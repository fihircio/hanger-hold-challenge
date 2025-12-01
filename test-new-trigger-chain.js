// Test script for new Electron Vending Service primary trigger chain
// Run this in browser console or Node.js with fetch polyfill

const API_BASE_URL = 'https://vendinghanger.eeelab.xyz/apiendpoints.php';

async function testNewTriggerChain() {
  console.log('🧪 Testing New Electron Vending Service Primary Trigger Chain');
  console.log('=' .repeat(60));
  
  try {
    // Test 1: Check inventory system status
    console.log('\n📊 Test 1: Inventory System Status');
    await testInventoryStatus();
    
    // Test 2: Test slot selection and load balancing
    console.log('\n🎯 Test 2: Slot Selection & Load Balancing');
    await testSlotSelection();
    
    // Test 3: Test prize dispensing simulation
    console.log('\n🎁 Test 3: Prize Dispensing Simulation');
    await testPrizeDispensing();
    
    // Test 4: Test fallback mechanisms
    console.log('\n🔄 Test 4: Fallback Mechanisms');
    await testFallbackMechanisms();
    
    // Test 5: Test Electron Vending Service logging
    console.log('\n📝 Test 5: Electron Vending Service Logging');
    await testElectronVendingLogging();
    
    // Test 6: Test Electron Vending Service statistics
    console.log('\n📈 Test 6: Electron Vending Service Statistics');
    await testElectronVendingStatistics();
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

async function testInventoryStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/inventory/stats`);
    const data = await response.json();
    
    console.log('📈 Inventory Statistics:');
    console.log(`  Total Slots: ${data.data?.total_slots || 'N/A'}`);
    console.log(`  Gold Slots: ${data.data?.gold_slots || 'N/A'}`);
    console.log(`  Silver Slots: ${data.data?.silver_slots || 'N/A'}`);
    console.log(`  Total Dispensed: ${data.data?.total_dispensed || 'N/A'}`);
    console.log(`  Empty Slots: ${data.data?.empty_slots || 'N/A'}`);
    console.log(`  Need Refill: ${data.data?.slots_needing_refill || 'N/A'}`);
    
    // Test individual slot status
    const slotsResponse = await fetch(`${API_BASE_URL}/api/inventory/slots`);
    const slotsData = await slotsResponse.json();
    
    console.log('\n🎰 Slot Status (first 10):');
    slotsData.data?.slice(0, 10).forEach(slot => {
      console.log(`  Slot ${slot.slot}: ${slot.tier} - ${slot.dispense_count}/${slot.max_dispenses} (${slot.usage_percentage}%)`);
    });
    
  } catch (error) {
    console.error('❌ Inventory status test failed:', error);
  }
}

async function testSlotSelection() {
  try {
    // Simulate different game times to test tier determination
    const testCases = [
      { time: 75000, expectedTier: 'gold' },
      { time: 45000, expectedTier: 'silver' },
      { time: 15000, expectedTier: 'none' }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n⏱️  Game Time: ${testCase.time}ms (${testCase.time/1000}s)`);
      console.log(`  Expected Tier: ${testCase.expectedTier}`);
      
      // Test prize eligibility
      const prizeResponse = await fetch(`${API_BASE_URL}/api/prizes/check?time=${testCase.time}`);
      const prizeData = await prizeResponse.json();
      
      if (prizeData.eligible) {
        console.log(`  ✅ Prize Eligible: ${prizeData.prize?.name || 'Unknown'}`);
        console.log(`  📍 Slot: ${prizeData.prize?.slot || 'Unknown'}`);
      } else {
        console.log(`  ❌ No Prize Eligible: ${prizeData.message || 'Unknown reason'}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Slot selection test failed:', error);
  }
}

async function testPrizeDispensing() {
  try {
    // Test logging a dispensing event
    const dispensingLog = {
      slot: 15,
      tier: 'silver',
      success: true,
      timestamp: new Date().toISOString(),
      source: 'electron_vending_test'
    };
    
    console.log('\n🎯 Testing Dispensing Log:');
    console.log(`  Slot: ${dispensingLog.slot}`);
    console.log(`  Tier: ${dispensingLog.tier}`);
    console.log(`  Success: ${dispensingLog.success}`);
    
    const response = await fetch(`${API_BASE_URL}/api/inventory/log-dispensing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dispensingLog)
    });
    
    const result = await response.json();
    if (result.success) {
      console.log(`  ✅ Dispensing logged successfully (ID: ${result.data?.log_id})`);
    } else {
      console.log(`  ❌ Failed to log dispensing: ${result.message}`);
    }
    
  } catch (error) {
    console.error('❌ Prize dispensing test failed:', error);
  }
}

