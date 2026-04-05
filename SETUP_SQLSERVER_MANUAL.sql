-- ============================================================================
-- SQL Server Database Setup Script for Library Management System
-- ============================================================================
-- Run this script in SQL Server Management Studio (SSMS)
-- Steps:
-- 1. Open SSMS
-- 2. Connect to your SQL Server
-- 3. Copy all the code below
-- 4. Paste it into a New Query window
-- 5. Click Execute (F5)
-- ============================================================================

-- Create the database
CREATE DATABASE [Library_management];
GO

-- Switch to the new database
USE [Library_management];
GO

-- ============================================================================
-- Create migrations table (tracks which migrations have been run)
-- ============================================================================
CREATE TABLE [dbo].[migrations] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [migration] NVARCHAR(255) NOT NULL,
    [batch] INT NOT NULL
);
GO

-- ============================================================================
-- Create users table (stores user registration data)
-- ============================================================================
CREATE TABLE [dbo].[users] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [name] NVARCHAR(255) NOT NULL,
    [email] NVARCHAR(255) NOT NULL UNIQUE,
    [email_verified_at] DATETIME NULL,
    [password] NVARCHAR(255) NOT NULL,
    [remember_token] NVARCHAR(100) NULL,
    [created_at] DATETIME DEFAULT GETDATE(),
    [updated_at] DATETIME DEFAULT GETDATE()
);
GO

-- Create index on email for faster lookups
CREATE INDEX [idx_email] ON [dbo].[users]([email]);
GO

-- ============================================================================
-- Insert migration records (tells Laravel these tables already exist)
-- ============================================================================
INSERT INTO [dbo].[migrations] ([migration], [batch]) 
VALUES 
    ('2014_10_12_000000_create_users_table', 1),
    ('2014_10_12_100000_create_password_reset_tokens_table', 1),
    ('2019_08_19_000000_create_failed_jobs_table', 1),
    ('2019_12_14_000001_create_personal_access_tokens_table', 1);
GO

-- ============================================================================
-- Verify Setup (you should see: users, migrations tables)
-- ============================================================================
SELECT 'Database Setup Complete!' AS [Status];
GO

SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'dbo' 
ORDER BY TABLE_NAME;
GO

SELECT COUNT(*) AS [Total_Users] FROM [dbo].[users];
GO

-- ============================================================================
-- Setup Verification Complete! ✅
-- ============================================================================
-- Your database is now ready for the Library Management System
-- You can now proceed to register users at: http://localhost:5173/register
