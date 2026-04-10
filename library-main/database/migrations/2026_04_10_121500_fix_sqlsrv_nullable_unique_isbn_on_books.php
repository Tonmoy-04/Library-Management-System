<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'sqlsrv') {
            return;
        }

        if (! Schema::hasTable('books') || ! Schema::hasColumn('books', 'isbn')) {
            return;
        }

        $tableObjectName = 'dbo.books';
        $targetIndexName = 'books_isbn_unique_not_null';

        // Drop unique constraints on books.isbn (SQL Server creates them for column->unique()).
        $constraints = DB::select(
            'SELECT kc.name
             FROM sys.key_constraints kc
             INNER JOIN sys.index_columns ic
                 ON kc.parent_object_id = ic.object_id
                AND kc.unique_index_id = ic.index_id
             INNER JOIN sys.columns c
                 ON ic.object_id = c.object_id
                AND ic.column_id = c.column_id
             WHERE kc.parent_object_id = OBJECT_ID(?)
               AND kc.type = ?
               AND c.name = ?',
            [$tableObjectName, 'UQ', 'isbn']
        );

        foreach ($constraints as $constraint) {
            $name = $constraint->name ?? null;
            if (! $name) {
                continue;
            }

            DB::statement("ALTER TABLE [books] DROP CONSTRAINT [{$name}]");
        }

        // Drop any remaining unique indexes on books.isbn except our target index name.
        $uniqueIndexes = DB::select(
            'SELECT i.name
             FROM sys.indexes i
             INNER JOIN sys.index_columns ic
                 ON i.object_id = ic.object_id
                AND i.index_id = ic.index_id
             INNER JOIN sys.columns c
                 ON ic.object_id = c.object_id
                AND ic.column_id = c.column_id
             WHERE i.object_id = OBJECT_ID(?)
               AND i.is_unique = 1
               AND i.is_primary_key = 0
               AND c.name = ?
               AND i.name <> ?',
            [$tableObjectName, 'isbn', $targetIndexName]
        );

        foreach ($uniqueIndexes as $index) {
            $name = $index->name ?? null;
            if (! $name) {
                continue;
            }

            DB::statement("DROP INDEX [{$name}] ON [books]");
        }

        $targetExists = DB::selectOne(
            'SELECT 1 AS found
             FROM sys.indexes
             WHERE object_id = OBJECT_ID(?)
               AND name = ?',
            [$tableObjectName, $targetIndexName]
        );

        if (! $targetExists) {
            DB::statement(
                'CREATE UNIQUE INDEX [books_isbn_unique_not_null]
                 ON [books] ([isbn])
                 WHERE [isbn] IS NOT NULL'
            );
        }
    }

    public function down(): void
    {
        // Non-destructive rollback: keep the safer SQL Server nullable unique behavior.
    }
};
