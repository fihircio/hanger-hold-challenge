# MySQL Connection Guide for Hanger Challenge Backend

## Current Issue
The application is configured to connect to the MySQL server at `vendinghanger.eeelab.xyz` but is encountering an access denied error:

```
Access denied for user 'eeelab46_vendinghangeruser'@'115.164.33.0' (using password: YES)
```

This indicates that the MySQL server has IP restrictions in place and only allows connections from specific IP addresses.

## Solutions

### Option 1: Whitelist Your IP Address (Recommended)
Contact your database administrator and request to whitelist your current IP address (`115.164.33.0`) for the MySQL user `eeelab46_vendinghangeruser`.

### Option 2: Use SSH Tunneling
If you have SSH access to the server, you can create an SSH tunnel to bypass IP restrictions:

```bash
ssh -L 3306:vendinghanger.eeelab.xyz:3306 user@server_ip
```

Then update your `.env` file to use localhost:
```
DB_HOST=localhost
DB_PORT=3306
```

### Option 3: Use a VPN
Connect to a VPN that has an IP address whitelisted for the MySQL server.

### Option 4: Use a Proxy Server
Set up a proxy server with a whitelisted IP address to forward requests to the MySQL server.

## Temporary Solution: Use SQLite for Development
For local development, you can temporarily switch back to SQLite by modifying `backend/config/database.php`:

```php
return [
    'default' => 'sqlite', // Change back to 'mysql' when IP is whitelisted
    // ... rest of configuration
];
```

## Migration Script
Once the connection issue is resolved, you have two options to set up the database:

### Option 1: Use PHP Migration Script
```bash
cd backend
php migrate_mysql.php
```

### Option 2: Manual SQL Upload (Recommended for your situation)
Since you don't have SSH access, you can manually upload and execute the complete migration file:

1. Upload `backend/complete_migration.sql` to your server
2. Execute it using your hosting control panel or phpMyAdmin
3. The file contains all tables and seed data in the correct order

The migration will:
1. Create players table
2. Create scores table
3. Create prizes table
4. Create vending_logs table
5. Seed prizes table with initial data

### Option 3: Server-Side API Endpoints (Perfect for Electron App)
Since you're deploying an Electron app and can't whitelist IPs, you can use server-side API endpoints:

1. Upload `backend/api_endpoints_for_server.php`
2. Place it in a directory accessible via web (e.g., vendinghanger.eeelab.xyz/api/)
3. Update your Electron app to use these endpoints instead of localhost

The API endpoints file provides:
- All CRUD operations for players, scores, prizes, and vending logs
- Direct database connection from server (bypasses IP restrictions)
- Same functionality as your local backend but accessible from anywhere

## Testing the Connection
After resolving the connection issue, test with:

```bash
cd backend
php test_mysql_connection.php
```

This will verify the connection and check if all tables exist.