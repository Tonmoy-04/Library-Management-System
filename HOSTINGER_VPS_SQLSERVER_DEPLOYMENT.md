# 🚀 Deploy to Hostinger VPS with SQL Server

Complete guide to deploy your Library Management System on Hostinger VPS with SQL Server.

---

## 📋 Your Hostinger VPS Details (from hPanel)

```
IP Address: 88.223.85.214
Port: 65002
Username: u297417257
Password: [Your password from hPanel]
Domain: delightfulbitsess.com
```

---

## PHASE 1: Connect to VPS via SSH

### Step 1: Open Terminal/Command Prompt

**Windows:**
- Open **PowerShell** or **CMD**
- Or use **PuTTY**: https://www.putty.org/

**Mac/Linux:**
- Use built-in Terminal

### Step 2: Connect via SSH

```bash
ssh -p 65002 u297417257@88.223.85.214
```

When prompted, enter your password (the one from hPanel SSH section).

✅ You're now connected to your VPS!

---

## PHASE 2: Install SQL Server on VPS

### Step 3: Update System

```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### Step 4: Add Microsoft SQL Server Repository

```bash
# Add Microsoft repository key
curl https://packages.microsoft.com/keys/microsoft.asc | sudo apt-key add -

# Add SQL Server 2019 repository (or 2022 for latest)
sudo add-apt-repository "$(curl https://packages.microsoft.com/config/ubuntu/20.04/mssql-server-2019.list)"
```

### Step 5: Install SQL Server

```bash
sudo apt-get update
sudo apt-get install -y mssql-server
```

### Step 6: Run SQL Server Setup

```bash
sudo /opt/mssql/bin/mssql-conf setup
```

You'll be prompted to:
1. **Accept License**: Type `Yes` and press Enter
2. **Enter Edition**: Choose `2` for Standard Edition (free for production use)
3. **SQL Server System Administrator Password**: Enter a STRONG password (save it!)

Example:
```
Please enter a password for the system administrator (SA) account:
Your_Strong_Password_123!

Confirm the password:
Your_Strong_Password_123!
```

### Step 7: Start SQL Server

```bash
sudo systemctl start mssql-server
sudo systemctl enable mssql-server  # Auto-start on reboot
```

Verify it's running:
```bash
sudo systemctl status mssql-server
```

---

## PHASE 3: Install SQL Server Tools

### Step 8: Install SQL Server Command-Line Tools

```bash
# Add tools repository
curl https://packages.microsoft.com/config/ubuntu/20.04/prod.list | sudo tee /etc/apt/sources.list.d/msprod.list

# Import GPG key
sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys EB3E94ADBE1229CF

# Update and install tools
sudo apt-get update
sudo apt-get install -y mssql-tools
```

### Step 9: Add SQL Tools to PATH

```bash
echo 'export PATH="$PATH:/opt/mssql-tools/bin"' >> ~/.bashrc
source ~/.bashrc
```

---

## PHASE 4: Create Database & Restore Your Data

### Step 10: Connect to SQL Server

```bash
sqlcmd -S localhost -U SA -P 'Your_Strong_Password_123!'
```

You should see: `1>`

### Step 11: Create Database

```sql
CREATE DATABASE Library_management;
GO
```

Verify:
```sql
SELECT name FROM sys.databases;
GO
```

Exit:
```sql
EXIT
GO
```

### Step 12: Restore Your Existing Data (Option A - Using Backup)

If you have a SQL Server backup file (.bak):

**Upload backup file via SCP:**
```bash
# From your local machine (new terminal)
scp -P 65002 path/to/your/backup.bak u297417257@88.223.85.214:/home/u297417257/
```

**Then restore on VPS:**
```bash
sqlcmd -S localhost -U SA -P 'Your_Strong_Password_123!' -i restore_script.sql
```

### Step 13: Restore Your Data (Option B - Using SQL Schema)

Execute your schema SQL file (you have `schema.sql` in your project):

```bash
# From VPS, if schema.sql is there
sqlcmd -S localhost -U SA -P 'Your_Strong_Password_123!' -d Library_management -i /path/to/schema.sql
```

Or copy your SQL file to VPS first:
```bash
# From local machine
scp -P 65002 library-main/schema.sql u297417257@88.223.85.214:/home/u297417257/
```

Then execute:
```bash
sqlcmd -S localhost -U SA -P 'Your_Strong_Password_123!' -d Library_management -i /home/u297417257/schema.sql
```

---

## PHASE 5: Install PHP & Laravel Requirements

### Step 14: Install PHP & Extensions

```bash
sudo apt-get install -y php php-cli php-fpm php-pdo php-sqlsrv php-pdo-sqlsrv \
    php-mbstring php-tokenizer php-json php-bcmath php-curl php-dom php-gd \
    php-zip php-xml php-ctype php-fileinfo
