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
   */
  async dispensePrize(slotNumber: number, prizeId?: number, scoreId?: number): Promise<boolean> {
    if (!this.isElectron()) {
      console.warn('Electron vending service called outside of Electron environment');
      return false;
    }

    // If Spring SDK is initialized, use enhanced method
    if (this.isInitialized) {
      // Map slot number to tier (1-5: gold, 6-15: silver, 16-25: bronze)
      let tier: 'gold' | 'silver' | 'bronze';
      if (slotNumber <= 5) {
        tier = 'gold';
      } else if (slotNumber <= 15) {
        tier = 'silver';
      } else {
        tier = 'bronze';
      }
      
      return await this.dispensePrizeByTier(tier, prizeId, scoreId);
    }

    // Fallback to original method
    try {
      const command = this.constructVendCommand(slotNumber);
      console.log(`[ELECTRON VENDING] Preparing to send command for slot ${slotNumber}...`);
      console.log(`[ELECTRON VENDING] Command (HEX): ${command}`);

      // Send command via Electron's serial port
      const result = await window.electronAPI.sendSerialCommand(command);
      
      if (result.success) {
        console.log(`[ELECTRON VENDING] Command sent successfully to slot ${slotNumber}`);
        
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
        console.error(`[ELECTRON VENDING] Failed to send command to slot ${slotNumber}`);
        return false;
      }
    } catch (error) {
      console.error('[ELECTRON VENDING] An error occurred during prize dispensing:', error);
      return false;
    }
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