<?php
/**
 * SQL Server Database Setup Script
 * Access: http://localhost:8000/setup_sqlserver.php
 * Delete after use for security
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1 style='color: #2563eb;'>SQL Server Database Setup</h1>";

try {
    // SQL Server connection string
    $serverName = "localhost";
    $uid = "sa";
    $pwd = "";
    
    echo "<p>Connecting to SQL Server at: <strong>$serverName</strong></p>";
    
    // First connection - to master database (to create new database)
    $connectionInfo = array(
        "UID" => $uid,
        "PWD" => $pwd,
        "Database" => "master",
        "ReturnDatesAsStrings" => true
    );
    
    $conn = sqlsrv_connect($serverName, $connectionInfo);
    
    if ($conn === false) {
        // Try ODBC if sqlsrv extension is not available
        echo "<p style='color: orange;'>⚠️ sqlsrv driver not found, trying ODBC...</p>";
        
        $dsn = "Driver={ODBC Driver 17 for SQL Server};Server=$serverName;UID=$uid;PWD=$pwd;";
        $conn = odbc_connect($dsn, $uid, $pwd);
        
        if (!$conn) {
            throw new Exception("Connection failed: " . odbc_errormsg());
        }
        
        $useOdbc = true;
    } else {
        $useOdbc = false;
    }
    
    echo "<p style='color: green;'>✅ Connected to SQL Server</p>";
    
    // Create database
    $sql = "IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'Library_management')
            CREATE DATABASE [Library_management];";
    
    if ($useOdbc) {
        $result = odbc_exec($conn, $sql);
        if (!$result) {
            throw new Exception("Error creating database: " . odbc_errormsg());
        }
    } else {
        $result = sqlsrv_query($conn, $sql);
        if ($result === false) {
            throw new Exception("Error creating database: " . print_r(sqlsrv_errors(), true));
        }
    }
    
    echo "<p style='color: green;'>✅ Database created/verified</p>";
    
    // Close first connection and connect to Library_management database
    if ($useOdbc) {
        odbc_close($conn);
    } else {
        sqlsrv_close($conn);
    }
    
    // Connect to Library_management database
    $connectionInfo["Database"] = "Library_management";
    
    if ($useOdbc) {
        $dsn = "Driver={ODBC Driver 17 for SQL Server};Server=$serverName;Database=Library_management;UID=$uid;PWD=$pwd;";
        $conn = odbc_connect($dsn, $uid, $pwd);
        if (!$conn) {
            throw new Exception("Connection to Library_management failed: " . odbc_errormsg());
        }
    } else {
        $conn = sqlsrv_connect($serverName, $connectionInfo);
        if ($conn === false) {
            throw new Exception("Connection to Library_management failed: " . print_r(sqlsrv_errors(), true));
        }
    }
    
    echo "<p style='color: green;'>✅ Connected to Library_management database</p>";
    
    // Create migrations table
    $sql = "IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'migrations')
            CREATE TABLE [migrations] (
                [id] INT IDENTITY(1,1) PRIMARY KEY,
                [migration] NVARCHAR(255) NOT NULL,
                [batch] INT NOT NULL
            );";
    
    if ($useOdbc) {
        $result = odbc_exec($conn, $sql);
        if (!$result) {
            throw new Exception("Error creating migrations table: " . odbc_errormsg());
        }
    } else {
        $result = sqlsrv_query($conn, $sql);
        if ($result === false) {
            throw new Exception("Error creating migrations table: " . print_r(sqlsrv_errors(), true));
        }
    }
    
    echo "<p style='color: green;'>✅ Migrations table created</p>";
    
    // Create users table
    $sql = "IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
            CREATE TABLE [users] (
                [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
                [name] NVARCHAR(255) NOT NULL,
                [email] NVARCHAR(255) NOT NULL UNIQUE,
                [email_verified_at] DATETIME NULL,
                [password] NVARCHAR(255) NOT NULL,
                [remember_token] NVARCHAR(100) NULL,
                [created_at] DATETIME DEFAULT GETDATE(),
                [updated_at] DATETIME DEFAULT GETDATE()
            );";
    
    if ($useOdbc) {
        $result = odbc_exec($conn, $sql);
        if (!$result) {
            throw new Exception("Error creating users table: " . odbc_errormsg());
        }
    } else {
        $result = sqlsrv_query($conn, $sql);
        if ($result === false) {
            throw new Exception("Error creating users table: " . print_r(sqlsrv_errors(), true));
        }
    }
    
    echo "<p style='color: green;'>✅ Users table created</p>";
    
    // Create index on email
    $sql = "IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_email' AND object_id = OBJECT_ID('[users]'))
            CREATE INDEX [idx_email] ON [users]([email]);";
    
    if ($useOdbc) {
        odbc_exec($conn, $sql);
    } else {
        sqlsrv_query($conn, $sql);
    }
    
    echo "<p style='color: green;'>✅ Email index created</p>";
    
    // Clear existing migrations (to avoid duplicates)
    $sql = "TRUNCATE TABLE [migrations];";
    if ($useOdbc) {
        odbc_exec($conn, $sql);
    } else {
        sqlsrv_query($conn, $sql);
    }
    
    // Insert migration records
    $sql = "INSERT INTO [migrations] ([migration], [batch]) VALUES 
            ('2014_10_12_000000_create_users_table', 1),
            ('2014_10_12_100000_create_password_reset_tokens_table', 1),
            ('2019_08_19_000000_create_failed_jobs_table', 1),
            ('2019_12_14_000001_create_personal_access_tokens_table', 1);";
    
    if ($useOdbc) {
        $result = odbc_exec($conn, $sql);
        if (!$result) {
            throw new Exception("Error inserting migrations: " . odbc_errormsg());
        }
    } else {
        $result = sqlsrv_query($conn, $sql);
        if ($result === false) {
            throw new Exception("Error inserting migrations: " . print_r(sqlsrv_errors(), true));
        }
    }
    
    echo "<p style='color: green;'>✅ Migration records inserted</p>";
    
    // Verify tables
    $sql = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo';";
    
    if ($useOdbc) {
        $result = odbc_exec($conn, $sql);
        $tables = array();
        while ($row = odbc_fetch_array($result)) {
            $tables[] = $row['TABLE_NAME'];
        }
    } else {
        $result = sqlsrv_query($conn, $sql);
        $tables = array();
        while ($row = sqlsrv_fetch_array($result, SQLSRV_FETCH_ASSOC)) {
            $tables[] = $row['TABLE_NAME'];
        }
    }
    
    echo "<p style='color: green;'><strong>✅ Database Setup Complete!</strong></p>";
    echo "<p><strong>Tables created:</strong></p><ul>";
    foreach ($tables as $table) {
        echo "<li>$table</li>";
    }
    echo "</ul>";
    
    // Check users count
    $sql = "SELECT COUNT(*) AS count FROM [users];";
    
    if ($useOdbc) {
        $result = odbc_exec($conn, $sql);
        $row = odbc_fetch_array($result);
        $count = $row['count'];
    } else {
        $result = sqlsrv_query($conn, $sql);
        $row = sqlsrv_fetch_array($result, SQLSRV_FETCH_ASSOC);
        $count = $row['count'];
    }
    
    echo "<p><strong>Total users in database:</strong> $count</p>";
    
    // Close connection
    if ($useOdbc) {
        odbc_close($conn);
    } else {
        sqlsrv_close($conn);
    }
    
    echo "<div style='margin-top: 30px; padding: 20px; background-color: #dcfce7; border: 2px solid #22c55e; border-radius: 8px;'>";
    echo "<p style='color: #166534; font-size: 16px;'><strong>🎉 Setup successful!</strong></p>";
    echo "<p style='color: #166534;'>You can now:</p>";
    echo "<ol style='color: #166534;'>";
    echo "<li>Close this page</li>";
    echo "<li>Try registering at: <a href='http://localhost:5173/register' style='color: #22c55e;'>http://localhost:5173/register</a></li>";
    echo "<li>Delete this setup.php file for security</li>";
    echo "</ol>";
    echo "</div>";
    
} catch (Exception $e) {
    echo "<div style='color: #dc2626; background-color: #fee2e2; padding: 15px; border-radius: 8px; margin-top: 20px;'>";
    echo "<p><strong>❌ Error:</strong> " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<p style='font-size: 12px; margin-top: 10px;'>Make sure:</p>";
    echo "<ul style='font-size: 12px;'>";
    echo "<li>SQL Server is running</li>";
    echo "<li>Backend is running (php artisan serve --port=8000)</li>";
    echo "<li>SA user credentials are correct in .env</li>";
    echo "</ul>";
    echo "</div>";
}
?>
