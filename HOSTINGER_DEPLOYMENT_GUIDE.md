# 🚀 Hostinger Deployment Guide - Library Management System

## Prerequisites
- Hostinger account with domain
- FTP/SFTP credentials
- cPanel access
- Frontend domain or subdomain
- Backend domain or subdomain

---

## 📋 STEP-BY-STEP DEPLOYMENT

### **PHASE 1: Database Setup**

#### **Step 1: Create MySQL Database**
1. Login to **Hostinger hPanel**
2. Go to **Hosting → Manage**
3. Scroll to **MySQL** section
4. Click **Add Database**
5. Fill in:
   - **Database name**: `library_db` (or your choice)
   - **Database user**: Create new (e.g., `lib_user`)
   - **Password**: Generate strong password (save it!)
6. Click **Create**

**⚠️ Save these credentials:**
```
DB_HOST: localhost
DB_DATABASE: library_db
DB_USERNAME: lib_user
DB_PASSWORD: [your-password]
```

---

### **PHASE 2: Prepare Backend (Laravel)**

#### **Step 2: Export Database Structure**
```bash
# From your local machine, export your SQL structure
# Since you're using SQL Server, we need to convert to MySQL

# 1. Export current SQL structure
# 2. Convert any SQL Server specific syntax to MySQL
# (We'll handle this in the migration step)
```

#### **Step 3: Update `.env` File**
Edit `library-main/.env`:
```env
APP_NAME="Library Management System"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.yourdomain.com  # or subdomain

# Database - CHANGE THESE!
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=library_db
DB_USERNAME=lib_user
DB_PASSWORD=your_password_from_step1

# Frontend URL (important for CORS)
FRONTEND_URL=https://yourdomain.com

# Optional - disable debug mode in production
LOG_LEVEL=notice
```

#### **Step 4: Install Dependencies**
```bash
cd library-main
composer install --no-dev --optimize-autoloader
```

#### **Step 5: Generate APP_KEY (if needed)**
The APP_KEY is already in your .env, but verify it:
```bash
php artisan key:show
```

#### **Step 6: Build Assets (if any)**
```bash
# Optional if you have Laravel Mix or Vite
npm install
npm run build
```

---

### **PHASE 3: Prepare Frontend (React/Vite)**

#### **Step 7: Build React Application**
```bash
cd library-frontend
npm run build
```

This creates a `dist/` folder with optimized production files.

#### **Step 8: Update API Base URL**
Edit `library-frontend/src/services/api.js`:
```javascript
// Change from:
const API_BASE = 'http://localhost:8000';

// To production URL:
const API_BASE = 'https://api.yourdomain.com';
// or if backend is on same domain:
const API_BASE = 'https://yourdomain.com/api';
```

**Then rebuild:**
```bash
npm run build
```

---

### **PHASE 4: Upload Files to Hostinger**

#### **Step 9: Connect via FTP/SFTP**
1. Installation FTP client:
   - **FileZilla** (free) - https://filezilla-project.org/
   - **WinSCP** (Windows)
   - **Cyberduck** (Mac)

2. **Hostinger FTP Credentials**:
   - Go to **hPanel → Hosting → Manage → SFTP/SSH**
   - Copy: Username, Password, Server, Port

3. **Connect** using your FTP client

#### **Step 10: Upload Backend (Laravel)**
1. Connect to Hostinger via FTP
2. Navigate to **public_html** folder
3. Delete existing files (if any)
4. Upload entire `library-main` folder contents:

**Important structure:**
```
public_html/
├── app/
├── bootstrap/
├── config/
├── database/
├── routes/
├── storage/
├── vendor/
├── public/        ← Point domain root here
├── .env           ← Upload this too!
├── artisan
├── composer.json
└── [other files]
```

**OR use subdomain for API:**
```
public_html/
├── api/           ← Create this folder
│   ├── app/
│   ├── bootstrap/
│   ├── public/    ← Point api.yourdomain.com here
│   └── [other]
└── [frontend files here]
```

#### **Step 11: Upload Frontend (React)**
1. Build the frontend:
   ```bash
   npm run build
   ```

