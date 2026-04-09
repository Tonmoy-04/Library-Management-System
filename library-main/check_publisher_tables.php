<?php
require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

try {
    DB::connection()->getPdo();
    echo "Database Connection: OK\n";
    echo "========================\n\n";
    
    // Check Publisher Portal Required Tables and Columns
    echo "PUBLISHER PORTAL REQUIREMENTS CHECK:\n";
    echo "====================================\n\n";
    
    // Check Publishers Table
    echo "✓ Publishers Table:\n";
    if (Schema::hasTable('publishers')) {
        $columns = DB::select("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='publishers' ORDER BY COLUMN_NAME");
        foreach ($columns as $col) {
            echo "  - {$col->COLUMN_NAME} ({$col->DATA_TYPE})\n";
        }
    }
    echo "\n";
    
    // Check Books Table
    echo "✓ Books Table:\n";
    if (Schema::hasTable('books')) {
        $columns = DB::select("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='books' ORDER BY COLUMN_NAME");
        foreach ($columns as $col) {
            echo "  - {$col->COLUMN_NAME} ({$col->DATA_TYPE})\n";
        }
    }
    echo "\n";
    
    // Check Book Issues Table
    echo "✓ Book Issues Table:\n";
    if (Schema::hasTable('book_issues')) {
        $columns = DB::select("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='book_issues' ORDER BY COLUMN_NAME");
        foreach ($columns as $col) {
            echo "  - {$col->COLUMN_NAME} ({$col->DATA_TYPE})\n";
        }
    }
    echo "\n";
    
    // Check Readers Table
    echo "✓ Readers Table:\n";
    if (Schema::hasTable('readers')) {
        $columns = DB::select("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='readers' ORDER BY COLUMN_NAME");
        foreach ($columns as $col) {
            echo "  - {$col->COLUMN_NAME} ({$col->DATA_TYPE})\n";
        }
    }
    echo "\n";
    
    // Check Feedback Table
    echo "✓ Feedback Table:\n";
    if (Schema::hasTable('feedback')) {
        $columns = DB::select("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='feedback' ORDER BY COLUMN_NAME");
        foreach ($columns as $col) {
            echo "  - {$col->COLUMN_NAME} ({$col->DATA_TYPE})\n";
        }
    } else {
        echo "  ✗ MISSING!\n";
    }
    echo "\n";
    
    // Summary
    echo "SUMMARY:\n";
    echo "========\n";
    $requiredTables = ['publishers', 'books', 'book_issues', 'readers', 'feedback'];
    $allPresent = true;
    
    foreach ($requiredTables as $table) {
        $exists = Schema::hasTable($table) ? '✓' : '✗';
        echo "$exists $table\n";
        if (!Schema::hasTable($table)) {
            $allPresent = false;
        }
    }
    
    echo "\n";
    if ($allPresent) {
        echo "✓ ALL REQUIRED TABLES ARE PRESENT!\n";
        echo "✓ Publisher Portal is ready to use!\n";
    } else {
        echo "✗ Some tables are missing. Run migrations.\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
