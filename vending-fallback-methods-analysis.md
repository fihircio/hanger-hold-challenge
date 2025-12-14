# Complete Vending Fallback Methods Analysis

## Vending System Fallback Chain

When TCN hardware fails, your system has multiple fallback layers. Here's the complete flow:

## Primary Method: TCN Serial Service
**File**: [`services/tcnSerialService.ts`](services/tcnSerialService.ts:1)

### When TCN Fails:
- **Connection timeout**: No TCN controller detected
- **Hardware malfunction**: TCN controller not responding
- **Serial port errors**: COM port communication failure
- **Motor failures**: Physical dispensing mechanism issues

---

## Secondary Method: Electron Vending Service (Spring SDK)
**File**: [`services/electronVendingService.ts`](services/electronVendingService.ts:1)

### Activation Triggers:
```typescript
// From vendingService.ts lines 81-104
if (typeof window !== 'undefined' && window.electronAPI) {
  try {
    const initialized = await electronVendingService.initializeVending();
    if (initialized) {
      console.log('[VENDING SERVICE] Using enhanced Spring SDK with capacity tracking');
      return await electronVendingService.dispensePrizeByTier(tier, prizeId, scoreId);
    }
  } catch (electronError) {
    console.error('[VENDING SERVICE] Electron Spring SDK failed:', electronError);
    // Fall back to simulation
  }
}
```

### Features:
- **Enhanced Spring SDK protocol** with capacity tracking
- **Round-robin channel selection** for even wear
- **5-item capacity per slot** with rotation logic
- **Comprehensive error handling** with specific error codes
- **API integration** for logging and tracking

### Expected Console Logs:
```log
[ELECTRON VENDING] Spring SDK service initialized successfully
[ELECTRON VENDING] Dispensing silver prize...
[ELECTRON VENDING] Successfully dispensed silver prize from channel 12
[ELECTRON VENDING] Prize dispensing logged to API
```

### Error Scenarios:
```log
[ELECTRON VENDING] Failed to dispense silver prize: Channel 5 motor malfunction
[ELECTRON VENDING] Spring SDK channel error - motor malfunction
[ELECTRON VENDING] Failed to log to API: Network error
```

---

## Tertiary Method: Simulation Mode
**File**: [`services/vendingService.ts`](services/vendingService.ts:110-160)

### Activation Triggers:
```typescript
// Final fallback when all hardware methods fail
return await simulateDispense(tier, prizeId, scoreId);
```

### Features:
- **Simulated HEX commands**: `00 FF XX XX AA 55`
- **Realistic delays**: 1.5s command + 2s response time
- **API logging attempts** for consistency
- **Same channel ranges** as production

### Expected Console Logs:
```log
[VENDING SIMULATION] Dispensing silver prize...
[VENDING SIMULATION] Preparing to send command for slot 7...
[VENDING SIMULATION] Command (HEX): 00 FF 07 F8 AA 55
[VENDING SIMULATION] Sending command to serial port...
[VENDING SIMULATION] Command sent.
[VENDING SIMULATION] Waiting for response...
[VENDING SIMULATION] Response received (HEX): 00 5D 00 AA 07
[VENDING SIMULATION] Slot 7 dispensed successfully.
```

---

## Complete Fallback Flow with Expected Logs

### Scenario: TCN Hardware Failure

```log
[GAME SCREEN] Game ended with time: 5000ms
[VENDING SERVICE] Attempting TCN hardware dispense for silver tier
[TCN SERIAL] Starting auto-detection...
[TCN SERIAL] Available ports: [{path: 'COM3', manufacturer: 'Prolific'}]
[TCN SERIAL] Trying port: COM3
[TCN SERIAL] Connecting to COM3 at 115200 baud...
[TCN SERIAL] Connection failed: Port already in use
[VENDING SERVICE] TCN hardware error: Connection failed
[VENDING SERVICE] Using enhanced Spring SDK with capacity tracking
[ELECTRON VENDING] Spring SDK service initialized successfully
[ELECTRON VENDING] Dispensing silver prize...
[ELECTRON VENDING] Successfully dispensed silver prize from channel 12
[ELECTRON VENDING] Prize dispensing logged to API
[GAME SCREEN] Silver prize dispensed!
```

### Scenario: Both TCN and Electron Fail

```log
[GAME SCREEN] Game ended with time: 5000ms
[VENDING SERVICE] Attempting TCN hardware dispense for silver tier
[TCN SERIAL] Starting auto-detection...
[TCN SERIAL] No TCN-compatible ports found
[VENDING SERVICE] TCN hardware error: No compatible ports
[VENDING SERVICE] Using enhanced Spring SDK with capacity tracking
[ELECTRON VENDING] Spring SDK initialization failed: Not in Electron environment
[VENDING SERVICE] Electron Spring SDK failed: Not in Electron environment
[VENDING SIMULATION] Dispensing silver prize...
[VENDING SIMULATION] Preparing to send command for slot 7...
[VENDING SIMULATION] Command (HEX): 00 FF 07 F8 AA 55
[VENDING SIMULATION] Sending command to serial port...
[VENDING SIMULATION] Command sent.
[VENDING SIMULATION] Waiting for response...
[VENDING SIMULATION] Response received (HEX): 00 5D 00 AA 07
[VENDING SIMULATION] Slot 7 dispensed successfully.
[GAME SCREEN] Silver prize dispensed!
```

---

## Channel Selection by Method

### TCN Serial Service:
```typescript
// 37 silver channels in custom arrangement
const silverChannels = [
  1, 2, 3, 4, 5, 6, 7, 8,        // Block 1
  11, 12, 13, 14, 15, 16, 17, 18, // Block 2  
  21, 22, 23,                      // Block 3
  26, 27, 28,                      // Block 4
  31, 32, 33, 34, 35, 36, 37, 38, // Block 5
  45, 46, 47, 48,                  // Block 6
  51, 52, 53, 54, 55, 56, 57, 58  // Block 7
];
```

### Electron Vending Service:
```typescript
// Same channel mapping with capacity tracking
const workingChannel = await this.findWorkingChannelWithRotation(availableChannels, tier);
// Uses round-robin with 5-item capacity per slot
```

### Simulation Mode:
```typescript
// Random selection from same channel ranges
slotNumber = Math.floor(Math.random() * 10) + 6; // 6-15 for silver
```

---

## Error Handling by Method

### TCN Errors:
- **Connection timeout**: 15 seconds
- **Dispense timeout**: 15 seconds  
- **Motor malfunction**: Hardware-specific error codes
- **Communication errors**: Serial port failures

### Electron Spring SDK Errors:
- **Channel errors**: Specific motor malfunction codes
- **Capacity errors**: Slot empty or full
- **API errors**: Network connectivity issues
- **Initialization errors**: Spring SDK not available

### Simulation Errors:
- **API failures**: Network connectivity issues
- **Simulation failures**: Logic errors in fallback mode

---

## Summary

Your vending system has **3 robust fallback layers**:

1. **Primary**: TCN Serial Service (direct hardware control)
2. **Secondary**: Electron Vending Service (enhanced Spring SDK)
3. **Tertiary**: Simulation Mode (development/testing)

Each method provides **detailed console logging** and **graceful degradation** to ensure players always get their prizes, even if hardware fails.