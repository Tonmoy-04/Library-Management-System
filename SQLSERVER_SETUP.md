# ⚡ QUICK START - SQL Server Setup

## Step 1: Start Backend Server

### Option A: Using Batch File (Easiest) ✅
1. Navigate to: `c:\Users\ahnaf\Downloads\Database\Library-Management-System\library-main`
2. Double-click: **`start_server.bat`**
3. PHP server will start on `http://localhost:8000`

### Option B: Manual Command
```bash
cd c:\Users\ahnaf\Downloads\Database\Library-Management-System\library-main
php -S localhost:8000 -t public
```

---

## Step 2: Setup SQL Server Database

1. **Open browser**: `http://localhost:8000/setup_sqlserver.php`

2. You'll see:
   ```
   ✅ Connected to SQL Server
   ✅ Database created/verified
   ✅ Migrations table created
   ✅ Users table created
   ✅ Email index created
   ✅ Migration records inserted
   ✅ Database Setup Complete!
   ```

3. **After setup is complete:**
   - Delete `public/setup_sqlserver.php` for security
   - Or leave it if you want to rerun setup later

---

## Step 3: Try Registration

1. **Make sure frontend is running:**
   ```bash
   cd library-frontend
   npm run dev
   ```

2. **Open browser:** `http://localhost:5173/register`

3. **Register with:**
   - Name: `Saim`
   - Email: `saim.cse.20230104073@aust.edu`
   - Password: `password123`
   - Confirm Password: `password123`

4. **Click Register** → Should redirect to Login page ✅

---

## Step 4: Verify Data in SQL Server

1. **Open SQL Server Management Studio (SSMS)**

2. **Run this query:**
   ```sql
   USE Library_management;
   SELECT * FROM users;
   ```

3. **You should see your registered user!** ✅

---

## 🔍 Troubleshooting

### Backend not starting?
- Make sure PHP 8.2+ is installed
- Check: `php --version`
- Try manual command instead of batch file

### Database setup page shows errors?
- SQL Server must be running
- Check .env for correct SA credentials
- Verify database connection settings

### Registration still failing?
1. Check browser console (F12)
2. Check backend logs (terminal window)
3. Verify users table exists in SSMS

---

## 📝 Important Files

- `public/setup_sqlserver.php` - Auto setup script (DELETE after use)
- `start_server.bat` - Quick start batch file
- `.env` - Database configuration
- `app/Http/Controllers/Auth/AuthController.php` - Registration logic

---

## 🎯 Quick Commands

```bash
# Start backend
php -S localhost:8000 -t public

# Start frontend
cd library-frontend && npm run dev

# Check PHP version
php --version

# View recent registrations in SQL Server
USE Library_management; SELECT * FROM users ORDER BY created_at DESC;
```

---

**All files are ready! Just start the backend and visit the setup page.** 🚀
