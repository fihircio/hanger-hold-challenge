# API Curl Testing Commands for Hanger Challenge Server

This document contains comprehensive curl commands to test all endpoints in your `backend/api_endpoints_for_server.php` file, based on the database schema from `backend/complete_migration.sql`.

## Server Configuration

**Base URL:** `http://vendinghanger.eeelab.xyz/apiendpoints.php`  
**Database:** `eeelab46_vendinghangerdb`  
**Content-Type:** `application/json`

## General Testing Notes

1. Replace `vendinghanger.eeelab.xyz` with your actual server URL
2. Some endpoints require specific IDs from previous operations
3. Test in sequence as some endpoints depend on data created by others
4. Use `-v` flag for verbose output to see full HTTP response
5. Use `-i` flag to include HTTP headers in response

---

## 1. Players Endpoints

### 1.1 Get All Players
```bash
curl -X GET "vendinghanger.eeelab.xyz/apiendpoints.php/players" \
  -H "Content-Type: application/json" \
  -v
```

### 1.2 Get Specific Player
```bash
curl -X GET "vendinghanger.eeelab.xyz/apiendpoints.php/players?id=1" \
  -H "Content-Type: application/json" \
  -v
```

### 1.3 Create New Player
```bash
curl -X POST "vendinghanger.eeelab.xyz/apiendpoints.php/players" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }' \
  -v
```

### 1.4 Create Player with Existing Email (returns existing player)
```bash
curl -X POST "vendinghanger.eeelab.xyz/apiendpoints.php/players" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "john@example.com"
  }' \
  -v
```

---

## 2. Scores Endpoints

### 2.1 Get All Scores
```bash
curl -X GET "vendinghanger.eeelab.xyz/apiendpoints.php/scores" \
  -H "Content-Type: application/json" \
  -v
```

### 2.2 Get Scores for Specific Player
```bash
curl -X GET "vendinghanger.eeelab.xyz/apiendpoints.php/scores?player_id=1" \
  -H "Content-Type: application/json" \
  -v
```

### 2.3 Create New Score
```bash
curl -X POST "vendinghanger.eeelab.xyz/apiendpoints.php/scores" \
  -H "Content-Type: application/json" \
  -d '{
    "player_id": 1,
    "time": 45000
  }' \
  -v
```

### 2.4 Create Score with Prize Eligibility (Gold - 60+ seconds)
```bash
curl -X POST "vendinghanger.eeelab.xyz/apiendpoints.php/scores" \
  -H "Content-Type: application/json" \
  -d '{
    "player_id": 1,
    "time": 75000
  }' \
  -v
```

### 2.5 Create Score with Prize Eligibility (Silver - 30+ seconds)
```bash
curl -X POST "vendinghanger.eeelab.xyz/apiendpoints.php/scores" \
  -H "Content-Type: application/json" \
  -d '{
    "player_id": 1,
    "time": 35000
  }' \
  -v
```

---

## 3. Leaderboard Endpoint

### 3.1 Get Leaderboard (Top 10)
```bash
curl -X GET "vendinghanger.eeelab.xyz/apiendpoints.php/leaderboard" \
  -H "Content-Type: application/json" \
  -v
```

---

## 4. Prizes Endpoints

### 4.1 Get All Prizes
```bash
curl -X GET "vendinghanger.eeelab.xyz/apiendpoints.php/prizes" \
  -H "Content-Type: application/json" \
  -v
```

### 4.2 Check Prize Eligibility (No Prize - <30 seconds)
```bash
curl -X GET "vendinghanger.eeelab.xyz/apiendpoints.php/prizes?check=1&time=25000" \
  -H "Content-Type: application/json" \
  -v
```

### 4.3 Check Prize Eligibility (Silver - 30-59 seconds)
```bash
curl -X GET "vendinghanger.eeelab.xyz/apiendpoints.php/prizes?check=1&time=45000" \
  -H "Content-Type: application/json" \
  -v
```

### 4.4 Check Prize Eligibility (Gold - 60+ seconds)
```bash
curl -X GET "vendinghanger.eeelab.xyz/apiendpoints.php/prizes?check=1&time=75000" \
  -H "Content-Type: application/json" \
  -v
```

