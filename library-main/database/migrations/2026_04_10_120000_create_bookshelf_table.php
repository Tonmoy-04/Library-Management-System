<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('bookshelf')) {
            return;
        }

        Schema::create('bookshelf', function (Blueprint $table) {
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

            $table->index(['publisher_id', 'status'], 'bookshelf_publisher_status_idx');
            $table->foreign('publisher_id', 'bookshelf_publisher_fk')
                ->references('id')
                ->on('publishers')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookshelf');
    }
};
