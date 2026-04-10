<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('user_library')) {
            Schema::create('user_library', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->unsignedBigInteger('book_id');
                $table->enum('status', ['saved', 'bookmarked', 'purchased', 'reading']);
                $table->dateTime('added_at')->useCurrent();

                $table->unique(['user_id', 'book_id', 'status'], 'user_library_user_book_status_unique');
                $table->index('user_id', 'user_library_user_idx');
                $table->index('book_id', 'user_library_book_idx');
                $table->index('status', 'user_library_status_idx');
            });
        }

        if (!Schema::hasTable('transactions')) {
            Schema::create('transactions', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->unsignedBigInteger('book_id');
                $table->decimal('amount', 10, 2)->default(0);
                $table->enum('payment_status', ['paid', 'pending', 'failed'])->default('pending');
                $table->dateTime('transaction_date')->useCurrent();

                $table->index('user_id', 'transactions_user_idx');
                $table->index('book_id', 'transactions_book_idx');
                $table->index('payment_status', 'transactions_payment_status_idx');
                $table->index('transaction_date', 'transactions_date_idx');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('user_library');
    }
};