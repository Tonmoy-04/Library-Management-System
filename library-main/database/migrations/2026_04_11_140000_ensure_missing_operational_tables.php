<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('borrow_requests')) {
            Schema::create('borrow_requests', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->unsignedBigInteger('book_id');
                $table->string('status', 30)->default('pending');
                $table->timestamp('requested_at')->nullable();
                $table->timestamp('approved_at')->nullable();
                $table->timestamp('rejected_at')->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();

                $table->index('user_id', 'borrow_requests_user_id_idx');
                $table->index('book_id', 'borrow_requests_book_id_idx');

                $table->foreign('user_id', 'borrow_requests_user_id_fk')
                    ->references('id')
                    ->on('users')
                    ->cascadeOnDelete();

                $table->foreign('book_id', 'borrow_requests_book_id_fk')
                    ->references('id')
                    ->on('books')
                    ->cascadeOnDelete();
            });
        }

        if (!Schema::hasTable('borrowed_books')) {
            Schema::create('borrowed_books', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->unsignedBigInteger('book_id');
                $table->unsignedBigInteger('book_issue_id')->nullable();
                $table->string('status', 30)->default('borrowed');
                $table->timestamp('borrowed_at')->nullable();
                $table->timestamp('due_at')->nullable();
                $table->timestamp('returned_at')->nullable();
                $table->timestamps();

                $table->index('user_id', 'borrowed_books_user_id_idx');
                $table->index('book_id', 'borrowed_books_book_id_idx');
                $table->index('book_issue_id', 'borrowed_books_book_issue_id_idx');

                $table->foreign('user_id', 'borrowed_books_user_id_fk')
                    ->references('id')
                    ->on('users')
                    ->cascadeOnDelete();

                $table->foreign('book_id', 'borrowed_books_book_id_fk')
                    ->references('id')
                    ->on('books')
                    ->cascadeOnDelete();

                $table->foreign('book_issue_id', 'borrowed_books_book_issue_id_fk')
                    ->references('id')
                    ->on('book_issues')
                    ->nullOnDelete();
            });
        }

        if (!Schema::hasTable('user_reader_profiles')) {
            Schema::create('user_reader_profiles', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->string('phone', 30)->nullable();
                $table->string('address', 255)->nullable();
                $table->date('date_of_birth')->nullable();
                $table->string('gender', 20)->nullable();
                $table->string('avatar_url', 500)->nullable();
                $table->json('preferences')->nullable();
                $table->timestamps();

                $table->unique('user_id', 'user_reader_profiles_user_id_unique');

                $table->foreign('user_id', 'user_reader_profiles_user_id_fk')
                    ->references('id')
                    ->on('users')
                    ->cascadeOnDelete();
            });
        }

        if (!Schema::hasTable('user_roles')) {
            Schema::create('user_roles', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->string('role', 50);
                $table->boolean('is_active')->default(true);
                $table->timestamp('assigned_at')->nullable();
                $table->timestamps();

                $table->unique(['user_id', 'role'], 'user_roles_user_id_role_unique');
                $table->index('role', 'user_roles_role_idx');

                $table->foreign('user_id', 'user_roles_user_id_fk')
                    ->references('id')
                    ->on('users')
                    ->cascadeOnDelete();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('user_roles');
        Schema::dropIfExists('user_reader_profiles');
        Schema::dropIfExists('borrowed_books');
        Schema::dropIfExists('borrow_requests');
    }
};
