<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class LibraryDataController extends Controller
{
    public function readers(): JsonResponse
    {
        $readers = DB::table('users')
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $readers]);
    }

    public function books(): JsonResponse
    {
        $books = DB::table('books as b')
            ->leftJoin('publishers as p', 'b.publisher_id', '=', 'p.id')
            ->select(
                'b.id',
                'b.isbn',
                'b.title',
                'b.author',
                'b.quantity',
                'b.available',
                DB::raw("COALESCE(p.name, 'N/A') as publisher")
            )
            ->orderByDesc('b.id')
            ->get();

        return response()->json(['data' => $books]);
    }

    public function transactions(): JsonResponse
    {
        $transactions = DB::table('book_issues as bi')
            ->join('users as u', 'bi.user_id', '=', 'u.id')
            ->join('books as b', 'bi.book_id', '=', 'b.id')
            ->select(
                'bi.id',
                'u.name as reader',
                'b.title as book',
                'bi.issued_at',
                'bi.due_at',
                'bi.returned_at',
                'bi.status'
            )
            ->orderByDesc('bi.id')
            ->get();

        return response()->json(['data' => $transactions]);
    }

    public function issueBook(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'book_id' => 'required|integer|exists:books,id',
            'user_id' => 'required|integer|exists:users,id',
            'due_at' => 'nullable|date|after:today',
        ]);

        $issued = DB::transaction(function () use ($validated) {
            $book = DB::table('books')
                ->where('id', $validated['book_id'])
                ->lockForUpdate()
                ->first();

            if (!$book || (int) $book->available < 1) {
                throw ValidationException::withMessages([
                    'book_id' => ['This book is currently not available for issue.'],
                ]);
            }

            $now = now();

            $issueId = DB::table('book_issues')->insertGetId([
                'user_id' => $validated['user_id'],
                'book_id' => $validated['book_id'],
                'issued_at' => $now,
                'due_at' => $validated['due_at'] ?? null,
                'returned_at' => null,
                'status' => 'issued',
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            DB::table('books')
                ->where('id', $validated['book_id'])
                ->update([
                    'available' => DB::raw('available - 1'),
                    'updated_at' => $now,
                ]);

            return DB::table('book_issues as bi')
                ->join('users as u', 'bi.user_id', '=', 'u.id')
                ->join('books as b', 'bi.book_id', '=', 'b.id')
                ->select(
                    'bi.id',
                    'u.name as reader',
                    'u.email as reader_email',
                    'b.title as book',
                    'bi.issued_at',
                    'bi.due_at',
                    'bi.status'
                )
                ->where('bi.id', $issueId)
                ->first();
        });

        return response()->json([
            'message' => 'Book issued successfully.',
            'data' => $issued,
        ], 201);
    }

    public function dashboardSummary(): JsonResponse
    {
        $totalBooks = (int) DB::table('books')->sum('quantity');
        $totalReaders = (int) DB::table('users')->count();
        $booksIssued = (int) DB::table('book_issues')
            ->where('status', 'issued')
            ->count();

        $overdueBooks = (int) DB::table('book_issues')
            ->where('status', 'issued')
            ->whereNull('returned_at')
            ->whereNotNull('due_at')
            ->where('due_at', '<', now())
            ->count();

        $recentTransactions = DB::table('book_issues as bi')
            ->join('users as u', 'bi.user_id', '=', 'u.id')
            ->join('books as b', 'bi.book_id', '=', 'b.id')
            ->select(
                'bi.id',
                'u.name as reader',
                'b.title as book',
                'bi.issued_at',
                'bi.status'
            )
            ->orderByDesc('bi.id')
            ->limit(5)
            ->get();

        return response()->json([
            'stats' => [
                'total_books' => $totalBooks,
                'total_readers' => $totalReaders,
                'books_issued' => $booksIssued,
                'overdue_books' => $overdueBooks,
            ],
            'recent_transactions' => $recentTransactions,
        ]);
    }
}