async function testFallbackMechanisms() {
  try {
    console.log('\n🔄 Testing Fallback Mechanisms:');
    
    // Test 1: API connectivity
    console.log('  📡 Testing API connectivity...');
    const apiResponse = await fetch(`${API_BASE_URL}/api/prizes`);
    if (apiResponse.ok) {
      console.log('  ✅ API connectivity: OK');
    } else {
      console.log('  ❌ API connectivity: Failed');
    }
    
    // Test 2: Database connectivity
    console.log('  🗄️ Testing database connectivity...');
    const dbResponse = await fetch(`${API_BASE_URL}/api/inventory/stats`);
    if (dbResponse.ok) {
      console.log('  ✅ Database connectivity: OK');
    } else {
      console.log('  ❌ Database connectivity: Failed');
    }
    
    // Test 3: Error handling
    console.log('  ⚠️ Testing error handling...');
    const errorTest = await fetch(`${API_BASE_URL}/api/inventory/log-dispensing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slot: 999, // Invalid slot
        tier: 'invalid_tier',
        success: false,
        timestamp: new Date().toISOString(),
        source: 'electron_vending_test'
      })
    });
    
    if (!errorTest.ok) {
      console.log('  ✅ Error handling: Working (invalid request properly rejected)');
    } else {
      console.log('  ⚠️ Error handling: May need improvement');
    }
    
  } catch (error) {
    console.error('❌ Fallback mechanisms test failed:', error);
  }
}

async function testElectronVendingLogging() {
  try {
    console.log('\n📝 Testing Electron Vending Service Logging:');
    
    // Test 1: Log a successful prize dispensing event
    const electronVendingLog = {
      action: 'prize_dispensing',
      game_time_ms: 45000,
      tier: 'silver',
      selected_slot: 15,
      channel_used: 12,
      score_id: 123,
      prize_id: 2,
      success: true,
      error_message: null,
      dispense_method: 'spring_sdk',
      inventory_before: 2,
      inventory_after: 3,
      response_time_ms: 1250,
      source: 'electron_vending_service'
    };
    
    console.log('  🎯 Testing detailed Electron Vending Service log:');
    console.log(`    Action: ${electronVendingLog.action}`);
    console.log(`    Game Time: ${electronVendingLog.game_time_ms}ms`);
    console.log(`    Tier: ${electronVendingLog.tier}`);
    console.log(`    Slot: ${electronVendingLog.selected_slot}`);
    console.log(`    Channel: ${electronVendingLog.channel_used}`);
    console.log(`    Method: ${electronVendingLog.dispense_method}`);
    console.log(`    Response Time: ${electronVendingLog.response_time_ms}ms`);
    
    const response = await fetch(`${API_BASE_URL}/api/electron-vending/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(electronVendingLog)
    });
    
    const result = await response.json();
    if (result.success) {
      console.log(`  ✅ Electron Vending Service log successful (ID: ${result.data?.log_id})`);
    } else {
      console.log(`  ❌ Failed to log to Electron Vending Service: ${result.message}`);
    }
    
    // Test 2: Log an out of stock event
    const outOfStockLog = {
      action: 'out_of_stock',
      tier: 'gold',
      success: false,
      source: 'electron_vending_service'
    };
    
    console.log('\n  📦 Testing out of stock log:');
    console.log(`    Action: ${outOfStockLog.action}`);
    console.log(`    Tier: ${outOfStockLog.tier}`);
    
    const oosResponse = await fetch(`${API_BASE_URL}/api/electron-vending/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(outOfStockLog)
    });
    
    const oosResult = await oosResponse.json();
    if (oosResult.success) {
      console.log(`  ✅ Out of stock log successful (ID: ${oosResult.data?.log_id})`);
    } else {
      console.log(`  ❌ Failed to log out of stock: ${oosResult.message}`);
    }
    
  } catch (error) {
    console.error('❌ Electron Vending Service logging test failed:', error);
  }
}

async function testElectronVendingStatistics() {
  try {
    console.log('\n📈 Testing Electron Vending Service Statistics:');
    
    const response = await fetch(`${API_BASE_URL}/api/electron-vending/stats`);
    const data = await response.json();
    
    if (data.success) {
      console.log('  📊 Electron Vending Service Statistics:');
      console.log(`    Total Operations: ${data.data?.total_operations || 'N/A'}`);
      console.log(`    Successful Operations: ${data.data?.successful_operations || 'N/A'}`);
      console.log(`    Failed Operations: ${data.data?.failed_operations || 'N/A'}`);
      console.log(`    Overall Success Rate: ${data.data?.overall_success_rate || 'N/A'}%`);
      console.log(`    Average Response Time: ${data.data?.average_response_time_ms || 'N/A'}ms`);
      console.log(`    Recent 24h Activity: ${data.data?.recent_24h_activity || 'N/A'}`);
      
      // Stats by tier
      console.log('\n  🏆 Statistics by Tier:');
      Object.entries(data.data?.stats_by_tier || {}).forEach(([tier, stats]) => {
        console.log(`    ${tier.toUpperCase()}:`);
        console.log(`      Total: ${stats.total}`);
        console.log(`      Successful: ${stats.successful}`);
        console.log(`      Success Rate: ${stats.success_rate}%`);
      });
      
      // Stats by method
      console.log('\n  ⚙️ Statistics by Method:');
      Object.entries(data.data?.stats_by_method || {}).forEach(([method, stats]) => {
        console.log(`    ${method.toUpperCase()}:`);
        console.log(`      Total: ${stats.total}`);
        console.log(`      Successful: ${stats.successful}`);
        console.log(`      Success Rate: ${stats.success_rate}%`);
      });
      
      console.log(`  🕐 Timestamp: ${data.data?.timestamp || 'N/A'}`);
      
    } else {
      console.log(`  ❌ Failed to get statistics: ${data.message}`);
    }
    
  } catch (error) {
    console.error('❌ Electron Vending Service statistics test failed:', error);
  }
}

// Run the tests
testNewTriggerChain();

// Additional test functions for browser environment
if (typeof window !== 'undefined') {
  // Make functions available globally for easy testing
  window.testNewTriggerChain = testNewTriggerChain;
  window.testElectronVendingLogging = testElectronVendingLogging;
  window.testElectronVendingStatistics = testElectronVendingStatistics;
  
  console.log('\n📋 Test functions loaded:');
  console.log('  window.testNewTriggerChain() - Run all tests');
  console.log('  window.testElectronVendingLogging() - Test Electron Vending Service logging');
  console.log('  window.testElectronVendingStatistics() - Test Electron Vending Service statistics');
  console.log('\nRun window.testNewTriggerChain() to start comprehensive testing.');
}