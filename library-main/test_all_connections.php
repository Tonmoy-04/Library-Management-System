<?php
echo "Testing SQL Server Connections...\n\n";

// Test 1: TCP/IP with 127.0.0.1
echo "Test 1: TCP/IP (127.0.0.1:1433)...\n";
try {
    $conn = new PDO("sqlsrv:Server=127.0.0.1,1433;Database=Library_management", "ahnaf", "StrongPassword123");
    echo "✅ SUCCESS!\n\n";
} catch (Exception $e) {
    echo "❌ Failed: " . $e->getMessage() . "\n\n";
}

// Test 2: Named instance
echo "Test 2: Named Instance (.\SQLEXPRESS)...\n";
try {
    $conn = new PDO("sqlsrv:Server=.\SQLEXPRESS;Database=Library_management", "ahnaf", "StrongPassword123");
    echo "✅ SUCCESS!\n\n";
} catch (Exception $e) {
    echo "❌ Failed: " . $e->getMessage() . "\n\n";
}

// Test 3: localhost
echo "Test 3: localhost...\n";
try {
    $conn = new PDO("sqlsrv:Server=localhost;Database=Library_management", "ahnaf", "StrongPassword123");
    echo "✅ SUCCESS!\n\n";
} catch (Exception $e) {
    echo "❌ Failed: " . $e->getMessage() . "\n\n";
}

// Test 4: (local)
echo "Test 4: (local)...\n";
try {
    $conn = new PDO("sqlsrv:Server=(local);Database=Library_management", "ahnaf", "StrongPassword123");
    echo "✅ SUCCESS!\n\n";
} catch (Exception $e) {
    echo "❌ Failed: " . $e->getMessage() . "\n\n";
}

echo "Testing completed.\n";
?>
