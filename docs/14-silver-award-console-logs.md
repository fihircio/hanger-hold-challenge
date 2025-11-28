# Silver Award Console Logs - Complete Flow

## Overview

This document shows the complete expected console log flow when a user wins a silver award, from game completion to prize dispensing using the updated hex spring SDK with slot capacity tracking and rotation logic.

## Complete Console Log Flow

### 1. Game End Detection
```
[GAME SCREEN] Game ended with time: 35000ms
[GAME SCREEN] Arduino sensor END - triggering hold end and prize dispensing
```

### 2. Tier Determination
```
[GAME SCREEN] Dispensing silver prize...
```

### 3. Vending Service Selection
```
[VENDING SERVICE] Attempting TCN hardware dispense for silver tier
[VENDING SERVICE] TCN not connected, attempting auto-connect...
[VENDING SERVICE] TCN connection failed, falling back to Electron
[VENDING SERVICE] Using enhanced Spring SDK with capacity tracking
```

### 4. Simulation Mode (If Hardware Unavailable)
```
[VENDING SIMULATION] Dispensing silver prize...
[VENDING SIMULATION] Preparing to send command for slot 1...
[VENDING SIMULATION] Command (HEX): 00 FF 01 FE AA 55
[VENDING SIMULATION] Sending command to serial port...
[VENDING SIMULATION] Command sent.
[VENDING SIMULATION] Waiting for response...
[VENDING SIMULATION] Response received (HEX): 00 5D 00 AA 07
[VENDING SIMULATION] Slot 1 dispensed successfully.
```

### 5. Enhanced Spring SDK Mode (Primary Path)
```
[VENDING SERVICE] Using enhanced Spring SDK with capacity tracking
[ELECTRON VENDING] Dispensing silver prize...
[SPRING VENDING] Dispensing silver prize from channel 1
[SPRING VENDING] Selected silver channel 1 (index 0, capacity 5)
[SPRING VENDING] Successfully dispensed silver prize from channel 1
[ELECTRON VENDING] Successfully dispensed silver prize from channel 1
[ELECTRON VENDING] Prize dispensing logged to API
[SPRING VENDING] Dispensing silver prize from channel 2
[SPRING VENDING] Selected silver channel 2 (index 1, capacity 4)
[SPRING VENDING] Successfully dispensed silver prize from channel 2
[ELECTRON VENDING] Successfully dispensed silver prize from channel 2
[ELECTRON VENDING] Prize dispensing logged to API
```

### 6. Enhanced Legacy Fallback Mode (If Enhanced SDK Fails)
```
[VENDING SERVICE] Failed to initialize enhanced Spring SDK, falling back to legacy method
[ELECTRON VENDING] Preparing to send command for slot 1...
[ELECTRON VENDING] Selected silver channel 1 with capacity tracking
[ELECTRON VENDING] Found available silver channel 1 with capacity
[ELECTRON VENDING] Command (HEX): 00 FF 01 FE AA 55
[ELECTRON VENDING] Command sent successfully to slot 1
[ELECTRON VENDING] Dispensed from silver channel 1 - 1 remaining
[ELECTRON VENDING] Prize dispensing logged to API
```

### 7. Enhanced Legacy with Rotation Logic
```
[ELECTRON VENDING] Preparing to send command for slot 1...
[ELECTRON VENDING] Selected silver channel 2 with capacity tracking
[ELECTRON VENDING] Found available silver channel 2 with capacity
[ELECTRON VENDING] Command (HEX): 00 FF 02 FD AA 55
[ELECTRON VENDING] Command sent successfully to slot 2
[ELECTRON VENDING] Dispensed from silver channel 2 - 1 remaining
[ELECTRON VENDING] Prize dispensing logged to API
```

### 6. Spring SDK Enhanced Mode (If Electron Spring SDK Available)
```
[ELECTRON VENDING] Dispensing silver prize...
[SPRING VENDING] Dispensing silver prize from channel 1
[SPRING VENDING] Selected silver channel 1 (index 0, capacity 5)
[SPRING VENDING] Shipping in progress for channel 1
[SPRING VENDING] Successfully dispensed silver prize from channel 1
[ELECTRON VENDING] Successfully dispensed silver prize from channel 1
[ELECTRON VENDING] Prize dispensing logged to API
[SPRING VENDING] Dispense log: {
  timestamp: 2025-11-28T02:47:35.268Z,
  channel: 1,
  tier: 'silver',
  success: true
}
```

### 7. Capacity Tracking Logs
```
[SPRING VENDING] Selected silver channel 2 (index 1, capacity 4)
[SPRING VENDING] Successfully dispensed silver prize from channel 2
[SPRING VENDING] Dispense log: {
  timestamp: 2025-11-28T02:47:36.152Z,
  channel: 2,
  tier: 'silver',
  success: true
}
```

