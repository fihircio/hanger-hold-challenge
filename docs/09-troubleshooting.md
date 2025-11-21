# Troubleshooting Guide

## Overview

This comprehensive troubleshooting guide covers common issues and solutions for the Hanger Hold Challenge system, including backend, frontend, hardware, and integration problems.

## Quick Diagnosis Flow

```
Problem Identification
       ↓
Symptom Analysis → Root Cause Analysis → Solution Implementation
       ↓
Verification Testing → Prevention Measures
```

## Backend Issues

### Database Connection Problems

#### Issue: "Database Connection Failed"
**Symptoms:**
- API returns 500 errors
- PHP logs show connection errors
- Application shows "Database unavailable"

**Diagnosis Steps:**
```bash
# 1. Test database connectivity
mysql -u hanger_user -p -h localhost -e "SELECT 1"

# 2. Check MySQL service status
sudo systemctl status mysql
sudo journalctl -u mysql

# 3. Verify credentials
grep -E "DB_HOST|DB_DATABASE|DB_USERNAME|DB_PASSWORD" .env
```

**Solutions:**
```bash
# Fix 1: Incorrect credentials
# Update .env file with correct database details
DB_HOST=localhost
DB_DATABASE=hanger_challenge
DB_USERNAME=hanger_user
DB_PASSWORD=correct_password

# Fix 2: MySQL service not running
sudo systemctl start mysql
sudo systemctl enable mysql

# Fix 3: Database doesn't exist
mysql -u root -p -e "CREATE DATABASE hanger_challenge"
mysql -u root -p hanger_challenge < database/migrations/complete_migration.sql
```

#### Issue: "SQL Error in API Response"
**Symptoms:**
- API returns database errors
- Specific SQL syntax errors in logs
- Data inconsistency problems

**Common SQL Errors:**
```sql
-- Table doesn't exist
Table 'hanger_challenge.players' doesn't exist

-- Foreign key constraint
Cannot add or update a row: a foreign key constraint fails

-- Data too long
Data too long for column 'player_name' at row 123

-- Duplicate entry
Duplicate entry 'test@example.com' for key 'email'
```

**Solutions:**
```bash
# Run database migrations
mysql -u hanger_user -p hanger_challenge < database/migrations/complete_migration.sql

# Check table structure
mysql -u hanger_user -p -e "DESCRIBE players"

# Verify data integrity
mysql -u hanger_user -p -e "SELECT COUNT(*) FROM players WHERE email IS NOT NULL"
```

### API Endpoint Issues

#### Issue: "404 Not Found"
**Symptoms:**
- API calls return 404 errors
- Frontend shows network errors
- Specific endpoints not accessible

**Diagnosis Steps:**
```bash
# 1. Check if routes are registered
curl -X GET http://localhost:8080/api/nonexistent-endpoint

# 2. Verify .htaccess rules (Apache)
cat .htaccess

# 3. Check nginx configuration (if using Nginx)
nginx -t

# 4. Test with different HTTP methods
curl -X POST http://localhost:8080/api/players
curl -X GET http://localhost:8080/api/players
```

**Solutions:**
```php
// Fix 1: Missing route registration
// In backend/src/routes.php
$app->post('/players', [PlayerController::class, 'createPlayer']);
$app->get('/players/{id}', [PlayerController::class, 'getPlayer']);

// Fix 2: Incorrect URL structure
// Ensure .htaccess redirects properly
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]
```

#### Issue: "CORS Errors"
**Symptoms:**
- Browser console shows CORS errors
- API calls blocked by browser
- "No 'Access-Control-Allow-Origin' header" errors

**Diagnosis:**
```bash
# Test CORS headers
curl -H "Origin: http://localhost:3000" \
     -H "Content-Type: application/json" \
     -X OPTIONS http://localhost:8080/api/players

# Check response headers
curl -I http://localhost:8080/api/players
```

**Solutions:**
```php
// Fix 1: Add CORS headers
// In backend/src/routes.php or middleware
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Fix 2: Preflight handling
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("HTTP/1.1 200 OK");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Max-Age: 86400");
    exit(0);
}
```

### Performance Issues

#### Issue: "Slow API Response Times"
**Symptoms:**
- API calls taking > 5 seconds
- Frontend timeout errors
- Database query logs show slow queries

**Diagnosis Steps:**
```bash
# 1. Profile slow queries
mysql -u hanger_user -p -e "
SELECT * FROM players WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY created_at DESC
LIMIT 10;

# 2. Check indexes
mysql -u hanger_user -p -e "SHOW INDEX FROM players";

# 3. Monitor database performance
mysqladmin -u root -p -i -r 10 extended-status
```

