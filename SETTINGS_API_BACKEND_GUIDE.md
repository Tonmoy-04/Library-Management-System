# Backend API Implementation Guide - Settings Feature

## Overview

This guide provides detailed specifications for implementing the Settings feature API endpoints on the Laravel backend.

---

## API Endpoints

### Reader Endpoints

#### 1. Update Reader Profile

**Endpoint**: `PUT /api/reader/profile`

**Authentication**: Required (JWT Bearer Token)

**Request Headers**:
```javascript
{
  'Authorization': 'Bearer {token}',
  'Content-Type': 'application/json'
}
```

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890"
}
```

**Validation Rules**:
- `name`: required, string, max:255
- `email`: required, email, unique (except current user)
- `phone`: nullable, string, max:20

**Success Response** (200):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "created_at": "2026-04-10T10:00:00Z",
    "updated_at": "2026-04-11T14:30:00Z"
  }
}
```

**Error Responses**:

- **422 Unprocessable Entity**:
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email has already been taken."],
    "phone": ["The phone field may not be greater than 20 characters."]
  }
}
```

- **401 Unauthorized**:
```json
{
  "message": "Unauthenticated."
}
```

---

#### 2. Change Reader Password

**Endpoint**: `POST /api/reader/change-password`

**Authentication**: Required (JWT Bearer Token)

**Request Headers**:
```javascript
{
  'Authorization': 'Bearer {token}',
  'Content-Type': 'application/json'
}
```

**Request Body**:
```json
{
  "current_password": "oldPassword123",
  "new_password": "newPassword456"
}
```

**Validation Rules**:
- `current_password`: required, string, min:6
- `new_password`: required, string, min:8, different from current_password

**Success Response** (200):
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Responses**:

- **422 Validation Error**:
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "current_password": ["The current password is incorrect."],
    "new_password": ["The new password must be different from the current password."]
  }
}
```

- **401 Unauthorized**:
```json
{
  "message": "Current password is incorrect."
}
```

---

### Publisher Endpoints

#### 1. Update Publisher Profile

**Endpoint**: `PUT /api/publisher/profile`

**Authentication**: Required (JWT Bearer Token)

**Request Headers**:
```javascript
{
  'Authorization': 'Bearer {token}',
  'Content-Type': 'application/json'
}
```

**Request Body**:
```json
{
  "name": "Amazing Books Publishing",
  "email": "publisher@example.com",
  "phone": "+0987654321"
}
```

**Validation Rules**:
- `name`: required, string, max:255
- `email`: required, email, unique (except current user)
- `phone`: nullable, string, max:20

**Success Response** (200):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 5,
    "name": "Amazing Books Publishing",
    "email": "publisher@example.com",
    "phone": "+0987654321",
    "created_at": "2026-03-15T08:00:00Z",
    "updated_at": "2026-04-11T15:45:00Z"
  }
}
```

---

#### 2. Change Publisher Password

**Endpoint**: `POST /api/publisher/change-password`

**Authentication**: Required (JWT Bearer Token)

**Request Headers**:
```javascript
{
  'Authorization': 'Bearer {token}',
  'Content-Type': 'application/json'
}
```

**Request Body**:
```json
{
  "current_password": "oldPassword123",
  "new_password": "newPassword456"
}
```

**Validation Rules**:
- `current_password`: required, string
- `new_password`: required, string, min:8, different from current_password

**Success Response** (200):
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## Laravel Implementation Examples

### Controller Implementation

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reader;
use App\Models\Publisher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class SettingsController extends Controller
{
    /**
     * Update reader profile
     */
    public function updateReaderProfile(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:readers,email,' . auth('reader')->id(),
            'phone' => 'nullable|string|max:20',
        ]);

        $reader = auth('reader')->user();
        $reader->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => $reader,
        ], 200);
    }

    /**
     * Change reader password
     */
    public function changeReaderPassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|string|min:6',
            'new_password' => 'required|string|min:8|different:current_password|confirmed',
        ]);

        $reader = auth('reader')->user();

        // Verify current password
        if (!Hash::check($validated['current_password'], $reader->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The provided password does not match our records.'],
            ]);
        }

        // Update password
        $reader->update([
            'password' => Hash::make($validated['new_password']),
        ]);

        // Optional: Log the password change
        // $this->logSecurityEvent($reader, 'password_changed');

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully',
        ], 200);
    }

    /**
     * Update publisher profile
     */
    public function updatePublisherProfile(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:publishers,email,' . auth('publisher')->id(),
            'phone' => 'nullable|string|max:20',
        ]);

        $publisher = auth('publisher')->user();
        $publisher->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => $publisher,
        ], 200);
    }

    /**
     * Change publisher password
     */
    public function changePublisherPassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|string|min:6',
            'new_password' => 'required|string|min:8|different:current_password|confirmed',
        ]);

        $publisher = auth('publisher')->user();

        // Verify current password
        if (!Hash::check($validated['current_password'], $publisher->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The provided password does not match our records.'],
            ]);
        }

        // Update password
        $publisher->update([
            'password' => Hash::make($validated['new_password']),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully',
        ], 200);
    }

    /**
     * Optional: Security event logging
     */
    private function logSecurityEvent($user, $event, $details = [])
    {
        // Implementation depends on your audit logging system
        // Example: SecurityLog::create([
        //     'user_id' => $user->id,
        //     'user_type' => class_basename($user),
        //     'event' => $event,
        //     'ip_address' => request()->ip(),
        //     'user_agent' => request()->userAgent(),
        //     'details' => $details,
        // ]);
    }
}
```

