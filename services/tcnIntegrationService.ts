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
  
  // Slot configuration for 2-tier system
  private readonly prizeChannels = {
    gold: [24, 25], // Gold slots 24-25
    silver: [
      1, 2, 3, 4, 5, 6, 7, 8, 11, 12, 13, 14, 15, 16, 17, 18, 21, 22, 23,
      26, 27, 28, 31, 32, 33, 34, 35, 36, 37, 38, 45, 46, 47, 48, 51, 52, 53, 54, 55, 56, 57, 58
    ] // Silver slots (1-8, 11-18, 21-23, 26-38, 45-48, 51-58) - 53 total
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
      
      // Initialize cache
      this.cacheValid = false;
      this.slotCache.clear();
      
      // Initialize persistent storage first
      const storageInitialized = await inventoryStorageService.initialize();
        if (!storageInitialized) {
          // Don't fail overall initialization just because persistent storage
          // couldn't be set up. Continue and fall back to in-memory cache so
          // TCN hardware connection can proceed.
          console.warn('[TCN INTEGRATION] Failed to initialize storage service - continuing with in-memory fallback');
        } else {
          // Clear and reinitialize slot data with updated configuration
          await inventoryStorageService.clearAndReinitialize();
        }
      
      // Load existing slot data
      await this.loadSlotData();
      
      // Step 1: Initialize TCN hardware connection
      console.log('[TCN INTEGRATION] Step 1: Connecting to TCN hardware...');
      const tcnConnected = await tcnSerialService.autoConnect();
      
      if (!tcnConnected) {
        console.warn('[TCN INTEGRATION] Auto-connect failed, trying COM1 force connection...');
        const forceConnected = await tcnSerialService.forceConnectCOM1();
        
        if (!forceConnected) {
          console.warn('[TCN INTEGRATION] TCN hardware not available, will use simulation');
        } else {
          console.log('[TCN INTEGRATION] TCN hardware connected successfully via COM1 force');
        }
      } else {
        console.log('[TCN INTEGRATION] TCN hardware connected successfully');
      }

      // Step 2: Initialize Arduino sensor service (but don't enable - GameScreen will manage it)
      console.log('[TCN INTEGRATION] Step 2: Initializing Arduino sensors...');
      
      if (typeof window !== 'undefined' && window.electronAPI) {
        // Only initialize the service - GameScreen will handle enabling and event handlers
        await arduinoSensorService.initialize();
        console.log('[TCN INTEGRATION] Arduino sensor service initialized (GameScreen will manage activation)');
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
      console.log(`[TCN INTEGRATION] Loaded ${slotInventory.length} slot records from storage`);
      
      // Load slot configuration
      const allSlots = [...this.prizeChannels.gold, ...this.prizeChannels.silver];
      
      // Update cache with loaded data
      for (const slotData of slotInventory) {
        this.slotCache.set(slotData.slot, slotData.dispenseCount);
      }
      
      // Initialize any missing slots (new configuration)
      let missingSlots = 0;
      for (const slot of allSlots) {
        if (!this.slotCache.has(slot)) {
          missingSlots++;
          this.slotCache.set(slot, 0);
          // Initialize in persistent storage
          let tier: 'gold' | 'silver';
          if (this.prizeChannels.gold.includes(slot)) {
            tier = 'gold';
          } else {
            tier = 'silver';
          }
          
          await inventoryStorageService.updateSlotInventory({
            slot,
            tier,
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
            console.log('[TCN INTEGRATION] TCN not available - showing HEX command that would be sent');
            
            // Show the HEX command that would be sent (for debugging)
            const mockHexCommand = this.constructMockHexCommand(selectedSlot);
            console.log(`[TCN INTEGRATION] MOCK HEX COMMAND: ${mockHexCommand} (slot ${selectedSlot})`);
            
            // Simulate dispensing and increment count
            await this.incrementSlotCount(selectedSlot);
            await this.logDispensingToServer(selectedSlot, tier, true, `Simulated - TCN not connected (HEX: ${mockHexCommand})`);
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
     * Updated for 2-tier system (gold/silver)
     */
  private determinePrizeTier(): 'gold' | 'silver' | 'bronze' | null {
    // For demonstration, we'll use a random tier
    // In real implementation, this would be based on actual game time
    const random = Math.random();
    
    if (random < 0.15) {
      return 'gold'; // 15% chance (rarer)
    } else if (random < 0.70) {
      return 'silver'; // 55% chance
    }
    
    return null; // 30% chance of no prize
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
      let tier: 'gold' | 'silver';
      if (this.prizeChannels.gold.includes(slot)) {
        tier = 'gold';
      } else {
        tier = 'silver';
      }
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
  async getNextAvailableSlot(tier: 'gold' | 'silver' | 'bronze'): Promise<number | null> {
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
      arduinoConnected: false, // TCN Integration doesn't need to track Arduino status
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
      
      // Note: Arduino sensor is managed by GameScreen, don't disable here
      // arduinoSensorService.setEnabled(false);
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
   * Legacy HEX dispensing method (Version 1.0.3 compatible)
   * Uses direct Electron serial API with proven HEX command format
   */
  private async dispensePrizeLegacy(slot: number, tier: 'gold' | 'silver'): Promise<boolean> {
    try {
      console.log(`[TCN INTEGRATION] Using Legacy HEX Method for slot ${slot} (${tier} tier)`);
      
      // Check if Electron API is available
      if (typeof window === 'undefined' || !window.electronAPI) {
        console.error('[TCN INTEGRATION] Electron API not available for legacy method');
        return false;
      }
      
      // Construct proven HEX command (same as version 1.0.3)
      const command = this.constructMockHexCommand(slot);
      console.log(`[TCN INTEGRATION] Legacy HEX Command: ${command}`);
      
      // Send command directly via Electron's serial API
      const result = await window.electronAPI.sendSerialCommand(command);
      
      if (result.success) {
        console.log(`[TCN INTEGRATION] ✓ Legacy HEX command sent successfully to slot ${slot}`);
        return true;
      } else {
        const errorMessage = (result as any).error || 'Unknown error';
        console.error(`[TCN INTEGRATION] ✗ Legacy HEX command failed for slot ${slot}: ${errorMessage}`);
        return false;
      }
    } catch (error) {
      console.error(`[TCN INTEGRATION] Legacy HEX method error for slot ${slot}:`, error);
      return false;
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
        console.warn('[TCN INTEGRATION] TCN not connected for manual dispensing - showing HEX command that would be sent');
        
        // Show the HEX command that would be sent (for debugging)
        const mockHexCommand = this.constructMockHexCommand(selectedSlot);
        console.log(`[TCN INTEGRATION] MOCK HEX COMMAND: ${mockHexCommand} (slot ${selectedSlot})`);
        
        await this.incrementSlotCount(selectedSlot);
        await this.logDispensingToServer(selectedSlot, tier, true, `Manual dispensing - Simulated (HEX: ${mockHexCommand})`);
        return true;
      }
    } catch (error) {
      console.error('[TCN INTEGRATION] Manual dispensing error:', error);
      return false;
    }
  }

  /**
   * Handle prize dispensing when game ends (called from prize service)
   * @param time The game time in milliseconds
   * @param scoreId Optional score ID for API logging
   */
  async handlePrizeDispensing(time: number, scoreId?: string): Promise<void> {
    try {
      console.log(`[TCN INTEGRATION] Handling prize dispensing for game time: ${time}ms`);
      console.log(`[TCN INTEGRATION] USING LEGACY HEX METHOD (Version 1.0.3 compatible)`);
      
      // Determine prize tier based on game time
      const tier = this.determinePrizeTierByTime(time);
      
      if (tier) {
        console.log(`[TCN INTEGRATION] Game time ${time}ms qualifies for ${tier} prize`);
        
        // Get next available slot for this tier with automatic progression
        const selectedSlot = await this.getNextAvailableSlot(tier);
        
        if (selectedSlot) {
          console.log(`[TCN INTEGRATION] Selected slot ${selectedSlot} for ${tier} prize`);
          
          // PRIORITY: Use Legacy HEX Method (Version 1.0.3 compatible)
          console.log(`[TCN INTEGRATION] Using Legacy HEX Method for slot ${selectedSlot}`);
          const success = await this.dispensePrizeLegacy(selectedSlot, tier);
          
          if (success) {
            console.log(`[TCN INTEGRATION] ✓ Legacy HEX method successful for ${tier} prize from slot ${selectedSlot}`);
            await this.incrementSlotCount(selectedSlot);
            await this.logDispensingToServer(selectedSlot, tier, true, 'Legacy HEX method successful');
          } else {
            console.error(`[TCN INTEGRATION] ✗ Legacy HEX method failed for slot ${selectedSlot}`);
            await this.logDispensingToServer(selectedSlot, tier, false, 'Legacy HEX method failed');
             
            // FALLBACK: Try TCN Serial Service if legacy fails
            if (tcnSerialService.isConnectedToTCN()) {
              console.log(`[TCN INTEGRATION] Falling back to TCN Serial Service...`);
              const result = await tcnSerialService.dispenseFromChannel(selectedSlot);
              
              if (result.success) {
                console.log(`[TCN INTEGRATION] ✓ TCN Serial fallback successful for ${tier} prize`);
                await this.incrementSlotCount(selectedSlot);
                await this.logDispensingToServer(selectedSlot, tier, true, 'TCN Serial fallback successful');
              } else {
                console.error(`[TCN INTEGRATION] ✗ TCN Serial fallback failed: ${result.error}`);
                await this.logDispensingToServer(selectedSlot, tier, false, `TCN Serial fallback failed: ${result.error}`);
              }
            } else {
              console.log('[TCN INTEGRATION] TCN not available - simulating for inventory tracking');
              await this.incrementSlotCount(selectedSlot);
              await this.logDispensingToServer(selectedSlot, tier, true, 'Simulated - all methods failed');
            }
          }
        } else {
          console.warn(`[TCN INTEGRATION] No available slots for ${tier} tier - machine may be empty`);
          // Log out of stock situation
          await this.logOutOfStockToServer(tier);
        }
      } else {
        console.log('[TCN INTEGRATION] No prize awarded - game time too short');
      }
    } catch (error) {
      console.error('[TCN INTEGRATION] Error handling prize dispensing:', error);
    }
  }

  /**
   * Determine prize tier based on game time (updated for 2-tier system)
   * @param time Game time in milliseconds
   * @returns Prize tier or null if no prize
   */
  private determinePrizeTierByTime(time: number): 'gold' | 'silver' | null {
    // Updated prize thresholds for 2-tier system
    if (time >= 240000) { // 4 minutes (240,000ms) or more
      return 'gold';
    } else if (time >= 120000) { // 2 minutes (120,000ms) or more
      return 'silver';
    }
    
    return null; // Less than 2 minutes - no prize
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

  /**
   * Construct mock HEX command for debugging (same format as TCN Serial service)
   * Format: 00 FF [SLOT] [CHECKSUM] AA 55
   */
  private constructMockHexCommand(slotNumber: number): string {
    if (slotNumber < 1 || slotNumber > 80) {
      throw new Error('Slot number must be between 1 and 80.');
    }

    const command = new Uint8Array(6);
    command[0] = 0x00;  // Command byte
    command[1] = 0xFF;  // Fixed byte
    command[2] = slotNumber;  // Slot number
    command[3] = 0xFF - slotNumber;  // Checksum (0xFF - slot)
    command[4] = 0xAA;  // Delivery detection ON
    command[5] = 0x55;  // Delivery detection ON

    return Array.from(command)
      .map(byte => byte.toString(16).toUpperCase().padStart(2, '0'))
      .join(' ');
  }
}

export const tcnIntegrationService = TCNIntegrationService.getInstance();