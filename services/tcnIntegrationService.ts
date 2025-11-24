// TCN Integration Service - Main integration point for TCN hardware
// Coordinates between Arduino sensors, game timer, and TCN vending machine

import { tcnSerialService } from './tcnSerialService';
import { arduinoSensorService } from './arduinoSensorService';
import { inventoryStorageService } from './inventoryStorageService';

// API base URL configuration
const API_BASE_URL = (window as any).process?.env?.REACT_APP_API_URL || 'https://vendinghanger.eeelab.xyz/apiendpoints.php';

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
  
  // Slot tracking for inventory management (now using persistent storage)
  private maxDispensesPerSlot: number = 5;
  private slotCache: Map<number, number> = new Map(); // Cache for performance
  private cacheValid: boolean = false;
  
  // Updated slot configuration for 2-tier system
  private readonly prizeChannels = {
    gold: [24, 25],
    silver: [
      1, 2, 3, 4, 5, 6, 7, 8,
      11, 12, 13, 14, 15, 16, 17, 18,
      21, 22, 23, 26, 27, 28,
      31, 32, 33, 34, 35, 36, 37, 38,
      45, 46, 47, 48,
      51, 52, 53, 54, 55, 56, 57, 58
    ]
  };

  private constructor() {
    console.log(`[TCN INTEGRATION] Initialized with ${this.prizeChannels.gold.length} gold, ${this.prizeChannels.silver.length} silver slots`);
  }

  /**
   * Initialize persistent storage and load existing data
   */
  async initialize(): Promise<boolean> {
    try {
      console.log('[TCN INTEGRATION] Initializing complete vending system...');
      
      // Initialize persistent storage first
      const storageInitialized = await inventoryStorageService.initialize();
      if (!storageInitialized) {
        console.error('[TCN INTEGRATION] Failed to initialize storage service');
        return false;
      }
      
      // Load existing slot data
      await this.loadSlotData();
      
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
   * Load slot data from persistent storage
   */
  private async loadSlotData(): Promise<void> {
    try {
      const slotInventory = await inventoryStorageService.getAllSlotInventory();
      
      // Update cache with loaded data
      this.slotCache.clear();
      for (const slotData of slotInventory) {
        this.slotCache.set(slotData.slot, slotData.dispenseCount);
      }
      
      // Initialize any missing slots (new configuration)
      const allSlots = [...this.prizeChannels.gold, ...this.prizeChannels.silver];
      for (const slot of allSlots) {
        if (!this.slotCache.has(slot)) {
          this.slotCache.set(slot, 0);
          // Initialize in persistent storage
          await inventoryStorageService.updateSlotInventory({
            slot,
            tier: this.prizeChannels.gold.includes(slot) ? 'gold' : 'silver',
            dispenseCount: 0,
            maxDispenses: this.maxDispensesPerSlot,
            updatedAt: new Date().toISOString()
          });
        }
      }
      
      this.cacheValid = true;
      console.log(`[TCN INTEGRATION] Loaded ${slotInventory.length} slot records from storage`);
    } catch (error) {
      console.error('[TCN INTEGRATION] Failed to load slot data:', error);
      // Fallback to empty cache
      this.slotCache.clear();
      const allSlots = [...this.prizeChannels.gold, ...this.prizeChannels.silver];
      for (const slot of allSlots) {
        this.slotCache.set(slot, 0);
      }
    }
  }

  /**
   * Invalidate cache (call after updating persistent storage)
   */
  private invalidateCache(): void {
    this.cacheValid = false;
  }

  /**
   * Ensure cache is valid
   */
  private async ensureCacheValid(): Promise<void> {
    if (!this.cacheValid) {
      await this.loadSlotData();
    }
  }

  static getInstance(): TCNIntegrationService {
    if (!TCNIntegrationService.instance) {
      TCNIntegrationService.instance = new TCNIntegrationService();
    }
    return TCNIntegrationService.instance;
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
     * Handle game end and prize dispensing with automatic slot progression
     */
  private async handleGameEnd(): Promise<void> {
    if (!this.gameInProgress) {
      console.warn('[TCN INTEGRATION] Game end triggered but no game in progress');
      return;
    }

    try {
      console.log('[TCN INTEGRATION] Processing game end and prize dispensing...');
      
      // Determine prize tier (updated for 2-tier system)
      const tier = this.determinePrizeTier();
      
      if (tier) {
        // Get next available slot for this tier with automatic progression
        const selectedSlot = await this.getNextAvailableSlot(tier);
        
        if (selectedSlot) {
          console.log(`[TCN INTEGRATION] Selected slot ${selectedSlot} for ${tier} prize`);
          
          if (tcnSerialService.isConnectedToTCN()) {
            console.log(`[TCN INTEGRATION] Dispensing ${tier} prize via TCN hardware from slot ${selectedSlot}`);
            
            const result = await tcnSerialService.dispenseFromChannel(selectedSlot);
            
            if (result.success) {
              console.log(`[TCN INTEGRATION] ${tier} prize dispensed successfully from slot ${selectedSlot}`);
              // Increment slot count after successful dispensing
              await this.incrementSlotCount(selectedSlot);
              
              // Log to backend if available
              await this.logDispensingToServer(selectedSlot, tier, true);
            } else {
              console.error(`[TCN INTEGRATION] Failed to dispense ${tier} prize from slot ${selectedSlot}: ${result.error}`);
              
              // Log failed attempt
              await this.logDispensingToServer(selectedSlot, tier, false, result.error);
            }
          } else {
            console.log('[TCN INTEGRATION] TCN not available - simulating dispensing');
            // Simulate dispensing and increment count
            await this.incrementSlotCount(selectedSlot);
            await this.logDispensingToServer(selectedSlot, tier, true, 'Simulated - TCN not connected');
          }
        } else {
          console.warn(`[TCN INTEGRATION] No available slots for ${tier} tier - machine may be empty`);
          // Log out of stock situation
          await this.logOutOfStockToServer(tier);
        }
      } else {
        console.log('[TCN INTEGRATION] No prize awarded - game time too short');
      }
      
      this.gameInProgress = false;
    } catch (error) {
      console.error('[TCN INTEGRATION] Error handling game end:', error);
      this.gameInProgress = false;
    }
  }

  /**
     * Determine prize tier based on game performance
     * Updated for 2-tier system (gold/silver only)
     */
  private determinePrizeTier(): 'gold' | 'silver' | null {
    // For demonstration, we'll use a random tier
    // In real implementation, this would be based on actual game time
    const random = Math.random();
    
    if (random < 0.15) {
      return 'gold'; // 15% chance (rarer)
    } else if (random < 0.85) {
      return 'silver'; // 70% chance
    }
    
    return null; // 15% chance of no prize
  }

  /**
   * Get current slot inventory for all slots
   */
  async getSlotInventory(): Promise<{[key: number]: number}> {
    await this.ensureCacheValid();
    const inventory: {[key: number]: number} = {};
    for (const [slot, count] of this.slotCache.entries()) {
      inventory[slot] = count;
    }
    return inventory;
  }

  /**
   * Get slots that need refilling based on threshold
   * @param threshold Usage threshold (0.8 = 80% used)
   */
  async getSlotsNeedingRefill(threshold: number = 0.8): Promise<number[]> {
    await this.ensureCacheValid();
    const needingRefill: number[] = [];
    const thresholdCount = Math.floor(this.maxDispensesPerSlot * threshold);
    
    for (const [slot, count] of this.slotCache.entries()) {
      if (count >= thresholdCount) {
        needingRefill.push(slot);
      }
    }
    
    return needingRefill.sort((a, b) => a - b);
  }

  /**
   * Reset all slot counts to zero
   */
  async resetSlotCounts(): Promise<void> {
    try {
      // Reset in persistent storage
      await inventoryStorageService.resetAllSlotCounts();
      
      // Reset cache
      for (const slot of this.slotCache.keys()) {
        this.slotCache.set(slot, 0);
      }
      
      console.log('[TCN INTEGRATION] All slot counts reset to zero');
    } catch (error) {
      console.error('[TCN INTEGRATION] Failed to reset slot counts:', error);
    }
  }

  /**
   * Increment dispense count for a specific slot
   * @param slot Slot number to increment
   * @returns New count after increment
   */
  async incrementSlotCount(slot: number): Promise<number> {
    try {
      // Update in persistent storage
      const tier = this.prizeChannels.gold.includes(slot) ? 'gold' : 'silver';
      const updatedData = await inventoryStorageService.incrementSlotCount(slot, tier);
      
      // Update cache
      this.slotCache.set(slot, updatedData.dispenseCount);
      
      console.log(`[TCN INTEGRATION] Slot ${slot} count incremented: ${updatedData.dispenseCount}/${updatedData.maxDispenses}`);
      return updatedData.dispenseCount;
    } catch (error) {
      console.error('[TCN INTEGRATION] Failed to increment slot count:', error);
      // Fallback to cache update
      const currentCount = this.slotCache.get(slot) || 0;
      const newCount = Math.min(currentCount + 1, this.maxDispensesPerSlot);
      this.slotCache.set(slot, newCount);
      return newCount;
    }
  }

  /**
   * Get next available slot for a tier with automatic progression
   * @param tier Prize tier ('gold' or 'silver')
   * @returns Next available slot number or null if none available
   */
  async getNextAvailableSlot(tier: 'gold' | 'silver'): Promise<number | null> {
    await this.ensureCacheValid();
    const availableSlots = this.prizeChannels[tier];
    
    // Filter slots that haven't reached max capacity
    const availableSlotsWithCapacity = availableSlots.filter(slot => {
      const count = this.slotCache.get(slot) || 0;
      return count < this.maxDispensesPerSlot;
    });
    
    if (availableSlotsWithCapacity.length === 0) {
      console.warn(`[TCN INTEGRATION] No available slots for ${tier} tier`);
      return null;
    }
    
    // Sort by dispense count (ascending) to use least used slots first
    availableSlotsWithCapacity.sort((a, b) => {
      const countA = this.slotCache.get(a) || 0;
      const countB = this.slotCache.get(b) || 0;
      return countA - countB;
    });
    
    const selectedSlot = availableSlotsWithCapacity[0];
    console.log(`[TCN INTEGRATION] Selected slot ${selectedSlot} for ${tier} tier (count: ${this.slotCache.get(selectedSlot)})`);
    
    return selectedSlot;
  }

  /**
   * Get statistics for all slots
   */
  async getSlotStatistics(): Promise<{
    totalSlots: number;
    goldSlots: number;
    silverSlots: number;
    totalDispensed: number;
    goldDispensed: number;
    silverDispensed: number;
    emptySlots: number;
    slotsNeedingRefill: number;
  }> {
    await this.ensureCacheValid();
    const goldSlots = this.prizeChannels.gold.length;
    const silverSlots = this.prizeChannels.silver.length;
    const totalSlots = goldSlots + silverSlots;
    
    let totalDispensed = 0;
    let goldDispensed = 0;
    let silverDispensed = 0;
    let emptySlots = 0;
    let slotsNeedingRefill = 0;
    
    // Gold statistics
    for (const slot of this.prizeChannels.gold) {
      const count = this.slotCache.get(slot) || 0;
      goldDispensed += count;
      if (count >= this.maxDispensesPerSlot) emptySlots++;
      if (count >= Math.floor(this.maxDispensesPerSlot * 0.8)) slotsNeedingRefill++;
    }
    
    // Silver statistics
    for (const slot of this.prizeChannels.silver) {
      const count = this.slotCache.get(slot) || 0;
      silverDispensed += count;
      if (count >= this.maxDispensesPerSlot) emptySlots++;
      if (count >= Math.floor(this.maxDispensesPerSlot * 0.8)) slotsNeedingRefill++;
    }
    
    totalDispensed = goldDispensed + silverDispensed;
    
    return {
      totalSlots,
      goldSlots,
      silverSlots,
      totalDispensed,
      goldDispensed,
      silverDispensed,
      emptySlots,
      slotsNeedingRefill
    };
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
    * Manual prize dispensing with automatic slot selection (for testing)
    */
  async dispensePrizeManually(tier: 'gold' | 'silver'): Promise<boolean> {
    try {
      console.log(`[TCN INTEGRATION] Manual ${tier} prize dispensing requested`);
      
      // Get next available slot for this tier
      const selectedSlot = await this.getNextAvailableSlot(tier);
      
      if (!selectedSlot) {
        console.warn(`[TCN INTEGRATION] No available slots for manual ${tier} dispensing`);
        return false;
      }
      
      console.log(`[TCN INTEGRATION] Manual dispensing from slot ${selectedSlot} for ${tier} tier`);
      
      if (tcnSerialService.isConnectedToTCN()) {
        const result = await tcnSerialService.dispenseFromChannel(selectedSlot);
        
        if (result.success) {
          console.log(`[TCN INTEGRATION] Manual ${tier} prize dispensed successfully from slot ${selectedSlot}`);
          await this.incrementSlotCount(selectedSlot);
          await this.logDispensingToServer(selectedSlot, tier, true, 'Manual dispensing');
          return true;
        } else {
          console.error(`[TCN INTEGRATION] Manual ${tier} dispensing failed from slot ${selectedSlot}: ${result.error}`);
          await this.logDispensingToServer(selectedSlot, tier, false, result.error);
          return false;
        }
      } else {
        console.warn('[TCN INTEGRATION] TCN not connected for manual dispensing - simulating');
        await this.incrementSlotCount(selectedSlot);
        await this.logDispensingToServer(selectedSlot, tier, true, 'Manual dispensing - Simulated');
        return true;
      }
    } catch (error) {
      console.error('[TCN INTEGRATION] Manual dispensing error:', error);
      return false;
    }
  }

  /**
   * Log dispensing information to server (with offline support)
   */
  private async logDispensingToServer(slot: number, tier: string, success: boolean, error?: string): Promise<void> {
    try {
      const logEntry = {
        slot,
        tier,
        success,
        error,
        timestamp: new Date().toISOString(),
        source: 'tcn_integration'
      };
      
      // Try to send to server, but don't wait for it (non-blocking)
      this.sendLogToServer(`${API_BASE_URL}/api/inventory/log-dispensing`, logEntry).catch(err => {
        console.warn('[TCN INTEGRATION] Failed to log dispensing to server (will queue for later):', err);
        this.queueOfflineLog(logEntry);
      });
    } catch (error) {
      console.error('[TCN INTEGRATION] Error creating dispensing log:', error);
    }
  }

  /**
   * Log out of stock situation to server
   */
  private async logOutOfStockToServer(tier: string): Promise<void> {
    try {
      const logEntry = {
        tier,
        outOfStock: true,
        timestamp: new Date().toISOString(),
        source: 'tcn_integration'
      };
      
      this.sendLogToServer(`${API_BASE_URL}/api/inventory/log-out-of-stock`, logEntry).catch(err => {
        console.warn('[TCN INTEGRATION] Failed to log out of stock to server:', err);
        this.queueOfflineLog(logEntry);
      });
    } catch (error) {
      console.error('[TCN INTEGRATION] Error creating out of stock log:', error);
    }
  }

  /**
   * Send log data to server
   */
  private async sendLogToServer(fullUrl: string, data: any): Promise<void> {
    if (typeof window === 'undefined' || !window.fetch) {
      throw new Error('Fetch API not available');
    }
    
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * Queue log data for when offline
   */
  private queueOfflineLog(logEntry: any): void {
    // This will be implemented when we create offline storage system
    console.log('[TCN INTEGRATION] Queued offline log:', logEntry);
  }
}

export const tcnIntegrationService = TCNIntegrationService.getInstance();