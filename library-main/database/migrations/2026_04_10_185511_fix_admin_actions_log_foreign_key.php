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
        // Drop the old table and recreate with correct schema
        Schema::dropIfExists('admin_actions_log');

        Schema::create('admin_actions_log', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('submission_id');
            $table->enum('action', ['accepted', 'declined']);
            $table->unsignedBigInteger('admin_id')->nullable();
            $table->timestamp('action_date')->useCurrent();
            $table->timestamps();

            $table->index(['submission_id', 'action'], 'admin_actions_submission_action_idx');
            $table->foreign('submission_id', 'admin_actions_submission_fk')
                ->references('id')
                ->on('publisher_book_submissions')
                ->cascadeOnDelete();
            $table->foreign('admin_id', 'admin_actions_admin_fk')
                ->references('id')
                ->on('users')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_actions_log');
    }
};