### 8. Rotation Logic Logs
```
[SPRING VENDING] Selected silver channel 3 (index 2, capacity 3)
[SPRING VENDING] Successfully dispensed silver prize from channel 3
[SPRING VENDING] Selected silver channel 4 (index 3, capacity 2)
[SPRING VENDING] Successfully dispensed silver prize from channel 4
[SPRING VENDING] Selected silver channel 5 (index 4, capacity 1)
[SPRING VENDING] Successfully dispensed silver prize from channel 5
[SPRING VENDING] Selected silver channel 6 (index 5, capacity 0) - SKIPPED
[SPRING VENDING] Selected silver channel 7 (index 6, capacity 5) - RESET CYCLE
[SPRING VENDING] Successfully dispensed silver prize from channel 7
```

### 9. API Integration Logs
```
[ELECTRON VENDING] Successfully dispensed silver prize from channel 7
[ELECTRON VENDING] Prize dispensing logged to API
```

### 10. Game Screen Status Updates
```
[GAME SCREEN] Dispensing silver prize...
[GAME SCREEN] Silver prize dispensed!
```

### 11. Timeout and Error Scenarios
```
[SPRING VENDING] Shipping timeout
[SPRING VENDING] Failed to dispense from channel 8: Shipping timeout
[SPRING VENDING] Dispense log: {
  timestamp: 2025-11-28T02:47:45.123Z,
  channel: 8,
  tier: 'silver',
  success: false,
  error: 'Shipping timeout'
}
[GAME SCREEN] Failed to dispense prize
```

### 12. Complete Success Flow Summary
```
[GAME SCREEN] Game ended with time: 35000ms
[GAME SCREEN] Arduino sensor END - triggering hold end and prize dispensing
[GAME SCREEN] Dispensing silver prize...
[VENDING SERVICE] Attempting TCN hardware dispense for silver tier
[VENDING SERVICE] TCN connection failed, falling back to Electron
[VENDING SERVICE] Using enhanced Spring SDK with capacity tracking
[ELECTRON VENDING] Dispensing silver prize...
[SPRING VENDING] Dispensing silver prize from channel 1
[SPRING VENDING] Selected silver channel 1 (index 0, capacity 5)
[SPRING VENDING] Shipping in progress for channel 1
[SPRING VENDING] Successfully dispensed silver prize from channel 1
[ELECTRON VENDING] Successfully dispensed silver prize from channel 1
[ELECTRON VENDING] Prize dispensing logged to API
[SPRING VENDING] Dispense log: {
  timestamp: 2025-11-28T02:47:35.268Z,
  channel: 1,
  tier: 'silver',
  success: true
}
[GAME SCREEN] Silver prize dispensed!
```

## Key Log Patterns to Watch For

### Successful Silver Award
1. **Game End**: `[GAME SCREEN] Game ended with time: XXXXXms`
2. **Tier Detection**: Time >= 3000ms triggers silver tier (3 seconds)
3. **Vending Start**: `[GAME SCREEN] Dispensing silver prize...`
4. **Channel Selection**: `[SPRING VENDING] Selected silver channel X (index Y, capacity Z)`
5. **HEX Command**: `00 FF XX XX AA 55` (where XX is slot number)
6. **Success Confirmation**: `[SPRING VENDING] Successfully dispensed silver prize from channel X`
7. **Capacity Update**: Remaining capacity decreases by 1
8. **UI Update**: `[GAME SCREEN] Silver prize dispensed!`

### Rotation Behavior
- **Index Tracking**: Shows current position in silver channel array
- **Capacity Check**: Skips channels with 0 remaining capacity
- **Cycle Reset**: Returns to start when all channels are exhausted

### Error Scenarios
- **Timeout**: `[SPRING VENDING] Shipping timeout` (3 seconds for silver)
- **No Capacity**: `[SPRING VENDING] Channel X has no remaining capacity`
- **Hardware Failure**: `[ELECTRON VENDING] Failed to send command to slot X`
- **Electron Failure**: `[VENDING SERVICE] Electron Spring SDK failed`

## Debugging Tips

### Check Silver Rotation
```javascript
// In browser console, monitor rotation:
setInterval(() => {
  const status = springVendingService.getAllChannelStatus();
  const silverChannels = [1,2,3,4,5,6,7,8,11,12,13,14,15,16,17,18,21,22,23,26,27,28,31,32,33,34,35,36,37,38,45,46,47,48,51,52,53,54,55,56,57,58];
  silverChannels.forEach(ch => {
    const s = status.find(s => s.channel === ch);
    if (s) console.log(`Channel ${ch}: ${s.remainingCapacity}/5 remaining`);
  });
}, 5000);
```

### Monitor Capacity Changes
```javascript
// Watch capacity decrease during dispensing
const originalLog = console.log;
console.log = function(...args) {
  if (args[0].includes('Successfully dispensed silver prize')) {
    console.log('🎯 SILVER PRIZE DISPENSED - Check capacity update');
  }
  return originalLog.apply(console, args);
};
```

This complete log flow helps verify that your hex spring SDK is working correctly with the new slot capacity tracking and rotation logic for silver awards.