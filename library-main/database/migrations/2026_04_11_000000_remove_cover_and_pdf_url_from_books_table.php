<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('books')) {
            return;
        }

        Schema::table('books', function (Blueprint $table) {
            if (Schema::hasColumn('books', 'cover_image_url')) {
                $table->dropColumn('cover_image_url');
            }

            if (Schema::hasColumn('books', 'pdf_url')) {
                $table->dropColumn('pdf_url');
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('books')) {
            return;
        }

        Schema::table('books', function (Blueprint $table) {
            if (! Schema::hasColumn('books', 'cover_image_url')) {
                $table->string('cover_image_url', 500)->nullable()->after('description');
            }

            if (! Schema::hasColumn('books', 'pdf_url')) {
                $table->string('pdf_url', 500)->nullable()->after('cover_image_url');
            }
        });
    }
};
