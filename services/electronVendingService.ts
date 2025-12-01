// Electron vending service for actual serial communication
// Enhanced with Spring SDK protocol integration and inventory management

import { springVendingService, DispenseResult, VendingSystemStatus } from './springVendingService';
import { inventoryStorageService, SlotInventoryData } from './inventoryStorageService';

export interface ElectronVendingResult {
  success: boolean;
  command?: string;
  response?: string;
  error?: string;
}

export interface PrizeDispenseResult {
  success: boolean;
  tier: 'gold' | 'silver' | 'bronze';
  channel: number | null;
  slot: number | null;
  error?: string;
  prizeId?: number;
  scoreId?: number;
}

class ElectronVendingService {
  private springService = springVendingService;
  private isInitialized: boolean = false;
  
  // Channel mapping for prize tiers (aligned with TCN configuration)
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
   * Initialize inventory management system
   */
  private async initializeInventoryManagement(): Promise<void> {
    try {
      console.log('[ELECTRON VENDING] Initializing inventory management...');
      
      // Initialize inventory storage service
      const storageInitialized = await inventoryStorageService.initialize();
      if (!storageInitialized) {
        console.warn('[ELECTRON VENDING] Failed to initialize inventory storage - using in-memory fallback');
      }
      
      // Load existing slot data and sync with local configuration
      await this.syncSlotConfiguration();
      
      console.log('[ELECTRON VENDING] Inventory management initialized');
    } catch (error) {
      console.error('[ELECTRON VENDING] Failed to initialize inventory management:', error);
    }
  }

