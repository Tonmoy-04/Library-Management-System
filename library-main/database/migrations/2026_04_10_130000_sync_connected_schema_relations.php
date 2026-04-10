<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $this->ensureIndexAndForeignKey('books', 'publisher_id', 'publishers', 'id', 'books_publisher_id_idx', 'books_publisher_id_fk', 'nullOnDelete');
        $this->ensureIndexAndForeignKey('bookshelf', 'publisher_id', 'publishers', 'id', 'bookshelf_publisher_id_idx', 'bookshelf_publisher_id_fk', 'cascadeOnDelete');
        $this->ensureIndexAndForeignKey('book_issues', 'book_id', 'books', 'id', 'book_issues_book_id_idx', 'book_issues_book_id_fk', 'cascadeOnDelete');
        $this->ensureIndexAndForeignKey('book_issues', 'user_id', 'users', 'id', 'book_issues_user_id_idx', 'book_issues_user_id_fk', 'cascadeOnDelete');
        $this->ensureIndexAndForeignKey('feedback', 'book_id', 'books', 'id', 'feedback_book_id_idx', 'feedback_book_id_fk', 'cascadeOnDelete');
        $this->ensureIndexAndForeignKey('feedback', 'publisher_id', 'publishers', 'id', 'feedback_publisher_id_idx', 'feedback_publisher_id_fk', 'cascadeOnDelete');
        $this->ensureIndexAndForeignKey('feedback', 'reader_id', 'readers', 'id', 'feedback_reader_id_idx', 'feedback_reader_id_fk', 'cascadeOnDelete');
        $this->ensureIndexAndForeignKey('admin_actions_log', 'admin_id', 'users', 'id', 'admin_actions_log_admin_id_idx', 'admin_actions_log_admin_id_fk', 'nullOnDelete');
        $this->ensureIndexAndForeignKey('admin_actions_log', 'book_id', 'bookshelf', 'id', 'admin_actions_log_book_id_idx', 'admin_actions_log_book_id_fk', 'cascadeOnDelete');
    }

    public function down(): void
    {
        // Non-destructive sync migration; rollback intentionally does not remove relations.
    }

    private function ensureIndexAndForeignKey(
        string $table,
        string $column,
        string $referencedTable,
        string $referencedColumn,
        string $indexName,
        string $foreignKeyName,
        string $deleteRule
    ): void {
        if (!Schema::hasTable($table) || !Schema::hasTable($referencedTable)) {
            return;
        }

        if (!Schema::hasColumn($table, $column) || !Schema::hasColumn($referencedTable, $referencedColumn)) {
            return;
        }

        if (!$this->indexExists($table, $indexName)) {
            Schema::table($table, function (Blueprint $schemaTable) use ($column, $indexName) {
                $schemaTable->index($column, $indexName);
            });
        }

        if ($this->foreignKeyExists($table, $column, $referencedTable)) {
            return;
        }

        if ($this->hasOrphanRows($table, $column, $referencedTable, $referencedColumn)) {
            return;
        }

        Schema::table($table, function (Blueprint $schemaTable) use ($column, $referencedTable, $referencedColumn, $foreignKeyName, $deleteRule) {
            $foreign = $schemaTable->foreign($column, $foreignKeyName)
                ->references($referencedColumn)
                ->on($referencedTable);

            if ($deleteRule === 'cascadeOnDelete') {
                $foreign->cascadeOnDelete();
                return;
            }

            if ($deleteRule === 'nullOnDelete') {
                $foreign->nullOnDelete();
            }
        });
    }

    private function hasOrphanRows(string $table, string $column, string $referencedTable, string $referencedColumn): bool
    {
        $count = DB::table($table)
            ->whereNotNull($column)
            ->whereNotIn($column, function ($query) use ($referencedTable, $referencedColumn) {
                $query->select($referencedColumn)->from($referencedTable);
            })
            ->count();

        return $count > 0;
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
            'SELECT 1 AS found
             FROM information_schema.statistics
             WHERE table_schema = DATABASE()
               AND table_name = ?
               AND index_name = ?
             LIMIT 1',
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
