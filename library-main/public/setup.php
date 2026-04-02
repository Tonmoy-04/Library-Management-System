<?php
/**
 * Library Management System - SQLite Setup
 * Access via: http://localhost:8000/setup.php
 * Then delete this file for security after successful setup
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    $dbPath = __DIR__ . '/../database/database.sqlite';
    $dbDir = dirname($dbPath);
    
    // Create database directory if it doesn't exist
    if (!is_dir($dbDir)) {
        if (!mkdir($dbDir, 0755, true)) {
            throw new Exception("Failed to create database directory");
        }
    }
    
    // Connect to SQLite
    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $output = [];
    
    // Check if tables exist
    $stmt = $pdo->query("SELECT name FROM sqlite_master WHERE type='table'");
    $existingTables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $tablesCreated = 0;
    
    // Create tables if they don't exist
    $tables = [
        'migrations' => "
            CREATE TABLE IF NOT EXISTS migrations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                migration TEXT NOT NULL,
                batch INTEGER NOT NULL
            )
        ",
        'users' => "
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                email_verified_at DATETIME,
                password TEXT NOT NULL,
                remember_token TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ",
        'publishers' => "
            CREATE TABLE IF NOT EXISTS publishers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                email TEXT,
                phone TEXT,
                address TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ",
        'books' => "
            CREATE TABLE IF NOT EXISTS books (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                author TEXT NOT NULL,
                publisher_id INTEGER,
                isbn TEXT UNIQUE,
                quantity INTEGER DEFAULT 1,
                available INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (publisher_id) REFERENCES publishers(id)
            )
        ",
        'book_issues' => "
            CREATE TABLE IF NOT EXISTS book_issues (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                book_id INTEGER NOT NULL,
                issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                due_at DATETIME,
                returned_at DATETIME,
                status TEXT DEFAULT 'issued',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (book_id) REFERENCES books(id)
            )
        "
    ];
    
    foreach ($tables as $tableName => $createSQL) {
        $pdo->exec($createSQL);
        if (!in_array($tableName, $existingTables)) {
            $tablesCreated++;
        }
    }
    
    $output[] = ['message' => "Database tables created ($tablesCreated new)", 'status' => 'success'];
    
    // Insert migrations record
    $pdo->exec("DELETE FROM migrations");
    $pdo->exec("
        INSERT INTO migrations (migration, batch) VALUES 
        ('2014_10_12_000000_create_users_table', 1),
        ('2024_01_01_000000_create_books_table', 1),
        ('2024_01_01_000001_create_publishers_table', 1),
        ('2024_01_01_000002_create_book_issues_table', 1)
    ");
    
    $output[] = ['message' => 'Migrations recorded', 'status' => 'success'];
    
    // Insert sample data
    $pdo->exec("DELETE FROM books");
    $pdo->exec("DELETE FROM publishers");
    
    $pdo->exec("
        INSERT INTO publishers (name, email, phone, address) VALUES 
        ('Penguin Books', 'contact@penguin.com', '1-800-PENGUIN', '80 Strand, London'),
        ('Oxford University Press', 'sales@oup.com', '1-800-451-7556', 'Great Clarendon Street, Oxford'),
        ('Cambridge University Press', 'info@cambridge.org', '1-800-872-7423', '32 Avenue of Americas, New York')
    ");
    
    $pdo->exec("
        INSERT INTO books (title, author, publisher_id, isbn, quantity, available) VALUES 
        ('The Great Gatsby', 'F. Scott Fitzgerald', 1, '9780743273565', 5, 5),
        ('1984', 'George Orwell', 2, '9780451524935', 3, 3),
        ('To Kill a Mockingbird', 'Harper Lee', 1, '9780061120084', 4, 4),
        ('Pride and Prejudice', 'Jane Austen', 3, '9780143039990', 6, 6),
        ('The Catcher in the Rye', 'J.D. Salinger', 2, '9780316769174', 2, 2)
    ");
    
    $output[] = ['message' => 'Sample data inserted', 'status' => 'success'];
    
    // Verify setup
    $userCount = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
    $bookCount = $pdo->query("SELECT COUNT(*) FROM books")->fetchColumn();
    $publisherCount = $pdo->query("SELECT COUNT(*) FROM publishers")->fetchColumn();
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Database setup completed successfully!',
        'steps' => $output,
        'statistics' => [
            'books' => $bookCount,
            'publishers' => $publisherCount,
            'users' => $userCount,
            'database_path' => $dbPath
        ],
        'next_steps' => [
            '1. Test registration at http://localhost:5175/register',
            '2. Delete this setup.php file for security',
            '3. Check backend logs for API responses'
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'troubleshooting' => [
            'Make sure the database directory is writable',
            'Check file permissions on ' . (isset($dbDir) ? $dbDir : 'database directory'),
            'Verify PDO SQLite driver is installed: php -m | grep pdo'
        ]
    ]);
}
?>