  /**
   * Sync slot configuration with inventory storage
   */
  private async syncSlotConfiguration(): Promise<void> {
    try {
      const allSlots = [...this.prizeChannels.gold, ...this.prizeChannels.silver];
      
      for (const slot of allSlots) {
        const existingData = await inventoryStorageService.getSlotInventory(slot);
        
        if (!existingData) {
          // Initialize new slot in storage
          const tier = this.prizeChannels.gold.includes(slot) ? 'gold' : 'silver';
          await inventoryStorageService.updateSlotInventory({
            slot,
            tier,
            dispenseCount: 0,
            maxDispenses: 5,
            updatedAt: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('[ELECTRON VENDING] Failed to sync slot configuration:', error);
    }
  }

  /**
   * Determine prize tier based on game time
   */
  private determinePrizeTierByTime(time: number): 'gold' | 'silver' | null {
    // Updated prize thresholds for 2-tier system
    if (time >= 60000) { // 60 seconds or more
      return 'gold';
    } else if (time >= 30000) { // 30 seconds or more
      return 'silver';
    }
    
    return null; // Less than 30 seconds - no prize
  }

  /**
   * Get next available slot for a tier with load balancing
   */
  private async getNextAvailableSlot(tier: 'gold' | 'silver'): Promise<number | null> {
    try {
      const tierSlots = this.prizeChannels[tier];
      const slotInventory = await inventoryStorageService.getSlotsByTier(tier);
      
      // Find slots with capacity
      const availableSlots = tierSlots.filter(slot => {
        const slotData = slotInventory.find(data => data.slot === slot);
        return slotData && slotData.dispenseCount < slotData.maxDispenses;
      });
      
      if (availableSlots.length === 0) {
        console.warn(`[ELECTRON VENDING] No available slots for ${tier} tier`);
        return null;
      }
      
      // Sort by dispense count (ascending) to use least used slots first
      const sortedSlots = availableSlots.sort((a, b) => {
        const countA = slotInventory.find(data => data.slot === a)?.dispenseCount || 0;
        const countB = slotInventory.find(data => data.slot === b)?.dispenseCount || 0;
        return countA - countB;
      });
      
      const selectedSlot = sortedSlots[0];
      console.log(`[ELECTRON VENDING] Selected slot ${selectedSlot} for ${tier} tier (count: ${slotInventory.find(data => data.slot === selectedSlot)?.dispenseCount || 0})`);
      
      return selectedSlot;
    } catch (error) {
      console.error('[ELECTRON VENDING] Failed to get next available slot:', error);
      return null;
    }
  }

  /**
   * Increment slot count after successful dispensing
   */
  private async incrementSlotCount(slot: number, tier: 'gold' | 'silver'): Promise<void> {
    try {
      await inventoryStorageService.incrementSlotCount(slot, tier);
      console.log(`[ELECTRON VENDING] Slot ${slot} count incremented for ${tier} tier`);
    } catch (error) {
      console.error('[ELECTRON VENDING] Failed to increment slot count:', error);
    }
  }

  /**
   * Log dispensing to server with inventory sync
   */
  private async logDispensingToServer(
    slot: number,
    tier: string,
    success: boolean,
    prizeId?: number,
    scoreId?: number,
    error?: string,
    gameTimeMs?: number,
    channelUsed?: number,
    dispenseMethod?: string,
    inventoryBefore?: number,
    inventoryAfter?: number,
    responseTimeMs?: number
  ): Promise<void> {
    try {
      // Log to inventory storage
      await inventoryStorageService.addDispensingLog({
        slot,
        tier: tier as 'gold' | 'silver',
        success,
        error,
        timestamp: new Date().toISOString(),
        source: 'electron_vending'
      });

      // Log to backend API - Electron Vending Service dedicated table
      const API_BASE_URL = (window as any).process?.env?.REACT_APP_API_URL || 'https://vendinghanger.eeelab.xyz/apiendpoints.php';
      
      const electronVendingLogEntry = {
        action: 'prize_dispensing',
        game_time_ms: gameTimeMs,
        tier,
        selected_slot: slot,
        channel_used: channelUsed,
        score_id: scoreId,
        prize_id: prizeId,
        success,
        error_message: error,
        dispense_method: dispenseMethod || 'spring_sdk',
        inventory_before: inventoryBefore,
        inventory_after: inventoryAfter,
        response_time_ms: responseTimeMs,
        source: 'electron_vending_service'
      };

      // Also log to inventory API for compatibility
      const inventoryLogEntry = {
        slot,
        tier,
        success,
        error,
        timestamp: new Date().toISOString(),
        source: 'electron_vending'
      };

      // Try to send to Electron Vending Service logs table (non-blocking)
      fetch(`${API_BASE_URL}/api/electron-vending/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(electronVendingLogEntry)
      }).catch(err => {
        console.warn('[ELECTRON VENDING] Failed to log to Electron Vending Service table (will queue for later):', err);
      });

      // Also log to inventory API for backward compatibility (non-blocking)
      fetch(`${API_BASE_URL}/api/inventory/log-dispensing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inventoryLogEntry)
      }).catch(err => {
        console.warn('[ELECTRON VENDING] Failed to log dispensing to inventory API (will queue for later):', err);
      });

      console.log(`[ELECTRON VENDING] Dispensing logged to both tables: slot=${slot}, tier=${tier}, success=${success}`);
    } catch (error) {
      console.error('[ELECTRON VENDING] Failed to log dispensing:', error);
    }
  }

  /**
   * Log out of stock situation to server
   */
  private async logOutOfStockToServer(tier: string): Promise<void> {
    try {
      const API_BASE_URL = (window as any).process?.env?.REACT_APP_API_URL || 'https://vendinghanger.eeelab.xyz/apiendpoints.php';
      
      // Log to Electron Vending Service table
      const electronVendingLogEntry = {
        action: 'out_of_stock',
        tier,
        success: false,
        source: 'electron_vending_service'
      };
      
      // Also log to inventory API for compatibility
      const inventoryLogEntry = {
        tier,
        timestamp: new Date().toISOString(),
        source: 'electron_vending'
      };
      
      // Try to send to Electron Vending Service logs table (non-blocking)
      fetch(`${API_BASE_URL}/api/electron-vending/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(electronVendingLogEntry)
      }).catch(err => {
        console.warn('[ELECTRON VENDING] Failed to log out of stock to Electron Vending Service table:', err);
      });
      
      // Also log to inventory API for backward compatibility (non-blocking)
      fetch(`${API_BASE_URL}/api/inventory/log-out-of-stock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inventoryLogEntry)
      }).catch(err => {
        console.warn('[ELECTRON VENDING] Failed to log out of stock to inventory API:', err);
      });
      
      console.log(`[ELECTRON VENDING] Out of stock logged for ${tier} tier to both tables`);
    } catch (error) {
      console.error('[ELECTRON VENDING] Failed to log out of stock:', error);
    }
  }

