# Testing Guide

## Overview

This comprehensive testing guide covers all aspects of the Hanger Hold Challenge system, including API testing, hardware integration, and end-to-end workflow validation.

## Testing Strategy

### Test Pyramid
```
                ┌─────────────────────────┐
                │  End-to-End Tests    │
                └───────────┬───────────┘
          ┌─────────────┴─────────────┐
          │    Integration Tests        │
          └───────────┬───────────┘
    ┌─────────────┴─────────────┐
    │       Unit Tests            │
    └─────────────────────────────┘
```

### Testing Levels
1. **Unit Tests**: Individual component testing
2. **Integration Tests**: Component interaction testing
3. **End-to-End Tests**: Complete workflow testing
4. **Hardware Tests**: Physical device testing
5. **Performance Tests**: Load and stress testing

## API Testing

### Prerequisites
```bash
# Ensure backend is running
php -S localhost:8080 -t public

# Ensure frontend is running
npm run dev

# Test database connection
mysql -u hanger_user -p hanger_challenge -e "SELECT 1"
```

### Core API Endpoints Testing

#### Test 1: System Health Check
```bash
# Basic status
curl -X GET http://localhost:8080/api/vending/status

# Expected response
{
  "success": true,
  "data": {
    "status": "operational",
    "logs": [...]
  }
}
```

#### Test 2: Enhanced Spring SDK Status
```bash
curl -X GET http://localhost:8080/api/vending/status-enhanced

# Expected response
{
  "success": true,
  "data": {
    "status": "operational",
    "connection": true,
    "healthy_channels": 22,
    "total_channels": 25,
    "spring_sdk": {
      "enabled": true,
      "total_logs": 12,
      "success_rate": 91.7
    }
  }
}
```

#### Test 3: System Diagnostics
```bash
curl -X GET http://localhost:8080/api/vending/diagnostics

# Expected response
{
  "success": true,
  "data": {
    "diagnostics": {
      "overall_status": "pass",
      "tests": [
        {
          "name": "database_connection",
          "status": "pass",
          "message": "Database connection successful"
        }
      ]
    }
  }
}
```

### Player Management Testing

#### Test 4: Create Player
```bash
# Create new player
PLAYER_RESPONSE=$(curl -s -X POST http://localhost:8080/api/players \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Player","email":"test@example.com","phone":"+1234567890"}')

echo "Player created with ID: $(echo $PLAYER_RESPONSE | jq -r '.data.id')"
```

#### Test 5: Get Player
```bash
# Get player details (replace 123 with actual ID)
curl -X GET http://localhost:8080/api/players/123

# Expected response
{
  "success": true,
  "data": {
    "id": 123,
    "name": "Test Player",
    "email": "test@example.com",
    "phone": "+1234567890"
  }
}
```

### Game Flow Testing

#### Test 6: Score Submission
```bash
# Submit score for existing player
curl -X POST http://localhost:8080/api/scores \
  -H "Content-Type: application/json" \
  -d '{"player_id":123,"time":45000}'

# Expected response
{
  "success": true,
  "data": {
    "id": 456,
    "player_id": 123,
    "time": 45000,
    "prize": {
      "id": 2,
      "name": "Silver Prize",
      "time_threshold": 30000
    }
  }
}
```

#### Test 7: Prize Eligibility Check
```bash
# Check eligibility for different time thresholds
curl "http://localhost:8080/api/prizes?check=1&time=75000"  # Gold tier
curl "http://localhost:8080/api/prizes?check=1&time=45000"  # Silver tier
curl "http://localhost:8080/api/prizes?check=1&time=15000"  # Bronze tier
curl "http://localhost:8080/api/prizes?check=1&time=5000"   # No prize
```

### Vending Integration Testing

#### Test 8: Legacy Prize Dispensing
```bash
# Test legacy dispensing
curl -X POST http://localhost:8080/api/vending/dispense \
  -H "Content-Type: application/json" \
  -d '{"prize_id":1,"score_id":456}'

# Expected response
{
  "success": true,
  "data": {
    "score_id": 456,
    "prize_id": 1,
    "prize_name": "Gold Prize",
    "slot": 3,
    "command": "00 FF 03 FC AA 55",
    "response": "00 5D 00 AA 07",
    "log_id": 789
  }
}
```

#### Test 9: Spring SDK Prize Dispensing
```bash
# Test Spring SDK dispensing with manual tier
curl -X POST http://localhost:8080/api/vending/dispense-spring \
  -H "Content-Type: application/json" \
  -d '{"tier":"gold","score_id":456}'

# Test Spring SDK dispensing with auto-tier detection
curl -X POST http://localhost:8080/api/vending/dispense-spring \
  -H "Content-Type: application/json" \
  -d '{"score_id":456}'  # Tier auto-detected from score time
```

## Hardware Testing

### TCN Hardware Testing

