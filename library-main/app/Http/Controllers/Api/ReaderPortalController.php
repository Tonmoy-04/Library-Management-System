<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

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
                    DB::raw($this->bookIsbnExpr() . ' as isbn'),
                    DB::raw($priceExpr . ' as price'),
                    'b.created_at',
                    DB::raw($this->bookCategoryExpr() . ' as category'),
                    DB::raw($coverImageExpr . ' as cover_image_url'),
                    DB::raw($this->bookRatingExpr() . ' as rating'),
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

        return response()->json(['data' => $book]);
    }

    public function purchase(int $bookId): JsonResponse
    {
        if (! $this->hasReaderBookPurchasesTable()) {
            return response()->json([
                'message' => 'Reader purchase tables are not ready yet. Please run migrations.',
            ], 503);
        }

        $readerId = (int) auth('reader')->id();

        $book = DB::table('books')->where('id', $bookId)->first();
        if (! $book) {
            return response()->json(['message' => 'Book not found.'], 404);
        }

        $purchase = DB::transaction(function () use ($readerId, $bookId, $book) {
            $existing = DB::table('reader_book_purchases')
                ->where('reader_id', $readerId)
                ->where('book_id', $bookId)
                ->first();

            if ($existing) {
                return $existing;
            }

            $now = now();
            $id = DB::table('reader_book_purchases')->insertGetId([
                'reader_id' => $readerId,
                'book_id' => $bookId,
                'price' => $book->price ?? 0,
                'purchased_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            $this->recordActivity($readerId, $bookId, 'book_purchased', [
                'price' => (float) ($book->price ?? 0),
            ]);

            return DB::table('reader_book_purchases')->where('id', $id)->first();
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
        if (! $this->hasReaderReadingProgressTable()) {
            return response()->json([
                'message' => 'Reader progress tables are not ready yet. Please run migrations.',
            ], 503);
        }

        $readerId = (int) auth('reader')->id();

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
        if (! $this->hasReaderBookmarksTable()) {
            return response()->json([
                'message' => 'Reader bookmark tables are not ready yet. Please run migrations.',
            ], 503);
        }

        $readerId = (int) auth('reader')->id();

        $validated = $request->validate([
            'book_id' => 'required|integer|exists:books,id',
            'page_number' => 'nullable|integer|min:0',
            'note' => 'nullable|string|max:500',
        ]);

        $now = now();
        $bookmarkId = DB::table('reader_bookmarks')->insertGetId([
            'reader_id' => $readerId,
            'book_id' => $validated['book_id'],
            'page_number' => $validated['page_number'] ?? null,
            'note' => $validated['note'] ?? null,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

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
        if (! $this->hasReaderBookmarksTable()) {
            return response()->json([
                'message' => 'Reader bookmark tables are not ready yet. Please run migrations.',
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

        DB::table('reader_bookmarks')->where('id', $bookmarkId)->delete();

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

        if (Schema::hasColumn('books', 'isbn')) {
            $groupBy[] = 'b.isbn';
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
                DB::raw($this->bookIsbnExpr() . ' as isbn'),
                DB::raw($this->bookPriceExpr() . ' as price'),
                'b.created_at',
                DB::raw($categoryExpr . ' as category'),
                DB::raw($coverImageExpr . ' as cover_image_url'),
                DB::raw($ratingExpr . ' as rating'),
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

    private function bookCategoryExpr(): string
    {
        return Schema::hasColumn('books', 'category')
            ? "COALESCE(b.category, 'General')"
            : "'General'";
    }

    private function bookIsbnExpr(): string
    {
        return Schema::hasColumn('books', 'isbn')
            ? "COALESCE(b.isbn, '')"
            : "''";
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