  /**
   * Primary prize dispensing handler with inventory management
   * This replaces tcnIntegrationService.handlePrizeDispensing as primary trigger
   */
  async handlePrizeDispensing(time: number, scoreId?: string): Promise<PrizeDispenseResult> {
    const startTime = Date.now();
    let inventoryBefore: number | undefined;
    let inventoryAfter: number | undefined;
    
    try {
      console.log(`[ELECTRON VENDING] Handling prize dispensing for game time: ${time}ms, scoreId: ${scoreId}`);
      
      // Determine prize tier based on game time
      const tier = this.determinePrizeTierByTime(time);
      
      if (!tier) {
        console.log('[ELECTRON VENDING] No prize awarded - game time too short');
        
        // Log no prize awarded
        await this.logDispensingToServer(
          0,
          'bronze',
          false,
          undefined,
          undefined,
          'Game time too short for prize eligibility',
          time,
          undefined,
          'no_prize',
          undefined,
          undefined,
          Date.now() - startTime
        );
        
        return {
          success: false,
          tier: 'bronze',
          channel: null,
          slot: null,
          error: 'Game time too short for prize eligibility'
        };
      }

      console.log(`[ELECTRON VENDING] Game time ${time}ms qualifies for ${tier} prize`);
      
      // Get next available slot for this tier with load balancing
      const selectedSlot = await this.getNextAvailableSlot(tier);
      
      if (!selectedSlot) {
        console.warn(`[ELECTRON VENDING] No available slots for ${tier} tier - machine may be empty`);
        
        // Log out of stock situation
        await this.logOutOfStockToServer(tier);
        
        // Log out of stock to Electron Vending Service table
        await this.logDispensingToServer(
          0,
          tier,
          false,
          undefined,
          undefined,
          `No available slots for ${tier} tier`,
          time,
          undefined,
          'out_of_stock',
          undefined,
          undefined,
          Date.now() - startTime
        );
        
        return {
          success: false,
          tier,
          channel: null,
          slot: null,
          error: `No available slots for ${tier} tier`
        };
      }

      console.log(`[ELECTRON VENDING] Selected slot ${selectedSlot} for ${tier} prize`);

      // Get inventory count before operation
      try {
        const slotData = await inventoryStorageService.getSlotInventory(selectedSlot);
        inventoryBefore = slotData?.dispenseCount;
      } catch (err) {
        console.warn('[ELECTRON VENDING] Failed to get inventory before count:', err);
      }

      // Convert scoreId to number if provided
      const scoreIdNum = scoreId ? parseInt(scoreId) : undefined;

      // Get prize ID from API based on tier for logging (move outside if block)
      let prizeIdForApi: number | undefined;
      if (typeof scoreIdNum !== 'undefined') {
        try {
          const apiService = await import('./apiService');
          const prizesResponse = await apiService.apiService.getAllPrizes();
          const prizeForTier = prizesResponse.prizes.find((p: any) =>
            (tier === 'gold' && p.time_threshold >= 60000) ||
            (tier === 'silver' && p.time_threshold >= 30000 && p.time_threshold < 60000)
          );
          prizeIdForApi = prizeForTier?.id;
          
          if (prizeIdForApi) {
            await apiService.apiService.dispensePrize(prizeIdForApi, scoreIdNum);
            console.log('[ELECTRON VENDING] Prize dispensing logged to API');
          }
        } catch (apiError) {
          console.error('[ELECTRON VENDING] Failed to log to API:', apiError);
        }
      }

      // Use Spring SDK if initialized, otherwise fall back to legacy method
      if (this.isInitialized) {
        console.log(`[ELECTRON VENDING] Using Spring SDK for ${tier} prize dispensing`);
        
        const result: DispenseResult = await this.springService.dispensePrizeByTier(tier);
        
        if (result.success) {
          console.log(`[ELECTRON VENDING] Successfully dispensed ${tier} prize via Spring SDK from channel ${result.channel}`);
          
          // Increment slot count after successful dispensing
          await this.incrementSlotCount(selectedSlot, tier);
          
          // Get inventory count after operation
          try {
            const slotData = await inventoryStorageService.getSlotInventory(selectedSlot);
            inventoryAfter = slotData?.dispenseCount;
          } catch (err) {
            console.warn('[ELECTRON VENDING] Failed to get inventory after count:', err);
          }
          
          // Log dispensing to server with inventory sync
          await this.logDispensingToServer(
            selectedSlot,
            tier,
            true,
            prizeIdForApi,
            scoreIdNum,
            undefined,
            time,
            result.channel,
            'spring_sdk',
            inventoryBefore,
            inventoryAfter,
            Date.now() - startTime
          );
          
          return {
            success: true,
            tier,
            channel: result.channel,
            slot: selectedSlot,
            prizeId: prizeIdForApi,
            scoreId: scoreIdNum
          };
        } else {
          console.error(`[ELECTRON VENDING] Failed to dispense ${tier} prize via Spring SDK: ${result.error}`);
          
          // Log failed attempt
          await this.logDispensingToServer(
            selectedSlot,
            tier,
            false,
            prizeIdForApi,
            scoreIdNum,
            result.error,
            time,
            result.channel,
            'spring_sdk',
            inventoryBefore,
            inventoryAfter,
            Date.now() - startTime
          );
          
          return {
            success: false,
            tier,
            channel: result.channel,
            slot: selectedSlot,
            error: result.error,
            prizeId: prizeIdForApi,
            scoreId: scoreIdNum
          };
        }
      } else {
        // Fallback to legacy method
        console.warn('[ELECTRON VENDING] Spring SDK not initialized, falling back to legacy method');
        return await this.dispensePrizeLegacy(selectedSlot, tier, prizeIdForApi, scoreIdNum, time, inventoryBefore, startTime);
      }
    } catch (error) {
      console.error('[ELECTRON VENDING] Error handling prize dispensing:', error);
      
      // Log error to Electron Vending Service table
      await this.logDispensingToServer(
        0,
        'bronze',
        false,
        undefined,
        undefined,
        error.message,
        time,
        undefined,
        'error',
        inventoryBefore,
        inventoryAfter,
        Date.now() - startTime
      );
      
      return {
        success: false,
        tier: 'bronze',
        channel: null,
        slot: null,
        error: error.message
      };
    }
  }

