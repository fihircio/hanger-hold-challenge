// TCN Integration Service - Main integration point for TCN hardware
// Coordinates between Arduino sensors, game timer, and TCN vending machine

import { tcnSerialService } from './tcnSerialService';
import { arduinoSensorService } from './arduinoSensorService';

export interface VendingIntegrationStatus {
  tcnConnected: boolean;
  arduinoConnected: boolean;
  gameInProgress: boolean;
  lastDispenseResult: any;
  systemHealth: 'healthy' | 'warning' | 'error';
}

export class TCNIntegrationService {
  private static instance: TCNIntegrationService;
  private isInitialized: boolean = false;
  private gameInProgress: boolean = false;
  private lastDispenseResult: any = null;

  private constructor() {}

  static getInstance(): TCNIntegrationService {
    if (!TCNIntegrationService.instance) {
      TCNIntegrationService.instance = new TCNIntegrationService();
    }
    return TCNIntegrationService.instance;
  }

  /**
   * Initialize complete vending system integration
   */
  async initialize(): Promise<boolean> {
    try {
      console.log('[TCN INTEGRATION] Initializing complete vending system...');
      
      // Step 1: Initialize TCN hardware connection
      console.log('[TCN INTEGRATION] Step 1: Connecting to TCN hardware...');
      const tcnConnected = await tcnSerialService.autoConnect();
      
      if (!tcnConnected) {
        console.warn('[TCN INTEGRATION] TCN hardware not available, will use simulation');
      } else {
        console.log('[TCN INTEGRATION] TCN hardware connected successfully');
      }

      // Step 2: Initialize Arduino sensor service
      console.log('[TCN INTEGRATION] Step 2: Initializing Arduino sensors...');
      
      if (typeof window !== 'undefined' && window.electronAPI) {
        await arduinoSensorService.initialize();
        
        // Set up Arduino event handlers
        arduinoSensorService.setEventHandlers({
          onSensorStart: () => {
            console.log('[TCN INTEGRATION] Arduino: Game started');
            this.gameInProgress = true;
          },
          onSensorEnd: () => {
            console.log('[TCN INTEGRATION] Arduino: Game ended - processing prize...');
            this.handleGameEnd();
          },
          onSensorChange: (state: number) => {
            console.log(`[TCN INTEGRATION] Arduino sensor state: ${state}`);
          }
        });

        // Enable Arduino sensors
        arduinoSensorService.setEnabled(true);
        arduinoSensorService.reset();
        
        console.log('[TCN INTEGRATION] Arduino sensors initialized');
      } else {
        console.warn('[TCN INTEGRATION] Not in Electron environment - Arduino sensors unavailable');
      }

      // Step 3: Set up TCN event listeners
      this.setupTCNEventListeners();

      this.isInitialized = true;
      console.log('[TCN INTEGRATION] Integration complete');
      
      return true;
    } catch (error) {
      console.error('[TCN INTEGRATION] Initialization failed:', error);
      return false;
    }
  }

  /**
   * Set up TCN hardware event listeners
   */
  private setupTCNEventListeners(): void {
    // Listen for dispensing events
    tcnSerialService.addEventListener('DISPENSING', (event: any) => {
      console.log(`[TCN INTEGRATION] Dispensing in progress from channel ${event.channel}`);
    });

    tcnSerialService.addEventListener('DISPENSE_SUCCESS', (event: any) => {
      console.log(`[TCN INTEGRATION] Dispense successful from channel ${event.channel}`);
      this.lastDispenseResult = {
        success: true,
        channel: event.channel,
        timestamp: new Date()
      };
    });

    tcnSerialService.addEventListener('DISPENSE_FAILURE', (event: any) => {
      console.error(`[TCN INTEGRATION] Dispense failed from channel ${event.channel}: ${event.error}`);
      this.lastDispenseResult = {
        success: false,
        channel: event.channel,
        error: event.error,
        timestamp: new Date()
      };
    });

    tcnSerialService.addEventListener('ERROR', (event: any) => {
      console.error(`[TCN INTEGRATION] TCN hardware error: ${event.message}`);
    });
  }

