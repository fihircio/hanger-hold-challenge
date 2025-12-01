# Electron Vending Service Logging Guide

## Overview

The Electron Vending Service now includes comprehensive logging capabilities with dedicated SQL table and API endpoints for detailed tracking and analytics of all vending operations.

## Database Schema

### `electron_vending_logs` Table

| Column | Type | Description |
|---------|------|-------------|
| `id` | int(11) | Primary key, auto-increment |
| `action` | varchar(50) | Action type (prize_dispensing, out_of_stock, etc.) |
| `game_time_ms` | int(11) | Game time in milliseconds |
| `tier` | enum('gold','silver','bronze') | Prize tier determined |
| `selected_slot` | int(11) | Slot selected for dispensing |
| `channel_used` | int(11) | Channel used by Spring SDK |
| `score_id` | int(11) | Related score ID |
| `prize_id` | int(11) | Related prize ID |
| `success` | tinyint(1) | Action success status |
| `error_code` | int(11) | Error code if failed |
| `error_message` | text | Detailed error message |
| `dispense_method` | varchar(20) | Method used (spring_sdk/legacy/fallback) |
| `inventory_before` | int(11) | Slot count before operation |
| `inventory_after` | int(11) | Slot count after operation |
| `response_time_ms` | int(11) | Operation response time in milliseconds |
| `source` | varchar(50) | Log source (electron_vending_service) |
| `created_at` | timestamp | Log creation timestamp |

## API Endpoints

### 1. Log Electron Vending Service Event

**Endpoint**: `POST /api/electron-vending/log`

**Request Body**:
```json
{
  "action": "prize_dispensing",
  "game_time_ms": 45000,
  "tier": "silver",
  "selected_slot": 15,
  "channel_used": 12,
  "score_id": 123,
  "prize_id": 2,
  "success": true,
  "error_message": null,
  "dispense_method": "spring_sdk",
  "inventory_before": 2,
  "inventory_after": 3,
  "response_time_ms": 1250,
  "source": "electron_vending_service"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Electron Vending Service log recorded successfully",
  "data": {
    "log_id": 456,
    "action": "prize_dispensing",
    "success": true,
    "source": "electron_vending_service"
  }
}
```

### 2. Get Electron Vending Service Logs

**Endpoint**: `GET /api/electron-vending/logs`

**Query Parameters**:
- `limit` (optional): Number of logs to return (default: 50)
- `action` (optional): Filter by action type
- `tier` (optional): Filter by prize tier
- `success` (optional): Filter by success status (0/1)

**Examples**:
```bash
# Get all logs
curl -X GET "https://vendinghanger.eeelab.xyz/apiendpoints.php/api/electron-vending/logs"

# Get last 20 successful dispensing logs
curl -X GET "https://vendinghanger.eeelab.xyz/apiendpoints.php/api/electron-vending/logs?limit=20&action=prize_dispensing&success=1"

# Get all gold tier logs
curl -X GET "https://vendinghanger.eeelab.xyz/apiendpoints.php/api/electron-vending/logs?tier=gold"
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 456,
      "action": "prize_dispensing",
      "game_time_ms": 45000,
      "tier": "silver",
      "selected_slot": 15,
      "channel_used": 12,
      "score_id": 123,
      "prize_id": 2,
      "success": true,
      "error_code": null,
      "error_message": null,
      "dispense_method": "spring_sdk",
      "inventory_before": 2,
      "inventory_after": 3,
      "response_time_ms": 1250,
      "source": "electron_vending_service",
      "created_at": "2025-12-01T10:45:30Z"
    }
  ],
  "total_logs": 1,
  "limit": 50,
  "filters": {
    "action": null,
    "tier": null,
    "success": null
  }
}
```

### 3. Get Electron Vending Service Statistics

**Endpoint**: `GET /api/electron-vending/stats`

**Response**:
```json
{
  "success": true,
  "data": {
    "total_operations": 1250,
    "successful_operations": 1185,
    "failed_operations": 65,
    "overall_success_rate": 94.8,
    "average_response_time_ms": 1245.67,
    "recent_24h_activity": 45,
    "stats_by_tier": {
      "gold": {
        "total": 180,
        "successful": 175,
        "success_rate": 97.22
      },
      "silver": {
        "total": 1070,
        "successful": 1010,
        "success_rate": 94.39
      }
    },
    "stats_by_method": {
      "spring_sdk": {
        "total": 1100,
        "successful": 1050,
        "success_rate": 95.45
      },
      "legacy": {
        "total": 150,
        "successful": 135,
        "success_rate": 90.00
      }
    },
    "timestamp": "2025-12-01 10:45:30"
  }
}
```

## Action Types

| Action Type | Description |
|-------------|-------------|
| `prize_dispensing` | Primary prize dispensing operation |
| `out_of_stock` | No available slots for requested tier |
| `no_prize` | Game time too short for prize eligibility |
| `slot_selection` | Slot selection process |
| `inventory_sync` | Inventory synchronization operation |
| `error` | General error condition |

## Dispense Methods

| Method | Description |
|---------|-------------|
| `spring_sdk` | Spring SDK protocol used |
| `legacy` | Direct serial communication used |
| `fallback` | Fallback method after primary failure |
| `no_prize` | No prize awarded |
| `out_of_stock` | Machine out of requested tier |
| `error` | Error occurred during operation |

