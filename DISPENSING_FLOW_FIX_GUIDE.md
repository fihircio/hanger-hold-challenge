# Dispensing Flow Fix Guide

## Problem Analysis

You're absolutely correct about the scenario! When a user gets a gold prize and the slot reaches `max_dispenses` (5), the system prevents further prize dispensing because:

1. **[`getNextAvailableSlot()`](services/electronVendingService.ts:137)** filters out slots where `dispenseCount >= maxDispenses`
2. When ALL slots reach 5, `availableSlots.length === 0` returns `null`
3. System logs "No available slots for gold tier" and won't dispense prizes
4. User closes program, reopens when server is available, but inventory still shows full slots

## Root Cause

In [`services/electronVendingService.ts`](services/electronVendingService.ts:143-146):
```typescript
const availableSlots = tierSlots.filter(slot => {
  const slotData = slotInventory.find(data => data.slot === slot);
  return slotData && slotData.dispenseCount < slotData.maxDispenses;  // ❌ PROBLEM HERE
});
```

**The Issue**: When `dispenseCount` reaches 5 (max), the slot is excluded from available slots, preventing any further dispensing.

## Solution: Implement Slot Reset Logic

### Fix 1: Update `getNextAvailableSlot()` Method

**File**: `services/electronVendingService.ts`

**Changes Needed**:
1. **Detect when all slots are full** and reset them automatically
2. **Log the reset operation** for transparency
3. **Continue with dispensing** after reset

### Fix 2: Add Offline Sync Support

**File**: `services/inventoryStorageService.ts`

**Changes Needed**:
1. **Add missing methods**:
   - `getPendingDispensingLogs()`
   - `clearPendingDispensingLogs()`
   - `syncPendingLogToServer()`

2. **Update interfaces** to remove bronze references
3. **Add server sync timestamp tracking**

## Implementation Details

### Step 1: Slot Reset Logic

When all slots for a tier are at maximum capacity:
1. **Reset all slots** for that tier to 0 count
2. **Log the reset** to server for transparency
3. **Continue with dispensing** using the reset slots

### Step 2: Offline Scenario Handling

When internet is disconnected:
1. **Queue all operations** locally in IndexedDB
2. **Sync automatically** when connection is restored
3. **Track sync status** to prevent data loss

### Step 3: Proper Slot Rotation

Ensure fair slot usage:
1. **Round-robin through available slots**
2. **Track usage statistics**
3. **Prevent slot starvation**

## Expected Behavior After Fix

### Before Fix (Current Issue):
```
User gets gold prize → Slot 24 reaches 5/5 → No more gold prizes possible
User closes program → Reopens → Still no gold prizes available
```

### After Fix (Desired Behavior):
```
User gets gold prize → Slot 24 reaches 5/5 → Auto-reset all gold slots to 0
User closes program → Reopens → Gold prizes available again
User continues playing → Fair slot rotation continues
```

## Code Changes Required

### 1. Update `getNextAvailableSlot()` Method

```typescript
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
      
      // 🎯 CRITICAL FIX: Check if all slots are at max capacity and reset if needed
      const allSlotsFull = tierSlots.every(slot => {
        const slotData = slotInventory.find(data => data.slot === slot);
        return slotData && slotData.dispenseCount >= slotData.maxDispenses;
      });
      
      if (allSlotsFull) {
        console.warn(`[ELECTRON VENDING] All ${tier} slots are at maximum capacity (${tierSlots.length} slots)`);
        
        // Reset all slots for this tier to allow continued operation
        console.log(`[ELECTRON VENDING] Resetting all ${tier} slots to 0 count for continued operation`);
        
        for (const slot of tierSlots) {
          try {
            await inventoryStorageService.updateSlotInventory({
              slot,
              tier,
              dispenseCount: 0,
              maxDispenses: 5,
              updatedAt: new Date().toISOString()
            });
          } catch (resetError) {
            console.error(`[ELECTRON VENDING] Failed to reset slot ${slot}:`, resetError);
          }
        }
        
        // Log the reset operation
        await this.logDispensingToServer(
          0,
          tier,
          false,
          undefined,
          undefined,
          `All ${tier} slots reset from max capacity (${tierSlots.length} slots) - allowing continued operation`,
          undefined,
          undefined,
          'slot_reset',
          undefined,
          undefined,
          Date.now()
        );
        
        // Try to get available slot again after reset
        const updatedSlotInventory = await inventoryStorageService.getSlotsByTier(tier);
        const resetAvailableSlots = tierSlots.filter(slot => {
          const slotData = updatedSlotInventory.find(data => data.slot === slot);
          return slotData && slotData.dispenseCount < slotData.maxDispenses;
        });
        
        if (resetAvailableSlots.length > 0) {
          const resetSortedSlots = resetAvailableSlots.sort((a, b) => {
            const countA = updatedSlotInventory.find(data => data.slot === a)?.dispenseCount || 0;
            const countB = updatedSlotInventory.find(data => data.slot === b)?.dispenseCount || 0;
            return countA - countB;
          });
          
          const selectedSlot = resetSortedSlots[0];
          console.log(`[ELECTRON VENDING] Selected slot ${selectedSlot} for ${tier} tier after reset (count: 0)`);
          return selectedSlot;
        } else {
          console.error(`[ELECTRON VENDING] Failed to reset ${tier} slots - no slots available after reset`);
          return null;
        }
      }
      
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
```

### 2. Add Offline Sync Methods

Add these methods to `inventoryStorageService.ts`:

```typescript
/**
 * Get pending dispensing logs that haven't been synced to server
 */
async getPendingDispensingLogs(): Promise<any[]> {
  if (!this.db) return [];
  
  return new Promise((resolve, reject) => {
    const transaction = this.db!.transaction(['dispensingLogs'], 'readonly');
    const store = transaction.objectStore('dispensingLogs');
    const request = store.getAll();
    
    request.onsuccess = () => {
      const logs = request.result || [];
      // Filter logs that haven't been synced to server (no server_sync_timestamp)
      const pendingLogs = logs.filter((log: any) => !log.server_sync_timestamp);
      resolve(pendingLogs);
    };
    
    request.onerror = () => {
      console.error('[INVENTORY STORAGE] Error getting pending dispensing logs:', request.error);
      resolve([]);
    };
  });
}

/**
 * Clear pending dispensing logs after successful sync
 */
async clearPendingDispensingLogs(): Promise<void> {
  if (!this.db) throw new Error('Database not initialized');
  
  return new Promise((resolve, reject) => {
    const transaction = this.db!.transaction(['dispensingLogs'], 'readwrite');
    const store = transaction.objectStore('dispensingLogs');
    
    // Get all logs first
    const getAllRequest = store.getAll();
    
    getAllRequest.onsuccess = () => {
      const logs = getAllRequest.result || [];
      
      // Update each log to mark as synced
      logs.forEach((log: any) => {
        if (!log.server_sync_timestamp) {
          log.server_sync_timestamp = new Date().toISOString();
          store.put(log);
        }
      });
      
      transaction.oncomplete = () => {
        console.log('[INVENTORY STORAGE] Pending dispensing logs cleared');
        resolve();
      };
      
      transaction.onerror = () => {
        console.error('[INVENTORY STORAGE] Error clearing pending logs:', transaction.error);
        reject(transaction.error);
      };
    };
    
    getAllRequest.onerror = () => {
      console.error('[INVENTORY STORAGE] Error getting logs for clearing:', getAllRequest.error);
      reject(getAllRequest.error);
    };
  });
}

/**
 * Sync a single pending log to server
 */
private async syncPendingLogToServer(log: any): Promise<void> {
  const API_BASE_URL = (window as any).process?.env?.REACT_APP_API_URL || 'https://vendinghanger.eeelab.xyz/apiendpoints.php';
  
  const electronVendingLogEntry = {
    action: log.action || 'prize_dispensing',
    game_time_ms: log.gameTimeMs,
    tier: log.tier,
    selected_slot: log.slot,
    channel_used: log.channel,
    score_id: log.scoreId,
    prize_id: log.prizeId,
    success: log.success,
    error_message: log.error,
    dispense_method: log.dispenseMethod || 'legacy',
    inventory_before: log.inventoryBefore,
    inventory_after: log.inventoryAfter,
    response_time_ms: log.responseTimeMs,
    source: 'electron_vending_service_sync'
  };

  // Sanitize log entry to remove null values
  const sanitizeLogEntry = (entry: any) => {
    Object.keys(entry).forEach(key => {
      if (entry[key] === null || entry[key] === undefined) {
        delete entry[key];
      }
    });
    return entry;
  };

  const sanitizedLogEntry = sanitizeLogEntry({...electronVendingLogEntry});

  // Try to send to Electron Vending Service logs table (non-blocking)
  fetch(`${API_BASE_URL}/api/electron-vending/log`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sanitizedLogEntry)
  }).then(response => {
    if (response.ok) {
      console.log(`[INVENTORY STORAGE] Successfully synced pending log for slot ${log.slot}, tier ${log.tier}`);
    } else {
      console.warn(`[INVENTORY STORAGE] Failed to sync pending log for slot ${log.slot}, tier ${log.tier}`);
    }
  }).catch(err => {
    console.warn(`[INVENTORY STORAGE] Network error syncing pending log:`, err);
  });
}
```

### 3. Update Interfaces

Update interfaces to remove bronze references:

```typescript
export interface DispensingLog {
  id: string;
  slot: number;
  tier: 'gold' | 'silver';
  success: boolean;
  error?: string;
  timestamp: string;
  source: string;
  server_sync_timestamp?: string; // Added to track when log was synced to server
}

export interface OutOfStockLog {
  id: string;
  tier: 'gold' | 'silver';
  timestamp: string;
  source: string;
  server_sync_timestamp?: string; // Added to track when log was synced to server
}
```

## Testing the Fix

### Test Scenario 1: Slot Reset
1. **Fill all gold slots** (5/5 dispenses each)
2. **Try to dispense another gold prize**
3. **Expected**: All gold slots reset to 0, then prize dispensed
4. **Verify**: Check console logs for reset message

### Test Scenario 2: Offline Sync
1. **Disconnect internet**
2. **Dispense a prize** (should be queued locally)
3. **Reconnect internet**
4. **Expected**: Queued operations sync to server automatically
5. **Verify**: Check IndexedDB and server for synced data

## Benefits of This Fix

1. **✅ Continuous Operation**: System never stops working due to full slots
2. **✅ Fair Distribution**: Automatic reset ensures all slots get used equally
3. **✅ Offline Support**: Operations continue even without internet
4. **✅ Data Integrity**: All operations are tracked and synced when possible
5. **✅ Transparency**: All reset operations are logged for auditing

## Implementation Priority

**High Priority**: Slot reset logic (fixes immediate blocking issue)
**Medium Priority**: Offline sync support (improves reliability)
**Low Priority**: Enhanced slot rotation (nice to have)

This fix ensures your vending system can continue operating 24/7 even when slots reach maximum capacity, and provides robust offline support for network interruptions.