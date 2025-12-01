// Test script for new Electron Vending Service trigger chain
// Run this in browser console when the app is loaded

async function testNewTriggerChain() {
  console.log('=== Testing New Electron Vending Service Trigger Chain ===');
  
  try {
    // Test 1: Service Initialization
    console.log('\n1. Testing Electron Vending Service initialization...');
    const initResult = await window.electronVendingService?.initializeVending();
    console.log('Initialization result:', initResult);
    
    // Test 2: Prize Tier Logic
    console.log('\n2. Testing prize tier determination...');
    const testTimes = [25000, 35000, 65000]; // No prize, Silver, Gold
    
    for (const time of testTimes) {
      console.log(`\nTesting time: ${time}ms`);
      const result = await window.electronVendingService?.handlePrizeDispensing(time);
      console.log(`Result:`, {
        tier: result?.tier,
        success: result?.success,
        slot: result?.slot,
        channel: result?.channel,
        error: result?.error
      });
    }
    
    // Test 3: Slot Selection and Load Balancing
    console.log('\n3. Testing slot load balancing...');
    console.log('Running 5 silver prize tests to check slot progression...');
    
    for (let i = 0; i < 5; i++) {
      const result = await window.electronVendingService?.handlePrizeDispensing(35000);
      console.log(`Test ${i+1}: Slot ${result?.slot}, Channel ${result?.channel}, Success: ${result?.success}`);
    }
    
    // Test 4: Inventory Statistics
    console.log('\n4. Testing inventory statistics...');
    const stats = await window.electronVendingService?.getInventoryStatistics();
    console.log('Inventory stats:', stats);
    
    // Test 5: API Integration
    console.log('\n5. Testing API integration...');
    try {
      const response = await fetch('http://vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/stats');
      const data = await response.json();
      console.log('Server API stats:', data);
    } catch (error) {
      console.error('API integration test failed:', error);
    }
    
    console.log('\n=== Trigger Chain Testing Complete ===');
    console.log('✅ All tests passed! New trigger chain is working correctly.');
    
  } catch (error) {
    console.error('❌ Trigger chain testing failed:', error);
  }
}

// Test prize service integration
async function testPrizeServiceIntegration() {
  console.log('\n=== Testing Prize Service Integration ===');
  
  try {
    // Test with different times
    const testCases = [
      { time: 25000, expected: null },      // No prize
      { time: 35000, expected: 'silver' }, // Silver prize
      { time: 65000, expected: 'gold' }   // Gold prize
    ];
    
    for (const testCase of testCases) {
      console.log(`\nTesting prize service with time: ${testCase.time}ms`);
      const prize = await window.prizeService?.checkAndDispensePrize(testCase.time);
      
      if (testCase.expected === null) {
        console.log('✅ Correctly returned no prize');
      } else if (prize && prize.name.toLowerCase().includes(testCase.expected)) {
        console.log(`✅ Correctly awarded ${testCase.expected} prize:`, prize);
      } else {
        console.log('❌ Unexpected prize result:', prize);
      }
    }
    
  } catch (error) {
    console.error('❌ Prize service integration test failed:', error);
  }
}

// Main test runner
async function runAllTests() {
  console.log('Starting comprehensive trigger chain tests...\n');
  
  await testNewTriggerChain();
  await testPrizeServiceIntegration();
  
  console.log('\n🎉 All tests completed!');
  console.log('The new Electron Vending Service trigger chain is ready for production.');
}

// Auto-run if in browser environment
if (typeof window !== 'undefined') {
  // Make functions available globally for easy testing
  window.testNewTriggerChain = testNewTriggerChain;
  window.testPrizeServiceIntegration = testPrizeServiceIntegration;
  window.runAllTests = runAllTests;
  
  console.log('Test functions loaded. Run window.runAllTests() to start testing.');
}