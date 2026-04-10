<?php
require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

try {
    DB::connection()->getPdo();
    echo "Database Connection: OK\n";
    echo "========================\n";
    
    // Get all tables
    $tables = DB::select("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE' ORDER BY TABLE_NAME");
    
    echo "Tables in Database:\n";
    foreach ($tables as $table) {
        echo "  - " . $table->TABLE_NAME . "\n";
    }
    
    echo "\nExpected Tables from Connected Schema:\n";
    echo "  - users\n";
    echo "  - profiles\n";
    echo "  - readers\n";
    echo "  - publishers\n";
    echo "  - books\n";
    echo "  - bookshelf\n";
    echo "  - book_issues\n";
    echo "  - feedback\n";
    echo "  - admin_actions_log\n";
    echo "  - password_resets\n";
    echo "  - password_reset_tokens\n";
    echo "  - failed_jobs\n";
    echo "  - personal_access_tokens\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
