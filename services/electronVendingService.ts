// Electron vending service for actual serial communication

export interface ElectronVendingResult {
  success: boolean;
  command?: string;
  response?: string;
  error?: string;
}

class ElectronVendingService {
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
   * Sends command to vending machine via serial port
   */
  async dispensePrize(slotNumber: number, prizeId?: number, scoreId?: number): Promise<boolean> {
    if (!this.isElectron()) {
      console.warn('Electron vending service called outside of Electron environment');
      return false;
    }

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
}

export const electronVendingService = new ElectronVendingService();