### 4.5 API Prizes Check (Alternative Endpoint)
```bash
curl -X GET "vendinghanger.eeelab.xyz/apiendpoints.php/api/prizes/check?time=45000" \
  -H "Content-Type: application/json" \
  -v
```

### 4.6 API Prizes List (Alternative Endpoint)
```bash
curl -X GET "vendinghanger.eeelab.xyz/apiendpoints.php/api/prizes" \
  -H "Content-Type: application/json" \
  -v
```

---

## 5. Vending Endpoints

### 5.1 Get Vending Status
```bash
curl -X GET "vendinghanger.eeelab.xyz/apiendpoints.php/vending/status" \
  -H "Content-Type: application/json" \
  -v
```

### 5.2 Get Enhanced Vending Status (with Spring SDK data)
```bash
curl -X GET "vendinghanger.eeelab.xyz/apiendpoints.php/vending/status-enhanced" \
  -H "Content-Type: application/json" \
  -v
```

### 5.3 Get Vending Diagnostics
```bash
curl -X GET "vendinghanger.eeelab.xyz/apiendpoints.php/vending/diagnostics" \
  -H "Content-Type: application/json" \
  -v
```

### 5.4 Dispense Prize (Legacy Method)
```bash
curl -X POST "vendinghanger.eeelab.xyz/apiendpoints.php/vending/dispense" \
  -H "Content-Type: application/json" \
  -d '{
    "prize_id": 1,
    "score_id": 1
  }' \
  -v
```

### 5.5 Dispense Prize with Spring SDK (Gold Tier)
```bash
curl -X POST "vendinghanger.eeelab.xyz/apiendpoints.php/vending/dispense-spring" \
  -H "Content-Type: application/json" \
  -d '{
    "tier": "gold",
    "score_id": 1
  }' \
  -v
```

### 5.6 Dispense Prize with Spring SDK (Silver Tier)
```bash
curl -X POST "vendinghanger.eeelab.xyz/apiendpoints.php/vending/dispense-spring" \
  -H "Content-Type: application/json" \
  -d '{
    "tier": "silver",
    "score_id": 1
  }' \
  -v
```

### 5.7 Dispense Prize with Spring SDK (Auto-detect tier from score)
```bash
curl -X POST "vendinghanger.eeelab.xyz/apiendpoints.php/vending/dispense-spring" \
  -H "Content-Type: application/json" \
  -d '{
    "score_id": 1
  }' \
  -v
```

---

## 6. Inventory Management Endpoints

### 6.1 Get All Slot Inventory
```bash
curl -X GET "vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/slots" \
  -H "Content-Type: application/json" \
  -v
```

### 6.2 Get Slots by Tier (Gold)
```bash
curl -X GET "vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/slots/gold" \
  -H "Content-Type: application/json" \
  -v
```

### 6.3 Get Slots by Tier (Silver)
```bash
curl -X GET "vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/slots/silver" \
  -H "Content-Type: application/json" \
  -v
```

### 6.4 Get Inventory Statistics
```bash
curl -X GET "vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/stats" \
  -H "Content-Type: application/json" \
  -v
```

### 6.5 Get Slots Needing Refill (Default 80% threshold)
```bash
curl -X GET "vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/slots-needing-refill" \
  -H "Content-Type: application/json" \
  -v
```

### 6.6 Get Slots Needing Refill (Custom threshold)
```bash
curl -X GET "vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/slots-needing-refill?threshold=0.9" \
  -H "Content-Type: application/json" \
  -v
```

### 6.7 Get Dispensing Logs
```bash
curl -X GET "vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/dispensing-logs" \
  -H "Content-Type: application/json" \
  -v
```

### 6.8 Get Dispensing Logs (Limited)
```bash
curl -X GET "vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/dispensing-logs?limit=10" \
  -H "Content-Type: application/json" \
  -v
```

### 6.9 Get Dispensing Logs (Filtered by Tier)
```bash
curl -X GET "vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/dispensing-logs?tier=gold&limit=5" \
  -H "Content-Type: application/json" \
  -v
```

### 6.10 Get Out of Stock Logs
```bash
curl -X GET "vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/out-of-stock-logs" \
  -H "Content-Type: application/json" \
  -v
```

