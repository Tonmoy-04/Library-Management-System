<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Idempotent remediation: safely creates or updates book_issues schema.
     */
    public function up(): void
    {
        // Ensure publishers table exists first
        if (!Schema::hasTable('publishers')) {
            Schema::create('publishers', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->text('description')->nullable();
                $table->string('email')->nullable();
                $table->string('phone')->nullable();
                $table->string('address')->nullable();
                $table->string('city')->nullable();
                $table->string('country')->nullable();
                $table->timestamps();
            });
        }

        // Ensure books table exists
        if (!Schema::hasTable('books')) {
            Schema::create('books', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->text('description')->nullable();
                $table->string('isbn')->unique()->nullable();
                $table->unsignedBigInteger('publisher_id')->nullable();
                $table->string('author')->nullable();
                $table->integer('quantity')->default(0);
                $table->integer('available_quantity')->default(0);
                $table->decimal('price', 10, 2)->nullable();
                $table->timestamps();
            });
        }

        // Safely create book_issues table if missing
        if (!Schema::hasTable('book_issues')) {
            Schema::create('book_issues', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->unsignedBigInteger('book_id');
                $table->dateTime('issued_at');
                $table->dateTime('due_at');
                $table->dateTime('returned_at')->nullable();
                $table->string('status')->default('issued');
                $table->text('notes')->nullable();
                $table->timestamps();

                // Add indexes for query performance
                $table->index('user_id');
                $table->index('book_id');
                $table->index('status');
                $table->index('issued_at');
            });
        } else {
            // Book_issues exists, but ensure all columns exist (additive fix)
            if (!Schema::hasColumn('book_issues', 'user_id')) {
                Schema::table('book_issues', function (Blueprint $table) {
                    $table->unsignedBigInteger('user_id')->after('id');
                });
            }

            if (!Schema::hasColumn('book_issues', 'book_id')) {
                Schema::table('book_issues', function (Blueprint $table) {
                    $table->unsignedBigInteger('book_id')->after('user_id');
                });
            }

            if (!Schema::hasColumn('book_issues', 'issued_at')) {
                Schema::table('book_issues', function (Blueprint $table) {
                    $table->dateTime('issued_at')->after('book_id');
                });
            }

            if (!Schema::hasColumn('book_issues', 'due_at')) {
                Schema::table('book_issues', function (Blueprint $table) {
                    $table->dateTime('due_at')->nullable()->after('issued_at');
                });
            }

            if (!Schema::hasColumn('book_issues', 'returned_at')) {
                Schema::table('book_issues', function (Blueprint $table) {
                    $table->dateTime('returned_at')->nullable()->after('due_at');
                });
            }

            if (!Schema::hasColumn('book_issues', 'status')) {
                Schema::table('book_issues', function (Blueprint $table) {
                    $table->string('status')->default('issued')->after('returned_at');
                });
            }

            if (!Schema::hasColumn('book_issues', 'notes')) {
                Schema::table('book_issues', function (Blueprint $table) {
                    $table->text('notes')->nullable()->after('status');
                });
            }

            // Ensure indexes exist
            $this->ensureIndexExists('book_issues', 'user_id');
            $this->ensureIndexExists('book_issues', 'book_id');
            $this->ensureIndexExists('book_issues', 'status');
            $this->ensureIndexExists('book_issues', 'issued_at');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Safety: Don't drop in down() - this is data preservation
        // If you need to rollback, manually remove the migration record
    }

    /**
     * Helper: safely create index if not exists (SQL Server compatible)
     */
    private function ensureIndexExists(string $table, string $column): void
    {
        $indexName = $table . '_' . $column . '_index';

        try {
            $exists = DB::selectOne(
                "SELECT 1 FROM sys.indexes WHERE name = ? AND object_id = OBJECT_ID(?)",
                [$indexName, 'dbo.' . $table]
            );

            if (!$exists) {
                DB::statement("CREATE INDEX [{$indexName}] ON [{$table}] ([{$column}])");
            }
        } catch (\Exception $e) {
            // Index might already exist with different name, that's OK
        }
    }
};
