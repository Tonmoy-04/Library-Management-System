<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('admin_actions_log')) {
            return;
        }

        Schema::create('admin_actions_log', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('book_id');
            $table->enum('action', ['accepted', 'declined']);
            $table->unsignedBigInteger('admin_id')->nullable();
            $table->timestamp('action_date')->useCurrent();
            $table->timestamps();

            $table->index(['book_id', 'action'], 'admin_actions_book_action_idx');
            $table->foreign('book_id', 'admin_actions_book_fk')
                ->references('id')
                ->on('bookshelf')
                ->cascadeOnDelete();
            $table->foreign('admin_id', 'admin_actions_admin_fk')
                ->references('id')
                ->on('users')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_actions_log');
    }
};
