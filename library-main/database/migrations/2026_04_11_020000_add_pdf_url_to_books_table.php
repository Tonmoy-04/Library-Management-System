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
            if (! Schema::hasColumn('books', 'pdf_url')) {
                $table->string('pdf_url', 500)->nullable()->after('description');
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('books')) {
            return;
        }

        Schema::table('books', function (Blueprint $table) {
            if (Schema::hasColumn('books', 'pdf_url')) {
                $table->dropColumn('pdf_url');
            }
        });
    }
};
