<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('books')) {
            return;
        }

        Schema::table('books', function (Blueprint $table) {
            if (!Schema::hasColumn('books', 'description')) {
                $table->text('description')->nullable();
            }

            if (!Schema::hasColumn('books', 'isbn')) {
                $table->string('isbn', 64)->nullable();
            }

            if (!Schema::hasColumn('books', 'price')) {
                $table->decimal('price', 10, 2)->default(0);
            }

            if (!Schema::hasColumn('books', 'category')) {
                $table->string('category', 120)->nullable();
            }

            if (!Schema::hasColumn('books', 'cover_image_url')) {
                $table->string('cover_image_url', 500)->nullable();
            }

            if (!Schema::hasColumn('books', 'rating')) {
                $table->decimal('rating', 3, 2)->default(0);
            }

            if (!Schema::hasColumn('books', 'available')) {
                if (Schema::hasColumn('books', 'available_quantity')) {
                    $table->integer('available')->default(0);
                } else {
                    $table->integer('available')->default(0);
                }
            }
        });
    }

    public function down(): void
    {
        // Non-destructive migration. Intentionally left blank.
    }
};
