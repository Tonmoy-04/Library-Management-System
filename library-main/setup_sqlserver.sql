-- SQL Server Setup Script for Library Management System
-- Run this in SQL Server Management Studio (SSMS)

-- Create database
CREATE DATABASE [Library_management];
GO

-- Use the database
USE [Library_management];
GO

-- Create migrations table
CREATE TABLE [migrations] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [migration] NVARCHAR(255) NOT NULL,
    [batch] INT NOT NULL
);
GO

-- Create users table
CREATE TABLE [users] (
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

-- Create index on email
CREATE INDEX [idx_email] ON [users]([email]);
GO

-- Insert migration records
INSERT INTO [migrations] ([migration], [batch]) VALUES
('2014_10_12_000000_create_users_table', 1),
('2014_10_12_100000_create_password_reset_tokens_table', 1),
('2019_08_19_000000_create_failed_jobs_table', 1),
('2019_12_14_000001_create_personal_access_tokens_table', 1);
GO

-- Verify setup
SELECT 'Database Setup Complete!' AS Status;
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo';
SELECT COUNT(*) AS UserCount FROM [users];
