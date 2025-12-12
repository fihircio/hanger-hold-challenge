# Arduino Sensor Loop Issue Fix

## Problem Description

When the Arduino sensor is NOT actively triggered (no hand in front of sensor), the system gets stuck in an infinite retry loop trying to connect to COM ports. This happens because:

1. The `ensureSerialConnection()` method automatically tries to connect when sensor is enabled
2. Both COM1 and COM7 show "Access denied" errors
3. The retry logic in `retryWithDifferentPorts()` keeps trying different strategies
4. Without a sensor trigger, there's no stable connection to break the retry cycle

## Root Cause Analysis

### Working Scenario (log.md)
- User actively triggers sensor
- System detects state changes: `0 -> 1` then `1 -> 0`
- Game completes normally with prize dispensing
- Slot 54 receives HEX command and reports success

### Non-Working Scenario (log2.md)
- User doesn't trigger sensor
- System gets stuck in initialization phase
- Multiple failed attempts to connect to COM1 and COM7
- Game never starts properly
- Loop continues indefinitely

## Solution Strategy

### 1. Add Sensor Trigger Detection

The Arduino sensor should only attempt serial connection when there's actual sensor activity, not just when enabled.

### 2. Implement Connection Timeout

Add a maximum timeout for connection attempts to prevent infinite loops.

### 3. Improve Port Access Handling

Better handle "Access denied" errors without triggering endless retries.

## Recommended Code Changes

### Change 1: Modify `ensureSerialConnection()` Logic

```typescript
private async ensureSerialConnection(): Promise<void> {
  if (!window.electronAPI) return;
  
  // CRITICAL FIX: Only attempt connection if we haven't already tried recently
  const lastConnectionAttempt = this.lastConnectionAttempt || 0;
  const now = Date.now();
  const MIN_RETRY_INTERVAL = 10000; // 10 seconds between connection attempts
  
  if (this.serialListenerSetup && this.isConnected) {
    console.log('[Arduino Sensor] Already connected to serial port, skipping reconnection');
    return;
  }
  
  // NEW: Don't retry too frequently
  if (now - lastConnectionAttempt < MIN_RETRY_INTERVAL) {
    console.log('[Arduino Sensor] Connection attempt too recent, skipping');
    return;
  }
  
  this.lastConnectionAttempt = now;
  
  // Rest of existing logic...
}
```

### Change 2: Add Maximum Retry Limit

```typescript
private async retryWithDifferentPorts(failedPort: any): Promise<void> {
  console.log('[Arduino Sensor] Starting optimized retry logic for Access denied error...');
  
  // NEW: Add maximum retry counter
  const MAX_TOTAL_RETRIES = 3;
  this.totalRetryCount = (this.totalRetryCount || 0) + 1;
  
  if (this.totalRetryCount > MAX_TOTAL_RETRIES) {
    console.warn('[Arduino Sensor] Maximum retry attempts reached, giving up');
    // Don't retry anymore - let system continue with mock mode
    return;
  }
  
  // Rest of existing retry logic...
}
```

### Change 3: Add Sensor Activity Detection

```typescript
private hasSensorActivity: boolean = false;

private handleSerialData(data: string): void {
  if (!this.isEnabled) {
    return;
  }

  const sensorValue = parseInt(data.trim());
  
  // Validate sensor value
  if (isNaN(sensorValue) || (sensorValue !== 0 && sensorValue !== 1)) {
    console.warn('Invalid sensor value received:', data);
    return;
  }

  // NEW: Mark that we've detected sensor activity
  if (sensorValue === 1 || sensorValue === 0) {
    this.hasSensorActivity = true;
  }

  // Rest of existing logic...
}
```

### Change 4: Modify Connection Strategy

```typescript
private async ensureSerialConnection(): Promise<void> {
  if (!window.electronAPI) return;
  
  // NEW: Only attempt connection if we have sensor activity or haven't tried before
  if (!this.hasSensorActivity && this.totalRetryCount > 0) {
    console.log('[Arduino Sensor] No sensor activity detected, skipping connection attempts');
    return;
  }
  
  // Rest of connection logic...
}
```

## Implementation Priority

### Immediate Fix (High Priority)
1. Add connection timeout to prevent infinite loops
2. Limit maximum retry attempts to 3
3. Add minimum retry interval of 10 seconds

### Enhanced Fix (Medium Priority)
1. Add sensor activity detection
2. Only attempt connection if sensor activity is detected
3. Improve error handling for "Access denied" scenarios

## Testing Strategy

### Test Case 1: Normal Operation
1. Start system
2. Wave hand in front of sensor
3. Verify sensor state changes are detected
4. Verify game completes successfully

### Test Case 2: No Sensor Trigger
1. Start system
2. Don't trigger sensor
3. Verify system doesn't get stuck in retry loop
4. Verify timeout occurs after maximum retries

### Test Case 3: Port Access Issues
1. Start system with COM ports unavailable
2. Verify graceful fallback to mock mode
3. Verify system remains functional

## Fallback Behavior

When all connection attempts fail:
1. Log the failure clearly
2. Continue with mock mode
3. Allow game to start with simulated sensor data
4. Show clear error message to user

## Files to Modify

1. `services/arduinoSensorService.ts` - Main fixes
2. `components/GameScreen.tsx` - Add error handling for sensor initialization failures
3. `electron/main/main.ts` - Improve port access error handling

## Expected Outcome

After implementing these fixes:
1. System will not get stuck in infinite retry loops
2. Normal sensor-triggered operation will work as before
3. Non-triggered scenarios will timeout gracefully
4. Clear error messages will help with debugging
5. System will remain functional even with port access issues

## Rollback Plan

If the new fixes cause issues:
1. Revert to current `ensureSerialConnection()` logic
2. Keep the retry count and timeout additions
3. Remove sensor activity detection if problematic
4. Test each change individually

## Success Metrics

- No more infinite loops in log2.md scenario
- Normal operation (log.md scenario) continues to work
- Clear error messages for debugging
- Graceful degradation when ports are unavailable
- Maximum 3 retry attempts with 10-second intervals