### 6.11 Get System Health
```bash
curl -X GET "vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/system-health" \
  -H "Content-Type: application/json" \
  -v
```

### 6.12 Increment Slot Count
```bash
curl -X POST "vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/slot/24/increment" \
  -H "Content-Type: application/json" \
  -v
```

### 6.13 Reset All Slot Counts
```bash
curl -X POST "vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/reset" \
  -H "Content-Type: application/json" \
  -v
```

### 6.14 Log Dispensing Operation
```bash
curl -X POST "vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/log-dispensing" \
  -H "Content-Type: application/json" \
  -d '{
    "slot": 24,
    "tier": "gold",
    "success": true,
    "timestamp": "2025-01-15 10:30:00",
    "source": "test_script"
  }' \
  -v
```

### 6.15 Log Failed Dispensing Operation
```bash
curl -X POST "vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/log-dispensing" \
  -H "Content-Type: application/json" \
  -d '{
    "slot": 1,
    "tier": "silver",
    "success": false,
    "error": "Motor jam detected",
    "timestamp": "2025-01-15 10:35:00",
    "source": "test_script"
  }' \
  -v
```

### 6.16 Log Out of Stock Event
```bash
curl -X POST "vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/log-out-of-stock" \
  -H "Content-Type: application/json" \
  -d '{
    "tier": "gold",
    "timestamp": "2025-01-15 10:40:00",
    "source": "test_script"
  }' \
  -v
```

---

## 7. Electron Vending Service Endpoints

### 7.1 Get Electron Vending Logs
```bash
curl -X GET "vendinghanger.eeelab.xyz/apiendpoints.php/api/electron-vending/logs" \
  -H "Content-Type: application/json" \
  -v
```

### 7.2 Get Electron Vending Logs (Filtered)
```bash
curl -X GET "vendinghanger.eeelab.xyz/apiendpoints.php/api/electron-vending/logs?action=prize_dispensing&success=true&limit=10" \
  -H "Content-Type: application/json" \
  -v
```

### 7.3 Get Electron Vending Statistics
```bash
curl -X GET "vendinghanger.eeelab.xyz/apiendpoints.php/api/electron-vending/stats" \
  -H "Content-Type: application/json" \
  -v
```

### 7.4 Log Electron Vending Operation (GET method)
```bash
curl -X GET "vendinghanger.eeelab.xyz/apiendpoints.php/api/electron-vending/log" \
  -H "Content-Type: application/json" \
  -H "X-HTTP-Method-Override: POST" \
  -d '{
    "action": "prize_dispensing",
    "game_time_ms": 45000,
    "tier": "silver",
    "selected_slot": 5,
    "channel_used": 8,
    "score_id": 1,
    "prize_id": 2,
    "success": true,
    "dispense_method": "spring_sdk",
    "inventory_before": 3,
    "inventory_after": 2,
    "response_time_ms": 1500,
    "source": "electron_test"
  }' \
  -v
```

### 7.5 Log Electron Vending Operation (POST method)
```bash
curl -X POST "vendinghanger.eeelab.xyz/apiendpoints.php/api/electron-vending/log" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "prize_dispensing",
    "game_time_ms": 75000,
    "tier": "gold",
    "selected_slot": 24,
    "channel_used": 3,
    "score_id": 2,
    "prize_id": 1,
    "success": true,
    "dispense_method": "spring_sdk",
    "inventory_before": 4,
    "inventory_after": 3,
    "response_time_ms": 1200,
    "source": "electron_test"
  }' \
  -v
```

### 7.6 Log Failed Electron Vending Operation
```bash
curl -X POST "vendinghanger.eeelab.xyz/apiendpoints.php/api/electron-vending/log" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "prize_dispensing",
    "game_time_ms": 35000,
    "tier": "silver",
    "selected_slot": 10,
    "channel_used": 12,
    "score_id": 3,
    "prize_id": 2,
    "success": false,
    "error_code": 5001,
    "error_message": "Spring SDK channel error - motor malfunction",
    "dispense_method": "spring_sdk",
    "inventory_before": 1,
    "inventory_after": 1,
    "response_time_ms": 3000,
    "source": "electron_test"
  }' \
  -v
```

---

