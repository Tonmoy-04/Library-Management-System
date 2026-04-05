@echo off
REM Start Laravel backend server
cd /d c:\Users\ahnaf\Downloads\Database\Library-Management-System\library-main

echo Starting Laravel server on port 8000...
echo Access at: http://localhost:8000

REM Try artisan serve first
if exist artisan (
    php artisan serve --port=8000
) else (
    REM Fallback to built-in server pointing to public folder
    php -S localhost:8000 -t public
)

pause
