<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Api\LibraryDataController;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware('auth:api')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('refresh', [AuthController::class, 'refresh']);
        Route::get('me', [AuthController::class, 'me']);
    });
});

Route::middleware('auth:api')->group(function () {
    Route::get('readers', [LibraryDataController::class, 'readers']);
    Route::get('books', [LibraryDataController::class, 'books']);
    Route::get('transactions', [LibraryDataController::class, 'transactions']);
    Route::post('transactions/issue', [LibraryDataController::class, 'issueBook']);
    Route::get('dashboard/summary', [LibraryDataController::class, 'dashboardSummary']);
});