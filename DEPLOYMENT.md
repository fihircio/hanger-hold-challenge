# Hanger Challenge - Complete Deployment Guide

This guide covers deployment of the entire Hanger Hold Challenge system including PHP backend, React frontend, and Electron desktop application.

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App    │    │   PHP Backend  │    │ Vending Machine │
│   (Frontend)   │◄──►│   (API Server)  │◄──►│   (Hardware)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       ▲                       ▲
         │                       │                       │
         └───────────────────────┴───────────────────────┘
                    ┌─────────────────┐
                    │   Electron App  │
                    │ (Desktop App)  │
                    └─────────────────┘
```

## 1. Backend Deployment (PHP/MySQL)

### Prerequisites
- PHP 8.0 or higher
- MySQL/MariaDB 5.7 or higher
- Composer package manager
- Web server (Apache/Nginx)

### Setup Steps

1. **Server Setup**:
```bash
# Clone repository to server
git clone <repository-url>
cd hanger-hold-challenge/backend

# Install dependencies
composer install --no-dev --optimize-autoloader

# Create environment file
cp .env.example .env
```

2. **Database Configuration**:
```bash
# Create database
mysql -u root -p
CREATE DATABASE hanger_challenge;
CREATE USER 'hanger_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON hanger_challenge.* TO 'hanger_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Import schema
mysql -u hanger_user -p hanger_challenge < database/migrations/001_create_players_table.sql
mysql -u hanger_user -p hanger_challenge < database/migrations/002_create_scores_table.sql
mysql -u hanger_user -p hanger_challenge < database/migrations/003_create_prizes_table.sql
mysql -u hanger_user -p hanger_challenge < database/migrations/004_create_vending_logs_table.sql
mysql -u hanger_user -p hanger_challenge < database/migrations/005_seed_prizes.sql
```

3. **Environment Configuration**:
```bash
# Edit .env file
DB_HOST=localhost
DB_DATABASE=hanger_challenge
DB_USERNAME=hanger_user
DB_PASSWORD=secure_password
```

4. **Web Server Configuration** (Apache example):
```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /path/to/hanger-hold-challenge/backend/public
    
    AllowOverride All
    Require all granted
    
    <FilesMatch \.php$>
        SetHandler application/x-httpd-php .php
    </FilesMatch>
</VirtualHost>
```

5. **Test API**:
```bash
# Start PHP development server for testing
php -S localhost:8080 -t public

# Test endpoints
curl -X GET http://localhost:8080/api/prizes
curl -X POST http://localhost:8080/api/players -H "Content-Type: application/json" -d '{"name":"Test Player"}'
```

## 2. Frontend Deployment (React)

### Prerequisites
- Node.js 16 or higher
- npm or yarn package manager

### Setup Steps

1. **Build for Production**:
```bash
cd hanger-hold-challenge
npm install
npm run build
```

2. **Configure API URL**:
```bash
# Create .env.production file
REACT_APP_API_URL=https://your-api-domain.com
```

3. **Deploy to Web Server**:
```bash
# Copy build files to web server
rsync -av build/ user@server:/var/www/html/
```

4. **Configure Web Server** (Nginx example):
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 3. Electron Desktop Application

### Prerequisites
- Node.js 16 or higher
- Python 3+ (for native dependencies)
- Windows SDK (for Windows builds)

### Development Setup

1. **Install Dependencies**:
```bash
cd electron
npm install
```

2. **Development Mode**:
```bash
# Run with hot reload
npm run dev

# Run Electron only (after building frontend)
npm start
```

### Production Build

1. **Windows Build**:
```bash
# Build for Windows
npm run build:win

# Output will be in dist/ folder
# Installer: dist/Hanger Challenge Setup 1.0.0.exe
```

2. **Cross-Platform Build**:
```bash
# Build for all platforms
npm run dist

