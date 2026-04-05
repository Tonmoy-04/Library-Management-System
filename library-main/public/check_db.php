<?php
try {
    $host = 'SIAM\SQLEXPRESS01';
    $database = 'Library_management';
    $username = 'Siam_Database';
    $password = 'Siam12345';
    
    $connectionInfo = array(
        'Database' => $database,
        'UID' => $username,
        'PWD' => $password,
        'Encrypt' => 0,
        'TrustServerCertificate' => 1
    );
    
    $conn = sqlsrv_connect($host, $connectionInfo);
    
    if ($conn === false) {
        echo json_encode([
            'status' => 'error',
            'message' => '❌ Database Connection Failed!',
            'error' => print_r(sqlsrv_errors(), true),
            'server' => $host,
            'database' => $database,
            'username' => $username
        ]);
    } else {
        $query = "SELECT 1 as test";
        $stmt = sqlsrv_query($conn, $query);
        
        if ($stmt === false) {
            echo json_encode([
                'status' => 'error',
                'message' => '❌ Query Failed!',
                'error' => print_r(sqlsrv_errors(), true)
            ]);
        } else {
            echo json_encode([
                'status' => 'success',
                'message' => '✅ Database Connection Successful!',
                'server' => $host,
                'database' => $database,
                'username' => $username
            ]);
        }
        sqlsrv_close($conn);
    }
} catch (\Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => '❌ Exception occurred!',
        'error' => $e->getMessage()
    ]);
}
?>
