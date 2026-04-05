<?php

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

/*
|--------------------------------------------------------------------------
| Check If The Application Is Under Maintenance
|--------------------------------------------------------------------------
|
| If the application is in maintenance / demo mode via the "down" command
| we will load this file so that any pre-rendered content can be shown
| instead of starting the framework, which could cause an exception.
|
*/

if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

/*
|--------------------------------------------------------------------------
| Register The Auto Loader
|--------------------------------------------------------------------------
|
| Composer provides a convenient, automatically generated class loader for
| this application. We just need to utilize it! We'll simply require it
| into the script here so we don't need to manually load our classes.
|
*/

// Handle setup.php and setup_sqlserver.php first
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if (strpos($uri, '/setup') !== false) {
    $setupFile = __DIR__ . '/setup_sqlserver.php';
    if (file_exists($setupFile) && strpos($uri, 'setup_sqlserver') !== false) {
        require $setupFile;
        exit;
    }
}

// Check if vendor/autoload.php exists
if (!file_exists($autoloadPath = __DIR__.'/../vendor/autoload.php')) {
    http_response_code(503);
    echo json_encode([
        'error' => 'Service Unavailable',
        'message' => 'Backend dependencies not installed. Run: composer install',
        'status' => 'dependencies_missing'
    ]);
    exit;
}

require $autoloadPath;

/*
|--------------------------------------------------------------------------
| Run The Application
|--------------------------------------------------------------------------
|
| Once we have the application, we can handle the incoming request using
| the application's HTTP kernel. Then, we will send the response back
| to this client's browser, allowing them to enjoy our application.
|
*/

$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(Kernel::class);

$response = $kernel->handle(
    $request = Request::capture()
)->send();

$kernel->terminate($request, $response);
