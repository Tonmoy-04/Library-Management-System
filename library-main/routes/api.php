<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\ReaderAuthController;
use App\Http\Controllers\Auth\PublisherAuthController;
use App\Http\Controllers\Api\LibraryDataController;
use App\Http\Controllers\Api\PublisherPortalController;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware('auth:api')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('refresh', [AuthController::class, 'refresh']);
        Route::get('me', [AuthController::class, 'me']);
    });
});

Route::prefix('reader')->group(function () {
    Route::post('register', [ReaderAuthController::class, 'register']);
    Route::post('login', [ReaderAuthController::class, 'login']);

    Route::middleware('auth:reader')->group(function () {
        Route::post('logout', [ReaderAuthController::class, 'logout']);
        Route::get('me', [ReaderAuthController::class, 'me']);
    });
});

Route::prefix('publisher')->group(function () {
    Route::post('register', [PublisherAuthController::class, 'register']);
    Route::post('login', [PublisherAuthController::class, 'login']);

    Route::middleware('auth:publisher')->group(function () {
        Route::post('logout', [PublisherAuthController::class, 'logout']);
        Route::get('me', [PublisherAuthController::class, 'me']);
    });
});

Route::middleware('auth:api')->group(function () {
    Route::get('readers', [LibraryDataController::class, 'readers']);
    Route::post('readers', [LibraryDataController::class, 'storeReader']);
    Route::put('readers/{id}', [LibraryDataController::class, 'updateReader']);
    Route::delete('readers/{id}', [LibraryDataController::class, 'destroyReader']);
    Route::get('publishers', [LibraryDataController::class, 'publishers']);
    Route::post('publishers', [LibraryDataController::class, 'storePublisher']);
    Route::put('publishers/{id}', [LibraryDataController::class, 'updatePublisher']);
    Route::delete('publishers/{id}', [LibraryDataController::class, 'destroyPublisher']);
    Route::get('publishers/{publisherId}/books', [LibraryDataController::class, 'getBooksByPublisher']);
    Route::get('books', [LibraryDataController::class, 'books']);
    Route::post('books', [LibraryDataController::class, 'storeBook']);
    Route::put('books/{id}', [LibraryDataController::class, 'updateBook']);
    Route::delete('books/{id}', [LibraryDataController::class, 'destroyBook']);
    Route::get('transactions', [LibraryDataController::class, 'transactions']);
    Route::post('transactions/issue', [LibraryDataController::class, 'issueBook']);
    Route::get('dashboard/summary', [LibraryDataController::class, 'dashboardSummary']);
});

// Publisher Portal Routes - Protected with publisher guard
Route::middleware('auth:publisher')->group(function () {
    Route::prefix('publisher-portal')->group(function () {
        Route::get('{publisherId}/dashboard', [PublisherPortalController::class, 'dashboard']);
        Route::get('{publisherId}/books', [PublisherPortalController::class, 'getPublisherBooks']);
        Route::get('{publisherId}/reports', [PublisherPortalController::class, 'reports']);
        Route::get('{publisherId}/feedback', [PublisherPortalController::class, 'feedback']);
        Route::post('feedback/{feedbackId}/reply', [PublisherPortalController::class, 'replyToFeedback']);
        Route::put('feedback/{feedbackId}/status', [PublisherPortalController::class, 'updateFeedbackStatus']);
    });
});