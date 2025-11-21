# Deployment Guide

## Overview

This guide covers production deployment of the Hanger Hold Challenge system, including backend API, frontend application, Electron desktop app, and hardware integration.

## Production Environment

### Server Requirements
- **Operating System**: Ubuntu 20.04 LTS or CentOS 8+
- **CPU**: 2+ cores, 4GB+ RAM recommended
- **Storage**: 50GB+ SSD recommended
- **Network**: Stable internet connection
- **Database**: MySQL 8.0+ or MariaDB 10.3+

### Network Configuration
```
Internet
    ↓
┌─────────────┐
│  Firewall    │
│  (Port 80)   │
└─────┬───────┘
      │
      ↓
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Web Server │    │  PHP Backend  │    │  Database    │
│  (Nginx/Apache)│◄──►│   (PHP-FPM)   │◄──►│ (MySQL/MariaDB)│
└─────────────┘    └─────────────┘    └─────────────┘
```

## Backend Deployment

### Step 1: Server Setup

#### Install Required Packages
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx php-fpm php-mysql mysql-server php-cli php-xml php-mbstring

# CentOS/RHEL
sudo yum install nginx php-fpm php-mysqlnd mariadb-server php-cli php-xml php-mbstring
```

#### Configure PHP-FPM
```ini
# /etc/php/8.1/fpm/php.ini
[www]
user = www-data
group = www-data
listen = /run/php/php8.1-fpm.sock
listen.owner = www-data
listen.group = www-data
pm = dynamic
pm.max_children = 50
pm.start_servers = 5
pm.min_spare_servers = 2
pm.max_requests = 500
request_terminate_timeout = 300s
```

#### Configure Nginx
```nginx
# /etc/nginx/sites-available/hanger-challenge
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/hanger-challenge/backend/public;
    index index.php index.html;

    # PHP processing
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param PATH_INFO $fastcgi_path_info;
        fastcgi_intercept_errors on;
        include fastcgi_params;
    }

    # Static files
    location / {
        try_files $uri $uri/ /index.php?$query_string;
        expires 1y;
        add_header Cache-Control "public, max-age=31536000";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

#### Configure Apache (Alternative)
```apache
# /etc/apache2/sites-available/hanger-challenge.conf
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/hanger-challenge/backend/public
    
    <FilesMatch \.php$>
        SetHandler application/x-httpd-php .php
    </FilesMatch>
    
    <Directory /var/www/hanger-challenge/backend/public>
        AllowOverride All
        Require all granted
        
        # Security headers
        Header always set X-Frame-Options "SAMEORIGIN"
        Header always set X-Content-Type-Options "nosniff"
        Header always set X-XSS-Protection "1; mode=block"
    </Directory>
</VirtualHost>
```

### Step 2: Database Setup

#### Install MySQL/MariaDB
```bash
# MySQL 8.0
sudo apt install mysql-server mysql-client

# MariaDB 10.3
sudo apt install mariadb-server mariadb-client

# Secure installation
sudo mysql_secure_installation
```

#### Database Configuration
```sql
-- Create database and user
CREATE DATABASE hanger_challenge CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'hanger_user'@'localhost' IDENTIFIED BY 'secure_password_here';
GRANT ALL PRIVILEGES ON hanger_challenge.* TO 'hanger_user'@'localhost';
FLUSH PRIVILEGES;

-- Import schema
SOURCE /path/to/complete_migration.sql;
```

#### Database Optimization
```sql
-- Performance indexes
CREATE INDEX idx_scores_time ON scores(time);
CREATE INDEX idx_vending_logs_created_at ON vending_logs(created_at);
CREATE INDEX idx_spring_vending_logs_timestamp ON spring_vending_logs(timestamp);

-- Configuration
SET GLOBAL innodb_buffer_pool_size = 256M;
SET GLOBAL innodb_log_file_size = 256M;
SET GLOBAL innodb_flush_log_at_trx_commit = 1;
```

### Step 3: Application Deployment

#### Deploy Backend Code
```bash
# Clone repository
cd /var/www
git clone <repository-url> hanger-challenge

# Set permissions
chown -R www-data:www-data /var/www/hanger-challenge
chmod -R 755 /var/www/hanger-challenge

# Install dependencies
cd hanger-challenge/backend
composer install --no-dev --optimize-autoloader

# Configure environment
cp .env.example .env
# Edit with production values
```

#### Configure Environment Variables
```bash
# .env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_HOST=localhost
DB_DATABASE=hanger_challenge
DB_USERNAME=hanger_user
DB_PASSWORD=secure_production_password
DB_CHARSET=utf8mb4
DB_COLLATION=utf8mb4_unicode_ci

# Security
APP_KEY=your-32-character-random-key
CORS_ALLOWED_ORIGINS=https://your-domain.com
```

## Frontend Deployment

### Step 4: Build Production Assets

#### Build React Application
```bash
cd /var/www/hanger-challenge
npm install
npm run build

# Output will be in build/ directory
```

#### Configure Web Server for Frontend
```nginx
# Add to server block
location / {
    root /var/www/hanger-challenge/build;
    try_files $uri $uri/ /index.html;
    expires 1y;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000";
    }
}
```

### Step 5: SSL Certificate Setup

#### Install Let's Encrypt
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Configure auto-renewal
sudo crontab -e
0 12 * * * /usr/bin/certbot renew --quiet --deploy-hook "systemctl reload nginx"
```

#### Configure HTTPS
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES128-SHA256;
    ssl_prefer_server_ciphers off;
    
    # Redirect HTTP to HTTPS
    if ($scheme != "https") {
        return 301 https://$host$request_uri;
    }
}
```

## Electron Application Deployment

### Step 6: Build Electron App

#### Production Build
```bash
cd /var/www/hanger-challenge/electron
npm install
npm run build:win

# Output will be in dist/ folder
```

#### Configure Electron Builder
```json
// electron/package.json
{
  "build": {
    "appId": "com.hangerchallenge.app",
    "productName": "Hanger Challenge",
    "directories": {
      "output": "dist"
    },
    "files": [
      "build/**/*",
      "node_modules/**/*"
    ],
    "win": {
      "target": "nsis",
      "icon": "assets/icon.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "shortcutName": "Hanger Challenge"
    }
  }
}
```

### Step 7: Create Installer

#### Windows Installer Configuration
```json
// electron-builder.yml
appId: com.hangerchallenge.app
productName: Hanger Challenge
copyright: Copyright © 2025 Your Company
electronDownload: https://github.com/electron/electron/releases/download/v20.0.0

win:
  target:
    - target: nsis
      arch:
        - x64
  artifactName: Hanger-Challenge-Setup-${version}
  publisherName: Your Company
  verifyUpdateCodeSignature: false
```

## Hardware Deployment

### Step 8: Vending Machine Setup

#### TCN Hardware Installation
```bash
# Physical setup checklist
- [ ] TCN CSC-8C (V49) machine positioned
- [ ] Power connected and verified
- [ ] RS232 cable connected to controller
- [ ] USB-to-RS232 adapter connected to PC
- [ ] Network cable connected (if remote monitoring)
- [ ] Machine configured and tested
```

#### Driver Deployment
```bash
# Install required drivers on production machine
# Copy driver installers to production machine
# Run driver installers as administrator
# Verify COM port in Device Manager
```

#### Spring SDK Deployment (Optional)
```bash
# For Android bridge deployment
- [ ] Android device configured with bridge app
- [ ] Network connectivity between PC and Android device
- [ ] Spring SDK initialized and connected
- [ ] All 25 channels tested and verified
```

### Step 9: Service Configuration

#### System Services
```bash
# Create systemd services
sudo nano /etc/systemd/systemd/hanger-challenge-api.service
```

```ini
[Unit]
Description=Hanger Challenge API
After=network.target

[Service]
Type=forking
User=www-data
Group=www-data
WorkingDirectory=/var/www/hanger-challenge/backend
ExecStart=/usr/bin/php-fpm -y -c /etc/php/8.1/fpm/php.ini
ExecReload=/bin/kill -USR2 main
PIDFile=/run/php-fpm.pid
Restart=always
RestartSec=10s

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start services
sudo systemctl daemon-reload
sudo systemctl enable hanger-challenge-api
sudo systemctl enable hanger-challenge-nginx
sudo systemctl start hanger-challenge-api
sudo systemctl start hanger-challenge-nginx
```

## Monitoring and Logging

### Step 10: Application Monitoring

#### Log Configuration
```bash
# Nginx access log
/var/log/nginx/hanger-challenge.access.log

# Nginx error log
/var/log/nginx/hanger-challenge.error.log

# PHP-FPM log
/var/log/php8.1-fpm.log

# Application logs
/var/log/hanger-challenge/app.log
```

#### Log Rotation
```bash
# Configure logrotate
sudo nano /etc/logrotate.d/hanger-challenge
```

```
/var/log/nginx/hanger-challenge.*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644
    postrotate
        systemctl reload nginx
}

/var/log/php8.1-fpm.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644
    postrotate
        systemctl reload php8.1-fpm
}
```

### Step 11: Performance Monitoring

#### Monitoring Tools
```bash
# Install monitoring tools
sudo apt install htop iotop nethogs

# Database monitoring
mysqladmin status -u root -p
mysqladmin processlist -u root -p

# Application performance monitoring
pm2 status hanger-challenge-api
```

#### Health Check Endpoint
```bash
# Create health check script
cat > /var/www/hanger-challenge/health-check.php << 'EOF
<?php
header('Content-Type: application/json');

$checks = [
    'database' => function() {
        try {
            $pdo = new PDO('mysql:host=localhost;dbname=hanger_challenge', 'hanger_user', 'password');
            return $pdo->query('SELECT 1')->fetchColumn() !== false;
        } catch (Exception $e) {
            return false;
        }
    },
    'api' => function() {
        return file_exists(__DIR__ . . '/api_endpoints_for_server.php');
    }
];

$allPassed = array_reduce($checks, function($carry, $item) {
    return $carry && $item();
}, true);

echo json_encode([
    'status' => $allPassed ? 'healthy' : 'unhealthy',
    'checks' => $checks,
    'timestamp' => date('c')
]);
?>
EOF
```

## Security Hardening

### Step 12: Security Configuration

#### Firewall Setup
```bash
# Configure UFW firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow from 192.168.1.0 to any port 3306  # Database access
sudo ufw status
```

#### Security Headers
```nginx
# Add to server configuration
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; object-src 'self'";
```

#### Database Security
```sql
-- Create restricted database user
CREATE USER 'hanger_readonly'@'localhost' IDENTIFIED BY 'readonly_password';
GRANT SELECT ON hanger_challenge.* TO 'hanger_readonly'@'localhost';

-- Remove test database
DROP DATABASE IF EXISTS test_hanger_challenge;
```

## Backup and Recovery

### Step 13: Backup Strategy

#### Database Backups
```bash
# Create backup script
cat > /usr/local/bin/backup-hanger-challenge.sh << 'EOF
#!/bin/bash

BACKUP_DIR="/var/backups/hanger-challenge"
DB_NAME="hanger_challenge"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
mysqldump --single-transaction --routines --triggers -u hanger_user -p$BACKUP_DIR/$DB_NAME_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/$DB_NAME_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/$DB_NAME_$DATE.sql.gz"
EOF

chmod +x /usr/local/bin/backup-hanger-challenge.sh
```

#### Application Backups
```bash
# Backup application files
tar -czf /var/backups/hanger-challenge/app_$(date +%Y%m%d_%H%M%S).tar.gz \
  /var/www/hanger-challenge \
  --exclude=node_modules \
  --exclude=build \
  --exclude=.git
```

#### Automated Backups
```bash
# Add to crontab
crontab -e
# Database backup at 2 AM daily
0 2 * * * /usr/local/bin/backup-hanger-challenge.sh

# Application backup at 3 AM daily
0 3 * * * tar -czf /var/backups/hanger-challenge/app_$(date +\%Y\%m\%d_\%H\%M\%S).tar.gz /var/www/hanger-challenge --exclude=node_modules --exclude=build
```

## Deployment Verification

### Step 14: Pre-Launch Checklist

#### Backend Verification
- [ ] Database connection working
- [ ] PHP-FPM service running
- [ ] Nginx configuration valid
- [ ] SSL certificate installed
- [ ] API endpoints responding
- [ ] Error pages configured

#### Frontend Verification
- [ ] Production build successful
- [ ] Static assets serving
- [ ] API communication working
- [ ] Browser console error-free
- [ ] Responsive design working

#### Hardware Verification
- [ ] TCN driver installed
- [ ] Serial communication working
- [ ] Vending machine responding
- [ ] Spring SDK initialized (if applicable)

#### Security Verification
- [ ] Firewall rules active
- [ ] SSL certificate valid
- [ ] Security headers present
- [ ] Database users restricted
- [ ] Log rotation configured

### Step 15: Go-Live Procedure

#### Deployment Steps
```bash
# 1. Final backup
/usr/local/bin/backup-hanger-challenge.sh

# 2. Deploy new code
cd /var/www/hanger-challenge
git pull origin main
composer install --no-dev --optimize-autoloader

# 3. Restart services
sudo systemctl reload php8.1-fpm
sudo systemctl reload nginx

# 4. Verify deployment
curl -f https://your-domain.com/api/vending/status
curl -f https://your-domain.com/health-check.php
```

#### Post-Launch Monitoring
```bash
# Monitor for 30 minutes after deployment
for i in {1..30}; do
  echo "Check $i: $(date)"
  curl -s https://your-domain.com/api/vending/status | jq -r '.status'
  sleep 60
done
```

## Maintenance Procedures

### Step 16: Ongoing Maintenance

#### Daily Tasks
- [ ] Check error logs
- [ ] Monitor system performance
- [ ] Verify backup completion
- [ ] Check SSL certificate expiry
- [ ] Review security logs

#### Weekly Tasks
- [ ] Update system packages
- [ ] Review and optimize database
- [ ] Check disk space usage
- [ ] Test failover procedures

#### Monthly Tasks
- [ ] Security audit and updates
- [ ] Performance analysis
- [ ] Backup verification and testing
- [ ] Documentation updates

This deployment guide provides comprehensive procedures for deploying and maintaining the Hanger Hold Challenge system in a production environment with proper security, monitoring, and backup strategies.