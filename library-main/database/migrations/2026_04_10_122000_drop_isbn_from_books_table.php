<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('books') || ! Schema::hasColumn('books', 'isbn')) {
            return;
        }

        if (DB::getDriverName() === 'sqlsrv') {
            $tableObjectName = 'dbo.books';

            $constraints = DB::select(
                'SELECT kc.name
                 FROM sys.key_constraints kc
                 INNER JOIN sys.key_constraints kcx ON kc.object_id = kcx.object_id
                 WHERE kc.parent_object_id = OBJECT_ID(?)
                   AND kc.type = ?',
                [$tableObjectName, 'UQ']
            );

            foreach ($constraints as $constraint) {
                $name = $constraint->name ?? null;
                if (! $name) {
                    continue;
                }

                $columnRows = DB::select(
                    'SELECT c.name
                     FROM sys.key_constraints kc
                     INNER JOIN sys.index_columns ic
                         ON kc.parent_object_id = ic.object_id
                        AND kc.unique_index_id = ic.index_id
                     INNER JOIN sys.columns c
                         ON ic.object_id = c.object_id
                        AND ic.column_id = c.column_id
                     WHERE kc.name = ?
                       AND kc.parent_object_id = OBJECT_ID(?)',
                    [$name, $tableObjectName]
                );

                foreach ($columnRows as $columnRow) {
                    if (($columnRow->name ?? null) === 'isbn') {
                        DB::statement("ALTER TABLE [books] DROP CONSTRAINT [{$name}]");
                        break;
                    }
                }
            }

            $indexes = DB::select(
                'SELECT DISTINCT i.name
                 FROM sys.indexes i
                 INNER JOIN sys.index_columns ic
                     ON i.object_id = ic.object_id
                    AND i.index_id = ic.index_id
                 INNER JOIN sys.columns c
                     ON ic.object_id = c.object_id
                    AND ic.column_id = c.column_id
                 WHERE i.object_id = OBJECT_ID(?)
                   AND i.is_primary_key = 0
                   AND c.name = ?',
                [$tableObjectName, 'isbn']
            );

            foreach ($indexes as $index) {
                $name = $index->name ?? null;
                if (! $name) {
                    continue;
                }

                DB::statement("DROP INDEX [{$name}] ON [books]");
            }

            DB::statement('ALTER TABLE [books] DROP COLUMN [isbn]');

            return;
        }

        DB::statement('ALTER TABLE books DROP COLUMN isbn');
    }

    public function down(): void
    {
        if (! Schema::hasTable('books') || Schema::hasColumn('books', 'isbn')) {
            return;
        }

        if (DB::getDriverName() === 'sqlsrv') {
            DB::statement('ALTER TABLE [books] ADD [isbn] NVARCHAR(64) NULL');
            return;
        }

        DB::statement('ALTER TABLE books ADD isbn VARCHAR(64) NULL');
    }
};
