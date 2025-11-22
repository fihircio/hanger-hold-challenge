// Inventory Storage Service - Handles persistent storage with offline support
// Uses IndexedDB for local storage and syncs with server when online

export interface SlotInventoryData {
  slot: number;
  tier: 'gold' | 'silver';
  dispenseCount: number;
  maxDispenses: number;
  lastDispensedAt?: string;
  updatedAt: string;
}

export interface DispensingLog {
  id: string;
  slot: number;
  tier: 'gold' | 'silver';
  success: boolean;
  error?: string;
  timestamp: string;
  source: string;
}

export interface OutOfStockLog {
  id: string;
  tier: 'gold' | 'silver';
  timestamp: string;
  source: string;
}

class InventoryStorageService {
  private static instance: InventoryStorageService;
  private dbName = 'VendingInventoryDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private isOnline: boolean = navigator.onLine;
  private syncQueue: any[] = [];

  private constructor() {
    // Monitor online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('[INVENTORY STORAGE] Connection restored - syncing queued data');
      this.syncQueuedData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('[INVENTORY STORAGE] Connection lost - data will be queued');
    });
  }

  static getInstance(): InventoryStorageService {
    if (!InventoryStorageService.instance) {
      InventoryStorageService.instance = new InventoryStorageService();
    }
    return InventoryStorageService.instance;
  }

  /**
   * Initialize IndexedDB database
   */
  async initialize(): Promise<boolean> {
    try {
      console.log('[INVENTORY STORAGE] Initializing database...');
      
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, this.dbVersion);

        request.onerror = () => {
          console.error('[INVENTORY STORAGE] Failed to open database');
          reject(false);
        };

        request.onsuccess = () => {
          this.db = request.result;
          console.log('[INVENTORY STORAGE] Database initialized successfully');
          resolve(true);
        };

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;

          // Create slot inventory store
          if (!db.objectStoreNames.contains('slotInventory')) {
            const slotStore = db.createObjectStore('slotInventory', { keyPath: 'slot' });
            slotStore.createIndex('tier', 'tier', { unique: false });
            slotStore.createIndex('updatedAt', 'updatedAt', { unique: false });
          }

          // Create dispensing logs store
          if (!db.objectStoreNames.contains('dispensingLogs')) {
            const logStore = db.createObjectStore('dispensingLogs', { keyPath: 'id' });
            logStore.createIndex('timestamp', 'timestamp', { unique: false });
            logStore.createIndex('tier', 'tier', { unique: false });
            logStore.createIndex('success', 'success', { unique: false });
          }

          // Create out of stock logs store
          if (!db.objectStoreNames.contains('outOfStockLogs')) {
            const outOfStockStore = db.createObjectStore('outOfStockLogs', { keyPath: 'id' });
            outOfStockStore.createIndex('timestamp', 'timestamp', { unique: false });
            outOfStockStore.createIndex('tier', 'tier', { unique: false });
          }

          // Create sync queue store
          if (!db.objectStoreNames.contains('syncQueue')) {
            db.createObjectStore('syncQueue', { keyPath: 'id' });
          }

          console.log('[INVENTORY STORAGE] Database schema created/updated');
        };
      });
    } catch (error) {
      console.error('[INVENTORY STORAGE] Database initialization failed:', error);
      return false;
    }
  }

  /**
   * Get all slot inventory data
   */
  async getAllSlotInventory(): Promise<SlotInventoryData[]> {
    if (!this.db) {
      console.warn('[INVENTORY STORAGE] Database not initialized, attempting to initialize...');
      await this.initialize();
      if (!this.db) {
        console.error('[INVENTORY STORAGE] Still cannot initialize database');
        return [];
      }
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['slotInventory'], 'readonly');
      const store = transaction.objectStore('slotInventory');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => {
        console.error('[INVENTORY STORAGE] Error getting slot inventory:', request.error);
        resolve([]); // Return empty array instead of rejecting
      };
    });
  }

  /**
   * Get inventory for a specific slot
   */
  async getSlotInventory(slot: number): Promise<SlotInventoryData | null> {
    if (!this.db) {
      console.warn('[INVENTORY STORAGE] Database not initialized, attempting to initialize...');
      await this.initialize();
      if (!this.db) {
        console.error('[INVENTORY STORAGE] Still cannot initialize database');
        return null;
      }
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['slotInventory'], 'readonly');
      const store = transaction.objectStore('slotInventory');
      const request = store.get(slot);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => {
        console.error('[INVENTORY STORAGE] Error getting slot inventory:', request.error);
        resolve(null); // Return null instead of rejecting
      };
    });
  }

  /**
   * Update slot inventory
   */
  async updateSlotInventory(slotData: SlotInventoryData): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['slotInventory'], 'readwrite');
      const store = transaction.objectStore('slotInventory');
      const request = store.put(slotData);

      request.onsuccess = () => {
        console.log(`[INVENTORY STORAGE] Updated slot ${slotData.slot}: ${slotData.dispenseCount}/${slotData.maxDispenses}`);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Increment dispense count for a slot
   */
  async incrementSlotCount(slot: number, tier: 'gold' | 'silver'): Promise<SlotInventoryData> {
    const currentData = await this.getSlotInventory(slot) || {
      slot,
      tier,
      dispenseCount: 0,
      maxDispenses: 5,
      updatedAt: new Date().toISOString()
    };

    const newCount = Math.min(currentData.dispenseCount + 1, currentData.maxDispenses);
    const updatedData: SlotInventoryData = {
      ...currentData,
      dispenseCount: newCount,
      lastDispensedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await this.updateSlotInventory(updatedData);
    return updatedData;
  }

  /**
   * Get slots by tier
   */
  async getSlotsByTier(tier: 'gold' | 'silver'): Promise<SlotInventoryData[]> {
    const allSlots = await this.getAllSlotInventory();
    return allSlots.filter(slot => slot.tier === tier);
  }

  /**
   * Get slots needing refill
   */
  async getSlotsNeedingRefill(threshold: number = 0.8): Promise<SlotInventoryData[]> {
    const allSlots = await this.getAllSlotInventory();
    const thresholdCount = Math.floor(5 * threshold); // 5 is max dispenses per slot
    
    return allSlots
      .filter(slot => slot.dispenseCount >= thresholdCount)
      .sort((a, b) => a.slot - b.slot);
  }

  /**
   * Reset all slot counts
   */
  async resetAllSlotCounts(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['slotInventory'], 'readwrite');
      const store = transaction.objectStore('slotInventory');
      const request = store.getAll();

      request.onsuccess = () => {
        const slots = request.result;
        slots.forEach((slot: SlotInventoryData) => {
          const resetSlot: SlotInventoryData = {
            ...slot,
            dispenseCount: 0,
            lastDispensedAt: undefined,
            updatedAt: new Date().toISOString()
          };
          store.put(resetSlot);
        });
        
        transaction.oncomplete = () => {
          console.log('[INVENTORY STORAGE] All slot counts reset');
          resolve();
        };
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Add dispensing log
   */
  async addDispensingLog(log: Omit<DispensingLog, 'id'>): Promise<void> {
    const logWithId: DispensingLog = {
      ...log,
      id: this.generateId()
    };

    // Store locally
    await this.storeDispensingLog(logWithId);

    // Try to sync with server if online
    if (this.isOnline) {
      await this.syncDispensingLog(logWithId);
    } else {
      // Queue for later sync
      await this.queueForSync('dispensingLog', logWithId);
    }
  }

  /**
   * Store dispensing log locally
   */
  private async storeDispensingLog(log: DispensingLog): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['dispensingLogs'], 'readwrite');
      const store = transaction.objectStore('dispensingLogs');
      const request = store.add(log);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Add out of stock log
   */
  async addOutOfStockLog(log: Omit<OutOfStockLog, 'id'>): Promise<void> {
    const logWithId: OutOfStockLog = {
      ...log,
      id: this.generateId()
    };

    // Store locally
    await this.storeOutOfStockLog(logWithId);

    // Try to sync with server if online
    if (this.isOnline) {
      await this.syncOutOfStockLog(logWithId);
    } else {
      // Queue for later sync
      await this.queueForSync('outOfStockLog', logWithId);
    }
  }

  /**
   * Store out of stock log locally
   */
  private async storeOutOfStockLog(log: OutOfStockLog): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['outOfStockLogs'], 'readwrite');
      const store = transaction.objectStore('outOfStockLogs');
      const request = store.add(log);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Queue data for sync when offline
   */
  private async queueForSync(type: string, data: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const queueItem = {
      id: this.generateId(),
      type,
      data,
      timestamp: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      const request = store.add(queueItem);

      request.onsuccess = () => {
        console.log(`[INVENTORY STORAGE] Queued ${type} for sync:`, data);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Sync queued data when connection is restored
   */
  private async syncQueuedData(): Promise<void> {
    if (!this.db) return;

    try {
      const queuedItems = await this.getQueuedItems();
      
      for (const item of queuedItems) {
        try {
          switch (item.type) {
            case 'dispensingLog':
              await this.syncDispensingLog(item.data);
              break;
            case 'outOfStockLog':
              await this.syncOutOfStockLog(item.data);
              break;
            default:
              console.warn('[INVENTORY STORAGE] Unknown queue item type:', item.type);
          }
          
          // Remove from queue after successful sync
          await this.removeFromQueue(item.id);
        } catch (error) {
          console.error(`[INVENTORY STORAGE] Failed to sync queued item ${item.id}:`, error);
        }
      }
    } catch (error) {
      console.error('[INVENTORY STORAGE] Error syncing queued data:', error);
    }
  }

  /**
   * Get queued items
   */
  private async getQueuedItems(): Promise<any[]> {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readonly');
      const store = transaction.objectStore('syncQueue');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Remove item from sync queue
   */
  private async removeFromQueue(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Sync dispensing log to server
   */
  private async syncDispensingLog(log: DispensingLog): Promise<void> {
    try {
      const response = await fetch('/api/inventory/log-dispensing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(log)
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      console.log('[INVENTORY STORAGE] Dispensing log synced successfully');
    } catch (error) {
      console.error('[INVENTORY STORAGE] Failed to sync dispensing log:', error);
      throw error;
    }
  }

  /**
   * Sync out of stock log to server
   */
  private async syncOutOfStockLog(log: OutOfStockLog): Promise<void> {
    try {
      const response = await fetch('/api/inventory/log-out-of-stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(log)
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      console.log('[INVENTORY STORAGE] Out of stock log synced successfully');
    } catch (error) {
      console.error('[INVENTORY STORAGE] Failed to sync out of stock log:', error);
      throw error;
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Get current online status
   */
  isCurrentlyOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Get sync queue status
   */
  async getSyncQueueStatus(): Promise<{count: number; items: any[]}> {
    const items = await this.getQueuedItems();
    return {
      count: items.length,
      items
    };
  }
}

export const inventoryStorageService = InventoryStorageService.getInstance();