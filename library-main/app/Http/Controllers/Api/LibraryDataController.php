<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdminActionLog;
use App\Models\Book;
use App\Models\Bookshelf;
use App\Models\PublisherBookSubmission;
use App\Models\Reader;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LibraryDataController extends Controller
{
    public function publisherBookshelf(Request $request): JsonResponse
    {
        $status = $request->query('status', 'pending');
        $allowedStatuses = ['pending', 'accepted', 'declined', 'all'];

        if (! in_array($status, $allowedStatuses, true)) {
            return response()->json(['message' => 'Invalid status filter.'], 422);
        }

        $query = PublisherBookSubmission::query()->orderByDesc('created_at');

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $submissions = $query->get()->map(function ($submission) {
            $submission->pdf_url = $this->resolvePublicFileUrl($submission->file_url ?? null);
            return $submission;
        });

        return response()->json([
            'data' => $submissions,
        ]);
    }

    public function reviewPublisherBook(Request $request, int $bookId): JsonResponse
    {
        $validated = $request->validate([
            'action' => 'required|in:accepted,declined',
        ]);

        $submission = PublisherBookSubmission::query()->find($bookId);
        if (! $submission) {
            return response()->json(['message' => 'Submission not found.'], 404);
        }

        DB::transaction(function () use ($submission, $validated) {
            $action = $validated['action'];

            if ($action === 'accepted') {
                $alreadyExists = Book::query()
                    ->where('title', $submission->title)
                    ->where('author', $submission->author)
                    ->where('publisher_id', $submission->publisher_id)
                    ->exists();

                if (! $alreadyExists) {
                    Book::query()->create([
                        'title' => $submission->title,
                        'author' => $submission->author,
                        'publisher_id' => $submission->publisher_id,
                        'description' => $submission->description,
                        'price' => $submission->price,
                        'category' => null,
                        'quantity' => 1,
                        'available' => 1,
                    ]);
                }
            }

            $submission->status = $action;
            $submission->save();

            AdminActionLog::query()->create([
                'submission_id' => $submission->id,
                'action' => $action,
                'admin_id' => optional(auth('api')->user())->id,
                'action_date' => now(),
            ]);
        });

        $submission->refresh();

        return response()->json([
            'message' => 'Submission updated successfully.',
            'data' => $submission,
        ]);
    }

    private function resolvePublicFileUrl(?string $path): ?string
    {
        if ($path === null) {
            return null;
        }

        $trimmed = trim($path);
        if ($trimmed === '') {
            return null;
        }

        if (Str::startsWith($trimmed, ['http://', 'https://'])) {
            return $trimmed;
        }

        if (Str::startsWith($trimmed, '/storage/')) {
            return request()->getSchemeAndHttpHost() . $trimmed;
        }

        if (Str::startsWith($trimmed, 'storage/')) {
            return request()->getSchemeAndHttpHost() . '/' . $trimmed;
        }

        return request()->getSchemeAndHttpHost() . '/storage/' . ltrim($trimmed, '/');
    }

    public function readers(): JsonResponse
    {
        $query = DB::table('readers')
            ->select('id', 'name', 'email', 'phone', 'address')
            ->orderByDesc('id');

        if (Schema::hasColumn('readers', 'is_online_registered')) {
            $query->where(function ($builder) {
                $builder->where('is_online_registered', false)
                    ->orWhereNull('is_online_registered');
            });
        }

        $readers = $query->get();

        return response()->json(['data' => $readers]);
    }

    public function onlineReaders(): JsonResponse
    {
        if (! Schema::hasColumn('readers', 'is_online_registered')) {
            return response()->json(['data' => []]);
        }

        $query = Reader::query()
            ->select('id', 'name', 'email', 'phone', 'address', 'created_at')
            ->where('is_online_registered', true)
            ->orderByDesc('id');

        if (Schema::hasColumn('readers', 'is_suspended')) {
            $query->addSelect('is_suspended');
        }

        $onlineReaders = $query->get()->map(function ($reader) {
            if (! isset($reader->is_suspended)) {
                $reader->is_suspended = false;
            }

            return $reader;
        });

        return response()->json(['data' => $onlineReaders]);
    }

    public function setOnlineReaderSuspension(Request $request, int $id): JsonResponse
    {
        if (! Schema::hasColumn('readers', 'is_online_registered') || ! Schema::hasColumn('readers', 'is_suspended')) {
            return response()->json([
                'message' => 'Reader suspension feature is not available. Please run latest migrations.',
            ], 409);
        }

        $validated = $request->validate([
            'suspended' => 'required|boolean',
        ]);

        $reader = Reader::query()
            ->where('id', $id)
            ->where('is_online_registered', true)
            ->first();

        if (! $reader) {
            return response()->json(['message' => 'Online reader not found.'], 404);
        }

        $reader->is_suspended = $validated['suspended'];
        $reader->suspended_at = $validated['suspended'] ? now() : null;
        $reader->save();

        return response()->json([
            'message' => $validated['suspended']
                ? 'Reader suspended successfully.'
                : 'Reader reactivated successfully.',
            'data' => $reader,
        ]);
    }

    public function storeReader(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:readers,name',
            'email' => 'nullable|email|max:255|unique:readers,email',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
        ]);

        $now = now();

        $insertData = [
            'name' => trim($validated['name']),
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
            'created_at' => $now,
            'updated_at' => $now,
        ];

        if (Schema::hasColumn('readers', 'password')) {
            // Offline readers are created by admin, so assign a random hashed password placeholder.
            $insertData['password'] = Hash::make(Str::random(40));
        }

        $readerId = DB::table('readers')->insertGetId($insertData);

        if (Schema::hasColumn('readers', 'is_online_registered')) {
            DB::table('readers')->where('id', $readerId)->update([
                'is_online_registered' => false,
            ]);
        }

        if (Schema::hasColumn('readers', 'is_suspended')) {
            DB::table('readers')->where('id', $readerId)->update([
                'is_suspended' => false,
            ]);
        }

        if (Schema::hasColumn('readers', 'suspended_at')) {
            DB::table('readers')->where('id', $readerId)->update([
                'suspended_at' => null,
            ]);
        }

        $reader = DB::table('readers')
            ->select('id', 'name', 'email', 'phone', 'address')
            ->where('id', $readerId)
            ->first();

        return response()->json([
            'message' => 'Reader added successfully.',
            'data' => $reader,
        ], 201);
    }

    public function updateReader(Request $request, int $id): JsonResponse
    {
        $reader = DB::table('readers')->where('id', $id)->first();

        if (! $reader) {
            return response()->json(['message' => 'Reader not found.'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:readers,name,' . $id,
            'email' => 'nullable|email|max:255|unique:readers,email,' . $id,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
        ]);

        DB::table('readers')
            ->where('id', $id)
            ->update([
                'name' => trim($validated['name']),
                'email' => $validated['email'] ?? null,
                'phone' => $validated['phone'] ?? null,
                'address' => $validated['address'] ?? null,
                'updated_at' => now(),
            ]);

        $updatedReader = DB::table('readers')
            ->select('id', 'name', 'email', 'phone', 'address')
            ->where('id', $id)
            ->first();

        return response()->json([
            'message' => 'Reader updated successfully.',
            'data' => $updatedReader,
        ]);
    }

    public function destroyReader(int $id): JsonResponse
    {
        $reader = DB::table('readers')->where('id', $id)->first();

        if (! $reader) {
            return response()->json(['message' => 'Reader not found.'], 404);
        }

        DB::transaction(function () use ($id) {
            if (Schema::hasTable('book_issues')) {
                if (Schema::hasColumn('book_issues', 'reader_id')) {
                    DB::table('book_issues')
                        ->where('reader_id', $id)
                        ->delete();
                } elseif (Schema::hasColumn('book_issues', 'user_id')) {
                    DB::table('book_issues')
                        ->where('user_id', $id)
                        ->delete();
                }
            }

            DB::table('readers')->where('id', $id)->delete();
        });

        return response()->json([
            'message' => 'Reader deleted successfully.',
        ]);
    }

    public function publishers(): JsonResponse
    {
        $query = DB::table('publishers')
            ->select('id', 'name', 'email', 'website', 'location')
            ->orderByDesc('id');

        if (Schema::hasColumn('publishers', 'is_suspended')) {
            $query->addSelect('is_suspended');
        }

        $publishers = $query->get()->map(function ($publisher) {
            if (! isset($publisher->is_suspended)) {
                $publisher->is_suspended = false;
            }

            return $publisher;
        });

        return response()->json(['data' => $publishers]);
    }

    public function setPublisherSuspension(Request $request, int $id): JsonResponse
    {
        if (! Schema::hasColumn('publishers', 'is_suspended')) {
            return response()->json([
                'message' => 'Publisher suspension feature is not available. Please run latest migrations.',
            ], 409);
        }

        $validated = $request->validate([
            'suspended' => 'required|boolean',
        ]);

        $publisher = DB::table('publishers')->where('id', $id)->first();

        if (! $publisher) {
            return response()->json(['message' => 'Publisher not found.'], 404);
        }

        $updateData = [
            'is_suspended' => $validated['suspended'],
            'updated_at' => now(),
        ];

        if (Schema::hasColumn('publishers', 'suspended_at')) {
            $updateData['suspended_at'] = $validated['suspended'] ? now() : null;
        }

        DB::table('publishers')->where('id', $id)->update($updateData);

        $updatedPublisher = DB::table('publishers')
            ->select('id', 'name', 'email', 'website', 'location', 'is_suspended')
            ->where('id', $id)
            ->first();

        return response()->json([
            'message' => $validated['suspended']
                ? 'Publisher suspended successfully.'
                : 'Publisher reactivated successfully.',
            'data' => $updatedPublisher,
        ]);
    }

    public function storePublisher(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:publishers,name',
                'email' => 'nullable|email|max:255',
                'website' => 'nullable|url|max:255',
                'location' => 'nullable|string|max:500',
            ]);

            $now = now();

            $publisherId = DB::table('publishers')->insertGetId([
                'name' => trim($validated['name']),
                'email' => $validated['email'] ?? null,
                'website' => $validated['website'] ?? null,
                'location' => $validated['location'] ?? null,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            $publisher = DB::table('publishers')
                ->select('id', 'name', 'email', 'website', 'location')
                ->where('id', $publisherId)
                ->first();

            return response()->json([
                'message' => 'Publisher added successfully.',
                'data' => $publisher,
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Failed to save publisher.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function updatePublisher(Request $request, int $id): JsonResponse
    {
        try {
            $publisher = DB::table('publishers')->where('id', $id)->first();

            if (! $publisher) {
                return response()->json(['message' => 'Publisher not found.'], 404);
            }

            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:publishers,name,' . $id,
                'email' => 'nullable|email|max:255',
                'website' => 'nullable|url|max:255',
                'location' => 'nullable|string|max:500',
            ]);

            DB::table('publishers')
                ->where('id', $id)
                ->update([
                    'name' => trim($validated['name']),
                    'email' => $validated['email'] ?? null,
                    'website' => $validated['website'] ?? null,
                    'location' => $validated['location'] ?? null,
                    'updated_at' => now(),
                ]);

            $updatedPublisher = DB::table('publishers')
                ->select('id', 'name', 'email', 'website', 'location')
                ->where('id', $id)
                ->first();

            return response()->json([
                'message' => 'Publisher updated successfully.',
                'data' => $updatedPublisher,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Failed to update publisher.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroyPublisher(int $id): JsonResponse
    {
        try {
            $publisher = DB::table('publishers')->where('id', $id)->first();

            if (! $publisher) {
                return response()->json(['message' => 'Publisher not found.'], 404);
            }

            DB::transaction(function () use ($id) {
                DB::table('books')
                    ->where('publisher_id', $id)
                    ->update([
                        'publisher_id' => null,
                        'updated_at' => now(),
                    ]);

                DB::table('publishers')->where('id', $id)->delete();
            });

            return response()->json([
                'message' => 'Publisher deleted successfully.',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Failed to delete publisher.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function books(): JsonResponse
    {
        $this->seedDemoBooksIfNeeded();

        $books = DB::table('books as b')
            ->leftJoin('publishers as p', 'b.publisher_id', '=', 'p.id')
            ->select(
                'b.id',
                'b.title',
                'b.author',
                'b.category',
                'b.price',
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
            'publisher' => 'nullable|string|max:255',
            'category' => 'required|string|max:120',
            'price' => 'nullable|numeric|min:0',
            'free_to_read' => 'nullable|boolean',
            'quantity' => 'nullable|integer|min:1|max:9999',
        ]);

        $now = now();
        $publisherId = null;
        $freeToRead = filter_var($validated['free_to_read'] ?? false, FILTER_VALIDATE_BOOLEAN);

        if (! $freeToRead && (! array_key_exists('price', $validated) || $validated['price'] === null || $validated['price'] === '')) {
            return response()->json([
                'message' => 'Price is required when the book is not marked as free to read.',
                'errors' => [
                    'price' => ['Price is required when free to read is disabled.'],
                ],
            ], 422);
        }

        $price = $freeToRead ? 0 : (float) $validated['price'];
        $quantity = max(1, (int) ($validated['quantity'] ?? 1));

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
            'category' => $validated['category'],
            'price' => $price,
            'quantity' => $quantity,
            'available' => $quantity,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $book = DB::table('books as b')
            ->leftJoin('publishers as p', 'b.publisher_id', '=', 'p.id')
            ->select(
                'b.id',
                'b.title',
                'b.author',
                'b.category',
                'b.price',
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

    public function updateBook(Request $request, int $id): JsonResponse
    {
        $book = DB::table('books')->where('id', $id)->first();

        if (! $book) {
            return response()->json(['message' => 'Book not found.'], 404);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'publisher' => 'nullable|string|max:255',
            'category' => 'required|string|max:120',
            'price' => 'nullable|numeric|min:0',
            'free_to_read' => 'nullable|boolean',
            'quantity' => 'nullable|integer|min:1|max:9999',
        ]);

        $now = now();
        $publisherId = null;
        $freeToRead = filter_var($validated['free_to_read'] ?? false, FILTER_VALIDATE_BOOLEAN);

        if (! $freeToRead && (! array_key_exists('price', $validated) || $validated['price'] === null || $validated['price'] === '')) {
            return response()->json([
                'message' => 'Price is required when the book is not marked as free to read.',
                'errors' => [
                    'price' => ['Price is required when free to read is disabled.'],
                ],
            ], 422);
        }

        $price = $freeToRead ? 0 : (float) $validated['price'];
        $newQuantity = max(1, (int) ($validated['quantity'] ?? $book->quantity ?? 1));

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

        $issuedCount = max(0, (int) $book->quantity - (int) $book->available);

        if ($newQuantity < $issuedCount) {
            return response()->json([
                'message' => 'Quantity cannot be lower than currently issued copies (' . $issuedCount . ').',
            ], 422);
        }

        $newAvailable = $newQuantity - $issuedCount;

        DB::table('books')
            ->where('id', $id)
            ->update([
                'title' => $validated['title'],
                'author' => $validated['author'],
                'publisher_id' => $publisherId,
                'category' => $validated['category'],
                'price' => $price,
                'quantity' => $newQuantity,
                'available' => $newAvailable,
                'updated_at' => $now,
            ]);

        $updatedBook = DB::table('books as b')
            ->leftJoin('publishers as p', 'b.publisher_id', '=', 'p.id')
            ->select(
                'b.id',
                'b.title',
                'b.author',
                'b.category',
                'b.price',
                'b.quantity',
                'b.available',
                DB::raw("COALESCE(p.name, 'N/A') as publisher")
            )
            ->where('b.id', $id)
            ->first();

        return response()->json([
            'message' => 'Book updated successfully.',
            'data' => $updatedBook,
        ]);
    }

    public function destroyBook(int $id): JsonResponse
    {
        $book = DB::table('books')->where('id', $id)->first();

        if (! $book) {
            return response()->json(['message' => 'Book not found.'], 404);
        }

        $hasIssueHistory = DB::table('book_issues')->where('book_id', $id)->exists();
        if ($hasIssueHistory) {
            return response()->json([
                'message' => 'This book cannot be deleted because it has issue history.',
            ], 422);
        }

        DB::table('books')->where('id', $id)->delete();

        return response()->json([
            'message' => 'Book deleted successfully.',
        ]);
    }

    public function transactions(): JsonResponse
    {
        $issueTransactions = DB::table('book_issues as bi')
            ->join('users as u', 'bi.user_id', '=', 'u.id')
            ->join('books as b', 'bi.book_id', '=', 'b.id')
            ->select(
                'bi.id',
                DB::raw("'issue' as transaction_type"),
                'u.name as reader',
                'b.title as book',
                DB::raw('NULL as amount'),
                DB::raw('NULL as payment_status'),
                'bi.issued_at',
                'bi.due_at',
                'bi.returned_at',
                'bi.status',
                DB::raw('bi.issued_at as transaction_date')
            )
            ->get();

        $paymentTransactions = collect();
        if (Schema::hasTable('transactions')) {
            $paymentTransactions = DB::table('transactions as t')
                ->join('users as u', 't.user_id', '=', 'u.id')
                ->leftJoin('books as b', 't.book_id', '=', 'b.id')
                ->select(
                    't.id',
                    DB::raw("'payment' as transaction_type"),
                    'u.name as reader',
                    DB::raw("COALESCE(b.title, 'N/A') as book"),
                    't.amount',
                    't.payment_status',
                    DB::raw('NULL as issued_at'),
                    DB::raw('NULL as due_at'),
                    DB::raw('NULL as returned_at'),
                    DB::raw("COALESCE(t.payment_status, 'paid') as status"),
                    DB::raw('t.transaction_date as transaction_date')
                )
                ->get();
        }

        $transactions = $issueTransactions
            ->concat($paymentTransactions)
            ->sortByDesc(function ($row) {
                return $row->transaction_date ?? $row->issued_at ?? $row->returned_at;
            })
            ->values();

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

    public function returnBook(int $id): JsonResponse
    {
        $returned = DB::transaction(function () use ($id) {
            $issue = DB::table('book_issues')
                ->where('id', $id)
                ->lockForUpdate()
                ->first();

            if (! $issue) {
                return null;
            }

            if ($issue->status === 'returned') {
                throw ValidationException::withMessages([
                    'transaction' => ['This transaction is already returned.'],
                ]);
            }

            $now = now();

            DB::table('book_issues')
                ->where('id', $id)
                ->update([
                    'status' => 'returned',
                    'returned_at' => $now,
                    'updated_at' => $now,
                ]);

            DB::table('books')
                ->where('id', $issue->book_id)
                ->update([
                    'available' => DB::raw('available + 1'),
                    'updated_at' => $now,
                ]);

            return DB::table('book_issues as bi')
                ->join('users as u', 'bi.user_id', '=', 'u.id')
                ->join('books as b', 'bi.book_id', '=', 'b.id')
                ->select(
                    'bi.id',
                    'u.name as reader',
                    'b.title as book',
                    'bi.issued_at',
                    'bi.returned_at',
                    'bi.status'
                )
                ->where('bi.id', $id)
                ->first();
        });

        if (! $returned) {
            return response()->json(['message' => 'Transaction not found.'], 404);
        }

        return response()->json([
            'message' => 'Book returned successfully.',
            'data' => $returned,
        ]);
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
            ['title' => 'Clean Code', 'author' => 'Robert C. Martin', 'publisher' => 'Prentice Hall', 'quantity' => 4],
            ['title' => 'The Pragmatic Programmer', 'author' => 'Andrew Hunt', 'publisher' => 'Addison-Wesley', 'quantity' => 3],
            ['title' => 'Introduction to Algorithms', 'author' => 'Thomas H. Cormen', 'publisher' => 'MIT Press', 'quantity' => 2],
            ['title' => 'Design Patterns', 'author' => 'Erich Gamma', 'publisher' => 'Addison-Wesley', 'quantity' => 5],
            ['title' => 'Refactoring', 'author' => 'Martin Fowler', 'publisher' => 'Addison-Wesley', 'quantity' => 3],
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
                'quantity' => $book['quantity'],
                'available' => $book['quantity'],
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    public function getBooksByPublisher($publisherId): JsonResponse
    {
        $books = DB::table('books')
            ->where('publisher_id', $publisherId)
            ->select('id', 'title', 'author', 'description', 'quantity', 'available_quantity', 'price', 'created_at', 'updated_at')
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $books]);
    }
}
