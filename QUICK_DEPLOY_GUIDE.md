# ⚡ Quick-Start: Hostinger VPS Deployment

**Read the full guide**: [HOSTINGER_VPS_SQLSERVER_DEPLOYMENT.md](HOSTINGER_VPS_SQLSERVER_DEPLOYMENT.md)

---

## 🎯 30-Second Overview

1. **SSH to VPS** → Install SQL Server → Create Database
2. **Upload Backend** → Configure .env → Run Migrations
3. **Upload Frontend** → Configure API URL → Build & Deploy
4. **Enable SSL** → Test Everything

---

## ✅ Pre-Deployment Checklist

### Local Machine
- [ ] `npm run build` executed in library-frontend/
- [ ] dist/ folder created successfully
- [ ] Backend code ready to upload
- [ ] Have your FTP/SSH credentials ready

### Hostinger VPS Credentials
```
IP: 88.223.85.214
Port: 65002
Username: u297417257
Domain: delightfulbitsess.com
```

---

## 🚀 Quick Commands (Copy-Paste Ready)

### 1️⃣ Connect to VPS
```bash
ssh -p 65002 u297417257@88.223.85.214
```

### 2️⃣ Install SQL Server (Run on VPS)
```bash
sudo apt-get update && sudo apt-get upgrade -y
curl https://packages.microsoft.com/keys/microsoft.asc | sudo apt-key add -
sudo add-apt-repository "$(curl https://packages.microsoft.com/config/ubuntu/20.04/mssql-server-2019.list)"
sudo apt-get install -y mssql-server
sudo /opt/mssql/bin/mssql-conf setup
```

**When prompted:**
- Accept License: `Yes`
- Edition: `2` (Standard)
- SA Password: `YourStrongPassword123!` (save this!)

### 3️⃣ Start SQL Server
```bash
sudo systemctl start mssql-server
sudo systemctl enable mssql-server
```

### 4️⃣ Create Database
```bash
sqlcmd -S localhost -U SA -P 'YourStrongPassword123!'
```

Then paste:
```sql
CREATE DATABASE Library_management;
GO
EXIT
GO
```

### 5️⃣ Install Required Tools (On VPS)
```bash
sudo apt-get install -y php php-fpm php-sqlsrv php-pdo-sqlsrv \
  php-mbstring php-tokenizer php-json php-bcmath php-curl \
  php-dom php-gd php-zip php-xml php-ctype php-fileinfo
  
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

sudo apt-get install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 6️⃣ Upload Backend Files (From Local Machine)
```bash
scp -P 65002 -r library-main/* u297417257@88.223.85.214:/var/www/delightfulbitsess.com/backend/
```

### 7️⃣ Configure Environment (On VPS)
```bash
nano /var/www/delightfulbitsess.com/backend/.env
```

Update these values:
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://delightfulbitsess.com/api

DB_CONNECTION=sqlsrv
DB_HOST=localhost
DB_PORT=1433
DB_DATABASE=Library_management
DB_USERNAME=SA
DB_PASSWORD=YourStrongPassword123!
```

Save: `Ctrl + X` → `Y` → `Enter`

### 8️⃣ Install Composer & Migrate (On VPS)
```bash
cd /var/www/delightfulbitsess.com/backend
composer install --no-dev --optimize-autoloader
php artisan key:generate
php artisan config:cache
php artisan route:cache
chmod -R 755 storage bootstrap/cache
```

**Optional - Run migrations:**
```bash
php artisan migrate --force
```

### 9️⃣ Update Frontend API URL (Local Machine)
Edit: `library-frontend/src/services/api.js`

Change:
```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

To:
```javascript
const API_BASE_URL = 'https://api.delightfulbitsess.com/api';
```

Then build:
```bash
cd library-frontend
npm run build
```

### 🔟 Upload Frontend (From Local Machine)
```bash
scp -P 65002 -r library-frontend/dist/* u297417257@88.223.85.214:/var/www/delightfulbitsess.com/
```

### 1️⃣1️⃣ Setup SSL (On VPS)
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d delightfulbitsess.com -d www.delightfulbitsess.com -d api.delightfulbitsess.com
```

---

## ✨ Verify Everything Works

### Check Services Running
```bash
sudo systemctl status mssql-server   # SQL Server
sudo systemctl status nginx           # Web Server
sudo systemctl status php-fpm         # PHP
```

### Test Database Connection
```bash
sqlcmd -S localhost -U SA -P 'YourStrongPassword123!'
SELECT name FROM sys.databases;
GO
EXIT
GO
```

### View Logs for Errors
```bash
tail -f /var/www/delightfulbitsess.com/backend/storage/logs/laravel.log
```

---

## 🌐 Access Your Application

- **Frontend**: https://delightfulbitsess.com/
- **Backend API**: https://api.delightfulbitsess.com/
- **Blog/Status**: Add route for `/status`

---

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| **SSH connection refused** | Use port 65002, not 22 |
| **SQL Server won't start** | Check: `sudo systemctl status mssql-server` |
| **Database connection error** | Verify password & database name in .env |
| **502 Bad Gateway** | Restart PHP-FPM: `sudo systemctl restart php-fpm` |
| **CORS errors** | Update `CORS_ALLOWED_ORIGINS` in .env |
| **Nginx not showing site** | Reload: `sudo systemctl reload nginx` |

---

## 📞 Get Help

1. **SSH into VPS**: `ssh -p 65002 u297417257@88.223.85.214`
2. **Check logs**: `tail storage/logs/laravel.log`
3. **Restart services**: `sudo systemctl restart nginx` or `mssql-server`

---

## ✅ Success Checklist

- [ ] SQL Server installed and running
- [ ] Database created
- [ ] Backend uploaded and configured
- [ ] Frontend built and uploaded
- [ ] SSL certificates obtained
- [ ] Frontend loads without errors
- [ ] Login works
- [ ] No database connection errors
- [ ] API responding correctly

---

**Good luck! 🚀 You got this!**
