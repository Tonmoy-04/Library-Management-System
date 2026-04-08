<?php
/**
 * Library Management System - SQL Server Automated Setup
 * Access via: http://localhost:8000/setup-sqlserver.php
 * Then delete this file for security after successful setup
 */

set_time_limit(300);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Load environment variables
$envFile = __DIR__ . '/../.env';
if (!file_exists($envFile)) {
    http_response_code(500);
    echo json_encode(['error' => '.env file not found']);
    exit;
}

// Parse .env file manually (more reliable than parse_ini_file)
$env = [];
$lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
foreach ($lines as $line) {
    if (strpos($line, '=') && strpos($line, '#') === false) {
        list($key, $value) = explode('=', $line, 2);
        $env[trim($key)] = trim($value);
    }
}

try {
    $output = [];
    
    // Step 1: Test connection
    $output[] = ['step' => 1, 'message' => 'Testing SQL Server connection...'];
    
    $connectionInfo = array(
        "Server" => $env['DB_HOST'] . ',' . $env['DB_PORT'],
        "UID" => $env['DB_USERNAME'],
        "PWD" => isset($env['DB_PASSWORD']) ? $env['DB_PASSWORD'] : '',
        "Database" => "",
        "CharacterSet" => "UTF-8",
        "Encrypt" => isset($env['DB_ENCRYPT']) && $env['DB_ENCRYPT'] == 'yes' ? 1 : 0,
        "TrustServerCertificate" => isset($env['DB_TRUST_SERVER_CERTIFICATE']) && $env['DB_TRUST_SERVER_CERTIFICATE'] == 'false' ? 0 : 1
    );
    
    $conn = sqlsrv_connect($env['DB_HOST'], $connectionInfo);
    
    if (!$conn) {
        throw new Exception("SQL Server connection failed: " . json_encode(sqlsrv_errors()));
    }
    
    $output[] = ['step' => 1, 'status' => 'success', 'message' => 'Connected to SQL Server'];
    
    // Step 2: Create database
    $output[] = ['step' => 2, 'message' => 'Creating database...'];
    
    $dbName = $env['DB_DATABASE'];
    
    // Drop existing database
    sqlsrv_query($conn, "
        IF EXISTS (SELECT 1 FROM sys.databases WHERE name = '$dbName')
            DROP DATABASE [$dbName]
    ");
    
    // Create new database
    if (!sqlsrv_query($conn, "CREATE DATABASE [$dbName]")) {
        throw new Exception("Failed to create database: " . json_encode(sqlsrv_errors()));
    }
    
    $output[] = ['step' => 2, 'status' => 'success', 'message' => "Database '$dbName' created"];
    
    sqlsrv_close($conn);
    
    // Step 3: Connect to new database
    $output[] = ['step' => 3, 'message' => 'Connecting to database...'];
    
    $connectionInfo['Database'] = $dbName;
    $conn = sqlsrv_connect($env['DB_HOST'], $connectionInfo);
    
    if (!$conn) {
        throw new Exception("Failed to connect to database: " . json_encode(sqlsrv_errors()));
    }
    
    $output[] = ['step' => 3, 'status' => 'success', 'message' => 'Connected to database'];
    
    // Step 4: Create tables
    $output[] = ['step' => 4, 'message' => 'Creating tables...'];
    
    $queries = [
        "CREATE TABLE migrations (
            id INT IDENTITY(1,1) PRIMARY KEY,
            migration NVARCHAR(255) NOT NULL,
            batch INT NOT NULL
        )",
        
        "CREATE TABLE users (
            id BIGINT IDENTITY(1,1) PRIMARY KEY,
            name NVARCHAR(255) NOT NULL,
            email NVARCHAR(255) NOT NULL UNIQUE,
            email_verified_at DATETIME NULL,
            password NVARCHAR(255) NOT NULL,
            remember_token NVARCHAR(100) NULL,
            created_at DATETIME DEFAULT GETDATE(),
            updated_at DATETIME DEFAULT GETDATE()
        )",
        
        "CREATE INDEX idx_users_email ON users(email)",

        "CREATE TABLE readers (
            id BIGINT IDENTITY(1,1) PRIMARY KEY,
            name NVARCHAR(255) NOT NULL,
            email NVARCHAR(255) NOT NULL UNIQUE,
            phone NVARCHAR(50) NOT NULL,
            address NVARCHAR(MAX) NOT NULL,
            password NVARCHAR(255) NOT NULL,
            created_at DATETIME DEFAULT GETDATE(),
            updated_at DATETIME DEFAULT GETDATE()
        )",

        "CREATE INDEX idx_readers_email ON readers(email)",
        
        "CREATE TABLE publishers (
            id BIGINT IDENTITY(1,1) PRIMARY KEY,
            name NVARCHAR(255) NOT NULL UNIQUE,
            email NVARCHAR(255),
            phone NVARCHAR(20),
            address NVARCHAR(500),
            created_at DATETIME DEFAULT GETDATE(),
            updated_at DATETIME DEFAULT GETDATE()
        )",
        
        "CREATE INDEX idx_publishers_name ON publishers(name)",
        
        "CREATE TABLE books (
            id BIGINT IDENTITY(1,1) PRIMARY KEY,
            title NVARCHAR(255) NOT NULL,
            author NVARCHAR(255) NOT NULL,
            publisher_id BIGINT NULL,
            isbn NVARCHAR(13) UNIQUE,
            quantity INT DEFAULT 1,
            available INT DEFAULT 1,
            created_at DATETIME DEFAULT GETDATE(),
            updated_at DATETIME DEFAULT GETDATE(),
            FOREIGN KEY (publisher_id) REFERENCES publishers(id)
        )",
        
        "CREATE INDEX idx_books_publisher ON books(publisher_id)",
        
        "CREATE TABLE book_issues (
            id BIGINT IDENTITY(1,1) PRIMARY KEY,
            user_id BIGINT NOT NULL,
            book_id BIGINT NOT NULL,
            issued_at DATETIME DEFAULT GETDATE(),
            due_at DATETIME NULL,
            returned_at DATETIME NULL,
            status NVARCHAR(20) DEFAULT 'issued',
            created_at DATETIME DEFAULT GETDATE(),
            updated_at DATETIME DEFAULT GETDATE(),
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (book_id) REFERENCES books(id)
        )",
        
        "CREATE INDEX idx_book_issues_user ON book_issues(user_id)",
        "CREATE INDEX idx_book_issues_book ON book_issues(book_id)",
        
        "INSERT INTO migrations (migration, batch) VALUES 
            ('2014_10_12_000000_create_users_table', 1),
            ('2026_04_09_000000_create_readers_table', 1),
            ('2024_01_01_000000_create_books_table', 1),
            ('2024_01_01_000001_create_publishers_table', 1),
            ('2024_01_01_000002_create_book_issues_table', 1)",
        
        "INSERT INTO publishers (name, email, phone, address) VALUES
            ('Penguin Books', 'contact@penguin.com', '1-800-PENGUIN', '80 Strand, London'),
            ('Oxford University Press', 'sales@oup.com', '1-800-451-7556', 'Great Clarendon Street, Oxford'),
            ('Cambridge University Press', 'info@cambridge.org', '1-800-872-7423', '32 Avenue of Americas, New York')",
        
        "INSERT INTO books (title, author, publisher_id, isbn, quantity, available) VALUES
            ('The Great Gatsby', 'F. Scott Fitzgerald', 1, '9780743273565', 5, 5),
            ('1984', 'George Orwell', 2, '9780451524935', 3, 3),
            ('To Kill a Mockingbird', 'Harper Lee', 1, '9780061120084', 4, 4),
            ('Pride and Prejudice', 'Jane Austen', 3, '9780143039990', 6, 6),
            ('The Catcher in the Rye', 'J.D. Salinger', 2, '9780316769174', 2, 2)"
    ];
    
    $tableCount = 0;
    foreach ($queries as $query) {
        if (!sqlsrv_query($conn, $query)) {
            $errors = sqlsrv_errors();
            // Skip if table already exists
            if (isset($errors[0]) && strpos($errors[0]['message'], 'already exists') === false) {
                throw new Exception("Query failed: " . json_encode($errors));
            }
        }
        $tableCount++;
    }
    
    $output[] = ['step' => 4, 'status' => 'success', 'message' => "Created tables and data (queries: $tableCount)"];
    
    // Step 5: Verify setup
    $output[] = ['step' => 5, 'message' => 'Verifying setup...'];
    
    $result = sqlsrv_query($conn, "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo' ORDER BY TABLE_NAME");
    $tables = [];
    while ($row = sqlsrv_fetch_array($result, SQLSRV_FETCH_ASSOC)) {
        $tables[] = $row['TABLE_NAME'];
    }
    
    // Count users
    $result = sqlsrv_query($conn, "SELECT COUNT(*) as cnt FROM users");
    $row = sqlsrv_fetch_array($result, SQLSRV_FETCH_ASSOC);
    $userCount = $row['cnt'];

    $result = sqlsrv_query($conn, "SELECT COUNT(*) as cnt FROM readers");
    $row = sqlsrv_fetch_array($result, SQLSRV_FETCH_ASSOC);
    $readerCount = $row['cnt'];
    
    $result = sqlsrv_query($conn, "SELECT COUNT(*) as cnt FROM books");
    $row = sqlsrv_fetch_array($result, SQLSRV_FETCH_ASSOC);
    $bookCount = $row['cnt'];
    
    $output[] = ['step' => 5, 'status' => 'success', 'message' => 'Setup verified', 'data' => [
        'tables' => $tables,
        'user_count' => $userCount,
        'reader_count' => $readerCount,
        'book_count' => $bookCount
    ]];
    
    sqlsrv_close($conn);
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Database setup completed successfully!',
        'steps' => $output,
        'next_steps' => [
            '1. Test registration: POST http://localhost:8000/api/auth/register',
            '2. Delete this setup-sqlserver.php file for security',
            '3. Go to http://localhost:5173/register to test frontend'
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'troubleshooting' => [
            'Make sure SQL Server is running',
            'Verify SA account credentials in .env',
            'Check that TCP/IP protocol is enabled in SQL Server',
            'Ensure port 1433 is accessible'
        ]
    ]);
}

?>