```

### Step 15: Install Composer

```bash
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
composer --version
```

### Step 16: Install Node.js & npm

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
npm --version
```

---

## PHASE 6: Deploy Backend (Laravel)

### Step 17: Create Web Root Directory

```bash
sudo mkdir -p /var/www/delightfulbitsess.com
sudo chown -R $USER:$USER /var/www/delightfulbitsess.com
```

### Step 18: Upload Backend Files

From your local machine:
```bash
# Upload entire backend
scp -P 65002 -r library-main/* u297417257@88.223.85.214:/var/www/delightfulbitsess.com/backend/
```

Or use SFTP client (FileZilla):
- Host: 88.223.85.214
- Port: 65002
- Username: u297417257
- Password: [your password]

Upload to: `/var/www/delightfulbitsess.com/backend/`

### Step 19: Configure .env for Production (On VPS)

SSH into VPS and edit:
```bash
nano /var/www/delightfulbitsess.com/backend/.env
```

Update these values:
```env
APP_NAME="Library Management System"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://delightfulbitsess.com/api

LOG_CHANNEL=stack
LOG_LEVEL=notice

DB_CONNECTION=sqlsrv
DB_HOST=localhost
DB_PORT=1433
DB_DATABASE=Library_management
DB_USERNAME=SA
DB_PASSWORD=Your_Strong_Password_123!
DB_ENCRYPT=no
DB_TRUST_SERVER_CERTIFICATE=yes

FRONTEND_URL=https://delightfulbitsess.com
CORS_ALLOWED_ORIGINS="https://delightfulbitsess.com,https://www.delightfulbitsess.com"
```

Save: `Ctrl + X`, then `Y`, then `Enter`

### Step 20: Install Composer Dependencies

```bash
cd /var/www/delightfulbitsess.com/backend
composer install --no-dev --optimize-autoloader
```

### Step 21: Generate APP_KEY

```bash
php artisan key:generate
```

### Step 22: Cache Configuration

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Step 23: Set Permissions

```bash
chmod -R 755 storage/
chmod -R 755 bootstrap/cache/
sudo chown -R www-data:www-data storage/
sudo chown -R www-data:www-data bootstrap/cache/
```

---

## PHASE 7: Install & Configure Web Server (Nginx)

### Step 24: Install Nginx

```bash
sudo apt-get install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 25: Create Nginx Config for Backend

```bash
sudo nano /etc/nginx/sites-available/delightfulbitsess-api
```

Paste:
```nginx
server {
    listen 80;
    server_name api.delightfulbitsess.com;
    root /var/www/delightfulbitsess.com/backend/public;

    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.ht {
        deny all;
    }
}
```

Enable:
```bash
sudo ln -s /etc/nginx/sites-available/delightfulbitsess-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## PHASE 8: Deploy Frontend (React)

### Step 26: Build Frontend (Local Machine)

From your local machine:
```bash
cd library-frontend

# Update API URL first in src/services/api.js
# Change: const API_BASE = 'http://localhost:8000';
# To: const API_BASE = 'https://api.delightfulbitsess.com';

npm run build
```

### Step 27: Upload Frontend Files

```bash
# From local machine
scp -P 65002 -r library-frontend/dist/* u297417257@88.223.85.214:/var/www/delightfulbitsess.com/
```

