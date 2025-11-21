# API Testing Guide

## Overview

This guide provides comprehensive API testing procedures for the Hanger Hold Challenge system, including all endpoints, expected responses, and troubleshooting steps.

## Testing Tools

### Prerequisites
```bash
# Install testing tools
npm install -g curl jq

# For Windows users
# Download and install Git for Windows
# Use Git Bash or WSL for curl commands
```

### Environment Setup
```bash
# Set environment variables
export API_BASE="http://localhost:8080/api"
export API_TOKEN="your-test-token-here"

# Test database connection
export DB_HOST="localhost"
export DB_NAME="hanger_challenge"
export DB_USER="hanger_user"
export DB_PASS="test_password"
```

## Authentication Testing

### Test 1: API Key Validation
```bash
# Test with valid API key
curl -H "Authorization: Bearer valid-token" \
     -H "Content-Type: application/json" \
     -X GET "$API_BASE/status"

# Expected: 200 OK with data
# Test with invalid API key
curl -H "Authorization: Bearer invalid-token" \
     -H "Content-Type: application/json" \
     -X GET "$API_BASE/status"

# Expected: 401 Unauthorized
```

### Test 2: JWT Token Expiration
```bash
# Test with expired token
curl -H "Authorization: Bearer expired-token" \
     -H "Content-Type: application/json" \
     -X GET "$API_BASE/status"

# Expected: 401 Unauthorized
# Test with malformed token
curl -H "Authorization: Bearer malformed.jwt" \
     -H "Content-Type: application/json" \
     -X GET "$API_BASE/status"

# Expected: 401 Unauthorized
```

## Player Management Testing

### Test 3: Create Player
```bash
# Valid player creation
PLAYER_RESPONSE=$(curl -s -X POST "$API_BASE/players" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $API_TOKEN" \
     -d '{
       "name": "Test Player",
       "email": "test@example.com",
       "phone": "+1234567890"
     }')

echo "Player created with ID: $(echo $PLAYER_RESPONSE | jq -r '.data.id')"

# Test duplicate player creation
DUPLICATE_RESPONSE=$(curl -s -X POST "$API_BASE/players" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $API_TOKEN" \
     -d '{
       "name": "Test Player",
       "email": "test@example.com"
     }')

echo "Duplicate player ID: $(echo $DUPLICATE_RESPONSE | jq -r '.data.id')"
echo "Existing player: $(echo $DUPLICATE_RESPONSE | jq -r '.data.existing')"
```

### Test 4: Get Player
```bash
# Get existing player
GET_PLAYER_RESPONSE=$(curl -s -X GET "$API_BASE/players/1" \
     -H "Authorization: Bearer $API_TOKEN")

echo "Player details:"
echo $GET_PLAYER_RESPONSE | jq '.data'

# Get non-existent player
NOT_FOUND_RESPONSE=$(curl -s -X GET "$API_BASE/players/99999" \
     -H "Authorization: Bearer $API_TOKEN")

echo "Status code: $(echo $NOT_FOUND_RESPONSE | jq -r '.success')"
echo "Error message: $(echo $NOT_FOUND_RESPONSE | jq -r '.error')"
```

### Test 5: Get All Players
```bash
# Get all players
ALL_PLAYERS_RESPONSE=$(curl -s -X GET "$API_BASE/players" \
     -H "Authorization: Bearer $API_TOKEN")

echo "Total players: $(echo $ALL_PLAYERS_RESPONSE | jq -r '.data.players | length')"
echo "Player list:"
echo $ALL_PLAYERS_RESPONSE | jq -r '.data.players[].name'
```

## Score Management Testing

### Test 6: Submit Score
```bash
# Submit score for existing player
SCORE_RESPONSE=$(curl -s -X POST "$API_BASE/scores" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $API_TOKEN" \
     -d '{
       "player_id": 1,
       "time": 45000
     }')

echo "Score created with ID: $(echo $SCORE_RESPONSE | jq -r '.data.id')"
echo "Prize awarded: $(echo $SCORE_RESPONSE | jq -r '.data.prize.name')"

# Test score for non-existent player
INVALID_PLAYER_RESPONSE=$(curl -s -X POST "$API_BASE/scores" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $API_TOKEN" \
     -d '{
       "player_id": 99999,
       "time": 30000
     }')

echo "Error: $(echo $INVALID_PLAYER_RESPONSE | jq -r '.error')"
```

