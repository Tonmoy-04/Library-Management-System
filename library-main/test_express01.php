<?php
try {
    $conn = new PDO('sqlsrv:Server=127.0.0.1\SQLEXPRESS01;Database=Library_management', 'ahnaf', 'StrongPassword123');
    echo "✓ Connected to SQLEXPRESS01 successfully!\n";
    
    // Try a simple query
    $result = $conn->query("SELECT @@version");
    if ($result) {
        echo "✓ Query executed!\n";
    }
} catch (PDOException $e) {
    echo "✗ Connection Failed: " . $e->getMessage() . "\n";
}
?>
