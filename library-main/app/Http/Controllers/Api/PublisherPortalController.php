<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookIssue;
use App\Models\Feedback;
use App\Models\Publisher;
use Carbon\Carbon;
use Illuminate\Http\Request;

class PublisherPortalController extends Controller
{
    /**
     * Get publisher's books
     */
    public function getPublisherBooks($publisherId)
    {
        $books = Book::where('publisher_id', $publisherId)
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

        $totalBooks = Book::where('publisher_id', $publisherId)->count();
        $totalOrders = BookIssue::whereIn('book_id', Book::where('publisher_id', $publisherId)->pluck('id'))
            ->where('status', 'issued')
            ->count();
        
        // Calculate total revenue
        $totalRevenue = BookIssue::whereIn('book_id', Book::where('publisher_id', $publisherId)->pluck('id'))
            ->where('status', 'issued')
            ->join('books', 'book_issues.book_id', '=', 'books.id')
            ->sum('books.price');

        $recentBooks = Book::where('publisher_id', $publisherId)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

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
                ];
            });

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

            $publisherBooks = Book::where('publisher_id', $publisherId)->pluck('id')->toArray();

            // Initialize default values
            $booksSold = 0;
            $totalRevenue = 0;
            $topBooks = [];
            $salesTrend = [];

            if (!empty($publisherBooks)) {
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

            // Performance metrics
            $performanceMetrics = [
                'avgRating' => 4.5, // Placeholder
                'totalReviews' => 0,
            ];

            // User engagement
            $userEngagement = [
                'views' => BookIssue::whereIn('book_id', $publisherBooks)
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->count(),
                'downloads' => BookIssue::whereIn('book_id', $publisherBooks)
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->where('status', 'returned')
                    ->count(),
                'avgReadingTime' => 45,
                'repeatReaders' => 0,
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
                'description' => 'nullable|string',
                'price' => 'required|numeric|min:0',
            ]);

            $book = Book::create([
                'title' => $request->title,
                'author' => $request->author,
                'publisher_id' => $publisherId,
                'description' => $request->description,
                'price' => $request->price,
                'quantity' => 1,
                'available' => 1,
            ]);

            return response()->json([
                'message' => 'Book created successfully',
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
                'description' => 'nullable|string',
                'price' => 'required|numeric|min:0',
            ]);

            $book = Book::where('id', $bookId)
                ->where('publisher_id', $publisherId)
                ->firstOrFail();

            $book->update([
                'title' => $request->title,
                'author' => $request->author,
                'description' => $request->description,
                'price' => $request->price,
            ]);

            return response()->json([
                'message' => 'Book updated successfully',
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
        try {
            $book = Book::where('id', $bookId)
                ->where('publisher_id', $publisherId)
                ->firstOrFail();

            $book->delete();

            return response()->json([
                'message' => 'Book deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete book',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
