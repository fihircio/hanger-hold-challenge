// This service handles communication with a vending machine via a serial protocol.
// Enhanced with Spring SDK protocol integration for better error handling and status monitoring

import { electronVendingService } from './electronVendingService';

/**
 * Constructs a 6-byte HEX command to vend an item from a specific slot.
 * Protocol based on "Vend Protocol" document:
 * - Byte 1: 0x00 (Command)
 * - Byte 2: 0xFF (Fixed)
 * - Byte 3: Slot number (1-based)
 * - Byte 4: Checksum (0xFF - Slot Number)
 * - Byte 5: 0xAA (Delivery detection ON)
 * - Byte 6: 0x55 (Delivery detection ON)
 * @param slotNumber The slot to dispense from (1-80).
 * @returns A string representing the HEX command.
 */
const constructVendCommand = (slotNumber: number): string => {
  if (slotNumber < 1 || slotNumber > 80) {
    throw new Error('Slot number must be between 1 and 80.');
  }

  const command = new Uint8Array(6);
  command[0] = 0x00;
  command[1] = 0xFF;
  command[2] = slotNumber;
  command[3] = 0xFF - slotNumber;
  command[4] = 0xAA;
  command[5] = 0x55;

  return Array.from(command).map(byte => byte.toString(16).toUpperCase().padStart(2, '0')).join(' ');
};

/**
 * Enhanced prize dispensing using Spring SDK protocol
 * @param tier The prize tier (gold, silver, bronze)
 * @param prizeId Optional prize ID for API logging
 * @param scoreId Optional score ID for API logging
 */
