<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('publisher_book_submissions')) {
            return;
        }

        Schema::table('publisher_book_submissions', function (Blueprint $table) {
            if (! Schema::hasColumn('publisher_book_submissions', 'category')) {
                $table->string('category', 120)->nullable()->after('description');
            }

            if (! Schema::hasColumn('publisher_book_submissions', 'quantity')) {
                $table->integer('quantity')->default(1)->after('price');
            }

            if (! Schema::hasColumn('publisher_book_submissions', 'free_to_read')) {
                $table->boolean('free_to_read')->default(false)->after('quantity');
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('publisher_book_submissions')) {
            return;
        }

        Schema::table('publisher_book_submissions', function (Blueprint $table) {
            if (Schema::hasColumn('publisher_book_submissions', 'free_to_read')) {
                $table->dropColumn('free_to_read');
            }

            if (Schema::hasColumn('publisher_book_submissions', 'quantity')) {
                $table->dropColumn('quantity');
            }

            if (Schema::hasColumn('publisher_book_submissions', 'category')) {
                $table->dropColumn('category');
            }
        });
    }
};
