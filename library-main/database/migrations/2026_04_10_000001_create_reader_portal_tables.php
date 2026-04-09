<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('books', 'category')) {
            Schema::table('books', function (Blueprint $table) {
                $table->string('category', 120)->nullable()->after('author');
            });
        }

        if (!Schema::hasColumn('books', 'cover_image_url')) {
            Schema::table('books', function (Blueprint $table) {
                $table->string('cover_image_url', 500)->nullable()->after('description');
            });
        }

        if (!Schema::hasColumn('books', 'rating')) {
            Schema::table('books', function (Blueprint $table) {
                $table->decimal('rating', 3, 2)->default(0)->after('price');
            });
        }

        if (!Schema::hasTable('reader_book_purchases')) {
            Schema::create('reader_book_purchases', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('reader_id');
                $table->unsignedBigInteger('book_id');
                $table->decimal('price', 10, 2)->default(0);
                $table->dateTime('purchased_at');
                $table->dateTime('downloaded_at')->nullable();
                $table->timestamps();

                $table->unique(['reader_id', 'book_id'], 'rbp_reader_book_unique');
                $table->index('reader_id', 'rbp_reader_idx');
                $table->index('book_id', 'rbp_book_idx');
            });
        }

        if (!Schema::hasTable('reader_reading_progress')) {
            Schema::create('reader_reading_progress', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('reader_id');
                $table->unsignedBigInteger('book_id');
                $table->decimal('progress_percent', 5, 2)->default(0);
                $table->integer('current_page')->default(0);
                $table->integer('total_pages')->nullable();
                $table->dateTime('last_opened_at')->nullable();
                $table->timestamps();

                $table->unique(['reader_id', 'book_id'], 'rrp_reader_book_unique');
                $table->index('reader_id', 'rrp_reader_idx');
                $table->index('book_id', 'rrp_book_idx');
            });
        }

        if (!Schema::hasTable('reader_bookmarks')) {
            Schema::create('reader_bookmarks', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('reader_id');
                $table->unsignedBigInteger('book_id');
                $table->integer('page_number')->nullable();
                $table->string('note', 500)->nullable();
                $table->timestamps();

                $table->index('reader_id', 'rb_reader_idx');
                $table->index('book_id', 'rb_book_idx');
            });
        }

        if (!Schema::hasTable('reader_activities')) {
            Schema::create('reader_activities', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('reader_id');
                $table->unsignedBigInteger('book_id')->nullable();
                $table->string('activity_type', 80);
                $table->text('metadata')->nullable();
                $table->dateTime('occurred_at');
                $table->timestamps();

                $table->index('reader_id', 'ra_reader_idx');
                $table->index('book_id', 'ra_book_idx');
                $table->index('activity_type', 'ra_type_idx');
                $table->index('occurred_at', 'ra_occurred_idx');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('reader_activities');
        Schema::dropIfExists('reader_bookmarks');
        Schema::dropIfExists('reader_reading_progress');
        Schema::dropIfExists('reader_book_purchases');

        if (Schema::hasColumn('books', 'rating')) {
            Schema::table('books', function (Blueprint $table) {
                $table->dropColumn('rating');
            });
        }

        if (Schema::hasColumn('books', 'cover_image_url')) {
            Schema::table('books', function (Blueprint $table) {
                $table->dropColumn('cover_image_url');
            });
        }

        if (Schema::hasColumn('books', 'category')) {
            Schema::table('books', function (Blueprint $table) {
                $table->dropColumn('category');
            });
        }
    }
};
