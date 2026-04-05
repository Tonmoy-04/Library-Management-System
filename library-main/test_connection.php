<?php
require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    DB::connection()->getPdo();
    echo "✅ Database connection successful!\n";
} catch (Exception $e) {
    echo "❌ Connection failed: " . $e->getMessage() . "\n";
}