2. Upload **dist/** folder contents to:
   - `public_html/` (if root domain for frontend)
   - OR `public_html/app/` (if keeping in separate folder)

**Example structure:**
```
public_html/
├── index.html     ← from dist/
├── assets/        ← from dist/assets/
├── api/           ← backend (optional)
└── [other]
```

---

### **PHASE 5: Configure Hostinger**

#### **Step 12: Set Public Directory (Important!)**

If backend is in same folder:

1. Go to **hPanel → Hosting → Manage**
2. Scroll to **Public directory**
3. Change from `/public_html` to `/public_html/public`
4. Click **Save**

*OR* if using subdomain for API, configure separately.

#### **Step 13: Create `.htaccess`** (if needed)

In `public_html/.htaccess`:
```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews
    </IfModule>

    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [QSA,L]
</IfModule>
```

---

### **PHASE 6: Database Migration**

#### **Step 14: Run Database Migrations**

**Option A: Via SSH (Recommended)**
1. **hPanel → Hosting → Manage → SSH/Terminal**
2. Login via SSH
3. Navigate to project:
   ```bash
   cd public_html
   # or cd public_html/api if using subdomain
   ```
4. Run migrations:
   ```bash
   php artisan migrate --force
   ```
5. Seed database (optional):
   ```bash
   php artisan db:seed --force
   ```

**Option B: Create PHP Script**
Create `public_html/migrate.php`:
```php
<?php
require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
exit($kernel->handle(
    $input = new Symfony\Component\Console\Input\ArgvInput,
    new Symfony\Component\Console\Output\ConsoleOutput
));
```

Then visit: `https://yourdomain.com/migrate.php migrate --force`

⚠️ **Delete `migrate.php` after running!**

---

### **PHASE 7: Configure Domain/SSL**

#### **Step 15: Point Domain**
1. **hPanel → Hosting → Manage → Domains**
2. Add/Configure your domain
3. Point DNS to Hostinger (usually auto)
4. SSL certificate (usually free with Hostinger)

#### **Step 16: Configure CORS**

Update `library-main/.env`:
```env
CORS_ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
```

Ensure `config/cors.php` allows your frontend domain.

---

### **PHASE 8: Setup & Testing**

#### **Step 17: Set Permissions (via SSH)**
```bash
chmod -R 755 public_html/storage
chmod -R 755 public_html/bootstrap/cache
```

#### **Step 18: Generate Cache**
```bash
cd public_html
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

#### **Step 19: Test Backend**
Visit: `https://yourdomain.com/api/status` or `https://api.yourdomain.com/status`

Expected response:
```json
{
  "message": "API is running",
  "status": "ok"
}
```

#### **Step 20: Test Frontend**
Visit: `https://yourdomain.com/`

You should see the login page.

---

## 🐛 Troubleshooting

### **500 Error on Backend**
1. Check `storage/logs/laravel.log`
2. Verify `.env` database credentials
3. Ensure `storage/` and `bootstrap/cache` have write permissions

### **CORS Errors**
1. Check `config/cors.php`
2. Update `CORS_ALLOWED_ORIGINS` in `.env`
3. Restart/clear cache

### **Frontend 404 Errors**
1. Ensure `.htaccess` is uploaded correctly
2. Public directory is set to `/public_html/public`
3. Check `vite.config.js` build output

### **Database Connection Error**
1. Verify credentials in MySQL section
2. Ensure `DB_HOST=localhost` (not IP)
3. Check database name spelling

### **Can't connect via FTP**
1. Verify credentials from hPanel
2. Try **SFTP** instead of **FTP**
3. Check port number (usually 22 for SFTP)

---

## 📝 Important Updates Before Going Live

1. **Update API URLs** in frontend:
   - [library-frontend/src/services/api.js](library-frontend/src/services/api.js)

2. **Set Production Environment**:
   ```env
   APP_ENV=production
   APP_DEBUG=false
   ```

3. **Enable SSL/HTTPS** everywhere

4. **Clear caches**:
   ```bash
   php artisan config:cache
   php artisan route:cache
   ```

5. **Set file permissions** properly

6. **Test thoroughly** before launching

---

## 🆘 Need Help?

- **Hostinger Support**: hPanel → Support
- **Check Laravel Logs**: `storage/logs/laravel.log`
- **SSH into server** for debugging

---

**🎉 Enjoy your deployed application!**
