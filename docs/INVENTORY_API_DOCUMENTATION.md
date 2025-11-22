# Vending Machine Inventory API Documentation

This document describes the comprehensive inventory management API for the vending machine system.

## Base URL
```
http://your-server.com
```

## Authentication
Currently, all endpoints are public (no authentication required).

## Response Format
All successful responses return JSON with this structure:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error description",
  "message": "Operation failed"
}
```

## Endpoints

### 1. Get All Slot Inventory
Retrieve current inventory status for all slots.

**Endpoint:** `GET /api/inventory/slots`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "slot": 1,
      "tier": "silver",
      "dispense_count": 3,
      "max_dispenses": 5,
      "usage_percentage": 60,
      "needs_refill": false,
      "last_dispensed_at": "2025-11-22T14:30:00Z"
    },
    {
      "slot": 24,
      "tier": "gold", 
      "dispense_count": 5,
      "max_dispenses": 5,
      "usage_percentage": 100,
      "needs_refill": true,
      "last_dispensed_at": "2025-11-22T13:45:00Z"
    }
  ],
  "total_slots": 36
}
```

**Curl Example:**
```bash
curl -X GET http://your-server.com/api/inventory/slots
```

---

### 2. Get Slots by Tier
Get inventory for specific tier (gold or silver).

**Endpoint:** `GET /api/inventory/slots/{tier}`

**Parameters:**
- `tier` (path): "gold" or "silver"

**Response:**
```json
{
  "success": true,
  "tier": "gold",
  "data": [
    {
      "slot": 24,
      "dispense_count": 2,
      "max_dispenses": 5,
      "usage_percentage": 40
    },
    {
      "slot": 25,
      "dispense_count": 5,
      "max_dispenses": 5,
      "usage_percentage": 100
    }
  ],
  "total_tier_slots": 2
}
```

**Curl Examples:**
```bash
# Get gold slots
curl -X GET http://your-server.com/api/inventory/slots/gold

# Get silver slots
curl -X GET http://your-server.com/api/inventory/slots/silver
```

---

### 3. Get Inventory Statistics
Get comprehensive statistics about the vending machine inventory.

**Endpoint:** `GET /api/inventory/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "total_slots": 36,
    "gold_slots": 2,
    "silver_slots": 34,
    "total_dispensed": 127,
    "gold_dispensed": 8,
    "silver_dispensed": 119,
    "empty_slots": 5,
    "slots_needing_refill": 12,
    "overall_usage_percentage": 71,
    "gold_usage_percentage": 80,
    "silver_usage_percentage": 70
  }
}
```

**Curl Example:**
```bash
curl -X GET http://your-server.com/api/inventory/stats
```

---

### 4. Get Slots Needing Refill
Get slots that need refilling based on usage threshold.

**Endpoint:** `GET /api/inventory/slots-needing-refill`

**Parameters:**
- `threshold` (query, optional): Usage threshold (0.8 = 80%, default: 0.8)

**Response:**
```json
{
  "success": true,
  "threshold": 0.8,
  "threshold_count": 4,
  "data": [
    {
      "slot": 21,
      "tier": "silver",
      "dispense_count": 4,
      "usage_percentage": 80
    },
    {
      "slot": 24,
      "tier": "gold",
      "dispense_count": 5,
      "usage_percentage": 100
    }
  ],
  "total_slots_needing_refill": 2
}
```

**Curl Examples:**
```bash
# Default 80% threshold
curl -X GET http://your-server.com/api/inventory/slots-needing-refill

# Custom threshold (90%)
curl -X GET "http://your-server.com/api/inventory/slots-needing-refill?threshold=0.9"
```

---

### 5. Increment Specific Slot
Increment dispense count for a specific slot.

**Endpoint:** `POST /api/inventory/slot/{slot}/increment`

**Parameters:**
- `slot` (path): Slot number to increment

**Response:**
```json
{
  "success": true,
  "message": "Slot 24 incremented successfully",
  "data": {
    "slot": 24,
    "tier": "gold",
    "dispense_count": 6,
    "max_dispenses": 5,
    "usage_percentage": 120
  }
}
```

**Curl Example:**
```bash
curl -X POST http://your-server.com/api/inventory/slot/24/increment \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

### 6. Reset All Slot Counts
Reset all slot counts to zero.

**Endpoint:** `POST /api/inventory/reset`

**Response:**
```json
{
  "success": true,
  "message": "All slot counts reset successfully",
  "total_slots_reset": 36
}
```

**Curl Example:**
```bash
curl -X POST http://your-server.com/api/inventory/reset \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

### 7. Get System Health
Get overall system health status.

