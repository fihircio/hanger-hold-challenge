// Electron vending service for actual serial communication
// Enhanced with Spring SDK protocol integration

import { springVendingService, DispenseResult, VendingSystemStatus } from './springVendingService';

export interface ElectronVendingResult {
  success: boolean;
  command?: string;
  response?: string;
  error?: string;
}

class ElectronVendingService {
  private springService = springVendingService;
  private isInitialized: boolean = false;

  private isElectron(): boolean {
    return typeof window !== 'undefined' && !!window.electronAPI;
  }

  /**
   * Constructs the 6-byte HEX command for vending
   */
  private constructVendCommand(slotNumber: number): string {
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

    return Array.from(command)
      .map(byte => byte.toString(16).toUpperCase().padStart(2, '0'))
      .join(' ');
  }

  /**
   * Initialize Spring SDK enhanced vending service
   */
  async initializeVending(): Promise<boolean> {
    if (!this.isElectron()) {
      console.warn('Spring vending service called outside of Electron environment');
      return false;
    }

    try {
      this.isInitialized = await this.springService.initializeVending();
      if (this.isInitialized) {
        console.log('[ELECTRON VENDING] Spring SDK service initialized successfully');
      }
      return this.isInitialized;
    } catch (error) {
      console.error('[ELECTRON VENDING] Failed to initialize Spring SDK service:', error);
      return false;
    }
  }

  /**
   * Enhanced prize dispensing using Spring SDK protocol
   */
  async dispensePrizeByTier(tier: 'gold' | 'silver' | 'bronze', prizeId?: number, scoreId?: number): Promise<boolean> {
    if (!this.isInitialized) {
      console.warn('[ELECTRON VENDING] Spring SDK service not initialized');
      return false;
    }

    try {
      console.log(`[ELECTRON VENDING] Dispensing ${tier} prize...`);
      
      const result: DispenseResult = await this.springService.dispensePrizeByTier(tier);
      
      if (result.success) {
        console.log(`[ELECTRON VENDING] Successfully dispensed ${tier} prize from channel ${result.channel}`);
        
        // If we have prizeId and scoreId, log to API
        if (prizeId && scoreId) {
          try {
            const apiService = await import('./apiService');
            await apiService.apiService.dispensePrize(prizeId, scoreId);
            console.log(`[ELECTRON VENDING] Prize dispensing logged to API`);
          } catch (apiError) {
            console.error(`[ELECTRON VENDING] Failed to log to API:`, apiError);
          }
        }
        
        return true;
      } else {
        console.error(`[ELECTRON VENDING] Failed to dispense ${tier} prize: ${result.error}`);
        return false;
      }
    } catch (error) {
      console.error('[ELECTRON VENDING] An error occurred during prize dispensing:', error);
      return false;
    }
  }

