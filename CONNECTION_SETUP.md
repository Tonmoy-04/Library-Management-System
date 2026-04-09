# Backend & Frontend Connection Setup

## Current Status ✅ CONFIGURED

### Frontend Updates:
- ✅ API Base URL updated to `http://localhost:8000/api`
- ✅ Registration page created at `/register`
- ✅ Validation rules updated to match backend:
  - Email must be @aust.edu domain
  - Passsword minimum 8 characters
  - Password confirmation required

### Backend Updates:
- ✅ AuthController updated to return JSON responses for API calls
- ✅ Login endpoint: `POST /api/auth/login`
- ✅ Register endpoint: `POST /api/auth/register`
- ✅ Logout endpoint: `POST /api/auth/logout`
- ✅ Me endpoint: `GET /api/auth/me`
- ✅ Refresh endpoint: `POST /api/auth/refresh`
- ✅ APP_KEY configured in .env

## Database Configuration

**Connection Details:**
- Host: 127.0.0.1
- Port: 3306
- Database: Library_management
- Username: root
- Password: (empty)

## Required Setup Steps

### 1. Create Database (if not exists)
```sql
CREATE DATABASE IF NOT EXISTS Library_management;
```

### 2. Run Migrations
```bash
cd library-main
php artisan migrate
```

### 3. Start Backend Server
```bash
cd library-main
php artisan serve --port=8000
```

### 4. Start Frontend Development Server
```bash
cd library-frontend
npm install  # if not already installed
npm run dev
```

## Testing Registration

1. Open browser: `http://localhost:5173/register`
2. Fill in the form:
   - Name: Any name
   - Email: anything@aust.edu
   - Password: At least 8 characters
   - Confirm Password: Must match password
3. Click Register
4. Check database if user was created:
   ```sql
   SELECT * FROM users;
   ```

## API Endpoints

### Register
```
POST http://localhost:8000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "user@aust.edu",
  "password": "password123",
  "password_confirmation": "password123"
}
```

### Login
```
POST http://localhost:8000/api/auth/login
Content-Type: application/json

{
  "email": "user@aust.edu",
  "password": "password123"
}
```

## Next Steps

1. ✅ Set up database and run migrations
2. ⏳ Test user registration
3. ⏳ Implement Login page functionality
4. ⏳ Add JWT token authentication
5. ⏳ Protect authenticated routes

## Files Modified

- `library-frontend/src/pages/Register.jsx` - Created
- `library-frontend/src/services/api.js` - Updated URL to port 8000
- `library-frontend/src/routes/AppRoutes.jsx` - Added /register route
- `library-frontend/src/pages/Login.jsx` - Added register link
- `library-main/app/Http/Controllers/Auth/AuthController.php` - Updated for JSON responses
- `.env` - Added APP_KEY and updated APP_URL