#### Test 10: Serial Connection
```bash
# Using TeraTerm (manual testing)
1. Open TeraTerm
2. Select Serial connection
3. Choose COM port (from Device Manager)
4. Set baud rate: 115200
5. Press Enter
6. Expected: "UCS V4.2" response
```

#### Test 11: Node.js Serial Communication
```bash
# Test with Node.js script
node -e "
const { SerialPort } = require('serialport');

async function testTCNConnection() {
  try {
    const ports = await SerialPort.list();
    console.log('Available ports:', ports);
    
    const port = new SerialPort({
      path: 'COM3', // Change to your port
      baudRate: 115200,
      dataBits: 8,
      parity: 'none',
      stopBits: 1
    });
    
    port.on('open', () => {
      console.log('Connected to TCN controller');
    });
    
    port.on('data', (data) => {
      console.log('Received:', data.toString());
    });
    
  } catch (error) {
    console.error('Connection failed:', error);
  }
}

testTCNConnection();
"
```

### Spring SDK Testing

#### Test 12: Android Bridge Connection
```bash
# Test Android bridge HTTP endpoint
curl -X GET http://192.168.1.100:8080/status

# Expected response
{
  "status": "ok",
  "message": "Spring SDK Bridge running"
}
```

#### Test 13: WebSocket Communication
```javascript
// Test WebSocket connection in browser console
const ws = new WebSocket('ws://192.168.1.100:8080');

ws.onopen = () => {
  console.log('WebSocket connected to Android bridge');
  
  // Test status request
  ws.send(JSON.stringify({
    action: 'query_status',
    channel: 5
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received from Android bridge:', data);
};
```

## Integration Testing

### End-to-End Workflow Tests

#### Test 14: Complete Game Flow
```bash
# Step 1: Create player
PLAYER_ID=$(curl -s -X POST http://localhost:8080/api/players \
  -H "Content-Type: application/json" \
  -d '{"name":"E2E Test","email":"e2e@test.com"}' | \
  jq -r '.data.id')

# Step 2: Submit gold-tier score
SCORE_ID=$(curl -s -X POST http://localhost:8080/api/scores \
  -H "Content-Type: application/json" \
  -d "{\"player_id\":$PLAYER_ID,\"time\":75000}" | \
  jq -r '.data.id')

# Step 3: Dispense gold prize
curl -X POST http://localhost:8080/api/vending/dispense-spring \
  -H "Content-Type: application/json" \
  -d "{\"score_id\":$SCORE_ID,\"tier\":\"gold\"}"

echo "Complete flow test completed"
```

#### Test 15: Error Handling
```bash
# Test invalid player ID
curl -X GET http://localhost:8080/api/players/99999

# Expected: 404 Not Found
{
  "success": false,
  "error": "Player not found",
  "code": "PLAYER_NOT_FOUND"
}

# Test invalid score submission
curl -X POST http://localhost:8080/api/scores \
  -H "Content-Type: application/json" \
  -d '{"player_id":123,"time":-1000}'

# Expected: 400 Bad Request
{
  "success": false,
  "error": "Invalid time value",
  "code": "INVALID_TIME"
}
```

## Performance Testing

### Load Testing Script
```bash
#!/bin/bash
# performance-test.sh

API_BASE="http://localhost:8080/api"
CONCURRENT_USERS=10
TEST_DURATION=60  # seconds

echo "Starting performance test..."

# Spawn multiple concurrent processes
for ((i=1; i<=CONCURRENT_USERS; i++)); do
  (
    echo "User $i: Starting test..."
    START_TIME=$(date +%s)
    
    # Run 10 requests per user
    for ((j=1; j<=10; j++)); do
      curl -s -X POST "$API_BASE/scores" \
        -H "Content-Type: application/json" \
        -d "{\"player_id\":1,\"time\":$((RANDOM % 60 + 30))000}" \
        > /dev/null
      
      sleep 1
    done
    
    END_TIME=$(date +%s)
    ELAPSED=$((END_TIME - START_TIME))
    echo "User $i: Completed in $ELAPSED seconds"
  ) &
done

# Wait for all processes to complete
wait

echo "Performance test completed"
```

### Stress Testing
```bash
# High-frequency vending test
for i in {1..100}; do
  curl -X POST http://localhost:8080/api/vending/dispense-spring \
    -H "Content-Type: application/json" \
    -d '{"tier":"bronze","score_id":1}' \
    -w "Response time: %{time_total}s\n" \
    -o /dev/null
  
  sleep 0.1
done
```

## Automated Testing