## 8. CORS Preflight Testing

### 8.1 OPTIONS Preflight Request
```bash
curl -X OPTIONS "vendinghanger.eeelab.xyz/apiendpoints.php/players" \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -v
```

---

## 9. Error Testing

### 9.1 Test Invalid Endpoint
```bash
curl -X GET "vendinghanger.eeelab.xyz/apiendpoints.php/invalid-endpoint" \
  -H "Content-Type: application/json" \
  -v
```

### 9.2 Test Invalid Method
```bash
curl -X PUT "vendinghanger.eeelab.xyz/apiendpoints.php/players" \
  -H "Content-Type: application/json" \
  -v
```

### 9.3 Test Missing Required Fields
```bash
curl -X POST "vendinghanger.eeelab.xyz/apiendpoints.php/players" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }' \
  -v
```

### 9.4 Test Invalid Player ID
```bash
curl -X GET "vendinghanger.eeelab.xyz/apiendpoints.php/players?id=99999" \
  -H "Content-Type: application/json" \
  -v
```

---

## 10. Complete Test Workflow

### 10.1 Full Game Flow Test Sequence

```bash
# Step 1: Create a player
PLAYER_RESPONSE=$(curl -s -X POST "vendinghanger.eeelab.xyz/apiendpoints.php/players" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Player",
    "email": "test@example.com"
  }')

PLAYER_ID=$(echo $PLAYER_RESPONSE | jq -r '.id')
echo "Created Player ID: $PLAYER_ID"

# Step 2: Create a score (Silver tier)
SCORE_RESPONSE=$(curl -s -X POST "vendinghanger.eeelab.xyz/apiendpoints.php/scores" \
  -H "Content-Type: application/json" \
  -d "{
    \"player_id\": $PLAYER_ID,
    \"time\": 45000
  }")

SCORE_ID=$(echo $SCORE_RESPONSE | jq -r '.id')
echo "Created Score ID: $SCORE_ID"

# Step 3: Check prize eligibility
curl -X GET "vendinghanger.eeelab.xyz/apiendpoints.php/prizes?check=1&time=45000" \
  -H "Content-Type: application/json" \
  -v

# Step 4: Dispense prize with Spring SDK
curl -X POST "vendinghanger.eeelab.xyz/apiendpoints.php/vending/dispense-spring" \
  -H "Content-Type: application/json" \
  -d "{
    \"score_id\": $SCORE_ID
  }" \
  -v

# Step 5: Check vending status
curl -X GET "vendinghanger.eeelab.xyz/apiendpoints.php/vending/status-enhanced" \
  -H "Content-Type: application/json" \
  -v

# Step 6: Check inventory
curl -X GET "vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/stats" \
  -H "Content-Type: application/json" \
  -v
```

---

## 11. Batch Testing Script

Save this as `test_api_endpoints.sh` and make it executable:

```bash
#!/bin/bash

SERVER_URL="vendinghanger.eeelab.xyz/apiendpoints.php"

echo "Testing Hanger Challenge API Endpoints"
echo "======================================"

# Test basic connectivity
echo "1. Testing basic connectivity..."
curl -s -X OPTIONS "$SERVER_URL/players" \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" | jq .

# Create test player
echo "2. Creating test player..."
PLAYER_RESPONSE=$(curl -s -X POST "$SERVER_URL/players" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Batch Test Player",
    "email": "batchtest@example.com"
  }')

echo "Player Response: $PLAYER_RESPONSE"
PLAYER_ID=$(echo $PLAYER_RESPONSE | jq -r '.id')

if [ "$PLAYER_ID" != "null" ]; then
  echo "✓ Player created with ID: $PLAYER_ID"
  
  # Create test score
  echo "3. Creating test score..."
  SCORE_RESPONSE=$(curl -s -X POST "$SERVER_URL/scores" \
    -H "Content-Type: application/json" \
    -d "{
      \"player_id\": $PLAYER_ID,
      \"time\": 45000
    }")
  
  echo "Score Response: $SCORE_RESPONSE"
  SCORE_ID=$(echo $SCORE_RESPONSE | jq -r '.id')
  
  if [ "$SCORE_ID" != "null" ]; then
    echo "✓ Score created with ID: $SCORE_ID"
  else
    echo "✗ Failed to create score"
  fi
else
  echo "✗ Failed to create player"
fi

# Test inventory endpoints
echo "4. Testing inventory endpoints..."
curl -s -X GET "$SERVER_URL/api/inventory/stats" | jq .

echo "5. Testing vending diagnostics..."
curl -s -X GET "$SERVER_URL/vending/diagnostics" | jq .

echo "======================================"
echo "API Testing Complete"
```

