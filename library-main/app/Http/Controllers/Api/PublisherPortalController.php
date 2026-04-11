<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PublisherBookSubmission;
use App\Models\Book;
use App\Models\BookIssue;
use App\Models\Feedback;
use App\Models\Publisher;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PublisherPortalController extends Controller
{
    /**
     * Get publisher's books
     */
    public function getPublisherBooks($publisherId)
    {
        $books = PublisherBookSubmission::where('publisher_id', $publisherId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $books,
        ]);
    }

    /**
     * Get publisher dashboard data
     */
    public function dashboard($publisherId)
    {
        $publisher = Publisher::findOrFail($publisherId);
        $publisherBookIds = Book::where('publisher_id', $publisherId)->pluck('id')->toArray();

        $hasPublisherRevenueSplit = Schema::hasTable('transactions')
            && Schema::hasColumn('transactions', 'publisher_id')
            && Schema::hasColumn('transactions', 'publisher_share');

        $totalBooks = Book::where('publisher_id', $publisherId)->count();

        if ($hasPublisherRevenueSplit) {
            $splitTransactionsBase = DB::table('transactions as t')
                ->where(function ($query) use ($publisherId, $publisherBookIds) {
                    $query->where('t.publisher_id', $publisherId);

                    if (! empty($publisherBookIds)) {
                        $query->orWhereIn('t.book_id', $publisherBookIds);
                    }
                })
                ->where('payment_status', 'paid')
                ->distinct('t.id');

            $totalOrders = (clone $splitTransactionsBase)->count('t.id');

            $totalRevenue = (float) (clone $splitTransactionsBase)
                ->selectRaw('SUM(CASE WHEN COALESCE(t.publisher_share, 0) > 0 THEN t.publisher_share ELSE COALESCE(t.amount, 0) * 0.90 END) as total')
                ->value('total');
        } else {
            $totalOrders = BookIssue::whereIn('book_id', Book::where('publisher_id', $publisherId)->pluck('id'))
                ->where('status', 'issued')
                ->count();

            $totalRevenue = (float) BookIssue::whereIn('book_id', Book::where('publisher_id', $publisherId)->pluck('id'))
                ->where('status', 'issued')
                ->join('books', 'book_issues.book_id', '=', 'books.id')
                ->sum('books.price');
        }

        $recentBooks = Book::where('publisher_id', $publisherId)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        if ($hasPublisherRevenueSplit) {
            $recentTransactions = DB::table('transactions as t')
                ->leftJoin('books as b', 'b.id', '=', 't.book_id')
                ->leftJoin('users as u', 'u.id', '=', 't.user_id')
                ->where(function ($query) use ($publisherId, $publisherBookIds) {
                    $query->where('t.publisher_id', $publisherId);

                    if (! empty($publisherBookIds)) {
                        $query->orWhereIn('t.book_id', $publisherBookIds);
                    }
                })
                ->where('t.payment_status', 'paid')
                ->orderByDesc('t.transaction_date')
                ->limit(5)
                ->get([
                    't.id',
                    DB::raw("COALESCE(b.title, 'Unknown') as book_title"),
                    DB::raw("COALESCE(u.name, 'Unknown Reader') as reader_name"),
                    DB::raw("COALESCE(t.payment_status, 'paid') as status"),
                    't.transaction_date as issued_at',
                    DB::raw('CASE WHEN COALESCE(t.publisher_share, 0) > 0 THEN t.publisher_share ELSE COALESCE(t.amount, 0) * 0.90 END as publisher_earning'),
                ]);
        } else {
            $recentTransactions = BookIssue::whereIn('book_id', Book::where('publisher_id', $publisherId)->pluck('id'))
                ->with(['book', 'user'])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($transaction) {
                    return [
                        'id' => $transaction->id,
                        'book_title' => $transaction->book->title ?? 'Unknown',
                        'reader_name' => $transaction->user->name ?? 'Unknown Reader',
                        'status' => $transaction->status,
                        'issued_at' => $transaction->issued_at,
                        'publisher_earning' => 0,
                    ];
                });
        }

        return response()->json([
            'stats' => [
                'books_published' => $totalBooks,
                'total_orders' => $totalOrders,
                'revenue' => $totalRevenue,
            ],
            'recent_books' => $recentBooks,
            'recent_transactions' => $recentTransactions,
        ]);
    }

    /**
     * Get publisher reports (sales, performance, engagement)
     */
    public function reports($publisherId, Request $request)
    {
        try {
            $startDate = $request->query('startDate') ? Carbon::parse($request->query('startDate')) : Carbon::now()->subDays(30);
            $endDate = $request->query('endDate') ? Carbon::parse($request->query('endDate')) : Carbon::now();
            $filterType = $request->query('filterType', 'sales');

            $hasPublisherRevenueSplit = Schema::hasTable('transactions')
                && Schema::hasColumn('transactions', 'publisher_id')
                && Schema::hasColumn('transactions', 'publisher_share');

            $publisherBooks = Book::where('publisher_id', $publisherId)->pluck('id')->toArray();

            // Initialize default values
            $booksSold = 0;
            $totalRevenue = 0;
            $topBooks = [];
            $salesTrend = [];

            if (!empty($publisherBooks) && $hasPublisherRevenueSplit) {
                $paymentRows = DB::table('transactions as t')
                    ->leftJoin('books as b', 'b.id', '=', 't.book_id')
                    ->where(function ($query) use ($publisherId, $publisherBooks) {
                        $query->where('t.publisher_id', $publisherId)
                            ->orWhereIn('t.book_id', $publisherBooks);
                    })
                    ->where('t.payment_status', 'paid')
                    ->whereBetween('t.transaction_date', [$startDate, $endDate])
                    ->select(
                        't.id',
                        't.book_id',
                        't.transaction_date',
                        DB::raw('CASE WHEN COALESCE(t.publisher_share, 0) > 0 THEN t.publisher_share ELSE COALESCE(t.amount, 0) * 0.90 END as publisher_share'),
                        DB::raw("COALESCE(b.title, 'Unknown') as title"),
                        DB::raw("COALESCE(b.author, 'Unknown') as author")
                    )
                    ->get();

                $booksSold = $paymentRows->count();
                $totalRevenue = (float) $paymentRows->sum('publisher_share');

                $topBooks = $paymentRows
                    ->groupBy('book_id')
                    ->map(function ($rows, $bookId) {
                        $first = $rows->first();
                        return [
                            'id' => $bookId,
                            'title' => $first->title ?? 'Unknown',
                            'author' => $first->author ?? 'Unknown',
                            'copies_sold' => $rows->count(),
                            'revenue' => (float) $rows->sum('publisher_share'),
                        ];
                    })
                    ->sortByDesc('revenue')
                    ->values()
                    ->toArray();

                $salesTrend = $paymentRows
                    ->groupBy(function ($item) {
                        return Carbon::parse($item->transaction_date)->format('Y-m-d');
                    })
                    ->map(function ($items, $date) {
                        return [
                            'date' => $date,
                            'sales' => (float) collect($items)->sum('publisher_share'),
                            'count' => count($items),
                        ];
                    })
                    ->values()
                    ->toArray();
            } elseif (!empty($publisherBooks)) {
                // Sales data
                $booksSold = BookIssue::whereIn('book_id', $publisherBooks)
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->where('status', 'issued')
                    ->count();

                // Calculate total revenue
                $bookIssues = BookIssue::whereIn('book_id', $publisherBooks)
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->where('status', 'issued')
                    ->with('book')
                    ->get();

                $totalRevenue = $bookIssues->sum(function ($issue) {
                    return $issue->book->price ?? 0;
                });

                // Top performing books
                $topBooks = $bookIssues
                    ->groupBy('book_id')
                    ->map(function ($issues, $bookId) {
                        $book = Book::find($bookId);
                        return [
                            'id' => $bookId,
                            'title' => $book->title ?? 'Unknown',
                            'author' => $book->author ?? 'Unknown',
                            'copies_sold' => $issues->count(),
                            'revenue' => ($book->price ?? 0) * $issues->count(),
                        ];
                    })
                    ->sortByDesc('revenue')
                    ->values()
                    ->toArray();

                // Sales trend (grouped by date)
                $salesTrend = $bookIssues
                    ->groupBy(function ($item) {
                        return $item->created_at->format('Y-m-d');
                    })
                    ->map(function ($items, $date) {
                        return [
                            'date' => $date,
                            'sales' => $items->sum(function ($item) {
                                return $item->book->price ?? 0;
                            }),
                            'count' => $items->count(),
                        ];
                    })
                    ->values()
                    ->toArray();
            }

            // Performance metrics (computed from feedback when available)
            $totalReviews = 0;
            $avgRating = 0.0;
            if (! empty($publisherBooks) && Schema::hasTable('feedback')) {
                $feedbackQuery = DB::table('feedback')
                    ->whereIn('book_id', $publisherBooks)
                    ->whereBetween('created_at', [$startDate, $endDate]);

                $totalReviews = (int) (clone $feedbackQuery)->count();
                $avgRating = (float) ((clone $feedbackQuery)->avg('rating') ?? 0);
            }

            $performanceMetrics = [
                'avgRating' => round($avgRating, 2),
                'totalReviews' => $totalReviews,
            ];

            // User engagement
            $views = BookIssue::whereIn('book_id', $publisherBooks)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count();

            $downloads = BookIssue::whereIn('book_id', $publisherBooks)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->where('status', 'returned')
                ->count();

            $repeatReaders = 0;
            $avgReadingTime = 0;

            if (! empty($publisherBooks) && Schema::hasTable('reader_book_purchases')) {
                $repeatReaders = (int) DB::table('reader_book_purchases')
                    ->whereIn('book_id', $publisherBooks)
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->select('reader_id')
                    ->groupBy('reader_id')
                    ->havingRaw('COUNT(*) > 1')
                    ->count();
            }

            if (! empty($publisherBooks) && Schema::hasTable('reader_reading_progress')) {
                $avgProgress = (float) (DB::table('reader_reading_progress')
                    ->whereIn('book_id', $publisherBooks)
                    ->whereBetween('updated_at', [$startDate, $endDate])
                    ->avg('progress_percent') ?? 0);
                // Convert average progress % to a coarse minutes estimate for UI continuity.
                $avgReadingTime = (int) round(($avgProgress / 100) * 60);
            }

            $userEngagement = [
                'views' => $views,
                'downloads' => $downloads,
                'avgReadingTime' => $avgReadingTime,
                'repeatReaders' => $repeatReaders,
            ];

            return response()->json([
                'totalSales' => $booksSold,
                'totalRevenue' => $totalRevenue,
                'booksSold' => $booksSold,
                'topBooks' => $topBooks,
                'salesTrend' => $salesTrend,
                'performanceMetrics' => $performanceMetrics,
                'userEngagement' => $userEngagement,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate reports',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get feedback for publisher's books
     */
    public function feedback($publisherId, Request $request)
    {
        try {
            $status = $request->query('status', 'all');

            $query = Feedback::where('publisher_id', $publisherId)
                ->with(['book', 'reader'])
                ->orderBy('created_at', 'desc');

            if ($status !== 'all') {
                $query->where('status', $status);
            }

            $feedbacks = $query->get()->map(function ($feedback) {
                return [
                    'id' => $feedback->id,
                    'reader_name' => optional($feedback->reader)->name ?? 'Anonymous',
                    'book_title' => optional($feedback->book)->title ?? 'Unknown',
                    'rating' => $feedback->rating ?? 0,
                    'comment' => $feedback->comment,
                    'reply' => $feedback->reply,
                    'replied_at' => $feedback->replied_at,
                    'status' => $feedback->status ?? 'pending',
                    'created_at' => $feedback->created_at,
                ];
            });

            return response()->json([
                'data' => $feedbacks,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to load feedback',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reply to feedback
     */
    public function replyToFeedback($feedbackId, Request $request)
    {
        $request->validate([
            'reply' => 'required|string|max:1000',
        ]);

        $feedback = Feedback::findOrFail($feedbackId);

        $feedback->update([
            'reply' => $request->reply,
            'replied_at' => Carbon::now(),
            'status' => 'resolved',
        ]);

        return response()->json([
            'message' => 'Reply sent successfully',
            'feedback' => $feedback,
        ]);
    }

    /**
     * Update feedback status
     */
    public function updateFeedbackStatus($feedbackId, Request $request)
    {
        $request->validate([
            'status' => 'required|in:pending,resolved',
        ]);

        $feedback = Feedback::findOrFail($feedbackId);
        $feedback->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Feedback status updated',
            'feedback' => $feedback,
        ]);
    }

    /**
     * Create a new book for the publisher
     */
    public function createBook($publisherId, Request $request)
    {
        try {
            $request->validate([
                'title' => 'required|string|max:255',
                'author' => 'required|string|max:255',
                'publisher' => 'required|string|max:255',
                'category' => 'required|string|max:120',
                'price' => 'required|numeric|min:0',
                'quantity' => 'nullable|integer|min:1|max:9999',
                'free_to_read' => 'nullable|boolean',
                'pdf' => 'nullable|file|mimes:pdf|max:51200', // 50MB max for PDF
                'pdf_base64' => 'nullable|string',
                'pdf_name' => 'nullable|string|max:255|required_with:pdf_base64',
            ]);

            $publisher = auth('publisher')->user();
            if (! $publisher || (int) $publisher->id !== (int) $publisherId) {
                return response()->json([
                    'error' => 'Unauthorized action',
                ], 403);
            }

            if (! $request->hasFile('pdf') && ! $request->filled('pdf_base64')) {
                throw ValidationException::withMessages([
                    'pdf' => ['PDF file is required.'],
                ]);
            }

            $fileUrl = $this->storePublisherPdf($request, (int) $publisherId);

            $freeToRead = filter_var($request->input('free_to_read', false), FILTER_VALIDATE_BOOLEAN);
            $price = $freeToRead ? 0 : (float) $request->input('price', 0);

            $book = PublisherBookSubmission::create([
                'title' => $request->title,
                'author' => $request->author,
                'publisher_id' => $publisherId,
                'description' => null,
                'category' => $request->category,
                'quantity' => max(1, (int) $request->input('quantity', 1)),
                'free_to_read' => $freeToRead,
                'price' => $price,
                'file_url' => $fileUrl,
                'status' => 'pending',
            ]);

            return response()->json([
                'message' => 'Book submitted for review successfully',
                'data' => $book,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to create book',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update a book for the publisher
     */
    public function updateBook($publisherId, $bookId, Request $request)
    {
        try {
            $request->validate([
                'title' => 'required|string|max:255',
                'author' => 'required|string|max:255',
                'publisher' => 'required|string|max:255',
                'category' => 'required|string|max:120',
                'price' => 'required|numeric|min:0',
                'quantity' => 'nullable|integer|min:1|max:9999',
                'free_to_read' => 'nullable|boolean',
                'pdf' => 'nullable|file|mimes:pdf|max:51200',
                'pdf_base64' => 'nullable|string',
                'pdf_name' => 'nullable|string|max:255|required_with:pdf_base64',
            ]);

            $publisher = auth('publisher')->user();
            if (! $publisher || (int) $publisher->id !== (int) $publisherId) {
                return response()->json([
                    'error' => 'Unauthorized action',
                ], 403);
            }

            $book = PublisherBookSubmission::where('id', $bookId)
                ->where('publisher_id', $publisherId)
                ->firstOrFail();

            if ($book->status !== 'pending') {
                return response()->json([
                    'error' => 'Only pending submissions can be edited.',
                ], 422);
            }

            // Handle PDF upload if provided
            $fileUrl = $book->file_url;
            if ($request->hasFile('pdf') || $request->filled('pdf_base64')) {
                $fileUrl = $this->storePublisherPdf($request, (int) $publisherId);
            }

            $freeToRead = filter_var($request->input('free_to_read', false), FILTER_VALIDATE_BOOLEAN);
            $price = $freeToRead ? 0 : (float) $request->input('price', 0);

            $book->update([
                'title' => $request->title,
                'author' => $request->author,
                'description' => null,
                'category' => $request->category,
                'quantity' => max(1, (int) $request->input('quantity', 1)),
                'free_to_read' => $freeToRead,
                'price' => $price,
                'file_url' => $fileUrl,
            ]);

            return response()->json([
                'message' => 'Submission updated successfully',
                'data' => $book,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to update book',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a book for the publisher
     */
    public function deleteBook($publisherId, $bookId)
    {
        return response()->json([
            'error' => 'Submissions are retained for history and cannot be deleted.',
        ], 422);
    }

    private function storePublisherPdf(Request $request, int $publisherId): ?string
    {
        if ($request->hasFile('pdf')) {
            $file = $request->file('pdf');
            $fileName = time() . '_' . $publisherId . '_' . $file->getClientOriginalName();
            return $file->storeAs('publisher_submissions/pdfs', $fileName, 'public');
        }

        if (! $request->filled('pdf_base64')) {
            return null;
        }

        $rawBase64 = (string) $request->input('pdf_base64');
        if (Str::contains($rawBase64, ',')) {
            [, $rawBase64] = explode(',', $rawBase64, 2);
        }

        $binary = base64_decode($rawBase64, true);
        if ($binary === false) {
            throw ValidationException::withMessages([
                'pdf' => ['Invalid PDF encoding.'],
            ]);
        }

        if (strlen($binary) > 7 * 1024 * 1024) {
            throw ValidationException::withMessages([
                'pdf' => ['PDF is too large. Please upload a file smaller than 7 MB.'],
            ]);
        }

        if (substr($binary, 0, 5) !== '%PDF-') {
            throw ValidationException::withMessages([
                'pdf' => ['Uploaded file is not a valid PDF.'],
            ]);
        }

        $providedName = (string) $request->input('pdf_name', 'uploaded.pdf');
        $safeName = preg_replace('/[^A-Za-z0-9._-]/', '_', $providedName) ?: 'uploaded.pdf';
        if (! Str::endsWith(Str::lower($safeName), '.pdf')) {
            $safeName .= '.pdf';
        }

        $fileName = time() . '_' . $publisherId . '_' . $safeName;
        $path = 'publisher_submissions/pdfs/' . $fileName;
        Storage::disk('public')->put($path, $binary);

        return $path;
    }
}
