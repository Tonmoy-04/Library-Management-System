<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('books', function (Blueprint $table) {
            // Drop columns safely
            $columnsToDrop = [];
            if (Schema::hasColumn('books', 'quantity')) $columnsToDrop[] = 'quantity';
            if (Schema::hasColumn('books', 'available_quantity')) $columnsToDrop[] = 'available_quantity';
            if (Schema::hasColumn('books', 'available')) $columnsToDrop[] = 'available';
            
            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });

        Schema::table('publisher_book_submissions', function (Blueprint $table) {
            if (Schema::hasColumn('publisher_book_submissions', 'quantity')) {
                $table->dropColumn('quantity');
            }
        });
    }

    public function down()
    {
        Schema::table('books', function (Blueprint $table) {
            if (!Schema::hasColumn('books', 'quantity')) $table->integer('quantity')->default(1);
            if (!Schema::hasColumn('books', 'available_quantity')) $table->integer('available_quantity')->default(1);
            if (!Schema::hasColumn('books', 'available')) $table->integer('available')->default(1);
        });

        Schema::table('publisher_book_submissions', function (Blueprint $table) {
            if (!Schema::hasColumn('publisher_book_submissions', 'quantity')) {
                $table->integer('quantity')->default(1);
            }
        });
    }
};