  /**
   * Legacy dispensing method for fallback
   */
  private async dispensePrizeLegacy(
    slot: number,
    tier: 'gold' | 'silver',
    prizeId?: number,
    scoreId?: number,
    gameTimeMs?: number,
    inventoryBefore?: number,
    startTime?: number
  ): Promise<PrizeDispenseResult> {
    const legacyStartTime = startTime || Date.now();
    let inventoryAfter: number | undefined;
    
    try {
      console.log(`[ELECTRON VENDING] Using legacy dispensing for slot ${slot}`);
      
      const command = this.constructVendCommand(slot);
      console.log(`[ELECTRON VENDING] Preparing to send command for slot ${slot}...`);
      console.log(`[ELECTRON VENDING] Command (HEX): ${command}`);

      // Send command via Electron's serial port
      const result = await window.electronAPI.sendSerialCommand(command);
      
      if (result.success) {
        console.log(`[ELECTRON VENDING] Command sent successfully to slot ${slot}`);
        
        // Increment slot count after successful dispensing
        await this.incrementSlotCount(slot, tier);
        
        // Get inventory count after operation
        try {
          const slotData = await inventoryStorageService.getSlotInventory(slot);
          inventoryAfter = slotData?.dispenseCount;
        } catch (err) {
          console.warn('[ELECTRON VENDING] Failed to get inventory after count:', err);
        }
        
        // Log to backend if we have prizeId and scoreId
        if (prizeId && scoreId) {
          try {
            const apiService = await import('./apiService');
            await apiService.apiService.dispensePrize(prizeId, scoreId);
            console.log('[ELECTRON VENDING] Prize dispensing logged to API');
          } catch (apiError) {
            console.error('[ELECTRON VENDING] Failed to log to API:', apiError);
          }
        }
        
        // Log dispensing to server with inventory sync
        await this.logDispensingToServer(
          slot,
          tier,
          true,
          prizeId,
          scoreId,
          undefined,
          gameTimeMs,
          slot,
          'legacy',
          inventoryBefore,
          inventoryAfter,
          Date.now() - legacyStartTime
        );
        
        return {
          success: true,
          tier,
          channel: slot,
          slot,
          prizeId,
          scoreId
        };
      } else {
        console.error(`[ELECTRON VENDING] Failed to send command to slot ${slot}`);
        
        // Log failed attempt
        await this.logDispensingToServer(
          slot,
          tier,
          false,
          prizeId,
          scoreId,
          'Failed to send serial command',
          gameTimeMs,
          slot,
          'legacy',
          inventoryBefore,
          inventoryAfter,
          Date.now() - legacyStartTime
        );
        
        return {
          success: false,
          tier,
          channel: slot,
          slot,
          error: 'Failed to send serial command',
          prizeId,
          scoreId
        };
      }
    } catch (error) {
      console.error('[ELECTRON VENDING] Legacy dispensing error:', error);
      
      // Log error to Electron Vending Service table
      await this.logDispensingToServer(
        slot,
        tier,
        false,
        prizeId,
        scoreId,
        error.message,
        gameTimeMs,
        slot,
        'legacy_error',
        inventoryBefore,
        inventoryAfter,
        Date.now() - legacyStartTime
      );
      
      return {
        success: false,
        tier,
        channel: slot,
        slot,
        error: error.message,
        prizeId,
        scoreId
      };
    }
  }