### Test 7: Get Player Scores
```bash
# Get scores for specific player
PLAYER_SCORES_RESPONSE=$(curl -s -X GET "$API_BASE/scores?player_id=1" \
     -H "Authorization: Bearer $API_TOKEN")

echo "Player scores:"
echo $PLAYER_SCORES_RESPONSE | jq -r '.data.scores[] | {time, prize_id, dispensed}'
```

### Test 8: Leaderboard
```bash
# Get leaderboard
LEADERBOARD_RESPONSE=$(curl -s -X GET "$API_BASE/leaderboard" \
     -H "Authorization: Bearer $API_TOKEN")

echo "Top 10 scores:"
echo $LEADERBOARD_RESPONSE | jq -r '.data.scores[:10] | {time, player_name}'
```

## Prize Management Testing

### Test 9: Check Prize Eligibility
```bash
# Test gold prize eligibility (60+ seconds)
GOLD_CHECK=$(curl -s -X GET "$API_BASE/prizes?check=1&time=75000" \
     -H "Authorization: Bearer $API_TOKEN")

echo "Gold eligible: $(echo $GOLD_CHECK | jq -r '.data.eligible')"

# Test silver prize eligibility (30-59 seconds)
SILVER_CHECK=$(curl -s -X GET "$API_BASE/prizes?check=1&time=45000" \
     -H "Authorization: Bearer $API_TOKEN")

echo "Silver eligible: $(echo $SILVER_CHECK | jq -r '.data.eligible')"

# Test bronze prize eligibility (10-29 seconds)
BRONZE_CHECK=$(curl -s -X GET "$API_BASE/prizes?check=1&time=20000" \
     -H "Authorization: Bearer $API_TOKEN")

echo "Bronze eligible: $(echo $BRONZE_CHECK | jq -r '.data.eligible')"

# Test no prize eligibility (< 10 seconds)
NO_PRIZE_CHECK=$(curl -s -X GET "$API_BASE/prizes?check=1&time=5000" \
     -H "Authorization: Bearer $API_TOKEN")

echo "No prize eligible: $(echo $NO_PRIZE_CHECK | jq -r '.data.eligible')"
```

### Test 10: Get All Prizes
```bash
# Get all prizes
PRIZES_RESPONSE=$(curl -s -X GET "$API_BASE/prizes" \
     -H "Authorization: Bearer $API_TOKEN")

echo "Available prizes:"
echo $PRIZES_RESPONSE | jq -r '.data.prizes[] | {id, name, time_threshold}'
```

## Vending Integration Testing

### Test 11: Basic Vending Status
```bash
# Check vending system status
VENDING_STATUS=$(curl -s -X GET "$API_BASE/vending/status" \
     -H "Authorization: Bearer $API_TOKEN")

echo "System status: $(echo $VENDING_STATUS | jq -r '.data.status')"
echo "Total logs: $(echo $VENDING_STATUS | jq -r '.data.logs | length')"
```

### Test 12: Enhanced Spring SDK Status
```bash
# Check enhanced vending status
ENHANCED_STATUS=$(curl -s -X GET "$API_BASE/vending/status-enhanced" \
     -H "Authorization: Bearer $API_TOKEN")

echo "Connection status: $(echo $ENHANCED_STATUS | jq -r '.data.connection')"
echo "Healthy channels: $(echo $ENHANCED_STATUS | jq -r '.data.healthy_channels')"
echo "Spring SDK enabled: $(echo $ENHANCED_STATUS | jq -r '.data.spring_sdk.enabled')"
```

### Test 13: System Diagnostics
```bash
# Run system diagnostics
DIAGNOSTICS=$(curl -s -X GET "$API_BASE/vending/diagnostics" \
     -H "Authorization: Bearer $API_TOKEN")

echo "Overall status: $(echo $DIAGNOSTICS | jq -r '.data.diagnostics.overall_status')"
echo "Tests passed: $(echo $DIAGNOSTICS | jq -r '.data.diagnostics.tests | map(select(.status == "pass")) | length')"
echo "Tests failed: $(echo $DIAGNOSTICS | jq -r '.data.diagnostics.tests | map(select(.status == "fail")) | length')"
```

