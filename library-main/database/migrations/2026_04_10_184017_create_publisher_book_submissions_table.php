<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('publisher_book_submissions', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('author');
            $table->unsignedBigInteger('publisher_id');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->string('file_url', 500)->nullable();
            $table->string('cover_url', 500)->nullable();
            $table->enum('status', ['pending', 'accepted', 'declined'])->default('pending');
            $table->timestamps();
            
            // Foreign key constraint
            $table->foreign('publisher_id')->references('id')->on('publishers')->onDelete('cascade');
            
            // Index for queries
            $table->index(['publisher_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('publisher_book_submissions');
    }
};