**Solutions:**
```sql
-- Fix 1: Add missing indexes
CREATE INDEX idx_players_email ON players(email);
CREATE INDEX idx_scores_time ON scores(time);
CREATE INDEX idx_vending_logs_created_at ON vending_logs(created_at);

-- Fix 2: Optimize slow queries
-- Instead of:
SELECT * FROM scores WHERE player_id IN (SELECT id FROM players WHERE created_at > '2025-01-01');

-- Use JOIN with proper indexing:
SELECT s.*, p.name FROM scores s 
JOIN players p ON s.player_id = p.id 
WHERE s.time > 10000 
ORDER BY s.time DESC 
LIMIT 10;
```

## Frontend Issues

### Build Problems

#### Issue: "Build Failed"
**Symptoms:**
- npm run build fails
- TypeScript compilation errors
- Missing dependencies

**Diagnosis Steps:**
```bash
# 1. Check for syntax errors
npm run build --verbose

# 2. Verify dependencies
npm ls
npm outdated

# 3. Clean build cache
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Common Build Errors:**
```bash
# TypeScript errors
# Error: Cannot find module 'services/vendingService'
# Solution: Check import path and file existence

# Error: Property 'time' does not exist on type
# Solution: Check TypeScript types and interfaces

# Error: Module not found
# Solution: Verify npm installation and package.json
```

### Runtime Errors

#### Issue: "Application Crashes on Startup"
**Symptoms:**
- Electron app crashes immediately
- White screen on launch
- Console errors before app loads

**Diagnosis Steps:**
```bash
# 1. Check Electron main process logs
# In Windows: %APPDATA%/hanger-challenge/logs/main.log
# In macOS: ~/Library/Logs/hanger-challenge/main.log

# 2. Check preload script errors
# Look for errors in preload.js console

# 3. Verify environment variables
echo $REACT_APP_API_URL
echo $NODE_ENV
```

**Solutions:**
```typescript
// Fix 1: Error boundary in React
import React, { Component, ErrorBoundary } from 'react';

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application error:', error, errorInfo);
    this.setState({ hasError: true, error });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <details>
            {this.state.error && this.state.error.toString()}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Network Issues

#### Issue: "API Connection Refused"
**Symptoms:**
- fetch() returns network errors
- CORS errors in browser
- Timeout errors

**Diagnosis Steps:**
```bash
# 1. Test backend connectivity
curl -v http://localhost:8080/api/status

# 2. Check if backend is running
ps aux | grep php

# 3. Test network connectivity
ping localhost
telnet localhost 8080
```

**Solutions:**
```javascript
// Fix 1: Add retry logic
const apiCall = async (url, options, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      
      const delay = Math.pow(2, i) * 1000; // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
    } catch (error) {
      if (i === retries - 1) throw error;
      console.warn(`Retry ${i + 1}/${retries} failed:`, error.message);
    }
  }
  
  throw new Error(`Failed after ${retries} retries`);
};

// Fix 2: Add timeout handling
const apiCallWithTimeout = async (url, timeout = 5000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { 
      signal: controller.signal,
      ...options 
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};
```

## Hardware Integration Issues

### TCN Connection Problems

#### Issue: "No COM Port Found"
**Symptoms:**
- TCN service shows "No TCN port found"
- Device Manager shows no COM ports
- Serial communication fails

**Diagnosis Steps:**
```bash
# 1. Check Device Manager
# Look under "Ports (COM & LPT)"

# 2. Test with different USB ports
# Try all USB ports on the computer

# 3. Verify driver installation
# Check for yellow exclamation marks in Device Manager

# 4. Test with TeraTerm
# Manual connection test
```

**Solutions:**
```bash
# Fix 1: Install all driver types
# Install Prolific, CH340, and FTDI drivers
# Restart after each installation

# Fix 2: Try different USB cables
# Some cables are faulty or have pin issues

# Fix 3: Check Windows services
# Ensure Windows services are running properly
sc query state= type= service state= running | findstr /i "TCN"
```

#### Issue: "Garbage Characters in Serial Terminal"
**Symptoms:**
- Random characters instead of readable text
- Corrupted data display
- Inconsistent responses

**Diagnosis Steps:**
```bash
# 1. Check baud rate settings
# Try 9600 instead of 115200

# 2. Verify cable connections
# Loose connections can cause data corruption

# 3. Test with different terminal software
# TeraTerm, PuTTY, etc.
```

**Solutions:**
```typescript
// Fix 1: Add error detection
private handleSerialData(data: Buffer): void {
  const text = data.toString('utf8');
  
  // Check for valid response patterns
  if (text.includes('UCS V4')) {
    console.log('Valid controller response:', text);
  } else if (!/^[A-Za-z0-9\r\n]+$/.test(text)) {
    console.warn('Garbage data detected:', text);
    return;
  }
  
  // Process valid data
  this.processValidResponse(text);
}
```

### Spring SDK Integration Issues

#### Issue: "Android Bridge Not Connecting"
**Symptoms:**
- WebSocket connection fails
- HTTP requests to bridge timeout
- Spring SDK not responding

**Diagnosis Steps:**
```bash
# 1. Test Android device connectivity
ping 192.168.1.100

# 2. Check bridge app status
curl -X GET http://192.168.1.100:8080/status

# 3. Verify network configuration
# Ensure both devices on same network
```