### Test 14: Legacy Prize Dispensing
```bash
# Test legacy dispensing
LEGACY_DISPENSE=$(curl -s -X POST "$API_BASE/vending/dispense" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $API_TOKEN" \
     -d '{
       "prize_id": 1,
       "score_id": 123
     }')

echo "Dispense success: $(echo $LEGACY_DISPENSE | jq -r '.success')"
echo "Prize name: $(echo $LEGACY_DISPENSE | jq -r '.data.prize_name')"
echo "Slot used: $(echo $LEGACY_DISPENSE | jq -r '.data.slot')"
```

### Test 15: Spring SDK Prize Dispensing
```bash
# Test Spring SDK dispensing with manual tier
SPRING_DISPENSE_MANUAL=$(curl -s -X POST "$API_BASE/vending/dispense-spring" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $API_TOKEN" \
     -d '{
       "tier": "gold",
       "score_id": 456
     }')

echo "Spring dispense success: $(echo $SPRING_DISPENSE_MANUAL | jq -r '.success')"
echo "Channel used: $(echo $SPRING_DISPENSE_MANUAL | jq -r '.data.channel')"

# Test Spring SDK dispensing with auto-tier detection
SPRING_DISPENSE_AUTO=$(curl -s -X POST "$API_BASE/vending/dispense-spring" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $API_TOKEN" \
     -d '{
       "score_id": 456
     }')

echo "Auto-detected tier: $(echo $SPRING_DISPENSE_AUTO | jq -r '.data.tier')"
echo "Channel used: $(echo $SPRING_DISPENSE_AUTO | jq -r '.data.channel')"
```

## Error Handling Testing

### Test 16: Invalid Input Validation
```bash
# Test missing required fields
MISSING_FIELDS=$(curl -s -X POST "$API_BASE/vending/dispense-spring" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $API_TOKEN" \
     -d '{}')

echo "Error status: $(echo $MISSING_FIELDS | jq -r '.success')"
echo "Error message: $(echo $MISSING_FIELDS | jq -r '.error')"

# Test invalid time value
INVALID_TIME=$(curl -s -X POST "$API_BASE/scores" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $API_TOKEN" \
     -d '{
       "player_id": 1,
       "time": -1000
     }')

echo "Error code: $(echo $INVALID_TIME | jq -r '.error')"
echo "Error message: $(echo $INVALID_TIME | jq -r '.error')"
```

### Test 17: Rate Limiting
```bash
# Test rate limiting (send rapid requests)
for i in {1..15}; do
  curl -s -X GET "$API_BASE/status" \
       -H "Authorization: Bearer $API_TOKEN" \
       -w /dev/null
done

# Check rate limit headers
RATE_LIMIT_RESPONSE=$(curl -s -X GET "$API_BASE/status" \
     -H "Authorization: Bearer $API_TOKEN")

echo "Rate limit remaining: $(echo $RATE_LIMIT_RESPONSE | jq -r '.headers."X-RateLimit-Remaining"')"
echo "Requests allowed: $(echo $RATE_LIMIT_RESPONSE | jq -r '.headers."X-RateLimit-Limit"')"
```

## Performance Testing

### Test 18: Response Time Testing
```bash
# Test API response times
for endpoint in "/status" "/players" "/scores" "/vending/status"; do
  echo "Testing $endpoint response time..."
  START_TIME=$(date +%s%N)
  
  RESPONSE=$(curl -s -w '%{time_total}' -X GET "$API_BASE$endpoint" \
       -H "Authorization: Bearer $API_TOKEN")
  
  END_TIME=$(date +%s%N)
  RESPONSE_TIME=$((END_TIME - START_TIME))
  
  echo "Response time: ${RESPONSE_TIME}s"
  
  if [ $RESPONSE_TIME -gt 2 ]; then
    echo "⚠️  Slow response detected"
  else
    echo "✅ Response time acceptable"
  fi
done
```

### Test 19: Concurrent Load Testing
```bash
# Test concurrent API requests
echo "Starting concurrent load test..."

# Spawn 20 parallel requests
for i in {1..20}; do
  curl -s -X GET "$API_BASE/status" \
       -H "Authorization: Bearer $API_TOKEN" \
       -w /dev/null &
done

# Wait for all requests to complete
wait

echo "Concurrent load test completed"
```

## Automated Testing Scripts

