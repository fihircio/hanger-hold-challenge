# API Testing Guide for 2-Prize System

This guide provides multiple ways to test your updated API endpoints to verify the 2-prize system is working correctly.

## 🧪 **Method 1: Using cURL Commands (Recommended)**

### Test Prize Eligibility

**Test Silver Prize (30+ seconds):**
```bash
curl -X GET "https://vendinghanger.eeelab.xyz/apiendpoints.php/prizes?check=1&time=35000" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n"
```

**Test Gold Prize (60+ seconds):**
```bash
curl -X GET "https://vendinghanger.eeelab.xyz/apiendpoints.php/prizes?check=1&time=65000" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n"
```

**Test No Prize (<30 seconds):**
```bash
curl -X GET "https://vendinghanger.eeelab.xyz/apiendpoints.php/prizes?check=1&time=15000" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n"
```

### Test All Prizes
```bash
curl -X GET "https://vendinghanger.eeelab.xyz/apiendpoints.php/prizes" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n"
```

### Test Inventory Logging

**Test Dispensing Log:**
```bash
curl -X POST "https://vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/log-dispensing" \
  -H "Content-Type: application/json" \
  -d '{
    "slot": 24,
    "tier": "gold",
    "success": true,
    "timestamp": "2025-11-22T10:30:00.000Z",
    "source": "test"
  }' \
  -w "\nHTTP Status: %{http_code}\n"
```

**Test Out of Stock Log:**
```bash
curl -X POST "https://vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/log-out-of-stock" \
  -H "Content-Type: application/json" \
  -d '{
    "tier": "silver",
    "timestamp": "2025-11-22T10:30:00.000Z",
    "source": "test"
  }' \
  -w "\nHTTP Status: %{http_code}\n"
```

## 🌐 **Method 2: Browser Testing**

### Option A: Browser Developer Console
1. Open your application in browser
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Copy and paste this code:

```javascript
// Test API endpoints directly in browser
const API_BASE = 'https://vendinghanger.eeelab.xyz/apiendpoints.php';

async function testAPI() {
  console.log('🧪 Testing API endpoints...\n');
  
  try {
    // Test 1: Silver prize eligibility
    console.log('📋 Testing Silver Prize (35s):');
    const silverResponse = await fetch(`${API_BASE}/prizes?check=1&time=35000`);
    const silverData = await silverResponse.json();
    console.log('Status:', silverResponse.status);
    console.log('Response:', silverData);
    
    // Test 2: Gold prize eligibility
    console.log('\n📋 Testing Gold Prize (65s):');
    const goldResponse = await fetch(`${API_BASE}/prizes?check=1&time=65000`);
    const goldData = await goldResponse.json();
    console.log('Status:', goldResponse.status);
    console.log('Response:', goldData);
    
    // Test 3: No prize eligibility
    console.log('\n📋 Testing No Prize (15s):');
    const noPrizeResponse = await fetch(`${API_BASE}/prizes?check=1&time=15000`);
    const noPrizeData = await noPrizeResponse.json();
    console.log('Status:', noPrizeResponse.status);
    console.log('Response:', noPrizeData);
    
    // Test 4: All prizes
    console.log('\n📋 Testing All Prizes:');
    const allPrizesResponse = await fetch(`${API_BASE}/prizes`);
    const allPrizesData = await allPrizesResponse.json();
    console.log('Status:', allPrizesResponse.status);
    console.log('Response:', allPrizesData);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testAPI();
```

### Option B: Using the Test Script
1. Open [`test-api-config.js`](test-api-config.js) in a text editor
2. Copy the entire content
3. Open your browser and go to your application
4. Press F12, go to Console tab
5. Paste the copied code and press Enter

## 📱 **Method 3: Using Postman (GUI Alternative)**

1. Install Postman (free) or use web version
2. Create new requests with these settings:

**GET Request - Prize Check:**
- URL: `https://vendinghanger.eeelab.xyz/apiendpoints.php/prizes`
- Params: 
  - `check`: `1`
  - `time`: `35000` (try 15000, 35000, 65000)
- Method: GET

**POST Request - Log Dispensing:**
- URL: `https://vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/log-dispensing`
- Method: POST
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "slot": 24,
  "tier": "gold",
  "success": true,
  "timestamp": "2025-11-22T10:30:00.000Z",
  "source": "test"
}
```

## 🎯 **Expected Results**

### Prize Eligibility Tests:
- **15 seconds**: `{"eligible": false, "message": "No prize eligible for this time"}`
- **35 seconds**: `{"eligible": true, "prize": {"id": 2, "name": "Silver Prize", ...}}`
- **65 seconds**: `{"eligible": true, "prize": {"id": 1, "name": "Gold Prize", ...}}`

### All Prizes Test:
```json
{
  "prizes": [
    {
      "id": 1,
      "name": "Gold Prize",
      "message": "Incredible! You won the Gold Prize!",
      "slot": 24,
      "time_threshold": 60000
    },
    {
      "id": 2,
      "name": "Silver Prize", 
      "message": "Amazing! You won the Silver Prize!",
      "slot": 1,
      "time_threshold": 30000
    }
  ]
}
```

### Logging Tests:
- Should return success messages with log IDs
- HTTP Status: 200 OK

## 🔧 **Troubleshooting**

### If you get 404 errors:
```bash
# Check if the file exists on server
curl -I "https://vendinghanger.eeelab.xyz/apiendpoints.php"
```

### If you get connection errors:
1. Verify the server URL is correct
2. Check if the PHP file is uploaded properly
3. Ensure the server supports PHP

### If you get PHP errors:
1. Check PHP error logs on server
2. Verify database connection details in the PHP file
3. Ensure the database migration was run

## 📋 **Quick Test Checklist**

- [ ] Silver prize (30+ seconds) returns eligible
- [ ] Gold prize (60+ seconds) returns eligible  
- [ ] No prize (<30 seconds) returns ineligible
- [ ] All prizes endpoint returns exactly 2 prizes
- [ ] Inventory logging endpoints accept POST requests
- [ ] All HTTP status codes are 200 OK

## 🚀 **Next Steps After Testing**

1. **If tests pass**: Your API is working! The frontend should now connect properly.
2. **If tests fail**: 
   - Deploy the updated [`api_endpoints_for_server.php`](backend/api_endpoints_for_server.php) to your server
   - Run the database migration if needed
   - Check server PHP error logs

3. **Test the full application**: Try the game and verify manual dispensing works without API errors.