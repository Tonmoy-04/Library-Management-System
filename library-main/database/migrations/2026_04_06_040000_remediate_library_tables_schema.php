<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $this->ensurePublishersTable();
        $this->ensureBooksTable();
        $this->ensureBookIssuesTable();
        $this->ensureBookIssuesColumns();
        $this->ensureBookIssuesIndexesAndForeignKeys();
    }

    public function down(): void
    {
        // Intentionally non-destructive: this remediation migration only repairs schema drift.
    }

    private function ensurePublishersTable(): void
    {
        if (Schema::hasTable('publishers')) {
            return;
        }

        Schema::create('publishers', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('email')->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('address', 500)->nullable();
            $table->timestamps();
        });

        if (! $this->indexExists('publishers', 'publishers_name_idx')) {
            Schema::table('publishers', function (Blueprint $table) {
                $table->index('name', 'publishers_name_idx');
            });
        }
    }

    private function ensureBooksTable(): void
    {
        if (! Schema::hasTable('books')) {
            Schema::create('books', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->string('author');
                $table->unsignedBigInteger('publisher_id')->nullable();
                $table->integer('quantity')->default(1);
                $table->integer('available')->default(1);
                $table->timestamps();
            });
        }

        Schema::table('books', function (Blueprint $table) {
            if (! Schema::hasColumn('books', 'title')) {
                $table->string('title');
            }
            if (! Schema::hasColumn('books', 'author')) {
                $table->string('author');
            }
            if (! Schema::hasColumn('books', 'publisher_id')) {
                $table->unsignedBigInteger('publisher_id')->nullable();
            }
            if (! Schema::hasColumn('books', 'quantity')) {
                $table->integer('quantity')->default(1);
            }
            if (! Schema::hasColumn('books', 'available')) {
                $table->integer('available')->default(1);
            }
            if (! Schema::hasColumn('books', 'created_at')) {
                $table->timestamp('created_at')->nullable();
            }
            if (! Schema::hasColumn('books', 'updated_at')) {
                $table->timestamp('updated_at')->nullable();
            }
        });

        if (! $this->indexExists('books', 'books_publisher_id_idx') && Schema::hasColumn('books', 'publisher_id')) {
            Schema::table('books', function (Blueprint $table) {
                $table->index('publisher_id', 'books_publisher_id_idx');
            });
        }

        if (
            Schema::hasTable('publishers')
            && Schema::hasColumn('books', 'publisher_id')
            && ! $this->foreignKeyExists('books', 'publisher_id', 'publishers')
        ) {
            Schema::table('books', function (Blueprint $table) {
                $table->foreign('publisher_id', 'books_publisher_id_fk')
                    ->references('id')
                    ->on('publishers')
                    ->nullOnDelete();
            });
        }
    }

    private function ensureBookIssuesTable(): void
    {
        if (Schema::hasTable('book_issues')) {
            return;
        }

        Schema::create('book_issues', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('book_id');
            $table->dateTime('issued_at')->nullable();
            $table->dateTime('due_at')->nullable();
            $table->dateTime('returned_at')->nullable();
            $table->string('status', 20)->default('issued');
            $table->timestamps();
        });
    }

    private function ensureBookIssuesColumns(): void
    {
        if (! Schema::hasTable('book_issues')) {
            return;
        }

        Schema::table('book_issues', function (Blueprint $table) {
            if (! Schema::hasColumn('book_issues', 'user_id')) {
                $table->unsignedBigInteger('user_id');
            }
            if (! Schema::hasColumn('book_issues', 'book_id')) {
                $table->unsignedBigInteger('book_id');
            }
            if (! Schema::hasColumn('book_issues', 'issued_at')) {
                $table->dateTime('issued_at')->nullable();
            }
            if (! Schema::hasColumn('book_issues', 'due_at')) {
                $table->dateTime('due_at')->nullable();
            }
            if (! Schema::hasColumn('book_issues', 'returned_at')) {
                $table->dateTime('returned_at')->nullable();
            }
            if (! Schema::hasColumn('book_issues', 'status')) {
                $table->string('status', 20)->default('issued');
            }
            if (! Schema::hasColumn('book_issues', 'created_at')) {
                $table->timestamp('created_at')->nullable();
            }
            if (! Schema::hasColumn('book_issues', 'updated_at')) {
                $table->timestamp('updated_at')->nullable();
            }
        });
    }

    private function ensureBookIssuesIndexesAndForeignKeys(): void
    {
        if (! Schema::hasTable('book_issues')) {
            return;
        }

        if (! $this->indexExists('book_issues', 'book_issues_user_id_idx') && Schema::hasColumn('book_issues', 'user_id')) {
            Schema::table('book_issues', function (Blueprint $table) {
                $table->index('user_id', 'book_issues_user_id_idx');
            });
        }

        if (! $this->indexExists('book_issues', 'book_issues_book_id_idx') && Schema::hasColumn('book_issues', 'book_id')) {
            Schema::table('book_issues', function (Blueprint $table) {
                $table->index('book_id', 'book_issues_book_id_idx');
            });
        }

        if (! $this->indexExists('book_issues', 'book_issues_status_idx') && Schema::hasColumn('book_issues', 'status')) {
            Schema::table('book_issues', function (Blueprint $table) {
                $table->index('status', 'book_issues_status_idx');
            });
        }

        if (
            Schema::hasTable('users')
            && Schema::hasColumn('book_issues', 'user_id')
            && ! $this->foreignKeyExists('book_issues', 'user_id', 'users')
        ) {
            Schema::table('book_issues', function (Blueprint $table) {
                $table->foreign('user_id', 'book_issues_user_id_fk')
                    ->references('id')
                    ->on('users');
            });
        }

        if (
            Schema::hasTable('books')
            && Schema::hasColumn('book_issues', 'book_id')
            && ! $this->foreignKeyExists('book_issues', 'book_id', 'books')
        ) {
            Schema::table('book_issues', function (Blueprint $table) {
                $table->foreign('book_id', 'book_issues_book_id_fk')
                    ->references('id')
                    ->on('books');
            });
        }
    }

    private function indexExists(string $table, string $indexName): bool
    {
        $driver = DB::getDriverName();

        if ($driver === 'sqlite') {
            $indexes = DB::select("PRAGMA index_list('$table')");
            foreach ($indexes as $index) {
                if (($index->name ?? null) === $indexName) {
                    return true;
                }
            }

            return false;
        }

        if ($driver === 'sqlsrv') {
            $result = DB::selectOne(
                'SELECT 1 AS found FROM sys.indexes WHERE name = ? AND object_id = OBJECT_ID(?)',
                [$indexName, $table]
            );

            return $result !== null;
        }

        $result = DB::selectOne(
            'SELECT 1 AS found FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ? LIMIT 1',
            [$table, $indexName]
        );

        return $result !== null;
    }

    private function foreignKeyExists(string $table, string $column, string $referencedTable): bool
    {
        $driver = DB::getDriverName();

        if ($driver === 'sqlite') {
            $foreignKeys = DB::select("PRAGMA foreign_key_list('$table')");
            foreach ($foreignKeys as $foreignKey) {
                if (($foreignKey->from ?? null) === $column && ($foreignKey->table ?? null) === $referencedTable) {
                    return true;
                }
            }

            return false;
        }

        if ($driver === 'sqlsrv') {
            $result = DB::selectOne(
                'SELECT 1 AS found
                 FROM sys.foreign_keys fk
                 JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
                 JOIN sys.columns pc ON fkc.parent_object_id = pc.object_id AND fkc.parent_column_id = pc.column_id
                 JOIN sys.tables rt ON fkc.referenced_object_id = rt.object_id
                 WHERE fk.parent_object_id = OBJECT_ID(?)
                   AND pc.name = ?
                   AND rt.name = ?',
                [$table, $column, $referencedTable]
            );

            return $result !== null;
        }

        $result = DB::selectOne(
            'SELECT 1 AS found
             FROM information_schema.KEY_COLUMN_USAGE
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = ?
               AND COLUMN_NAME = ?
               AND REFERENCED_TABLE_NAME = ?
             LIMIT 1',
            [$table, $column, $referencedTable]
        );

        return $result !== null;
    }
};
