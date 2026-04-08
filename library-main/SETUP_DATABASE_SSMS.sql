-- SQL Server Database Setup for Library Management System
-- Execute this in SQL Server Management Studio (SSMS)
-- Right-click "Databases" > New Query > Paste this entire script > Execute

USE master;
GO

-- Check if database exists and drop it
IF EXISTS (SELECT 1 FROM sys.databases WHERE name = 'library_management')
    DROP DATABASE library_management;
GO

-- Create the database
CREATE DATABASE library_management;
GO

-- Use the new database
USE library_management;
GO

-- Create migrations table
CREATE TABLE migrations (
    id INT IDENTITY(1,1) PRIMARY KEY,
    migration NVARCHAR(255) NOT NULL,
    batch INT NOT NULL
);
GO

-- Create users table
CREATE TABLE users (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NOT NULL UNIQUE,
    email_verified_at DATETIME NULL,
    password NVARCHAR(255) NOT NULL,
    remember_token NVARCHAR(100) NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);
GO

-- Create readers table
CREATE TABLE readers (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NOT NULL UNIQUE,
    phone NVARCHAR(50) NOT NULL,
    address NVARCHAR(MAX) NOT NULL,
    password NVARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);
GO

-- Create index on email for better query performance
CREATE INDEX idx_users_email ON users(email);
GO

-- Create index on reader email for faster reader lookups
CREATE INDEX idx_readers_email ON readers(email);
GO

-- Create books table
CREATE TABLE books (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    author NVARCHAR(255) NOT NULL,
    publisher_id BIGINT NULL,
    isbn NVARCHAR(13) UNIQUE,
    quantity INT DEFAULT 1,
    available INT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);
GO

-- Create publishers table
CREATE TABLE publishers (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL UNIQUE,
    email NVARCHAR(255),
    phone NVARCHAR(20),
    address NVARCHAR(500),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);
GO

-- Create index on publisher name
CREATE INDEX idx_publishers_name ON publishers(name);
GO

-- Create book_issues table (transactions)
CREATE TABLE book_issues (
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
);
GO

-- Create index on user_id for faster queries
CREATE INDEX idx_book_issues_user ON book_issues(user_id);
GO

-- Create index on book_id
CREATE INDEX idx_book_issues_book ON book_issues(book_id);
GO

-- Insert migration records
INSERT INTO migrations (migration, batch) VALUES
    ('2014_10_12_000000_create_users_table', 1),
    ('2026_04_09_000000_create_readers_table', 1),
    ('2014_10_12_100000_create_password_reset_tokens_table', 1),
    ('2019_08_19_000000_create_failed_jobs_table', 1),
    ('2019_12_14_000001_create_personal_access_tokens_table', 1),
    ('2024_01_01_000000_create_books_table', 1),
    ('2024_01_01_000001_create_publishers_table', 1),
    ('2024_01_01_000002_create_book_issues_table', 1);
GO

-- Insert sample publishers
INSERT INTO publishers (name, email, phone, address) VALUES
    ('Penguin Books', 'contact@penguin.com', '1-800-PENGUIN', '80 Strand, London WC2R 0RL, UK'),
    ('Oxford University Press', 'sales@oup.com', '1-800-451-7556', 'Great Clarendon Street, Oxford OX2 6DP, UK'),
    ('Cambridge University Press', 'info@cambridge.org', '1-800-872-7423', '32 Avenue of the Americas, New York, NY 10013, USA');
GO

-- Insert sample books
INSERT INTO books (title, author, publisher_id, isbn, quantity, available) VALUES
    ('The Great Gatsby', 'F. Scott Fitzgerald', 1, '9780743273565', 5, 5),
    ('1984', 'George Orwell', 2, '9780451524935', 3, 3),
    ('To Kill a Mockingbird', 'Harper Lee', 1, '9780061120084', 4, 4),
    ('Pride and Prejudice', 'Jane Austen', 3, '9780143039990', 6, 6),
    ('The Catcher in the Rye', 'J.D. Salinger', 2, '9780316769174', 2, 2);
GO

-- Verify tables were created
SELECT 'Database Setup Complete!' AS Status;
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo' ORDER BY TABLE_NAME;
GO

-- Show record counts
SELECT 'users' AS TableName, COUNT(*) AS RecordCount FROM users
UNION ALL
SELECT 'readers', COUNT(*) FROM readers
UNION ALL
SELECT 'books', COUNT(*) FROM books
UNION ALL
SELECT 'publishers', COUNT(*) FROM publishers
UNION ALL
SELECT 'book_issues', COUNT(*) FROM book_issues;
GO
