<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class ReaderPortalController extends Controller
{
    public function dashboard(): JsonResponse
    {
        $readerId = (int) auth('reader')->id();
        $descriptionExpr = $this->bookDescriptionExpr();
        $priceExpr = $this->bookPriceExpr();
        $coverImageExpr = $this->bookCoverExpr();
        $hasPurchases = $this->hasReaderBookPurchasesTable();
        $hasProgress = $this->hasReaderReadingProgressTable();
        $hasBookmarks = $this->hasReaderBookmarksTable();
        $hasActivities = $this->hasReaderActivitiesTable();

        $purchasedBooks = collect();
        if ($hasPurchases) {
            $purchasedBooks = DB::table('reader_book_purchases as rbp')
                ->join('books as b', 'b.id', '=', 'rbp.book_id')
                ->leftJoin('publishers as p', 'b.publisher_id', '=', 'p.id')
                ->where('rbp.reader_id', $readerId)
                ->select(
                    'b.id',
                    'b.title',
                    'b.author',
                    DB::raw($descriptionExpr . ' as description'),
                    DB::raw($priceExpr . ' as price'),
                    'b.created_at',
                    DB::raw($this->bookCategoryExpr() . ' as category'),
                    DB::raw($coverImageExpr . ' as cover_image_url'),
                    DB::raw($this->bookRatingExpr() . ' as rating'),
                    DB::raw($this->bookPdfExpr() . ' as pdf_url'),
                    DB::raw("COALESCE(p.name, 'N/A') as publisher"),
                    'rbp.purchased_at',
                    'rbp.downloaded_at',
                    DB::raw('rbp.price as purchase_price'),
                    DB::raw('1 as is_purchased'),
                    DB::raw('0 as is_bookmarked'),
                    DB::raw('0 as progress_percent')
                )
                ->orderByDesc('rbp.purchased_at')
                ->get();

            $purchasedBooks->transform(function ($book) {
                $book->pdf_url = $this->resolvePublicFileUrl($book->pdf_url ?? null);
                return $book;
            });
        }

        $readingProgress = collect();
        if ($hasProgress) {
            $readingProgress = DB::table('reader_reading_progress as rrp')
                ->join('books as b', 'b.id', '=', 'rrp.book_id')
                ->leftJoin('publishers as p', 'b.publisher_id', '=', 'p.id')
                ->where('rrp.reader_id', $readerId)
                ->select(
                    'rrp.id',
                    'rrp.book_id',
                    'rrp.progress_percent',
                    'rrp.current_page',
                    'rrp.total_pages',
                    'rrp.last_opened_at',
                    'b.title',
                    'b.author',
                    DB::raw($coverImageExpr . ' as cover_image_url'),
                    DB::raw("COALESCE(p.name, 'N/A') as publisher")
                )
                ->orderByDesc('rrp.last_opened_at')
                ->get();
        }

        $recentReads = collect();
        if ($hasActivities) {
            $recentReadsQuery = DB::table('reader_activities as ra')
                ->join('books as b', 'b.id', '=', 'ra.book_id')
                ->where('ra.reader_id', $readerId)
                ->whereIn('ra.activity_type', ['book_opened', 'continue_reading', 'book_downloaded']);

            if ($hasProgress) {
                $recentReadsQuery->leftJoin('reader_reading_progress as rrp', function ($join) use ($readerId) {
                    $join->on('rrp.book_id', '=', 'ra.book_id')
                        ->where('rrp.reader_id', '=', $readerId);
                });
            }

            $recentReads = $recentReadsQuery
                ->select(
                    'ra.id',
                    'ra.book_id',
                    'ra.activity_type',
                    'ra.occurred_at',
                    'b.title',
                    'b.author',
                    DB::raw($hasProgress ? 'COALESCE(rrp.progress_percent, 0) as progress_percent' : '0 as progress_percent')
                )
                ->orderByDesc('ra.occurred_at')
                ->limit(8)
                ->get();
        }

        $activity = collect();
        if ($hasActivities) {
            $activity = DB::table('reader_activities as ra')
                ->leftJoin('books as b', 'b.id', '=', 'ra.book_id')
                ->where('ra.reader_id', $readerId)
                ->select(
                    'ra.id',
                    'ra.activity_type',
                    'ra.metadata',
                    'ra.occurred_at',
                    'ra.book_id',
                    DB::raw("COALESCE(b.title, 'N/A') as book_title")
                )
                ->orderByDesc('ra.occurred_at')
                ->limit(12)
                ->get();
        }

        return response()->json([
            'data' => [
                'purchased_books' => $purchasedBooks,
                'reading_progress' => $readingProgress,
                'recent_reads' => $recentReads,
                'activity' => $activity,
            ],
        ]);
    }

    public function books(Request $request): JsonResponse
    {
        $readerId = (int) auth('reader')->id();
        $query = $this->baseBookQuery($readerId);

        $search = trim((string) $request->query('search', ''));
        $author = trim((string) $request->query('author', ''));
        $category = trim((string) $request->query('category', ''));

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('b.title', 'like', '%' . $search . '%')
                    ->orWhere('b.author', 'like', '%' . $search . '%');
            });
        }

        if ($author !== '') {
            $query->where('b.author', 'like', '%' . $author . '%');
        }

        if ($category !== '') {
            if (Schema::hasColumn('books', 'category')) {
                $query->where('b.category', 'like', '%' . $category . '%');
            }
        }

        $books = $query
            ->orderByDesc('b.id')
            ->get();

        $books->transform(function ($book) {
            $book->pdf_url = $this->resolvePublicFileUrl($book->pdf_url ?? null);
            return $book;
        });

        return response()->json(['data' => $books]);
    }

    public function bookDetails(int $bookId): JsonResponse
    {
        $readerId = (int) auth('reader')->id();

        $book = $this->baseBookQuery($readerId)
            ->where('b.id', $bookId)
            ->first();

        if (! $book) {
            return response()->json(['message' => 'Book not found.'], 404);
        }

        $book->pdf_url = $this->resolvePublicFileUrl($book->pdf_url ?? null);

        return response()->json(['data' => $book]);
    }

    public function purchase(int $bookId): JsonResponse
    {
        if (! $this->hasUserLibraryTable() || ! $this->hasTransactionsTable()) {
            return response()->json([
                'message' => 'Reader library tables are not ready yet. Please run migrations.',
            ], 503);
        }

        $validated = request()->validate([
            'payment_method' => 'nullable|string|max:40',
            'payment_reference' => 'nullable|string|max:120',
        ]);

        $readerId = (int) auth('reader')->id();

        $book = DB::table('books')->where('id', $bookId)->first();
        if (! $book) {
            return response()->json(['message' => 'Book not found.'], 404);
        }

        $amount = (float) ($book->price ?? 0);

        if ($amount > 0 && empty($validated['payment_method'])) {
            return response()->json([
                'message' => 'Payment method is required for paid books.',
                'errors' => [
                    'payment_method' => ['Payment method is required for paid books.'],
                ],
            ], 422);
        }

        $purchase = DB::transaction(function () use ($readerId, $bookId, $book, $validated, $amount) {
            $now = now();
            $adminShare = round($amount * 0.10, 2);
            $publisherShare = round($amount - $adminShare, 2);

            $existingTransaction = DB::table('transactions')
                ->where('user_id', $readerId)
                ->where('book_id', $bookId)
                ->where('payment_status', 'paid')
                ->orderByDesc('transaction_date')
                ->first();

            if (! $existingTransaction) {
                $transactionPayload = [
                    'user_id' => $readerId,
                    'book_id' => $bookId,
                    'amount' => $amount,
                    'payment_status' => 'paid',
                    'transaction_date' => $now,
                ];

                if (Schema::hasColumn('transactions', 'publisher_id')) {
                    $transactionPayload['publisher_id'] = $book->publisher_id ?? null;
                }

                if (Schema::hasColumn('transactions', 'admin_share')) {
                    $transactionPayload['admin_share'] = $adminShare;
                }

                if (Schema::hasColumn('transactions', 'publisher_share')) {
                    $transactionPayload['publisher_share'] = $publisherShare;
                }

                if (Schema::hasColumn('transactions', 'payment_method')) {
                    $transactionPayload['payment_method'] = $validated['payment_method'] ?? ($amount > 0 ? 'card' : 'free');
                }

                if (Schema::hasColumn('transactions', 'payment_reference')) {
                    $transactionPayload['payment_reference'] = $validated['payment_reference'] ?? ('TXN-' . strtoupper(Str::random(10)));
                }

                $transactionId = DB::table('transactions')->insertGetId($transactionPayload);

                $existingTransaction = DB::table('transactions')->where('id', $transactionId)->first();
            }

            DB::table('user_library')->updateOrInsert(
                [
                    'user_id' => $readerId,
                    'book_id' => $bookId,
                    'status' => 'purchased',
                ],
                [
                    'added_at' => $now,
                ]
            );

            if ($this->hasReaderBookPurchasesTable()) {
                DB::table('reader_book_purchases')->updateOrInsert(
                    [
                        'reader_id' => $readerId,
                        'book_id' => $bookId,
                    ],
                    [
                        'price' => $amount,
                        'purchased_at' => $now,
                        'downloaded_at' => null,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]
                );
            }

            $this->recordActivity($readerId, $bookId, 'book_purchased', [
                'price' => $amount,
                'admin_share' => $adminShare,
                'publisher_share' => $publisherShare,
            ]);

            return $existingTransaction;
        });

        return response()->json([
            'message' => 'Book purchased successfully.',
            'data' => $purchase,
        ], 201);
    }

    public function download(int $bookId): JsonResponse
    {
        if (! $this->hasReaderBookPurchasesTable()) {
            return response()->json([
                'message' => 'Reader purchase tables are not ready yet. Please run migrations.',
            ], 503);
        }

        $readerId = (int) auth('reader')->id();

        $purchase = DB::table('reader_book_purchases')
            ->where('reader_id', $readerId)
            ->where('book_id', $bookId)
            ->first();

        if (! $purchase) {
            return response()->json(['message' => 'Please purchase the book before download.'], 403);
        }

        DB::table('reader_book_purchases')
            ->where('id', $purchase->id)
            ->update([
                'downloaded_at' => now(),
                'updated_at' => now(),
            ]);

        $this->recordActivity($readerId, $bookId, 'book_downloaded');

        return response()->json([
            'message' => 'Download is ready.',
            'data' => [
                'book_id' => $bookId,
                'downloaded_at' => now()->toDateTimeString(),
            ],
        ]);
    }

    public function upsertProgress(Request $request, int $bookId): JsonResponse
    {
        if (! $this->hasReaderReadingProgressTable()) {
            return response()->json([
                'message' => 'Reader progress tables are not ready yet. Please run migrations.',
            ], 503);
        }

        $readerId = (int) auth('reader')->id();

        $validated = $request->validate([
            'progress_percent' => 'required|numeric|min:0|max:100',
            'current_page' => 'nullable|integer|min:0',
            'total_pages' => 'nullable|integer|min:1',
        ]);

        $now = now();

        $existing = DB::table('reader_reading_progress')
            ->where('reader_id', $readerId)
            ->where('book_id', $bookId)
            ->first();

        if ($existing) {
            DB::table('reader_reading_progress')
                ->where('id', $existing->id)
                ->update([
                    'progress_percent' => $validated['progress_percent'],
                    'current_page' => $validated['current_page'] ?? $existing->current_page,
                    'total_pages' => $validated['total_pages'] ?? $existing->total_pages,
                    'last_opened_at' => $now,
                    'updated_at' => $now,
                ]);

            $progressId = $existing->id;
        } else {
            $progressId = DB::table('reader_reading_progress')->insertGetId([
                'reader_id' => $readerId,
                'book_id' => $bookId,
                'progress_percent' => $validated['progress_percent'],
                'current_page' => $validated['current_page'] ?? 0,
                'total_pages' => $validated['total_pages'] ?? null,
                'last_opened_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $this->recordActivity($readerId, $bookId, 'progress_updated', [
            'progress_percent' => (float) $validated['progress_percent'],
        ]);

        $progress = DB::table('reader_reading_progress')->where('id', $progressId)->first();

        return response()->json([
            'message' => 'Reading progress saved.',
            'data' => $progress,
        ]);
    }

    public function continueReading(int $bookId): JsonResponse
    {
        if (! $this->hasUserLibraryTable()) {
            return response()->json([
                'message' => 'Reader library tables are not ready yet. Please run migrations.',
            ], 503);
        }

        $readerId = (int) auth('reader')->id();

        $hasPurchased = DB::table('user_library')
            ->where('user_id', $readerId)
            ->where('book_id', $bookId)
            ->where('status', 'purchased')
            ->exists();

        if (! $hasPurchased) {
            $hasPurchased = DB::table('reader_book_purchases')
                ->where('reader_id', $readerId)
                ->where('book_id', $bookId)
                ->exists();
        }

        if (! $hasPurchased) {
            return response()->json(['message' => 'Purchase the book before marking it as reading.'], 403);
        }

        $progress = null;

        if ($this->hasReaderReadingProgressTable()) {
            $progress = DB::table('reader_reading_progress')
                ->where('reader_id', $readerId)
                ->where('book_id', $bookId)
                ->first();

            if (! $progress) {
                $now = now();
                $id = DB::table('reader_reading_progress')->insertGetId([
                    'reader_id' => $readerId,
                    'book_id' => $bookId,
                    'progress_percent' => 0,
                    'current_page' => 1,
                    'total_pages' => null,
                    'last_opened_at' => $now,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
                $progress = DB::table('reader_reading_progress')->where('id', $id)->first();
            } else {
                DB::table('reader_reading_progress')
                    ->where('id', $progress->id)
                    ->update([
                        'last_opened_at' => now(),
                        'updated_at' => now(),
                    ]);
                $progress = DB::table('reader_reading_progress')->where('id', $progress->id)->first();
            }
        }

        DB::table('user_library')->updateOrInsert(
            [
                'user_id' => $readerId,
                'book_id' => $bookId,
                'status' => 'reading',
            ],
            [
                'added_at' => now(),
            ]
        );

        $this->recordActivity($readerId, $bookId, 'continue_reading');

        return response()->json([
            'message' => 'Continue reading session started.',
            'data' => $progress,
        ]);
    }

    public function bookmarks(): JsonResponse
    {
        if (! $this->hasReaderBookmarksTable()) {
            return response()->json(['data' => []]);
        }

        $readerId = (int) auth('reader')->id();

        $bookmarks = DB::table('reader_bookmarks as rb')
            ->join('books as b', 'b.id', '=', 'rb.book_id')
            ->where('rb.reader_id', $readerId)
            ->select(
                'rb.id',
                'rb.book_id',
                'rb.page_number',
                'rb.note',
                'rb.created_at',
                'b.title',
                'b.author'
            )
            ->orderByDesc('rb.created_at')
            ->get();

        return response()->json(['data' => $bookmarks]);
    }

    public function addBookmark(Request $request): JsonResponse
    {
        if (! $this->hasUserLibraryTable()) {
            return response()->json([
                'message' => 'Reader library tables are not ready yet. Please run migrations.',
            ], 503);
        }

        $readerId = (int) auth('reader')->id();

        $validated = $request->validate([
            'book_id' => 'required|integer|exists:books,id',
            'page_number' => 'nullable|integer|min:0',
            'note' => 'nullable|string|max:500',
        ]);

        $now = now();
        $bookmarkId = null;

        if ($this->hasReaderBookmarksTable()) {
            $bookmarkId = DB::table('reader_bookmarks')->insertGetId([
                'reader_id' => $readerId,
                'book_id' => $validated['book_id'],
                'page_number' => $validated['page_number'] ?? null,
                'note' => $validated['note'] ?? null,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        DB::table('user_library')->updateOrInsert(
            [
                'user_id' => $readerId,
                'book_id' => (int) $validated['book_id'],
                'status' => 'bookmarked',
            ],
            [
                'added_at' => $now,
            ]
        );

        $this->recordActivity($readerId, (int) $validated['book_id'], 'bookmark_added', [
            'page_number' => $validated['page_number'] ?? null,
        ]);

        $bookmark = DB::table('reader_bookmarks')->where('id', $bookmarkId)->first();

        return response()->json([
            'message' => 'Bookmark saved.',
            'data' => $bookmark,
        ], 201);
    }

    public function removeBookmark(int $bookmarkId): JsonResponse
    {
        if (! $this->hasUserLibraryTable()) {
            return response()->json([
                'message' => 'Reader library tables are not ready yet. Please run migrations.',
            ], 503);
        }

        $readerId = (int) auth('reader')->id();

        $bookmark = DB::table('reader_bookmarks')
            ->where('id', $bookmarkId)
            ->where('reader_id', $readerId)
            ->first();

        if (! $bookmark) {
            return response()->json(['message' => 'Bookmark not found.'], 404);
        }

        if ($this->hasReaderBookmarksTable()) {
            DB::table('reader_bookmarks')->where('id', $bookmarkId)->delete();
            DB::table('user_library')
                ->where('user_id', $readerId)
                ->where('book_id', $bookmark->book_id)
                ->where('status', 'bookmarked')
                ->delete();
        }

        $this->recordActivity($readerId, (int) $bookmark->book_id, 'bookmark_removed');

        return response()->json(['message' => 'Bookmark removed.']);
    }

    public function activity(): JsonResponse
    {
        if (! $this->hasReaderActivitiesTable()) {
            return response()->json(['data' => []]);
        }

        $readerId = (int) auth('reader')->id();

        $activity = DB::table('reader_activities as ra')
            ->leftJoin('books as b', 'b.id', '=', 'ra.book_id')
            ->where('ra.reader_id', $readerId)
            ->select(
                'ra.id',
                'ra.activity_type',
                'ra.metadata',
                'ra.occurred_at',
                DB::raw("COALESCE(b.title, 'N/A') as book_title")
            )
            ->orderByDesc('ra.occurred_at')
            ->limit(20)
            ->get();

        return response()->json(['data' => $activity]);
    }

    public function library(Request $request): JsonResponse
    {
        $readerId = (int) auth('reader')->id();
        $query = $this->catalogBookQuery();

        $search = trim((string) $request->query('search', ''));
        $author = trim((string) $request->query('author', ''));
        $category = trim((string) $request->query('category', ''));

        if ($search !== '') {
            $query->where(function ($builder) use ($search) {
                $builder->where('b.title', 'like', '%' . $search . '%')
                    ->orWhere('b.author', 'like', '%' . $search . '%');
            });
        }

        if ($author !== '') {
            $query->where('b.author', 'like', '%' . $author . '%');
        }

        if ($category !== '' && Schema::hasColumn('books', 'category')) {
            $query->where('b.category', 'like', '%' . $category . '%');
        }

        $books = $query->orderByDesc('b.id')->get();
        $statusLookup = $this->readerLibraryStatusLookup($readerId);

        $books = $books->map(function ($book) use ($statusLookup) {
            $statuses = $statusLookup[(int) $book->id] ?? [];

            return array_merge((array) $book, [
                'library_statuses' => array_values($statuses),
                'is_saved' => in_array('saved', $statuses, true) ? 1 : 0,
                'is_bookmarked' => in_array('bookmarked', $statuses, true) ? 1 : 0,
                'is_purchased' => in_array('purchased', $statuses, true) ? 1 : 0,
                'is_reading' => in_array('reading', $statuses, true) ? 1 : 0,
            ]);
        });

        return response()->json(['data' => $books]);
    }

    public function saveBook(int $bookId): JsonResponse
    {
        if (! $this->hasUserLibraryTable()) {
            return response()->json(['message' => 'Reader library tables are not ready yet. Please run migrations.'], 503);
        }

        if (! DB::table('books')->where('id', $bookId)->exists()) {
            return response()->json(['message' => 'Book not found.'], 404);
        }

        $readerId = (int) auth('reader')->id();
        $now = now();

        DB::table('user_library')->updateOrInsert(
            [
                'user_id' => $readerId,
                'book_id' => $bookId,
                'status' => 'saved',
            ],
            [
                'added_at' => $now,
            ]
        );

        return response()->json(['message' => 'Book saved to your library.'], 201);
    }

    public function removeLibraryStatus(int $bookId, string $status): JsonResponse
    {
        if (! $this->hasUserLibraryTable()) {
            return response()->json(['message' => 'Reader library tables are not ready yet. Please run migrations.'], 503);
        }

        if (! in_array($status, ['saved', 'bookmarked', 'reading'], true)) {
            return response()->json(['message' => 'Unsupported library status.'], 422);
        }

        $readerId = (int) auth('reader')->id();

        if ($status === 'reading') {
            $hasPurchased = DB::table('user_library')
                ->where('user_id', $readerId)
                ->where('book_id', $bookId)
                ->where('status', 'purchased')
                ->exists();

            if (! $hasPurchased) {
                $hasPurchased = DB::table('reader_book_purchases')
                    ->where('reader_id', $readerId)
                    ->where('book_id', $bookId)
                    ->exists();
            }

            if (! $hasPurchased) {
                return response()->json(['message' => 'Only purchased books can be marked as reading.'], 403);
            }
        }

        DB::table('user_library')
            ->where('user_id', $readerId)
            ->where('book_id', $bookId)
            ->where('status', $status)
            ->delete();

        if ($status === 'bookmarked' && $this->hasReaderBookmarksTable()) {
            DB::table('reader_bookmarks')
                ->where('reader_id', $readerId)
                ->where('book_id', $bookId)
                ->delete();
        }

        if ($status === 'reading' && $this->hasReaderReadingProgressTable()) {
            DB::table('reader_reading_progress')
                ->where('reader_id', $readerId)
                ->where('book_id', $bookId)
                ->delete();
        }

        return response()->json(['message' => 'Library status removed.']);
    }

    public function myLibrary(): JsonResponse
    {
        $readerId = (int) auth('reader')->id();
        $lookup = $this->readerLibraryStatusLookup($readerId);
        $books = $this->catalogBookQuery()->get()->keyBy('id');

        $sections = [
            'saved' => [],
            'bookmarked' => [],
            'purchased' => [],
            'reading' => [],
        ];

        foreach ($lookup as $bookId => $statuses) {
            $book = $books->get((int) $bookId);

            if (! $book) {
                continue;
            }

            foreach ($statuses as $status) {
                if (! array_key_exists($status, $sections)) {
                    continue;
                }

                $sections[$status][] = array_merge((array) $book, [
                    'library_status' => $status,
                    'library_statuses' => array_values($statuses),
                ]);
            }
        }

        return response()->json(['data' => $sections]);
    }

    public function history(Request $request): JsonResponse
    {
        if (! $this->hasTransactionsTable()) {
            return response()->json(['data' => []]);
        }

        $readerId = (int) auth('reader')->id();
        $range = trim((string) $request->query('range', 'all'));

        $query = DB::table('transactions as t')
            ->join('books as b', 'b.id', '=', 't.book_id')
            ->where('t.user_id', $readerId)
            ->select(
                't.id',
                't.book_id',
                't.amount',
                't.payment_status',
                't.transaction_date',
                'b.title as book_title',
                'b.author as author'
            )
            ->orderByDesc('t.transaction_date');

        if ($range === 'recent') {
            $query->limit(10);
        }

        return response()->json(['data' => $query->get()]);
    }

    private function baseBookQuery(int $readerId)
    {
        $hasPurchases = $this->hasReaderBookPurchasesTable();
        $hasProgress = $this->hasReaderReadingProgressTable();
        $hasBookmarks = $this->hasReaderBookmarksTable();

        $descriptionExpr = $this->bookDescriptionExpr();
        $categoryExpr = $this->bookCategoryExpr();
        $coverImageExpr = $this->bookCoverExpr();
        $ratingExpr = $this->bookRatingExpr();
        $availableExpr = $this->bookAvailabilityExpr();

        $groupBy = [
            'b.id',
            'b.title',
            'b.author',
            'b.created_at',
            'p.name',
        ];

        if (Schema::hasColumn('books', 'description')) {
            $groupBy[] = 'b.description';
        }

        if (Schema::hasColumn('books', 'price')) {
            $groupBy[] = 'b.price';
        }

        if ($hasPurchases) {
            $groupBy[] = 'rbp.id';
            $groupBy[] = 'rbp.downloaded_at';
        }

        if ($hasProgress) {
            $groupBy[] = 'rrp.progress_percent';
        }

        if ($hasBookmarks) {
            $groupBy[] = 'rb.id';
        }

        if (Schema::hasColumn('books', 'category')) {
            $groupBy[] = 'b.category';
        }

        if (Schema::hasColumn('books', 'cover_image_url')) {
            $groupBy[] = 'b.cover_image_url';
        }

        if (Schema::hasColumn('books', 'rating')) {
            $groupBy[] = 'b.rating';
        }

        if (Schema::hasColumn('books', 'pdf_url')) {
            $groupBy[] = 'b.pdf_url';
        }

        if (Schema::hasColumn('books', 'available')) {
            $groupBy[] = 'b.available';
        }

        if (Schema::hasColumn('books', 'available_quantity')) {
            $groupBy[] = 'b.available_quantity';
        }

        $query = DB::table('books as b')
            ->leftJoin('publishers as p', 'b.publisher_id', '=', 'p.id')
            ->select(
                'b.id',
                'b.title',
                'b.author',
                DB::raw($descriptionExpr . ' as description'),
                DB::raw($this->bookPriceExpr() . ' as price'),
                'b.created_at',
                DB::raw($categoryExpr . ' as category'),
                DB::raw($coverImageExpr . ' as cover_image_url'),
                DB::raw($ratingExpr . ' as rating'),
                DB::raw($this->bookPdfExpr() . ' as pdf_url'),
                DB::raw("COALESCE(p.name, 'N/A') as publisher"),
                DB::raw($hasPurchases ? 'rbp.downloaded_at as downloaded_at' : 'NULL as downloaded_at'),
                DB::raw($hasProgress ? 'COALESCE(rrp.progress_percent, 0) as progress_percent' : '0 as progress_percent'),
                DB::raw($hasBookmarks ? 'COALESCE(rb.id, 0) as bookmark_id' : '0 as bookmark_id'),
                DB::raw($hasPurchases ? 'CASE WHEN rbp.id IS NULL THEN 0 ELSE 1 END as is_purchased' : '0 as is_purchased'),
                DB::raw($hasBookmarks ? 'CASE WHEN rb.id IS NULL THEN 0 ELSE 1 END as is_bookmarked' : '0 as is_bookmarked'),
                DB::raw($availableExpr . ' as available_copies')
            );

        if ($hasPurchases) {
            $query->leftJoin('reader_book_purchases as rbp', function ($join) use ($readerId) {
                $join->on('rbp.book_id', '=', 'b.id')
                    ->where('rbp.reader_id', '=', $readerId);
            });
        }

        if ($hasProgress) {
            $query->leftJoin('reader_reading_progress as rrp', function ($join) use ($readerId) {
                $join->on('rrp.book_id', '=', 'b.id')
                    ->where('rrp.reader_id', '=', $readerId);
            });
        }

        if ($hasBookmarks) {
            $query->leftJoin('reader_bookmarks as rb', function ($join) use ($readerId) {
                $join->on('rb.book_id', '=', 'b.id')
                    ->where('rb.reader_id', '=', $readerId);
            });
        }

        return $query->groupBy($groupBy);
    }

    private function bookPdfExpr(): string
    {
        if (Schema::hasColumn('books', 'pdf_url')) {
            return "COALESCE(b.pdf_url, '')";
        }

        return "''";
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

    private function hasReaderBookPurchasesTable(): bool
    {
        return Schema::hasTable('reader_book_purchases');
    }

    private function hasReaderReadingProgressTable(): bool
    {
        return Schema::hasTable('reader_reading_progress');
    }

    private function hasReaderBookmarksTable(): bool
    {
        return Schema::hasTable('reader_bookmarks');
    }

    private function hasReaderActivitiesTable(): bool
    {
        return Schema::hasTable('reader_activities');
    }

    private function hasUserLibraryTable(): bool
    {
        return Schema::hasTable('user_library');
    }

    private function hasTransactionsTable(): bool
    {
        return Schema::hasTable('transactions');
    }

    private function catalogBookQuery()
    {
        $descriptionExpr = $this->bookDescriptionExpr();
        $categoryExpr = $this->bookCategoryExpr();
        $coverImageExpr = $this->bookCoverExpr();
        $ratingExpr = $this->bookRatingExpr();
        $availableExpr = $this->bookAvailabilityExpr();

        return DB::table('books as b')
            ->leftJoin('publishers as p', 'b.publisher_id', '=', 'p.id')
            ->select(
                'b.id',
                'b.title',
                'b.author',
                DB::raw($descriptionExpr . ' as description'),
                DB::raw($this->bookPriceExpr() . ' as price'),
                'b.created_at',
                DB::raw($categoryExpr . ' as category'),
                DB::raw($coverImageExpr . ' as cover_image_url'),
                DB::raw($ratingExpr . ' as rating'),
                DB::raw("COALESCE(p.name, 'N/A') as publisher"),
                DB::raw($availableExpr . ' as available_copies')
            );
    }

    private function readerLibraryStatusLookup(int $readerId): array
    {
        $rows = collect();

        if ($this->hasUserLibraryTable()) {
            $rows = $rows->merge(
                DB::table('user_library as ul')
                    ->where('ul.user_id', $readerId)
                    ->select('ul.book_id', 'ul.status')
                    ->get()
            );
        }

        if ($this->hasReaderBookPurchasesTable()) {
            $rows = $rows->merge(
                DB::table('reader_book_purchases as rbp')
                    ->where('rbp.reader_id', $readerId)
                    ->select(DB::raw('rbp.book_id as book_id'), DB::raw("'purchased' as status"))
                    ->get()
            );
        }

        if ($this->hasReaderBookmarksTable()) {
            $rows = $rows->merge(
                DB::table('reader_bookmarks as rb')
                    ->where('rb.reader_id', $readerId)
                    ->select(DB::raw('rb.book_id as book_id'), DB::raw("'bookmarked' as status"))
                    ->get()
            );
        }

        if ($this->hasReaderReadingProgressTable()) {
            $rows = $rows->merge(
                DB::table('reader_reading_progress as rrp')
                    ->where('rrp.reader_id', $readerId)
                    ->select(DB::raw('rrp.book_id as book_id'), DB::raw("'reading' as status"))
                    ->get()
            );
        }

        if ($this->hasTransactionsTable()) {
            $rows = $rows->merge(
                DB::table('transactions as t')
                    ->where('t.user_id', $readerId)
                    ->where('t.payment_status', 'paid')
                    ->select(DB::raw('t.book_id as book_id'), DB::raw("'purchased' as status"))
                    ->get()
            );
        }

        $lookup = [];

        foreach ($rows as $row) {
            $bookId = (int) $row->book_id;
            $status = (string) $row->status;

            if (! isset($lookup[$bookId])) {
                $lookup[$bookId] = [];
            }

            if (! in_array($status, $lookup[$bookId], true)) {
                $lookup[$bookId][] = $status;
            }
        }

        return $lookup;
    }

    private function bookCategoryExpr(): string
    {
        return Schema::hasColumn('books', 'category')
            ? "COALESCE(b.category, 'General')"
            : "'General'";
    }

    private function bookPriceExpr(): string
    {
        return Schema::hasColumn('books', 'price')
            ? 'COALESCE(b.price, 0)'
            : '0';
    }

    private function bookDescriptionExpr(): string
    {
        return Schema::hasColumn('books', 'description')
            ? "COALESCE(b.description, '')"
            : "''";
    }

    private function bookCoverExpr(): string
    {
        return Schema::hasColumn('books', 'cover_image_url')
            ? "COALESCE(b.cover_image_url, '')"
            : "''";
    }

    private function bookRatingExpr(): string
    {
        return Schema::hasColumn('books', 'rating')
            ? 'COALESCE(b.rating, 0)'
            : '0';
    }

    private function bookAvailabilityExpr(): string
    {
        $hasAvailable = Schema::hasColumn('books', 'available');
        $hasAvailableQuantity = Schema::hasColumn('books', 'available_quantity');

        if ($hasAvailable && $hasAvailableQuantity) {
            return 'COALESCE(b.available, b.available_quantity, 0)';
        }

        if ($hasAvailable) {
            return 'COALESCE(b.available, 0)';
        }

        if ($hasAvailableQuantity) {
            return 'COALESCE(b.available_quantity, 0)';
        }

        return '0';
    }

    private function recordActivity(int $readerId, ?int $bookId, string $activityType, array $metadata = []): void
    {
        if (! $this->hasReaderActivitiesTable()) {
            return;
        }

        DB::table('reader_activities')->insert([
            'reader_id' => $readerId,
            'book_id' => $bookId,
            'activity_type' => $activityType,
            'metadata' => ! empty($metadata) ? json_encode($metadata) : null,
            'occurred_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