  /**
   * Handle game end and prize dispensing
   */
  private async handleGameEnd(): Promise<void> {
    if (!this.gameInProgress) {
      console.warn('[TCN INTEGRATION] Game end triggered but no game in progress');
      return;
    }

    try {
      // Get game time from Arduino or calculate it
      // For now, we'll use a simple tier selection
      // In a real implementation, you'd get the actual game time
      
      console.log('[TCN INTEGRATION] Processing game end and prize dispensing...');
      
      // Determine prize tier (you can customize this logic)
      const tier = this.determinePrizeTier();
      
      if (tier && tcnSerialService.isConnectedToTCN()) {
        console.log(`[TCN INTEGRATION] Dispensing ${tier} prize via TCN hardware`);
        
        const result = await tcnSerialService.dispensePrizeByTier(tier);
        
        if (result.success) {
          console.log(`[TCN INTEGRATION] ${tier} prize dispensed successfully from channel ${result.channel}`);
        } else {
          console.error(`[TCN INTEGRATION] Failed to dispense ${tier} prize: ${result.error}`);
        }
      } else {
        console.log('[TCN INTEGRATION] TCN not available - skipping hardware dispensing');
      }
      
      this.gameInProgress = false;
    } catch (error) {
      console.error('[TCN INTEGRATION] Error handling game end:', error);
      this.gameInProgress = false;
    }
  }

  /**
   * Determine prize tier based on game performance
   * Customize this based on your game logic
   */
  private determinePrizeTier(): 'gold' | 'silver' | 'bronze' | null {
    // For demonstration, we'll use a random tier
    // In real implementation, this would be based on actual game time
    const random = Math.random();
    
    if (random < 0.2) {
      return 'gold'; // 20% chance
    } else if (random < 0.6) {
      return 'silver'; // 40% chance
    } else if (random < 0.9) {
      return 'bronze'; // 30% chance
    }
    
    return null; // 10% chance of no prize
  }

  /**
   * Get current integration status
   */
  getStatus(): VendingIntegrationStatus {
    const tcnStatus = tcnSerialService.getSystemStatus();
    
    return {
      tcnConnected: tcnStatus.connected,
      arduinoConnected: arduinoSensorService.isSensorEnabled(),
      gameInProgress: this.gameInProgress,
      lastDispenseResult: this.lastDispenseResult,
      systemHealth: this.calculateSystemHealth(tcnStatus)
    };
  }

  /**
   * Calculate overall system health
   */
  private calculateSystemHealth(tcnStatus: any): 'healthy' | 'warning' | 'error' {
    if (tcnStatus.connected && this.isInitialized) {
      return 'healthy';
    } else if (this.isInitialized) {
      return 'warning';
    } else {
      return 'error';
    }
  }

  /**
   * Test complete integration
   */
  async testIntegration(): Promise<boolean> {
    try {
      console.log('[TCN INTEGRATION] Testing complete integration...');
      
      // Test TCN connection
      const tcnConnected = tcnSerialService.isConnectedToTCN();
      console.log(`[TCN INTEGRATION] TCN Connection: ${tcnConnected ? 'OK' : 'FAILED'}`);
      
      // Test Arduino sensors
      const arduinoEnabled = arduinoSensorService.isSensorEnabled();
      console.log(`[TCN INTEGRATION] Arduino Sensors: ${arduinoEnabled ? 'OK' : 'DISABLED'}`);
      
      // Test dispensing (if TCN is connected)
      if (tcnConnected) {
        console.log('[TCN INTEGRATION] Testing TCN dispensing...');
        const testResult = await tcnSerialService.dispenseFromChannel(1); // Test channel 1
        
        if (testResult.success) {
          console.log('[TCN INTEGRATION] TCN dispensing test: SUCCESS');
        } else {
          console.log(`[TCN INTEGRATION] TCN dispensing test: FAILED - ${testResult.error}`);
        }
      }
      
      return tcnConnected || this.isInitialized;
    } catch (error) {
      console.error('[TCN INTEGRATION] Integration test failed:', error);
      return false;
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    try {
      console.log('[TCN INTEGRATION] Cleaning up integration service...');
      
      // Disconnect TCN
      await tcnSerialService.disconnect();
      
      // Disable Arduino sensors
      arduinoSensorService.setEnabled(false);
      arduinoSensorService.cleanup();
      
      // Reset state
      this.gameInProgress = false;
      this.lastDispenseResult = null;
      this.isInitialized = false;
      
      console.log('[TCN INTEGRATION] Cleanup complete');
    } catch (error) {
      console.error('[TCN INTEGRATION] Cleanup error:', error);
    }
  }

  /**
   * Manual prize dispensing (for testing)
   */
  async dispensePrizeManually(tier: 'gold' | 'silver' | 'bronze'): Promise<boolean> {
    try {
      console.log(`[TCN INTEGRATION] Manual ${tier} prize dispensing requested`);
      
      if (tcnSerialService.isConnectedToTCN()) {
        const result = await tcnSerialService.dispensePrizeByTier(tier);
        return result.success;
      } else {
        console.warn('[TCN INTEGRATION] TCN not connected for manual dispensing');
        return false;
      }
    } catch (error) {
      console.error('[TCN INTEGRATION] Manual dispensing error:', error);
      return false;
    }
  }
}

export const tcnIntegrationService = TCNIntegrationService.getInstance();