### Step 28: Create Nginx Config for Frontend

```bash
sudo nano /etc/nginx/sites-available/delightfulbitsess
```

Paste:
```nginx
server {
    listen 80;
    server_name delightfulbitsess.com www.delightfulbitsess.com;
    root /var/www/delightfulbitsess.com;

    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location ~ \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable:
```bash
sudo ln -s /etc/nginx/sites-available/delightfulbitsess /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## PHASE 9: Enable SSL/HTTPS (Free with Let's Encrypt)

### Step 29: Install Certbot

```bash
sudo apt-get install -y certbot python3-certbot-nginx
```

### Step 30: Generate SSL Certificates

```bash
sudo certbot certonly --nginx -d delightfulbitsess.com -d www.delightfulbitsess.com -d api.delightfulbitsess.com
```

Follow prompts to verify.

---

## PHASE 10: Testing & Verification

### Step 31: Test Backend API

```bash
# From VPS
curl http://localhost/api/status
```

Or visit in browser:
- `https://delightfulbitsess.com/` (Frontend)
- `https://api.delightfulbitsess.com/` (Backend)

### Step 32: Verify Database Connection

```bash
cd /var/www/delightfulbitsess.com/backend
php artisan migrate --force
```

Or create test file:
```bash
cat > test_db.php << 'EOF'
<?php
require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$db = $app['db'];
try {
    $query = $db->connection()->getPdo();
    echo "✅ Database connection successful!";
} catch (\Exception $e) {
    echo "❌ Database error: " . $e->getMessage();
}
?>
EOF

php test_db.php
```

---

## 🐛 Troubleshooting

### SQL Server Not Running
```bash
sudo systemctl status mssql-server
sudo systemctl start mssql-server
```

### Database Connection Error
```bash
# Test connection with sqlcmd
sqlcmd -S localhost -U SA -P 'your_password'

# Or from Laravel code
php artisan tinker
>>> DB::connection()->getPdo();
```

### Nginx 502 Bad Gateway
Check PHP-FPM:
```bash
sudo systemctl status php-fpm
sudo systemctl restart php-fpm
```

### Check Logs
```bash
# Laravel errors
tail -f /var/www/delightfulbitsess.com/backend/storage/logs/laravel.log

# Nginx errors
tail -f /var/log/nginx/error.log

# SQL Server
sudo tail -f /var/opt/mssql/log/errorlog
```

---

## 🔒 Security Checklist

- [ ] APP_DEBUG set to false
- [ ] APP_ENV set to production
- [ ] Strong SA password set
- [ ] File permissions correct (755 for dirs, 644 for files)
- [ ] .env file not accessible via web
- [ ] SSL/HTTPS enabled
- [ ] Firewall configured (allow only ports 22, 80, 443)
- [ ] Regular backups configured
- [ ] Database user password is strong

---

## 📊 Final Directory Structure

```
/var/www/delightfulbitsess.com/
├── backend/          # Laravel API
│   ├── app/
│   ├── config/
│   ├── database/
│   ├── public/
│   ├── routes/
│   ├── storage/
│   ├── .env         # Production config
│   └── ...
├── index.html        # React frontend
├── assets/          # Frontend assets
└── ...
```

---

## 🎉 Success Indicators

✅ Visit `https://delightfulbitsess.com/` - See frontend
✅ Visit `https://api.delightfulbitsess.com/` - See API response
✅ SQL Server running: `sudo systemctl status mssql-server`
✅ Nginx running: `sudo systemctl status nginx`
✅ No errors in logs: `tail storage/logs/laravel.log`

---

## 📞 Support

- SSH into VPS: `ssh -p 65002 u297417257@88.223.85.214`
- Check Laravel logs: `/var/www/delightfulbitsess.com/backend/storage/logs/laravel.log`
- Check Nginx logs: `/var/log/nginx/error.log`
- Hostinger Support: https://support.hostinger.com

---

**Deployment Date**: April 12, 2026
**Status**: Ready for Production