Make it executable:
```bash
chmod +x test_api_endpoints.sh
./test_api_endpoints.sh
```

---

## 12. Performance Testing

### 12.1 Load Test with Multiple Concurrent Requests
```bash
# Install Apache Bench if not available: brew install httpie-tools

# Test 100 concurrent requests to players endpoint
ab -n 100 -c 10 -H "Content-Type: application/json" "vendinghanger.eeelab.xyz/apiendpoints.php/players"

# Test POST requests
ab -n 50 -c 5 -H "Content-Type: application/json" -p player_data.json "vendinghanger.eeelab.xyz/apiendpoints.php/players"
```

Create `player_data.json`:
```json
{
  "name": "Load Test Player",
  "email": "loadtest@example.com"
}
```

---

## 13. Troubleshooting Common Issues

### 13.1 Check if Server is Running
```bash
curl -I "vendinghanger.eeelab.xyz/apiendpoints.php"
```

### 13.2 Test Database Connection
```bash
curl -X GET "vendinghanger.eeelab.xyz/apiendpoints.php/vending/diagnostics" \
  -H "Content-Type: application/json" \
  -v
```

### 13.3 Check CORS Headers
```bash
curl -X OPTIONS "vendinghanger.eeelab.xyz/apiendpoints.php/players" \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -i
```

### 13.4 Test JSON Response Format
```bash
curl -X GET "vendinghanger.eeelab.xyz/apiendpoints.php/players" | jq .
```

---

## 14. Security Testing

### 14.1 Test SQL Injection Protection
```bash
curl -X GET "vendinghanger.eeelab.xyz/apiendpoints.php/players?id=1' OR '1'='1" \
  -H "Content-Type: application/json" \
  -v
```

### 14.2 Test XSS Protection
```bash
curl -X POST "vendinghanger.eeelab.xyz/apiendpoints.php/players" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "<script>alert(\"xss\")</script>",
    "email": "xss@example.com"
  }' \
  -v
```

---

## 15. Database Verification Queries

After testing, you can verify the data in your database with these SQL queries:

```sql
-- Check players
SELECT * FROM players ORDER BY created_at DESC LIMIT 5;

-- Check scores with player names
SELECT s.*, p.name as player_name FROM scores s JOIN players p ON s.player_id = p.id ORDER BY s.created_at DESC LIMIT 5;

-- Check vending logs
SELECT * FROM vending_logs ORDER BY created_at DESC LIMIT 5;

-- Check inventory status
SELECT * FROM slot_inventory ORDER BY tier, slot;

-- Check electron vending logs
SELECT * FROM electron_vending_logs ORDER BY created_at DESC LIMIT 5;

-- Check system health
SELECT 
  COUNT(*) as total_scores,
  SUM(dispensed) as total_dispensed,
  AVG(time) as avg_time
FROM scores;
```

---

## Notes

1. **Replace `vendinghanger.eeelab.xyz`** with your actual server URL (e.g., `http://vendinghanger.eeelab.xyz/apiendpoints.php`)
2. **Player and Score IDs** should be replaced with actual IDs from your database
3. **JSON Tool**: Install `jq` for pretty-printing JSON responses: `brew install jq` (macOS) or `apt-get install jq` (Ubuntu)
4. **Time thresholds**: 
   - Gold prize: 60+ seconds (60000ms)
   - Silver prize: 30-59 seconds (30000-59999ms)
   - No prize: <30 seconds (<30000ms)
5. **Spring SDK channels**: Gold (1-5), Silver (6-15)
6. **Slot numbers**: Gold (24-25), Silver (1-8, 11-18, 21-28, 31-38, 45-48, 51-58)

This comprehensive testing guide covers all endpoints in your API server. Test them systematically to ensure your server is working correctly before deploying your application.