// Test script to verify slot capacity tracking and rotation logic
import { springVendingService } from './springVendingService';

const testSlotCapacityAndRotation = async () => {
  console.log('=== Testing Slot Capacity and Rotation Logic ===');
  
  try {
    // Initialize the vending service
    console.log('\n--- Initializing Vending Service ---');
    const initialized = await springVendingService.initializeVending();
    console.log('Service initialized:', initialized);
    
    if (!initialized) {
      console.error('Failed to initialize vending service');
      return;
    }
    
    // Test silver tier dispensing multiple times to verify rotation
    console.log('\n--- Testing Silver Tier Rotation ---');
    console.log('Dispensing 7 silver prizes to test rotation...');
    
    for (let i = 1; i <= 7; i++) {
      console.log(`\n--- Silver Prize #${i} ---`);
      
      const result = await springVendingService.dispensePrizeByTier('silver');
      
      if (result.success) {
        console.log(`✓ Success: Channel ${result.channel} (capacity should decrease)`);
        
        // Check channel status after dispensing
        const status = springVendingService.getChannelStatus(result.channel);
        if (status) {
          console.log(`  Remaining Capacity: ${status.remainingCapacity}/5`);
          console.log(`  Total Dispensed: ${status.totalDispensed}`);
        }
      } else {
        console.log(`✗ Failed: ${result.error}`);
      }
      
      // Small delay between operations
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Test gold tier dispensing
    console.log('\n--- Testing Gold Tier ---');
    console.log('Dispensing 2 gold prizes...');
    
    for (let i = 1; i <= 2; i++) {
      console.log(`\n--- Gold Prize #${i} ---`);
      
      const result = await springVendingService.dispensePrizeByTier('gold');
      
      if (result.success) {
        console.log(`✓ Success: Channel ${result.channel}`);
        
        const status = springVendingService.getChannelStatus(result.channel);
        if (status) {
          console.log(`  Remaining Capacity: ${status.remainingCapacity}/5`);
          console.log(`  Total Dispensed: ${status.totalDispensed}`);
        }
      } else {
        console.log(`✗ Failed: ${result.error}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Test capacity limits (simulate empty slot)
    console.log('\n--- Testing Capacity Limits ---');
    console.log('Checking system status after multiple dispensing...');
    
    const systemStatus = await springVendingService.getSystemStatus();
    console.log(`Total Channels: ${systemStatus.totalChannels}`);
    console.log(`Healthy Channels: ${systemStatus.healthyChannels}`);
    
    // Display all channel statuses
    console.log('\n--- All Channel Statuses ---');
    const allStatuses = springVendingService.getAllChannelStatus();
    
    const silverChannels = [
      1, 2, 3, 4, 5, 6, 7, 8,
      11, 12, 13, 14, 15, 16, 17, 18,
      21, 22, 23, 26, 27, 28,
      31, 32, 33, 34, 35, 36, 37, 38,
      45, 46, 47, 48,
      51, 52, 53, 54, 55, 56, 57, 58
    ];
    
    console.log('\nSilver Channel Statuses:');
    silverChannels.forEach(channel => {
      const status = springVendingService.getChannelStatus(channel);
      if (status) {
        console.log(`  Slot ${channel.toString().padStart(2, '0')}: Capacity ${status.remainingCapacity}/5, Dispensed ${status.totalDispensed}, Healthy: ${status.isHealthy}`);
      }
    });
    
    const goldChannels = [24, 25];
    console.log('\nGold Channel Statuses:');
    goldChannels.forEach(channel => {
      const status = springVendingService.getChannelStatus(channel);
      if (status) {
        console.log(`  Slot ${channel}: Capacity ${status.remainingCapacity}/5, Dispensed ${status.totalDispensed}, Healthy: ${status.isHealthy}`);
      }
    });
    
    console.log('\n=== Slot Capacity and Rotation Test Complete ===');
    
  } catch (error) {
    console.error('Test failed with error:', error);
  } finally {
    // Cleanup
    await springVendingService.disconnect();
    console.log('Vending service disconnected');
  }
};

// Export for use in testing
export { testSlotCapacityAndRotation };

// Auto-run if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  (window as any).testSlotCapacityAndRotation = testSlotCapacityAndRotation;
  console.log('Test function available as window.testSlotCapacityAndRotation()');
} else if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = { testSlotCapacityAndRotation };
}