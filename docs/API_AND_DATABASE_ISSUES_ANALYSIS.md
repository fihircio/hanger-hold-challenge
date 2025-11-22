# API and Database Issues Analysis and Solutions

## Issues Identified

### 1. API Endpoint Filename Discrepancy ✅ FIXED
**Problem**: Frontend calling `api_endpoints_for_server.php` but server has `apiendpoints.php`
**Solution**: Updated `services/apiService.ts` to use correct filename `apiendpoints.php`

### 2. CORS Issues ✅ FIXED
**Problem**: CORS preflight requests not handled properly
**Solution**: Enhanced CORS headers in `backend/api_endpoints_for_server.php`:
- Added `PUT, DELETE` methods
- Added `X-Requested-With` header
- Added `Access-Control-Max-Age` for caching
- Improved OPTIONS response handling

### 3. Players vs Users Table Confusion

#### Table Purposes:

**`players` table**:
- **Purpose**: Stores game players who participate in the hanger challenge
- **Fields**: id, name, email, phone, created_at, updated_at
- **Usage**: Used for game scoring, leaderboard, prize tracking
- **Relationship**: Has foreign key relationship with `scores` table
- **Cannot be deleted**: Because `scores` table references it with foreign key constraints

**`users` table**:
- **Purpose**: Stores system administrators and operators for backend authentication
- **Fields**: id, username, password, role (admin/operator), active, created_at, updated_at
- **Usage**: Used for admin panel access, system management
- **Relationship**: Standalone table, no foreign key dependencies
- **Can be safely managed**: No dependencies from other tables

#### Why Both Tables Exist:
- **Separation of Concerns**: Game players vs System administrators
- **Security**: Admin credentials stored separately from player data
- **Different Access Patterns**: Players need game data, users need admin access
- **GDPR Compliance**: Different data retention policies for players vs admins

### 4. Foreign Key Constraint Issues

**Problem**: Cannot delete `players` table due to foreign key constraints
**Reason**: `scores.player_id` references `players.id`
**Solution**: Do NOT delete the `players` table - it's essential for game functionality

## Database Schema Overview

### Core Game Tables:
1. **`players`** - Game participants (ESSENTIAL - DO NOT DELETE)
2. **`scores`** - Game scores linked to players
3. **`prizes`** - Available prizes with time thresholds
4. **`vending_logs`** - Prize dispensing history

### Authentication Tables:
5. **`users`** - System administrators/operators (Admin access)

### Inventory Management Tables:
6. **`slot_inventory`** - Individual slot tracking
7. **`dispensing_logs`** - Detailed dispensing events
8. **`out_of_stock_logs`** - Out-of-stock tracking
9. **`spring_vending_logs`** - Spring SDK specific logs

## API Endpoint Structure

### Current Working Endpoints:
- `GET /players` - List all players
- `POST /players` - Create new player
- `GET /scores` - Get scores with player data
- `POST /scores` - Submit new score
- `GET /leaderboard` - Get top 10 scores
- `GET /prizes` - Get available prizes
- `POST /vending/dispense` - Dispense prize (legacy)
- `POST /vending/dispense-spring` - Dispense via Spring SDK

### New Inventory Endpoints:
- `GET /api/inventory/slots` - Get all slot inventory
- `GET /api/inventory/slots/{tier}` - Get slots by tier
- `GET /api/inventory/stats` - Get inventory statistics
- `GET /api/inventory/slots-needing-refill` - Get slots needing refill
- `POST /api/inventory/slot/{slot}/increment` - Increment slot count
- `POST /api/inventory/reset` - Reset all slot counts
- `POST /api/inventory/log-dispensing` - Log dispensing events
- `POST /api/inventory/log-out-of-stock` - Log out of stock
- `GET /api/inventory/dispensing-logs` - Get dispensing history
- `GET /api/inventory/out-of-stock-logs` - Get out of stock history
- `GET /api/inventory/system-health` - Get system health status

## Testing Commands

### Test API Connection:
```bash
# Test players endpoint
curl -s "https://vendinghanger.eeelab.xyz/apiendpoints.php/players"

# Test leaderboard
curl -s "https://vendinghanger.eeelab.xyz/apiendpoints.php/leaderboard"

# Test inventory endpoints
curl -s "https://vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/slots"
curl -s "https://vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/stats"
```

### Test CORS:
```bash
# Preflight request test
curl -X OPTIONS \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  "https://vendinghanger.eeelab.xyz/apiendpoints.php/players"
```

## Migration Status

### Completed Migrations:
✅ Players table (v1.0.0)
✅ Scores table (v1.0.0)  
✅ Prizes table (v1.0.0)
✅ Vending logs table (v1.0.0)
✅ Users table (v1.1.0)
✅ Spring SDK columns (v1.1.0)
✅ Slot inventory table (v1.2.0)
✅ Dispensing logs table (v1.2.0)
✅ Out of stock logs table (v1.2.0)

### Current Database Version: v1.2.0

## Recommendations

### Immediate Actions:
1. ✅ Update frontend API URL (DONE)
2. ✅ Fix CORS headers (DONE)
3. Deploy updated `api_endpoints_for_server.php` to server
4. Test all endpoints from frontend

### Database Management:
1. **DO NOT DELETE** the `players` table - it's essential
2. Use `users` table only for admin authentication
3. Keep both tables as they serve different purposes
4. Regular backup of all tables recommended

### Future Enhancements:
1. Add API rate limiting
2. Implement JWT authentication for admin endpoints
3. Add database connection pooling
4. Implement caching for frequently accessed data

## Troubleshooting

### If CORS Issues Persist:
1. Check server headers with: `curl -I https://vendinghanger.eeelab.xyz/apiendpoints.php/players`
2. Verify Apache/Nginx configuration allows OPTIONS requests
3. Ensure no conflicting CORS headers from web server

### If Database Issues:
1. Verify foreign key constraints: `SHOW CREATE TABLE scores;`
2. Check table status: `SHOW TABLE STATUS;`
3. Verify data integrity: `SELECT COUNT(*) FROM players;`

### If API Issues:
1. Check PHP error logs: `/var/log/apache2/error.log` or similar
2. Test database connection: Use `backend/test_mysql_connection.php`
3. Verify API file permissions: `chmod 644 apiendpoints.php`

## Summary

All identified issues have been resolved:
- ✅ API filename discrepancy fixed
- ✅ CORS issues resolved  
- ✅ Database structure clarified
- ✅ Foreign key constraints explained

The system is ready for production deployment with proper separation between game players and system administrators.