**Solutions:**
```javascript
// Fix 1: Add connection retry logic
class SpringBridgeService {
  private maxRetries = 5;
  private reconnectDelay = 2000;

  async connect(): Promise<boolean> {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(`http://192.168.1.100:8080/status`);
        if (response.ok) return true;
      } catch (error) {
        console.warn(`Connection attempt ${attempt} failed:`, error.message);
        if (attempt < this.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, this.reconnectDelay));
        }
      }
    }
    
    throw new Error('Failed to connect after maximum retries');
  }
}
```

## Performance Issues

### Memory Leaks

#### Issue: "Memory Usage Increases Over Time"
**Symptoms:**
- Application becomes slower over time
- Browser crashes after extended use
- System performance degrades

**Diagnosis Steps:**
```bash
# 1. Monitor Node.js memory usage
node --inspect index.js

# 2. Check for memory leaks in browser
# Open Developer Tools → Memory tab

# 3. Profile Electron app memory
# Use Chrome DevTools for Electron apps
```

**Solutions:**
```javascript
// Fix 1: Proper cleanup in React
useEffect(() => {
  return () => {
    // Cleanup timers and intervals
    clearInterval(timerId);
    clearTimeout(timeoutId);
    
    // Cleanup event listeners
    window.removeEventListener('resize', handleResize);
    
    // Cleanup subscriptions
    subscription.unsubscribe();
  };
}, []);

// Fix 2: Dispose serial ports properly
class SerialService {
  disconnect(): void {
    if (this.port && this.port.isOpen) {
      this.port.removeAllListeners();
      this.port.close();
    }
  }
}
```

### CPU Usage Problems

#### Issue: "High CPU Usage"
**Symptoms:**
- Fan runs constantly
- System becomes unresponsive
- Battery drains quickly (laptops)

**Diagnosis Steps:**
```bash
# 1. Monitor CPU usage
top -p $(pgrep node)
htop

# 2. Profile Node.js application
node --prof index.js

# 3. Check for infinite loops
# Look in code for while(true) loops without breaks
```

**Solutions:**
```javascript
// Fix 1: Optimize expensive operations
// Instead of processing large arrays in loops
const processedData = largeArray.map(item => expensiveOperation(item));

// Fix 2: Add debouncing
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

// Fix 3: Use requestAnimationFrame for animations
requestAnimationFrame(animate);
```

## Security Issues

### Authentication Problems

#### Issue: "Unauthorized API Access"
**Symptoms:**
- 401 Unauthorized errors
- API keys not working
- Session management issues

**Diagnosis Steps:**
```bash
# 1. Test API key validity
curl -H "Authorization: Bearer invalid-key" \
     http://localhost:8080/api/players

# 2. Check token expiration
# Decode JWT token and check expiration

# 3. Verify user permissions
# Check database user roles and permissions
```

**Solutions:**
```php
// Fix 1: Implement proper JWT validation
function validateJWT($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return false;
    
    list($parts, $header, $payload) === str_replace($header, '', $payload, $parts[1])) {
        return base64_decode($parts[2]);
    }
    
    return false;
}

// Fix 2: Add rate limiting
class RateLimiter {
    private $requests = [];
    
    public function checkLimit($ip, $window = 3600) {
        $now = time();
        $this->cleanupOldRequests($now - $window);
        
        $recent = array_filter($this->requests, function($req) use ($req['ip']) {
            return $req['timestamp'] > ($now - $window);
        });
        
        return count($recent) < 100; // 100 requests per hour
    }
}
```

## Monitoring and Prevention

### Proactive Monitoring

#### System Health Dashboard
```javascript
// Create monitoring dashboard
const healthCheck = {
  database: async () => {
    const start = Date.now();
    try {
      await db.query('SELECT 1');
      return { status: 'healthy', responseTime: Date.now() - start };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  },
  
  api: async () => {
    // Test critical endpoints
    const endpoints = ['/api/status', '/api/players', '/api/scores'];
    const results = [];
    
    for (const endpoint of endpoints) {
      const start = Date.now();
      try {
        await fetch(`http://localhost:8080${endpoint}`);
        results.push({ endpoint, status: 'healthy', responseTime: Date.now() - start });
      } catch (error) {
        results.push({ endpoint, status: 'unhealthy', error: error.message });
      }
    }
    
    return results;
  }
};
```

### Error Logging Strategy

#### Structured Logging
```javascript
// Implement structured logging
class Logger {
  static log(level, message, context = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      context,
      stack: level === 'error' ? new Error().stack : undefined
    };
    
    console.log(JSON.stringify(logEntry));
    
    // Send to external logging service
    if (level === 'error') {
      this.sendToAlertingService(logEntry);
    }
  }
  
  static sendToAlertingService(logEntry) {
    // Integration with monitoring service
    fetch('https://monitoring-service.com/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logEntry)
    });
  }
}
```

This troubleshooting guide provides comprehensive solutions for common issues across all components of the Hanger Hold Challenge system.