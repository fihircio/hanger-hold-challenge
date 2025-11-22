# Inventory API Endpoints Testing Guide

## Quick Reference for Testing New Inventory Features

### Base URL
```
http://vendinghanger.eeelab.xyz/apiendpoints.php
```

## GET Endpoints

### 1. Get All Slot Inventory
```bash
curl -X GET "http://vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/slots"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "slot": 1,
      "tier": "silver",
      "dispense_count": 0,
      "max_dispenses": 5,
      "usage_percentage": 0,
      "needs_refill": false
    }
  ],
  "total_slots": 36
}
```

### 2. Get Slots by Tier
```bash
# Gold slots
curl -X GET "http://vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/slots/gold"

# Silver slots
curl -X GET "http://vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/slots/silver"
```

### 3. Get Inventory Statistics
```bash
curl -X GET "http://vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/stats"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "total_slots": 36,
    "gold_slots": 2,
    "silver_slots": 34,
    "total_dispensed": 0,
    "gold_dispensed": 0,
    "silver_dispensed": 0,
    "empty_slots": 0,
    "slots_needing_refill": 0,
    "overall_usage_percentage": 0
  }
}
```

### 4. Get Slots Needing Refill
```bash
# Default 80% threshold
curl -X GET "http://vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/slots-needing-refill"

# Custom threshold (90%)
curl -X GET "http://vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/slots-needing-refill?threshold=0.9"
```

### 5. Get System Health
```bash
curl -X GET "http://vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/system-health"
```

### 6. Get Dispensing Logs
```bash
# Default 50 logs
curl -X GET "http://vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/dispensing-logs"

# Gold tier only, 20 logs
curl -X GET "http://vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/dispensing-logs?tier=gold&limit=20"
```

### 7. Get Out of Stock Logs
```bash
# Default 20 logs
curl -X GET "http://vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/out-of-stock-logs"

# Silver tier only, 10 logs
curl -X GET "http://vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/out-of-stock-logs?tier=silver&limit=10"
```

## POST Endpoints

### 8. Increment Slot Count
```bash
# Increment gold slot 24
curl -X POST "http://vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/slot/24/increment" \
  -H "Content-Type: application/json" \
  -d '{}'

# Increment silver slot 1
curl -X POST "http://vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/slot/1/increment" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 9. Reset All Slot Counts
```bash
curl -X POST "http://vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/reset" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 10. Log Dispensing Event
```bash
curl -X POST "http://vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/log-dispensing" \
  -H "Content-Type: application/json" \
  -d '{
    "slot": 24,
    "tier": "gold",
    "success": true,
    "timestamp": "2025-11-22T14:30:00Z",
    "source": "tcn_integration"
  }'
```

### 11. Log Out of Stock Event
```bash
curl -X POST "http://vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/log-out-of-stock" \
  -H "Content-Type: application/json" \
  -d '{
    "tier": "gold",
    "timestamp": "2025-11-22T14:30:00Z",
    "source": "tcn_integration"
  }'
```

## Testing Workflow

### 1. Initial Setup Verification
```bash
# Check if slots exist
curl -s "http://vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/slots" | jq '.total_slots'

# Should return: 36 (2 gold + 34 silver)
```

### 2. Test Slot Progression
```bash
# Increment gold slot 24 five times to max capacity
for i in {1..5}; do
  curl -X POST "http://vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/slot/24/increment" \
    -H "Content-Type: application/json" -d '{}'
  sleep 1
done

# Check slot status
curl -s "http://vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/slots/gold" | jq '.data[0]'
```

### 3. Test Refill Detection
```bash
# Check slots needing refill (should show slot 24 at 100%)
curl -s "http://vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/slots-needing-refill?threshold=0.8" | jq '.total_slots_needing_refill'

# Should return: 1 (slot 24)
```

### 4. Test System Health
```bash
# Check overall system health
curl -s "http://vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/system-health" | jq '.data.health_status'

# Should return: "warning" (due to slot 24 being at 100%)
```

### 5. Test Logging
```bash
# Log a dispensing event
curl -X POST "http://vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/log-dispensing" \
  -H "Content-Type: application/json" \
  -d '{
    "slot": 24,
    "tier": "gold", 
    "success": true,
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
    "source": "manual_test"
  }'

# Check logs
curl -s "http://vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/dispensing-logs?limit=1" | jq '.data[0]'
```

### 6. Reset for Next Test
```bash
# Reset all slots
curl -X POST "http://vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/reset" \
  -H "Content-Type: application/json" -d '{}'

# Verify reset
curl -s "http://vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/stats" | jq '.data.total_dispensed'

# Should return: 0
```

## Expected Slot Configuration

### Gold Slots (2 total)
- Slot 24: Gold prizes
- Slot 25: Gold prizes

### Silver Slots (34 total)
- Slots 1-8: Silver prizes
- Slots 11-18: Silver prizes  
- Slots 21-28: Silver prizes
- Slots 31-38: Silver prizes
- Slots 45-48: Silver prizes
- Slots 51-58: Silver prizes

## Error Response Format

All endpoints return errors in this format:
```json
{
  "error": true,
  "message": "Error description"
}
```

Common HTTP Status Codes:
- 200: Success
- 400: Bad Request (missing/invalid parameters)
- 404: Not Found (slot doesn't exist)
- 500: Internal Server Error

## Integration Testing with Frontend

### Test TCN Integration
1. Play a game in the frontend
2. Check if dispensing is logged:
```bash
curl -s "http://vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/dispensing-logs?limit=1" | jq '.data[0]'
```

### Test Inventory Updates
1. After gameplay, check slot counts:
```bash
curl -s "http://vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/stats" | jq '.data'
```

### Test Out of Stock Handling
1. Increment a slot 5 times to max capacity
2. Try one more increment (should fail)
3. Check if out of stock is logged:
```bash
curl -s "http://vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/out-of-stock-logs?limit=1" | jq '.data[0]'
```

This testing guide will help you verify that all inventory management features are working correctly in your production environment.