### Test Suite Runner
```bash
#!/bin/bash
# api-test-suite.sh

API_BASE="http://localhost:8080/api"
API_TOKEN="test-token"
TEST_RESULTS=()

run_test() {
  local test_name=$1
  local expected_code=$2
  local command=$3
  
  echo "Running: $test_name"
  
  RESPONSE=$(curl -s -w "%{http_code}" -X "$command" \
       -H "Content-Type: application/json" \
       -H "Authorization: Bearer $API_TOKEN" \
       "$API_BASE$endpoint")
  
  HTTP_CODE=$(echo "$RESPONSE" | jq -r '.http_code')
  
  if [ "$HTTP_CODE" = "$expected_code" ]; then
    echo "✅ $test_name: PASSED"
    TEST_RESULTS+=("PASS: $test_name")
  else
    echo "❌ $test_name: FAILED (HTTP $HTTP_CODE)"
    TEST_RESULTS+=("FAIL: $test_name")
  fi
}

# Run all tests
run_test "Player Creation" 200 "POST /players" '{"name":"Test User","email":"test@example.com"}'
run_test "Get Player" 200 "GET /players/1"
run_test "Submit Score" 200 "POST /scores" '{"player_id":1,"time":45000}'
run_test "Check Eligibility" 200 "GET /prizes?check=1&time=45000"
run_test "Vending Status" 200 "GET /vending/status"
run_test "Spring Dispensing" 200 "POST /vending/dispense-spring" '{"tier":"gold","score_id":1}'

# Print results
echo "=== TEST RESULTS ==="
for result in "${TEST_RESULTS[@]}"; do
  echo "$result"
done

echo "Pass rate: $(echo "${TEST_RESULTS[@]}" | grep -c "PASS:" | wc -l)/$(echo "${TEST_RESULTS[@]}" | wc -l)"
```

## Integration Testing

### End-to-End Workflow Test
```bash
#!/bin/bash
# e2e-workflow-test.sh

API_BASE="http://localhost:8080/api"
API_TOKEN="test-token"

echo "=== END-TO-END WORKFLOW TEST ==="

# Step 1: Create player
PLAYER_ID=$(curl -s -X POST "$API_BASE/players" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $API_TOKEN" \
     -d '{"name":"E2E Test User","email":"e2e@test.com"}' | \
     jq -r '.data.id')

echo "Player created: $PLAYER_ID"

# Step 2: Submit gold-tier score
SCORE_ID=$(curl -s -X POST "$API_BASE/scores" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $API_TOKEN" \
     -d "{\"player_id\":$PLAYER_ID,\"time\":75000}" | \
     jq -r '.data.id')

echo "Score submitted: $SCORE_ID"

# Step 3: Dispense gold prize
DISPENSE_RESULT=$(curl -s -X POST "$API_BASE/vending/dispense-spring" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $API_TOKEN" \
     -d "{\"score_id\":$SCORE_ID}" | \
     jq -r '.success')

echo "Dispense result: $DISPENSE_RESULT"

# Step 4: Verify results
echo "=== WORKFLOW VERIFICATION ==="
echo "Player ID: $PLAYER_ID"
echo "Score ID: $SCORE_ID"
echo "Dispense success: $DISPENSE_RESULT"

if [ "$DISPENSE_RESULT" = "true" ]; then
  echo "✅ End-to-end workflow: PASSED"
else
  echo "❌ End-to-end workflow: FAILED"
fi
```

## Continuous Testing

### Load Testing Script
```bash
#!/bin/bash
# load-test.sh

API_BASE="http://localhost:8080/api"
CONCURRENT_USERS=10
TEST_DURATION=60

echo "Starting load test: $(date)"

# Generate concurrent load
for ((i=1; i<=CONCURRENT_USERS; i++)); do
  (
    echo "User $i: Starting requests..."
    START_TIME=$(date +%s)
    
    # Send 10 requests per user
    for ((j=1; j<=10; j++)); do
      curl -s -X POST "$API_BASE/scores" \
           -H "Content-Type: application/json" \
           -H "Authorization: Bearer test-token" \
           -d "{\"player_id\":$i,\"time\":$((RANDOM % 60 + 30))000}" \
           -w /dev/null &
    done
    
    END_TIME=$(date +%s)
    ELAPSED=$((END_TIME - START_TIME))
    
    echo "User $i: Completed in $ELAPSED seconds"
  ) &
done

# Wait for all to complete
wait

echo "Load test completed: $(date)"
```

This API testing guide provides comprehensive procedures for validating all endpoints and functionality of the Hanger Hold Challenge system.