## Logging Implementation

### Automatic Logging

The Electron Vending Service automatically logs:

1. **All Prize Dispensing Operations**:
   - Game time and tier determination
   - Slot selection with load balancing
   - Inventory counts before/after operation
   - Response time measurement
   - Success/failure status with error details

2. **Error Conditions**:
   - Out of stock situations
   - No prize eligibility
   - Hardware communication failures
   - API integration errors

3. **Performance Metrics**:
   - Response time for each operation
   - Success rates by tier and method
   - Inventory usage patterns

### Dual Logging Strategy

The service logs to both:

1. **Electron Vending Service Table** (`electron_vending_logs`):
   - Detailed operational data
   - Performance metrics
   - Enhanced analytics capabilities

2. **Inventory API** (`/api/inventory/log-dispensing`):
   - Backward compatibility
   - Existing inventory management integration

## Testing the Logging System

### 1. Test Basic Logging

```javascript
// Test logging a successful dispensing event
fetch('https://vendinghanger.eeelab.xyz/apiendpoints.php/api/electron-vending/log', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'prize_dispensing',
    game_time_ms: 45000,
    tier: 'silver',
    selected_slot: 15,
    channel_used: 12,
    score_id: 123,
    prize_id: 2,
    success: true,
    dispense_method: 'spring_sdk',
    inventory_before: 2,
    inventory_after: 3,
    response_time_ms: 1250,
    source: 'electron_vending_service'
  })
})
.then(response => response.json())
.then(data => console.log('Log result:', data));
```

### 2. Test Statistics Retrieval

```javascript
// Get current statistics
fetch('https://vendinghanger.eeelab.xyz/apiendpoints.php/api/electron-vending/stats')
.then(response => response.json())
.then(data => console.log('Statistics:', data));
```

### 3. Test Filtered Logs

```javascript
// Get recent successful gold prize dispensing
fetch('https://vendinghanger.eeelab.xyz/apiendpoints.php/api/electron-vending/logs?action=prize_dispensing&tier=gold&success=1&limit=10')
.then(response => response.json())
.then(data => console.log('Filtered logs:', data));
```

## Analytics and Monitoring

### Key Performance Indicators

1. **Success Rate**: Overall and by tier/method
2. **Response Time**: Average operation duration
3. **Inventory Usage**: Slot utilization patterns
4. **Error Patterns**: Common failure modes
5. **Activity Trends**: Time-based usage analysis

### Monitoring Queries

```sql
-- Success rate by tier
SELECT 
  tier,
  COUNT(*) as total,
  SUM(success) as successful,
  ROUND(SUM(success) / COUNT(*) * 100, 2) as success_rate
FROM electron_vending_logs 
WHERE tier IS NOT NULL 
GROUP BY tier;

-- Average response time by method
SELECT 
  dispense_method,
  COUNT(*) as total,
  AVG(response_time_ms) as avg_response_time
FROM electron_vending_logs 
WHERE response_time_ms IS NOT NULL 
GROUP BY dispense_method;

-- Recent activity (last 24 hours)
SELECT 
  action,
  COUNT(*) as count
FROM electron_vending_logs 
WHERE created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
GROUP BY action;

-- Slot utilization
SELECT 
  selected_slot,
  tier,
  COUNT(*) as usage_count,
  AVG(inventory_after) as avg_inventory_after
FROM electron_vending_logs 
WHERE selected_slot IS NOT NULL 
GROUP BY selected_slot, tier
ORDER BY usage_count DESC;
```

## Integration with Existing Systems

### Compatibility

The Electron Vending Service logging is designed to:

1. **Enhance** existing inventory management
2. **Maintain** backward compatibility with current APIs
3. **Provide** detailed analytics for operations
4. **Support** troubleshooting and performance optimization

### Migration Strategy

1. **Phase 1**: Deploy new logging table alongside existing system
2. **Phase 2**: Enable dual logging for comprehensive coverage
3. **Phase 3**: Transition to Electron Vending Service as primary logging source
4. **Phase 4**: Deprecate legacy logging (optional)

## Troubleshooting

### Common Issues

1. **Missing Logs**:
   - Check API endpoint connectivity
   - Verify database table exists
   - Check error logs for API failures

2. **Incorrect Data**:
   - Verify parameter mapping
   - Check data type conversions
   - Validate API request format

3. **Performance Issues**:
   - Monitor response times
   - Check database indexes
   - Review query optimization

### Debug Logging

Enable debug logging in Electron Vending Service:

```typescript
// In electronVendingService.ts
console.log('[ELECTRON VENDING] Debug: Logging to Electron Vending Service table');
console.log('[ELECTRON VENDING] Debug: Log entry:', electronVendingLogEntry);
```

## Security Considerations

1. **API Access**: Implement proper authentication for logging endpoints
2. **Data Validation**: Validate all input parameters
3. **Rate Limiting**: Prevent log flooding
4. **Privacy**: Avoid logging sensitive personal information

## Future Enhancements

1. **Real-time Dashboard**: Live monitoring interface
2. **Alert System**: Automatic notifications for issues
3. **Predictive Analytics**: Machine learning for maintenance prediction
4. **Integration**: Third-party monitoring system compatibility