# Creates installers for:
# - Windows (.exe)
# - macOS (.dmg)
# - Linux (.AppImage)
```

### Distribution

1. **Code Signing (Windows)**:
```bash
# Install certificate
# Configure in electron-builder
# Sign the installer
```

2. **Auto-Updater** (Optional):
```json
// Add to electron/package.json
"publish": {
  "provider": "github",
  "owner": "your-username",
  "repo": "hanger-challenge"
}
```

## 4. Vending Machine Setup

### Hardware Requirements
- Serial port (RS-232/USB)
- Compatible vending machine controller
- Power supply (12V/24V DC)

### Configuration

1. **Physical Connection**:
   - Connect serial cable to appropriate port
   - Verify power connections
   - Test communication

2. **Port Configuration**:
   - Baud Rate: 9600
   - Data Bits: 8
   - Parity: None
   - Stop Bits: 1

3. **Slot Mapping**:
   - Gold Prize: Slot 1
   - Silver Prize: Slot 2
   - Bronze Prize: Slot 3

### Testing

1. **Manual Test**:
```bash
# Test with serial terminal
echo "00 FF 01 FE AA 55" | xxd -r -p > /dev/ttyUSB0
```

2. **Software Test**:
   - Use Electron app test mode
   - Verify command reception
   - Check prize dispensing

## 5. Complete System Integration

### Network Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   Internet Cloud                     │
└─────────────────────┬───────────────────────────┘
                    │
        ┌───────────▼───────────┐
        │    Web Server          │
        │  (Nginx/Apache)      │
        └───────┬───────┬───────┘
                │           │
    ┌───────▼───┐ ┌───▼────────┐
    │  Frontend   │ │  Backend   │
    │  (React)   │ │  (PHP)    │
    └───────┬─────┘ └───────┬─────┘
            │                   │
    ┌───────▼─────────────────▼───┐
    │      Electron Desktop App       │
    │   (Serial Communication)     │
    └───────────┬───────────────────┘
                │
        ┌───────▼────────┐
        │ Vending Machine │
        │   (Hardware)    │
        └────────────────┘
```

### Environment Variables

| Variable | Frontend | Backend | Description |
|-----------|------------|-----------|-------------|
| API_URL | REACT_APP_API_URL | - | Backend API endpoint |
| DB_HOST | - | DB_HOST | Database host |
| DB_NAME | - | DB_DATABASE | Database name |
| DB_USER | - | DB_USERNAME | Database user |
| DB_PASS | - | DB_PASSWORD | Database password |

### Monitoring

1. **Application Logs**:
   - Frontend: Browser console
   - Backend: PHP error logs
   - Electron: Console/DevTools

2. **Server Monitoring**:
   - Use PM2 for process management
   - Monitor with htop/htop
   - Log rotation setup

3. **Database Monitoring**:
   - Slow query log
   - Connection pool monitoring
   - Backup automation

### Security Considerations

1. **Backend Security**:
   - HTTPS enforcement
   - API rate limiting
   - Input validation
   - SQL injection prevention

2. **Frontend Security**:
   - HTTPS only
   - CSP headers
   - XSS prevention
   - Secure cookies

3. **Desktop Security**:
   - Code signing
   - Auto-updater verification
   - Serial port access control

## 6. Troubleshooting

### Common Issues

1. **API Connection Errors**:
   - Check CORS settings
   - Verify firewall rules
   - Test endpoint accessibility

2. **Database Connection**:
   - Verify credentials
   - Check server status
   - Test network connectivity

3. **Serial Communication**:
   - Port permissions
   - Driver installation
   - Hardware compatibility

4. **Build Failures**:
   - Clear node_modules
   - Update dependencies
   - Check platform tools

### Support Contacts

- **Backend Issues**: Check PHP error logs
- **Frontend Issues**: Check browser console
- **Hardware Issues**: Verify serial connections
- **Build Issues**: Check CI/CD logs

## 7. Maintenance

### Regular Tasks

1. **Daily**:
   - Check error logs
   - Monitor performance
   - Verify backups

2. **Weekly**:
   - Update dependencies
   - Security patches
   - Clean temp files

3. **Monthly**:
   - Database optimization
   - Certificate renewal
   - Capacity planning

### Backup Strategy

1. **Database**:
   - Daily automated backups
   - Weekly full exports
   - Off-site storage

2. **Application**:
   - Version control tags
   - Configuration backups
   - Asset management

3. **Recovery Plan**:
   - RTO/RPO definitions
   - Test restoration
   - Documentation updates