**Endpoint:** `GET /api/inventory/system-health`

**Response:**
```json
{
  "success": true,
  "data": {
    "total_slots": 36,
    "empty_slots": 5,
    "critical_slots": 2,
    "operational_slots": 31,
    "health_status": "warning",
    "recent_failures": 3,
    "success_rate": 85,
    "timestamp": "2025-11-22T14:30:00Z"
  }
}
```

**Curl Example:**
```bash
curl -X GET http://your-server.com/api/inventory/system-health
```

---

### 8. Get Recent Dispensing Logs
Get recent dispensing activity logs.

**Endpoint:** `GET /api/inventory/dispensing-logs`

**Parameters:**
- `limit` (query, optional): Number of logs to return (default: 50)
- `tier` (query, optional): Filter by tier ("gold" or "silver")

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "slot": 24,
      "tier": "gold",
      "success": true,
      "error": null,
      "timestamp": "2025-11-22T14:25:00Z",
      "source": "tcn_integration",
      "created_at": "2025-11-22T14:25:00Z"
    }
  ],
  "total_logs": 1,
  "limit": 50,
  "tier_filter": null
}
```

**Curl Examples:**
```bash
# Get recent logs (default 50)
curl -X GET http://your-server.com/api/inventory/dispensing-logs

# Get recent gold logs only
curl -X GET "http://your-server.com/api/inventory/dispensing-logs?tier=gold&limit=20"

# Get recent silver logs only
curl -X GET "http://your-server.com/api/inventory/dispensing-logs?tier=silver&limit=30"
```

---

### 9. Get Out of Stock Logs
Get logs of out of stock situations.

**Endpoint:** `GET /api/inventory/out-of-stock-logs`

**Parameters:**
- `limit` (query, optional): Number of logs to return (default: 20)
- `tier` (query, optional): Filter by tier ("gold" or "silver")

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 456,
      "tier": "gold",
      "timestamp": "2025-11-22T13:15:00Z",
      "source": "tcn_integration",
      "created_at": "2025-11-22T13:15:00Z"
    }
  ],
  "total_logs": 1,
  "limit": 20,
  "tier_filter": null
}
```

**Curl Examples:**
```bash
# Get recent out of stock logs
curl -X GET http://your-server.com/api/inventory/out-of-stock-logs

# Get gold out of stock logs only
curl -X GET "http://your-server.com/api/inventory/out-of-stock-logs?tier=gold&limit=10"
```

## Slot Configuration

### Gold Slots
- Slots: 24, 25
- Max dispenses per slot: 5
- Total gold capacity: 10 prizes

### Silver Slots
- Slots: 1-8, 11-18, 21-28, 31-38, 45-48, 51-58
- Max dispenses per slot: 5
- Total silver capacity: 170 prizes

### Total System Capacity
- Total slots: 36
- Total max capacity: 180 prizes
- Usage thresholds:
  - 80% (4 dispenses): Needs refill warning
  - 100% (5 dispenses): Empty/Out of stock

## Error Codes

| HTTP Status | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request (missing/invalid parameters) |
| 404 | Not Found (slot doesn't exist) |
| 500 | Internal Server Error |

## Usage Examples

### Quick Inventory Check
```bash
# Check all slots
curl -s http://your-server.com/api/inventory/slots | jq '.data[] | {slot, tier, dispense_count, usage_percentage}'

# Check only gold slots
curl -s http://your-server.com/api/inventory/slots/gold | jq '.data[] | {slot, dispense_count, usage_percentage}'

# Get system health
curl -s http://your-server.com/api/inventory/system-health | jq '.data.health_status'
```

### Monitor Usage
```bash
# Watch for slots needing refill
watch -n 5 'curl -s http://your-server.com/api/inventory/slots-needing-refill | jq ".total_slots_needing_refill"'

# Monitor system health
watch -n 10 'curl -s http://your-server.com/api/inventory/system-health | jq ".data.health_status"'
```

### Batch Operations
```bash
# Reset all slots (maintenance)
curl -X POST http://your-server.com/api/inventory/reset

# Increment specific slot (testing)
curl -X POST http://your-server.com/api/inventory/slot/24/increment
```

## Integration Notes

1. **Offline Support**: The system automatically queues operations when offline and syncs when connection is restored.

2. **Real-time Updates**: Use WebSocket or polling for real-time inventory updates.

3. **Automatic Slot Progression**: System automatically selects least-used slots to distribute wear evenly.

4. **Drop Detection**: Currently logged for future implementation (informational only).

5. **Data Persistence**: All inventory data persists across application restarts via IndexedDB and MySQL.