# Electron App API Integration Guide

## Overview
This guide explains how to update your Electron app to use the server-side API endpoints instead of localhost, bypassing IP restrictions.

## Files to Update
1. `backend/api_endpoints_for_server.php` - Upload this to your server
2. Update your Electron app's API service files

## Step 1: Upload API Endpoints to Server
1. Upload `backend/api_endpoints_for_server.php` to your web server
2. Rename it to `apiendpoints.php` (or any name you prefer)
3. Ensure it's accessible at: `https://vendinghanger.eeelab.xyz/api/apiendpoints.php`

## Step 2: Update Electron App API Configuration

### Update `services/apiService.ts`
Replace the base URL with your server URL:

```typescript
// Before:
const API_BASE_URL = 'http://localhost:8891/api';

// After:
const API_BASE_URL = 'https://vendinghanger.eeelab.xyz/api';
```

### Update `services/dataService.ts`
Update the API endpoints to use the server URL:

```typescript
// Update all fetch calls to use the new base URL
```

### Update `services/electronVendingService.ts`
Update the vending service to use the server URL:

```typescript
// Update the vending API calls
```

## Step 3: Build and Deploy Electron App
1. Build your Electron app:
   ```bash
   cd electron
   npm run build
   ```

2. Package the app:
   ```bash
   npm run package
   ```

3. Install on client machines - the app will now connect to your server instead of localhost

## API Endpoints Available
The server-side API provides these endpoints:

### Players
- `GET /players` - Get all players
- `GET /players/{id}` - Get specific player
- `POST /players` - Create new player

### Scores
- `GET /scores` - Get all scores
- `GET /scores?player_id={id}` - Get scores for specific player
- `POST /scores` - Create new score

### Prizes
- `GET /prizes` - Get all prizes
- `GET /prizes/check?time={ms}` - Check prize eligibility

### Vending
- `GET /vending/status` - Get vending status and logs
- `POST /vending/dispense` - Dispense a prize

## Testing the Integration
After updating your Electron app, test it by:
1. Opening the app
2. Checking network requests in browser dev tools
3. Verifying data appears in your MySQL database

## Benefits of This Approach
1. **No IP Whitelist Required**: The server handles database connections
2. **Centralized Data**: All client apps connect to the same database
3. **Easier Deployment**: Just upload the API file once, update all apps
4. **Same Functionality**: Identical API endpoints as your local backend

## Troubleshooting
If the Electron app can't connect:
1. Check the URL is correct in apiService.ts
2. Verify the API file is accessible in a browser
3. Check browser console for network errors
4. Ensure CORS is properly configured on the server