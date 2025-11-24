// Test script to verify API configuration
// Run this in browser console or Node.js to test endpoints

const API_BASE_URL = 'https://vendinghanger.eeelab.xyz/apiendpoints.php';

// Test endpoints
const tests = [
  {
    name: 'Prize Eligibility Check (30+ seconds - should get silver)',
    url: `${API_BASE_URL}/prizes?check=1&time=35000`,
    expected: 'silver prize'
  },
  {
    name: 'Prize Eligibility Check (60+ seconds - should get gold)',
    url: `${API_BASE_URL}/prizes?check=1&time=65000`,
    expected: 'gold prize'
  },
  {
    name: 'Prize Eligibility Check (10 seconds - should get no prize)',
    url: `${API_BASE_URL}/prizes?check=1&time=10000`,
    expected: 'no prize'
  },
  {
    name: 'Get All Prizes',
    url: `${API_BASE_URL}/prizes`,
    expected: '2 prizes (gold and silver)'
  },
  {
    name: 'Inventory Log Dispensing Endpoint',
    url: `${API_BASE_URL}/api/inventory/log-dispensing`,
    method: 'POST',
    body: {
      slot: 24,
      tier: 'gold',
      success: true,
      timestamp: new Date().toISOString(),
      source: 'test'
    },
    expected: 'successful log creation'
  }
];

async function runTests() {
  console.log('🧪 Testing API Configuration...\n');
  
  for (const test of tests) {
    try {
      console.log(`📋 Testing: ${test.name}`);
      
      const options = {
        method: test.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      };
      
      if (test.body) {
        options.body = JSON.stringify(test.body);
      }
      
      const response = await fetch(test.url, options);
      const data = await response.json();
      
      console.log(`✅ Status: ${response.status}`);
      console.log(`📄 Response:`, data);
      console.log(`🎯 Expected: ${test.expected}`);
      
      if (response.ok) {
        console.log('✅ PASSED\n');
      } else {
        console.log('❌ FAILED - HTTP Error\n');
      }
      
    } catch (error) {
      console.log(`❌ FAILED - Error: ${error.message}\n`);
    }
  }
  
  console.log('🏁 Test completed!');
}

// Run tests if in browser or Node.js
if (typeof window !== 'undefined') {
  // Browser environment
  runTests();
} else if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment - you'll need to install node-fetch
  console.log('To run in Node.js, install node-fetch first, then run this script');
}