export const dispensePrizeByTier = async (tier: 'gold' | 'silver' | 'bronze', prizeId?: number, scoreId?: number): Promise<boolean> => {
  // Check if we're running in Electron environment
  if (typeof window !== 'undefined' && window.electronAPI) {
    try {
      // Initialize Spring SDK if not already done
      if (!electronVendingService.isSpringSDKInitialized()) {
        const initialized = await electronVendingService.initializeVending();
        if (!initialized) {
          console.error('[VENDING SERVICE] Failed to initialize Spring SDK');
          return false;
        }
      }
      
      return await electronVendingService.dispensePrizeByTier(tier, prizeId, scoreId);
    } catch (error) {
      console.error('[VENDING SERVICE] Failed to use enhanced vending service:', error);
      // Fall back to simulation
    }
  }

  // Fallback to simulation
  try {
    console.log(`[VENDING SIMULATION] Dispensing ${tier} prize...`);
    
    // Map tier to slot range for simulation
    let slotNumber: number;
    switch (tier) {
      case 'gold':
        slotNumber = Math.floor(Math.random() * 5) + 1; // 1-5
        break;
      case 'silver':
        slotNumber = Math.floor(Math.random() * 10) + 6; // 6-15
        break;
      case 'bronze':
        slotNumber = Math.floor(Math.random() * 10) + 16; // 16-25
        break;
      default:
        throw new Error(`Unknown tier: ${tier}`);
    }

    const command = constructVendCommand(slotNumber);
    console.log(`[VENDING SIMULATION] Preparing to send command for slot ${slotNumber}...`);
    console.log(`[VENDING SIMULATION] Command (HEX): ${command}`);

    // --- SIMULATED SERIAL COMMUNICATION ---
    console.log('[VENDING SIMULATION] Sending command to serial port...');
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
    console.log('[VENDING SIMULATION] Command sent.');

    // Simulate waiting for and receiving a response
    console.log('[VENDING SIMULATION] Waiting for response...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate vend time
    const simulatedResponse = '00 5D 00 AA 07'; // A successful response
    console.log(`[VENDING SIMULATION] Response received (HEX): ${simulatedResponse}`);
    console.log(`[VENDING SIMULATION] Slot ${slotNumber} dispensed successfully.`);
    // --- END SIMULATION ---
    
    // If we have prizeId and scoreId, try to use API for logging
    if (prizeId && scoreId) {
      try {
        const apiService = await import('./apiService');
        const result = await apiService.apiService.dispensePrize(prizeId, scoreId);
        return result.success;
      } catch (error) {
        console.error('[VENDING SERVICE] API dispensing failed, falling back to simulation:', error);
        // Continue with simulation if API fails
      }
    }
    
    return true; // Indicate success
  } catch (error) {
    console.error('[VENDING SIMULATION] An error occurred during prize dispensing:', error);
    return false;
  }
};

/**
 * Sends a command to the vending machine to dispense a prize.
 * @param slotNumber The slot number of the prize to dispense.
 * @param prizeId Optional prize ID for API logging
 * @param scoreId Optional score ID for API logging
 */
export const dispensePrize = async (slotNumber: number, prizeId?: number, scoreId?: number): Promise<boolean> => {
  // Check if we're running in Electron environment
  if (typeof window !== 'undefined' && window.electronAPI) {
    try {
      // Try to use enhanced Spring SDK service first
      if (electronVendingService.isSpringSDKInitialized()) {
        // Map slot number to tier
        let tier: 'gold' | 'silver' | 'bronze';
        if (slotNumber <= 5) {
          tier = 'gold';
        } else if (slotNumber <= 15) {
          tier = 'silver';
        } else {
          tier = 'bronze';
        }
        
        return await electronVendingService.dispensePrizeByTier(tier, prizeId, scoreId);
      } else {
        // Fallback to legacy method
        return await electronVendingService.dispensePrize(slotNumber, prizeId, scoreId);
      }
    } catch (error) {
      console.error('[VENDING SERVICE] Failed to use Electron vending service:', error);
      // Fall back to simulation
    }
  }
  try {
    const command = constructVendCommand(slotNumber);
    console.log(`[VENDING SIMULATION] Preparing to send command for slot ${slotNumber}...`);
    console.log(`[VENDING SIMULATION] Command (HEX): ${command}`);

    // --- SIMULATED SERIAL COMMUNICATION ---
    // In a real application, you would send the `command` byte array
    // over the serial port here (e.g. 9600, 8, N, 1).
    console.log('[VENDING SIMULATION] Sending command to serial port...');
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
    console.log('[VENDING SIMULATION] Command sent.');

    // Simulate waiting for and receiving a response.
    // Example success response: Motor OK, delivery detected -> 00 5D 00 AA 07
    console.log('[VENDING SIMULATION] Waiting for response...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate vend time
    const simulatedResponse = '00 5D 00 AA 07'; // A successful response
    console.log(`[VENDING SIMULATION] Response received (HEX): ${simulatedResponse}`);
    console.log(`[VENDING SIMULATION] Slot ${slotNumber} dispensed successfully.`);
    // --- END SIMULATION ---
    
    // If we have prizeId and scoreId, try to use API for logging
    if (prizeId && scoreId) {
      try {
        const apiService = await import('./apiService');
        const result = await apiService.apiService.dispensePrize(prizeId, scoreId);
        return result.success;
      } catch (error) {
        console.error('[VENDING SERVICE] API dispensing failed, falling back to simulation:', error);
        // Continue with simulation if API fails
      }
    }
    
    return true; // Indicate success
  } catch (error) {
    console.error('[VENDING SIMULATION] An error occurred during prize dispensing:', error);
    return false;
  }
};

/**
 * Get enhanced vending system status
 */
export const getVendingSystemStatus = async (): Promise<any> => {
  if (typeof window !== 'undefined' && window.electronAPI) {
    try {
      if (electronVendingService.isSpringSDKInitialized()) {
        return await electronVendingService.getSystemStatus();
      } else {
        return {
          connected: false,
          message: 'Spring SDK not initialized'
        };
      }
    } catch (error) {
      console.error('[VENDING SERVICE] Failed to get system status:', error);
      return {
        connected: false,
        error: error.message
      };
    }
  }

  // Simulation fallback
  return {
    connected: false,
    message: 'Simulation mode - no hardware connection'
  };
};

/**
 * Initialize enhanced vending system
 */
export const initializeVendingSystem = async (): Promise<boolean> => {
  if (typeof window !== 'undefined' && window.electronAPI) {
    try {
      return await electronVendingService.initializeVending();
    } catch (error) {
      console.error('[VENDING SERVICE] Failed to initialize vending system:', error);
      return false;
    }
  }

  console.log('[VENDING SERVICE] Running in simulation mode - no hardware initialization needed');
  return true;
};
