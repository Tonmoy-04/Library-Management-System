# Database Setup Script for Library Management System
# This script creates the database and all tables using SQL Server

# Configuration from .env file
$serverName = "(local)\SQLEXPRESS"
$username = "sa"
$password = "Server12345"
$database = "Library_management"

# Path to SQL setup script
$sqlScriptPath = ".\library-main\SETUP_DATABASE_SSMS.sql"

Write-Host "=====================================`n" -ForegroundColor Cyan
Write-Host "Library Management System - Database Setup" -ForegroundColor Cyan
Write-Host "=====================================`n" -ForegroundColor Cyan

# Check if sqlcmd is available
try {
    $sqlcmdTest = sqlcmd -? | Out-Null
}
catch {
    Write-Host "Error: sqlcmd is not available. Please install SQL Server Command Line Tools (sqlcmd)." -ForegroundColor Red
    Write-Host "Download from: https://learn.microsoft.com/en-us/sql/tools/sqlcmd/sqlcmd-utility" -ForegroundColor Yellow
    exit 1
}

# Check if SQL script exists
if (!(Test-Path $sqlScriptPath)) {
    Write-Host "Error: SQL script not found at $sqlScriptPath" -ForegroundColor Red
    exit 1
}

# Display connection details
Write-Host "Connection Details:" -ForegroundColor Yellow
Write-Host "  Server: $serverName`n  Username: $username`n  Database: $database`n" 

# Execute the SQL script
try {
    Write-Host "Executing database setup script..." -ForegroundColor Yellow
    Write-Host "=========================================`n"
    
    # Read SQL script
    $sqlScript = Get-Content -Path $sqlScriptPath -Raw
    
    # Execute using sqlcmd with Windows authentication (Integrated Security)
    sqlcmd -S $serverName -E -d master -i $sqlScriptPath -b -C
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n=========================================`n" -ForegroundColor Green
        Write-Host "[SUCCESS] Database setup completed successfully!" -ForegroundColor Green
        Write-Host "[SUCCESS] Database: $database" -ForegroundColor Green
        Write-Host "[SUCCESS] All tables created with sample data" -ForegroundColor Green
    }
    else {
        Write-Host "`n=========================================`n" -ForegroundColor Red
        Write-Host "[FAILED] Database setup encountered an error (Exit code: $LASTEXITCODE)" -ForegroundColor Red
    }
}
catch {
    Write-Host "`n=========================================`n" -ForegroundColor Red
    Write-Host "[ERROR] Error executing setup script:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