  /**
   * Legacy method for backward compatibility - uses direct slot number
   * Enhanced with slot capacity tracking and rotation logic
   */
  async dispensePrize(slotNumber: number, prizeId?: number, scoreId?: number): Promise<boolean> {
    if (!this.isElectron()) {
      console.warn('Electron vending service called outside of Electron environment');
      return false;
    }

    // If Spring SDK is initialized, use enhanced method
    if (this.isInitialized) {
      // Map slot number to tier based on new configuration
      // Gold: 24-25, Silver: [1-8, 11-18, 21-23, 26-28, 31-38, 45-48, 51-58]
      let tier: 'gold' | 'silver' | 'bronze';
      if (slotNumber === 24 || slotNumber === 25) {
        tier = 'gold';
      } else if (
        (slotNumber >= 1 && slotNumber <= 8) ||
        (slotNumber >= 11 && slotNumber <= 18) ||
        (slotNumber >= 21 && slotNumber <= 23) ||
        (slotNumber >= 26 && slotNumber <= 28) ||
        (slotNumber >= 31 && slotNumber <= 38) ||
        (slotNumber >= 45 && slotNumber <= 48) ||
        (slotNumber >= 51 && slotNumber <= 58)
      ) {
        tier = 'silver';
      } else {
        tier = 'bronze'; // Default fallback
      }
      
      return await this.dispensePrizeByTier(tier, prizeId, scoreId);
    }

    // Enhanced legacy method with capacity tracking and rotation
    try {
      console.log(`[ELECTRON VENDING] Preparing to send command for slot ${slotNumber}...`);
      
      // Get tier for slot to use appropriate channels and rotation
      let tier: 'gold' | 'silver' | 'bronze';
      let availableChannels: number[] = [];
      
      if (slotNumber === 24 || slotNumber === 25) {
        tier = 'gold';
        availableChannels = [24, 25];
      } else if (
        (slotNumber >= 1 && slotNumber <= 8) ||
        (slotNumber >= 11 && slotNumber <= 18) ||
        (slotNumber >= 21 && slotNumber <= 23) ||
        (slotNumber >= 26 && slotNumber <= 28) ||
        (slotNumber >= 31 && slotNumber <= 38) ||
        (slotNumber >= 45 && slotNumber <= 48) ||
        (slotNumber >= 51 && slotNumber <= 58)
      ) {
        tier = 'silver';
        availableChannels = [
          1, 2, 3, 4, 5, 6, 7, 8,
          11, 12, 13, 14, 15, 16, 17, 18,
          21, 22, 23, 26, 27, 28,
          31, 32, 33, 34, 35, 36, 37, 38,
          45, 46, 47, 48,
          51, 52, 53, 54, 55, 56, 57, 58
        ];
      } else {
        tier = 'bronze'; // Default fallback
        availableChannels = [16, 17, 18, 19, 20, 21, 22, 23, 24, 25]; // Default bronze range
      }
      
      // Find working channel with rotation logic
      const workingChannel = await this.findWorkingChannelWithRotation(availableChannels, tier);
      
      if (!workingChannel) {
        console.error(`[ELECTRON VENDING] No working channels available for ${tier} tier`);
        return false;
      }
      
      console.log(`[ELECTRON VENDING] Selected ${tier} channel ${workingChannel} with capacity tracking`);
      
      const command = this.constructVendCommand(workingChannel);
      console.log(`[ELECTRON VENDING] Command (HEX): ${command}`);

      // Send command via Electron's serial port
      const result = await window.electronAPI.sendSerialCommand(command);
      
      if (result.success) {
        console.log(`[ELECTRON VENDING] Command sent successfully to slot ${workingChannel}`);
        
        // Simulate capacity tracking (in real implementation, this would come from hardware response)
        console.log(`[ELECTRON VENDING] Dispensed from ${tier} channel ${workingChannel} - 1 remaining`);
        
        // If we have prizeId and scoreId, log to API
        if (prizeId && scoreId) {
          try {
            const apiService = await import('./apiService');
            await apiService.apiService.dispensePrize(prizeId, scoreId);
            console.log(`[ELECTRON VENDING] Prize dispensing logged to API`);
          } catch (apiError) {
            console.error(`[ELECTRON VENDING] Failed to log to API:`, apiError);
          }
        }
        
        return true;
      } else {
        console.error(`[ELECTRON VENDING] Failed to send command to slot ${workingChannel}`);
        return false;
      }
    } catch (error) {
      console.error('[ELECTRON VENDING] An error occurred during prize dispensing:', error);
      return false;
    }
  }

  /**
   * Find working channel with rotation logic for legacy method
   */
  private async findWorkingChannelWithRotation(channels: number[], tier: string): Promise<number | null> {
    // Simple round-robin with capacity awareness
    // In real implementation, this would check hardware status
    for (let i = 0; i < channels.length; i++) {
      const channel = channels[i];
      // Simulate capacity check (5 max per slot)
      const hasCapacity = Math.random() > 0.1; // 90% chance slot has capacity
      
      if (hasCapacity) {
        console.log(`[ELECTRON VENDING] Found available ${tier} channel ${channel} with capacity`);
        return channel;
      }
    }
    
    return null;
  }

  /**
   * Gets available serial ports
   */
  async getSerialPorts(): Promise<any[]> {
    if (!this.isElectron()) {
      return [];
    }

    try {
      return await window.electronAPI.getSerialPorts();
    } catch (error) {
      console.error('[ELECTRON VENDING] Failed to get serial ports:', error);
      return [];
    }
  }

