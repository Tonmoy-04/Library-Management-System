<?php
/**
 * Standalone SQLite Database Setup
 * Run: php public/setup_standalone.php
 */

set_time_limit(300);

$dbPath = __DIR__ . '/../database/database.sqlite';
$dbDir = dirname($dbPath);

try {
    if (!extension_loaded('pdo_sqlite')) {
        throw new Exception("PDO SQLite extension is not installed");
    }

    echo "[Step 1] Creating database directory...\n";
    if (!is_dir($dbDir)) {
        mkdir($dbDir, 0755, true);
    }
    echo "[✓] Directory ready\n";

    echo "\n[Step 2] Creating SQLite database...\n";
    
    // Delete existing database if it exists
    if (file_exists($dbPath)) {
        unlink($dbPath);
        echo "[i] Old database deleted\n";
    }
    
    // Create connection
    $pdo = new PDO("sqlite:$dbPath");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "[✓] Database created at: $dbPath\n";

    // Create tables
    echo "\n[Step 3] Creating tables...\n";
    
    $queries = [
        // Migrations table
        "CREATE TABLE migrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            migration TEXT NOT NULL,
            batch INTEGER NOT NULL
        )",
        
        // Users table
        "CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            email_verified_at DATETIME NULL,
            password TEXT NOT NULL,
            remember_token TEXT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        
        // Insert migration records
        "INSERT INTO migrations (migration, batch) VALUES ('2014_10_12_000000_create_users_table', 1)",
        "INSERT INTO migrations (migration, batch) VALUES ('2014_10_12_100000_create_password_reset_tokens_table', 1)",
        "INSERT INTO migrations (migration, batch) VALUES ('2019_08_19_000000_create_failed_jobs_table', 1)",
        "INSERT INTO migrations (migration, batch) VALUES ('2019_12_14_000001_create_personal_access_tokens_table', 1)"
    ];
    
    foreach ($queries as $i => $sql) {
        try {
            $pdo->exec($sql);
        } catch (Exception $e) {
            // Ignore if table already exists
            if (strpos($e->getMessage(), 'already exists') === false) {
                throw new Exception("Query " . ($i+1) . " failed: " . $e->getMessage() . "\nSQL: " . $sql);
            }
        }
    }
    echo "[✓] All tables created\n";

    // Verify
    echo "\n[Step 4] Verifying setup...\n";
    
    $tables = $pdo->query("SELECT name FROM sqlite_master WHERE type='table'")->fetchAll(PDO::FETCH_COLUMN);
    echo "Tables:\n";
    foreach ($tables as $table) {
        echo "  - $table\n";
    }
    
    $userCount = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
    echo "Users: " . $userCount . "\n";
    
    $migrationCount = $pdo->query("SELECT COUNT(*) FROM migrations")->fetchColumn();
    echo "Migrations: " . $migrationCount . "\n";

    $pdo = null;
    
    echo "\n" . str_repeat("=", 50) . "\n";
    echo "[✓] DATABASE SETUP COMPLETE!\n";
    echo str_repeat("=", 50) . "\n";
    echo "\nYou can now:\n";
    echo "1. Go to http://localhost:5173/register\n";
    echo "2. Fill in the registration form\n";
    echo "3. Click Register to create a new user\n";
    
} catch (Exception $e) {
    echo "\n" . str_repeat("=", 50) . "\n";
    echo "[ERROR] Setup failed!\n";
    echo str_repeat("=", 50) . "\n";
    echo "\nError: " . $e->getMessage() . "\n";
    echo "\nTroubleshooting:\n";
    echo "1. Make sure PHP PDO SQLite extension is installed\n";
    echo "2. Check write permissions for directory: " . dirname($dbPath) . "\n";
    echo "3. Try again: php public/setup_standalone.php\n";
    exit(1);
}

?>
