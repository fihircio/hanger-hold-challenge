// Test script to verify new slot configuration
import { springVendingService } from './springVendingService';
import { tcnSerialService } from './tcnSerialService';

// Test the new slot configuration
const testSlotConfiguration = () => {
  console.log('=== Testing New Slot Configuration ===');
  
  // Test Spring Vending Service
    console.log('\n--- Spring Vending Service ---');
    springVendingService.getSystemStatus().then(springStatus => {
      console.log('Total channels:', springStatus.totalChannels);
      console.log('Healthy channels:', springStatus.healthyChannels);
    });
  
  // Test specific slot mappings
  console.log('\n--- Slot Mappings ---');
  console.log('Gold slots: 24, 25');
  console.log('Silver slots: [1-8, 11-18, 21-23, 26-28, 31-38, 45-48, 51-58]');
  
  // Test HEX command generation for key slots
  console.log('\n--- HEX Commands Test ---');
  const testSlots = [1, 24, 25, 58]; // Test first silver, both gold, and last silver
  
  testSlots.forEach(slot => {
    const checksum = (0xFF - slot) & 0xFF;
    const hexCommand = `00 FF ${slot.toString(16).toUpperCase().padStart(2, '0')} ${checksum.toString(16).toUpperCase().padStart(2, '0')} AA 55`;
    console.log(`Slot ${slot}: ${hexCommand}`);
  });
  
  // Test TCN Serial Service
  console.log('\n--- TCN Serial Service ---');
  const tcnStatus = tcnSerialService.getSystemStatus();
  console.log('TCN Total channels:', tcnStatus.totalChannels);
  console.log('TCN Healthy channels:', tcnStatus.healthyChannels);
  console.log('TCN Connected:', tcnStatus.connected);
  
  console.log('\n=== Slot Configuration Test Complete ===');
};

// Export for use in testing
export { testSlotConfiguration };

// Auto-run if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  (window as any).testSlotConfiguration = testSlotConfiguration;
  console.log('Test function available as window.testSlotConfiguration()');
} else if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = { testSlotConfiguration };
}