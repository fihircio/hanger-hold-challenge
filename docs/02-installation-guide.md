# Installation Guide

## Prerequisites

### System Requirements
- **Node.js** 16 or higher
- **PHP** 8.0 or higher
- **MySQL/MariaDB** 5.7 or higher
- **Composer** package manager
- **Git** for version control
- **Windows PC** with COM port access (for hardware integration)

### Hardware Requirements
- **Windows PC** (Celeron or better) for Electron app
- **TCN CSC-8C (V49)** vending machine with RS232 support
- **USB-to-RS232 adapter** for hardware communication
- **Arduino board** for game sensors (optional)
- **Serial cables** for hardware connections

## Backend Installation

### Step 1: Server Setup
```bash
# Clone repository to server
git clone <repository-url>
cd hanger-hold-challenge/backend

# Install PHP dependencies
composer install --no-dev --optimize-autoloader

# Create environment file
cp .env.example .env
```

### Step 2: Database Configuration
```bash
# Create database
mysql -u root -p
CREATE DATABASE hanger_challenge;
CREATE USER 'hanger_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON hanger_challenge.* TO 'hanger_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Import database schema
mysql -u hanger_user -p hanger_challenge < database/migrations/complete_migration.sql
```

### Step 3: Environment Configuration
Edit `.env` file with your settings:
```bash
DB_HOST=localhost
DB_DATABASE=hanger_challenge
DB_USERNAME=hanger_user
DB_PASSWORD=secure_password
```

### Step 4: Web Server Configuration

#### Apache Example
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

#### Nginx Example
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/hanger-hold-challenge/backend/public;
    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

### Step 5: Verify Backend Installation
```bash
# Start PHP development server for testing
php -S localhost:8080 -t public

# Test endpoints
curl -X GET http://localhost:8080/api/prizes
curl -X POST http://localhost:8080/api/players -H "Content-Type: application/json" -d '{"name":"Test"}'
```

## Frontend Installation

### Step 1: Node.js Setup
```bash
cd hanger-hold-challenge
npm install
```

### Step 2: Environment Configuration
Create `.env.local` file:
```bash
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_ENV=development
```

### Step 3: Development Server
```bash
# Start development server
npm run dev

# Application will be available at http://localhost:3000
```

### Step 4: Production Build
```bash
# Build for production
npm run build

# Output will be in build/ directory
```

## Electron Desktop Application

### Step 1: Electron Setup
```bash
cd electron
npm install
```

### Step 2: Development Mode
```bash
# Run with hot reload
npm run dev

# Run Electron only (after building frontend)
npm start
```

### Step 3: Production Build
```bash
# Build for Windows
npm run build:win

# Output will be in dist/ folder
# Installer: dist/Hanger Challenge Setup 1.0.0.exe
```

## Hardware Integration

### Spring SDK Integration

#### Option 1: Android Bridge (Recommended)
1. **Install Android Studio**
2. **Create new Android project**
3. **Copy vendor SDK files**:
   ```bash
   # Copy TcnSpringDome/MyApplication/app/libs/tcn_springboard-debug.aar
   # Copy Java files to project
   ```
4. **Build and install bridge app**:
   ```bash
   ./gradlew assembleDebug
   adb install -r app/build/outputs/apk/debug/app-debug.apk
   ```

#### Option 2: Android Emulator
1. **Install Android Studio**
2. **Create AVD** with API level 25+
3. **Import SDK project**
4. **Run in emulator**

### TCN Hardware Setup

#### Step 1: Driver Installation
Install all 3 common USB-to-RS232 drivers:

**Prolific PL2303 Driver** (70% chance)
```
Download: https://www.prolific.com.tw/US/ShowProduct.aspx?pcid=41
Install: Windows Driver Installer
Restart: Required
```

**CH340/CH341 Driver** (20% chance)
```
Download: https://sparks.gogo.co.nz/ch340.html
Install: CH341SER.EXE
Restart: Required
```

**FTDI FT232 Driver** (10% chance)
```
Download: https://ftdichip.com/drivers/vcp-drivers/
Install: FTDI CDM Drivers
Restart: Required
```

#### Step 2: Verify Driver Installation
1. **Open Device Manager**
2. **Expand "Ports (COM & LPT)"**
3. **Look for**:
   - Prolific USB-to-Serial (COM3)
   - USB-SERIAL CH340 (COM4)
   - USB Serial Port (FTDI) (COM5)

#### Step 3: Hardware Connection
```
TCN CSC-8C Machine
       ↓ (RS232 Cable)
USB-to-RS232 Adapter
       ↓ (USB Cable)
Windows PC
```

#### Step 4: Serial Configuration
- **Baud Rate**: 115200 (for V49 newer screens)
- **Data Bits**: 8
- **Parity**: None
- **Stop Bits**: 1
- **Flow Control**: None

### Arduino Sensor Setup (Optional)

#### Step 1: Arduino Installation
1. **Install Arduino IDE**
2. **Connect Arduino board** via USB
3. **Upload sensor sketch**
4. **Verify COM port** in Device Manager

#### Step 2: Sensor Calibration
1. **Test button detection**
2. **Adjust sensitivity** if needed
3. **Verify timing accuracy**
4. **Test hold/release events**

## Network Configuration

### Firewall Settings
- **Port 8080**: PHP development server
- **Port 3000**: React development server
- **COM ports**: Serial communication
- **Database port**: 3306 (MySQL)

### CORS Configuration
For development, ensure CORS allows:
- `http://localhost:3000` (React dev server)
- `ws://localhost:3000` (WebSocket connections)

## Verification Checklist

### Backend Verification
- [ ] PHP dependencies installed
- [ ] Database created and migrated
- [ ] Environment file configured
- [ ] Web server configured
- [ ] API endpoints responding
- [ ] Database connectivity working

### Frontend Verification
- [ ] Node.js dependencies installed
- [ ] Environment variables set
- [ ] Development server starts
- [ ] API communication working
- [ ] Build process successful

### Electron Verification
- [ ] Electron dependencies installed
- [ ] Application launches
- [ ] Serial port access working
- [ ] Hardware communication functional
- [ ] Build creates installer

### Hardware Verification
- [ ] COM port visible in Device Manager
- [ ] Serial communication established
- [ ] TCN controller responding
- [ ] Spring SDK initialized (if applicable)
- [ ] Arduino sensors detecting input (if applicable)

## Troubleshooting Installation

### Common Issues

#### "No COM Port Found"
- Install all 3 drivers (Prolific, CH340, FTDI)
- Restart PC after driver installation
- Check Device Manager for yellow exclamation marks
- Try different USB ports

#### "Database Connection Failed"
- Verify MySQL/MariaDB is running
- Check database credentials in .env
- Test with mysql command line
- Check firewall settings

#### "API Not Responding"
- Check web server configuration
- Verify .htaccess rules (Apache)
- Test PHP error logs
- Check file permissions

#### "Electron App Won't Start"
- Verify Node.js installation
- Check package.json dependencies
- Clear node_modules and reinstall
- Check system requirements

## Next Steps

After successful installation:
1. **Review System Overview** documentation
2. **Configure API endpoints** for your needs
3. **Set up hardware integration** based on your vending machine
4. **Test complete workflow** from game to prize dispensing
5. **Deploy to production environment**

This installation guide provides all necessary steps to get your Hanger Hold Challenge system running with full hardware integration.