### Test Suite Implementation
```javascript
// automated-test-suite.js
const axios = require('axios');

class HangerTestSuite {
  constructor(apiBase) {
    this.apiBase = apiBase;
    this.testResults = [];
  }

  async runAllTests() {
    console.log('Starting comprehensive test suite...');
    
    await this.testPlayerManagement();
    await this.testGameFlow();
    await this.testVendingIntegration();
    await this.testErrorHandling();
    
    this.generateReport();
  }

  async testPlayerManagement() {
    console.log('Testing player management...');
    
    try {
      // Test player creation
      const player = await this.createPlayer({
        name: 'Auto Test Player',
        email: 'auto@test.com'
      });
      
      // Test player retrieval
      const retrieved = await this.getPlayer(player.id);
      
      this.testResults.push({
        test: 'Player Creation & Retrieval',
        status: player.id === retrieved.id ? 'PASS' : 'FAIL',
        details: `Created ID: ${player.id}, Retrieved ID: ${retrieved.id}`
      });
    } catch (error) {
      this.testResults.push({
        test: 'Player Creation & Retrieval',
        status: 'FAIL',
        details: error.message
      });
    }
  }

  async testGameFlow() {
    console.log('Testing complete game flow...');
    
    try {
      // Create player
      const player = await this.createPlayer({
        name: 'Game Test Player',
        email: 'game@test.com'
      });
      
      // Submit scores for different tiers
      const goldScore = await this.submitScore(player.id, 75000);  // Gold
      const silverScore = await this.submitScore(player.id, 45000); // Silver
      const bronzeScore = await this.submitScore(player.id, 15000); // Bronze
      
      // Test dispensing for each tier
      const goldDispense = await this.dispensePrize('gold', goldScore.id);
      const silverDispense = await this.dispensePrize('silver', silverScore.id);
      const bronzeDispense = await this.dispensePrize('bronze', bronzeScore.id);
      
      this.testResults.push({
        test: 'Complete Game Flow',
        status: (goldDispense && silverDispense && bronzeDispense) ? 'PASS' : 'FAIL',
        details: `Gold: ${goldDispense ? 'PASS' : 'FAIL'}, Silver: ${silverDispense ? 'PASS' : 'FAIL'}, Bronze: ${bronzeDispense ? 'PASS' : 'FAIL'}`
      });
    } catch (error) {
      this.testResults.push({
        test: 'Complete Game Flow',
        status: 'FAIL',
        details: error.message
      });
    }
  }

  async testErrorHandling() {
    console.log('Testing error handling...');
    
    try {
      // Test invalid player ID
      await this.getPlayer(99999);
      this.testResults.push({
        test: 'Error Handling - Invalid Player',
        status: 'FAIL', // Should fail
        details: 'Should return 404 error'
      });
    } catch (error) {
      this.testResults.push({
        test: 'Error Handling - Network Error',
        status: 'PASS', // Should handle gracefully
        details: `Caught error: ${error.message}`
      });
    }
  }

  async createPlayer(data) {
    const response = await axios.post(`${this.apiBase}/players`, data);
    return response.data;
  }

  async getPlayer(id) {
    const response = await axios.get(`${this.apiBase}/players/${id}`);
    return response.data;
  }

  async submitScore(playerId, time) {
    const response = await axios.post(`${this.apiBase}/scores`, {
      player_id: playerId,
      time: time
    });
    return response.data;
  }

  async dispensePrize(tier, scoreId) {
    const response = await axios.post(`${this.apiBase}/vending/dispense-spring`, {
      tier: tier,
      score_id: scoreId
    });
    return response.data.success;
  }

  generateReport() {
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    
    console.log('\n=== TEST REPORT ===');
    console.log(`Total Tests: ${this.testResults.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / this.testResults.length) * 100).toFixed(2)}%`);
    
    console.log('\nFailed Tests:');
    this.testResults
      .filter(r => r.status === 'FAIL')
      .forEach(test => {
        console.log(`- ${test.test}: ${test.details}`);
      });
  }
}

// Run the test suite
const testSuite = new HangerTestSuite('http://localhost:8080/api');
testSuite.runAllTests();
```

## Continuous Integration

### CI/CD Pipeline Testing
```yaml
# .github/workflows/test.yml
name: Hanger Challenge Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: hanger_challenge_test
          MYSQL_USER: hanger_test
        options: >-
          --health-cmd-status=interval=5s
          --health-cmd-timeout=2s
          --health-interval=10s
          --health-retries=3

    steps:
    - name: Checkout code
      uses: actions/checkout@v2

    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'

    - name: Install dependencies
      run: |
        cd backend
        composer install
        cd ..
        npm install

    - name: Start services
      run: |
        # Start MySQL
        sudo systemctl start mysql
        
        # Start PHP development server
        cd backend && php -S localhost:8080 -t public &
        
        # Wait for services to be ready
        sleep 10

    - name: Run API tests
      run: |
        # Run curl-based tests
        ./tests/api-tests.sh
        
        # Run automated test suite
        node tests/automated-test-suite.js

    - name: Run hardware simulation tests
      run: |
        # Run Node.js serial communication tests
        node tests/hardware-simulation.js
```

This testing guide provides comprehensive procedures for validating all aspects of your Hanger Hold Challenge system from unit tests to end-to-end workflows.