### Routes Configuration

Add these routes to `routes/api.php`:

```php
<?php

use App\Http\Controllers\Api\SettingsController;

Route::middleware('auth:reader')->group(function () {
    Route::put('/reader/profile', [SettingsController::class, 'updateReaderProfile']);
    Route::post('/reader/change-password', [SettingsController::class, 'changeReaderPassword']);
});

Route::middleware('auth:publisher')->group(function () {
    Route::put('/publisher/profile', [SettingsController::class, 'updatePublisherProfile']);
    Route::post('/publisher/change-password', [SettingsController::class, 'changePublisherPassword']);
});
```

### Model Updates (if needed)

Ensure your Reader and Publisher models have these attributes:

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;

class Reader extends Authenticatable
{
    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'email_verified_at',
        'remember_token',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];
}
```

---

## Testing the Endpoints

### Using cURL

```bash
# Update Reader Profile
curl -X PUT http://localhost:8000/api/reader/profile \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }'

# Change Reader Password
curl -X POST http://localhost:8000/api/reader/change-password \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "oldPassword123",
    "new_password": "newPassword456"
  }'
```

### Using Postman

1. **Create new Request**
   - Method: `PUT`
   - URL: `http://localhost:8000/api/reader/profile`

2. **Headers Tab**
   - Key: `Authorization`
   - Value: `Bearer {your_token}`
   - Key: `Content-Type`
   - Value: `application/json`

3. **Body Tab (Raw JSON)**
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "phone": "+1234567890"
}
```

4. Click **Send**

---

## Error Handling Best Practices

### Validation Errors

```php
if ($request->fails()) {
    return response()->json([
        'message' => 'The given data was invalid.',
        'errors' => $validator->errors(),
    ], 422);
}
```

### Authentication Errors

```php
if (!auth('reader')->check()) {
    return response()->json([
        'message' => 'Unauthenticated.',
    ], 401);
}
```

### General Error Handling

```php
try {
    // Your logic here
} catch (\Exception $e) {
    return response()->json([
        'success' => false,
        'message' => 'An error occurred. Please try again.',
    ], 500);
}
```

---

## Security Considerations

1. **Password Hashing**
   - Always use `Hash::make()` for password storage
   - Use `Hash::check()` for password verification
   - Never store plain text passwords

2. **Authentication**
   - Verify JWT token is valid
   - Ensure user is authenticated before processing
   - Use appropriate auth guards (`auth:reader`, `auth:publisher`)

3. **Authorization**
   - Users can only update their own profile
   - Users can only change their own password
   - Implement middleware for authorization if needed

4. **Input Validation**
   - Validate all inputs on backend
   - Check email uniqueness with exception for current user
   - Enforce password requirements

5. **Audit Logging**
   - Log password changes for security
   - Log significant profile updates
   - Store IP address and timestamp

6. **Rate Limiting**
   - Implement rate limiting for password change endpoint
   - Limit failed password attempts
   - Use middleware like `throttle`

```php
Route::middleware('auth:reader', 'throttle:10,1')->post('/reader/change-password', ...);
```

---

## Database Considerations

### Ensure Tables Have Required Columns

**readers table**:
```sql
ALTER TABLE readers ADD COLUMN phone VARCHAR(20) NULL;
```

**publishers table**:
```sql
ALTER TABLE publishers ADD COLUMN phone VARCHAR(20) NULL;
```

### Indexes

```sql
CREATE INDEX idx_readers_email ON readers(email);
CREATE INDEX idx_publishers_email ON publishers(email);
```

---

## Response Format Standards

All endpoints follow this standard response format:

**Success (200, 201)**:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* optional */ }
}
```

**Validation Error (422)**:
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": ["Error message"]
  }
}
```

**Unauthorized (401)**:
```json
{
  "message": "Unauthenticated."
}
```

**Server Error (500)**:
```json
{
  "message": "An error occurred. Please try again."
}
```

---

## Migration Files

Create migration if phone column doesn't exist:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('readers', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
        });

        Schema::table('publishers', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
        });
    }

    public function down(): void
    {
        Schema::table('readers', function (Blueprint $table) {
            $table->dropColumn('phone');
        });

        Schema::table('publishers', function (Blueprint $table) {
            $table->dropColumn('phone');
        });
    }
};
```

Run migration:
```bash
php artisan migrate
```

---

## Troubleshooting

### 422 Validation Errors
- Check request body format (JSON)
- Verify all required fields are present
- Ensure validation rules are met

### 401 Unauthorized
- Verify JWT token is valid
- Check token hasn't expired
- Ensure Authorization header format: `Bearer {token}`

### 500 Server Error
- Check Laravel logs: `storage/logs/laravel.log`
- Verify database connection
- Check if migration has been run

### Password Change Issues
- Verify current password is correct
- Ensure new password meets requirements (min 8 chars)
- Check if password fields match in request

---

## Conclusion

This implementation provides a secure, maintainable Settings API for your multi-role application. Follow the specifications carefully and test thoroughly before deployment.

**Last Updated**: April 11, 2026  
**Version**: 1.0.0
