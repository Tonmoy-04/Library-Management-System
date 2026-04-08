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
        $this->seedDemoBooksIfNeeded();

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

    public function storeBook(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'isbn' => 'nullable|string|max:13|unique:books,isbn',
            'publisher' => 'nullable|string|max:255',
            'quantity' => 'required|integer|min:1|max:9999',
        ]);

        $now = now();
        $publisherId = null;

        if (! empty($validated['publisher'])) {
            $publisherName = trim($validated['publisher']);
            $publisherId = DB::table('publishers')
                ->where('name', $publisherName)
                ->value('id');

            if (! $publisherId) {
                $publisherId = DB::table('publishers')->insertGetId([
                    'name' => $publisherName,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }

        $bookId = DB::table('books')->insertGetId([
            'title' => $validated['title'],
            'author' => $validated['author'],
            'publisher_id' => $publisherId,
            'isbn' => $validated['isbn'] ?? null,
            'quantity' => $validated['quantity'],
            'available' => $validated['quantity'],
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $book = DB::table('books as b')
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
            ->where('b.id', $bookId)
            ->first();

        return response()->json([
            'message' => 'Book added successfully.',
            'data' => $book,
        ], 201);
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

    private function seedDemoBooksIfNeeded(): void
    {
        if (DB::table('books')->exists()) {
            return;
        }

        $now = now();

        $demoBooks = [
            ['title' => 'Clean Code', 'author' => 'Robert C. Martin', 'publisher' => 'Prentice Hall', 'isbn' => '9780132350884', 'quantity' => 4],
            ['title' => 'The Pragmatic Programmer', 'author' => 'Andrew Hunt', 'publisher' => 'Addison-Wesley', 'isbn' => '9780135957059', 'quantity' => 3],
            ['title' => 'Introduction to Algorithms', 'author' => 'Thomas H. Cormen', 'publisher' => 'MIT Press', 'isbn' => '9780262046305', 'quantity' => 2],
            ['title' => 'Design Patterns', 'author' => 'Erich Gamma', 'publisher' => 'Addison-Wesley', 'isbn' => '9780201633610', 'quantity' => 5],
            ['title' => 'Refactoring', 'author' => 'Martin Fowler', 'publisher' => 'Addison-Wesley', 'isbn' => '9780134757599', 'quantity' => 3],
        ];

        foreach ($demoBooks as $book) {
            $publisherId = DB::table('publishers')
                ->where('name', $book['publisher'])
                ->value('id');

            if (! $publisherId) {
                $publisherId = DB::table('publishers')->insertGetId([
                    'name' => $book['publisher'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }

            DB::table('books')->insert([
                'title' => $book['title'],
                'author' => $book['author'],
                'publisher_id' => $publisherId,
                'isbn' => $book['isbn'],
                'quantity' => $book['quantity'],
                'available' => $book['quantity'],
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }
}