  /**
   * Get inventory statistics
   */
  async getInventoryStatistics(): Promise<{
    totalSlots: number;
    goldSlots: number;
    silverSlots: number;
    totalDispensed: number;
    goldDispensed: number;
    silverDispensed: number;
    emptySlots: number;
    slotsNeedingRefill: number;
  }> {
    try {
      const slotInventory = await inventoryStorageService.getAllSlotInventory();
      
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
        const slotData = slotInventory.find(data => data.slot === slot);
        if (slotData) {
          goldDispensed += slotData.dispenseCount;
          if (slotData.dispenseCount >= slotData.maxDispenses) emptySlots++;
          if (slotData.dispenseCount >= 4) slotsNeedingRefill++; // 80% threshold
        }
      }
      
      // Silver statistics
      for (const slot of this.prizeChannels.silver) {
        const slotData = slotInventory.find(data => data.slot === slot);
        if (slotData) {
          silverDispensed += slotData.dispenseCount;
          if (slotData.dispenseCount >= slotData.maxDispenses) emptySlots++;
          if (slotData.dispenseCount >= 4) slotsNeedingRefill++; // 80% threshold
        }
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
    } catch (error) {
      console.error('[ELECTRON VENDING] Failed to get inventory statistics:', error);
      return {
        totalSlots: 0,
        goldSlots: 0,
        silverSlots: 0,
        totalDispensed: 0,
        goldDispensed: 0,
        silverDispensed: 0,
        emptySlots: 0,
        slotsNeedingRefill: 0
      };
    }
  }

  /**
   * Initialize Spring SDK enhanced vending service with inventory management
   */
  async initializeVending(): Promise<boolean> {
    if (!this.isElectron()) {
      console.warn('Spring vending service called outside of Electron environment');
      return false;
    }

    try {
      // Initialize Spring SDK first
      this.isInitialized = await this.springService.initializeVending();
      if (this.isInitialized) {
        console.log('[ELECTRON VENDING] Spring SDK service initialized successfully');
        
        // Initialize inventory management
        await this.initializeInventoryManagement();
        console.log('[ELECTRON VENDING] Inventory management initialized');
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