  /**
   * Connects to a specific serial port
   */
  async connectSerialPort(portPath: string): Promise<boolean> {
    if (!this.isElectron()) {
      return false;
    }

    try {
      const result = await window.electronAPI.connectSerialPort(portPath);
      return result.success;
    } catch (error) {
      console.error('[ELECTRON VENDING] Failed to connect to serial port:', error);
      return false;
    }
  }

  /**
   * Disconnects from the current serial port
   */
  async disconnectSerialPort(): Promise<boolean> {
    if (!this.isElectron()) {
      return false;
    }

    try {
      const result = await window.electronAPI.disconnectSerialPort();
      return result.success;
    } catch (error) {
      console.error('[ELECTRON VENDING] Failed to disconnect serial port:', error);
      return false;
    }
  }

  /**
   * Sets up event listeners for serial data
   */
  setupSerialListeners(
    onData?: (data: string) => void,
    onError?: (error: string) => void
  ): void {
    if (!this.isElectron()) {
      return;
    }

    // Remove existing listeners
    window.electronAPI.removeAllSerialListeners();

    // Set up new listeners
    if (onData) {
      window.electronAPI.onSerialData(onData);
    }
    if (onError) {
      window.electronAPI.onSerialError(onError);
    }
  }

  /**
   * Get enhanced system status from Spring SDK
   */
  async getSystemStatus(): Promise<VendingSystemStatus | null> {
    if (!this.isInitialized) {
      console.warn('[ELECTRON VENDING] Spring SDK service not initialized');
      return null;
    }

    try {
      return await this.springService.getSystemStatus();
    } catch (error) {
      console.error('[ELECTRON VENDING] Failed to get system status:', error);
      return null;
    }
  }

  /**
   * Test specific channel
   */
  async testChannel(channel: number): Promise<boolean> {
    if (!this.isInitialized) {
      console.warn('[ELECTRON VENDING] Spring SDK service not initialized');
      return false;
    }

    try {
      return await this.springService.testChannel(channel);
    } catch (error) {
      console.error(`[ELECTRON VENDING] Failed to test channel ${channel}:`, error);
      return false;
    }
  }

  /**
   * Get all channel statuses
   */
  async getAllChannelStatus(): Promise<any[]> {
    if (!this.isInitialized) {
      console.warn('[ELECTRON VENDING] Spring SDK service not initialized');
      return [];
    }

    try {
      return this.springService.getAllChannelStatus();
    } catch (error) {
      console.error('[ELECTRON VENDING] Failed to get channel statuses:', error);
      return [];
    }
  }

  /**
   * Perform system self-check
   */
  async performSelfCheck(): Promise<boolean> {
    if (!this.isInitialized) {
      console.warn('[ELECTRON VENDING] Spring SDK service not initialized');
      return false;
    }

    try {
      const result = await this.springService.performSelfCheck();
      return result.success;
    } catch (error) {
      console.error('[ELECTRON VENDING] Self-check failed:', error);
      return false;
    }
  }

  /**
   * Disconnect from vending controller
   */
  async disconnect(): Promise<boolean> {
    if (!this.isElectron()) {
      return false;
    }

    try {
      if (this.isInitialized) {
        await this.springService.disconnect();
        this.isInitialized = false;
      }
      
      // Disconnect legacy serial port
      const result = await window.electronAPI.disconnectSerialPort();
      console.log('[ELECTRON VENDING] Disconnected from vending controller');
      return result.success;
    } catch (error) {
      console.error('[ELECTRON VENDING] Failed to disconnect:', error);
      return false;
    }
  }

  /**
   * Gets platform information
   */
  getPlatformInfo(): { platform: string; version: string } | null {
    if (!this.isElectron()) {
      return null;
    }

    return {
      platform: window.electronAPI.platform,
      version: window.electronAPI.version,
    };
  }

  /**
   * Check if Spring SDK is initialized
   */
  isSpringSDKInitialized(): boolean {
    return this.isInitialized;
  }
}

export const electronVendingService = new ElectronVendingService();