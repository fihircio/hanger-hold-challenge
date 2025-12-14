# Expected Behavior on Actual Vending Machine vs Current Logs

## Analysis of Your Current Logs (Lines 51-105)

### Issues Identified:

1. **API Endpoint Not Found**:
```
GET https://vendinghanger.eeelab.xyz/api_endpoints_for_server.php/prizes?check=1&time=57 404 (Not Found)
GET https://vendinghanger.eeelab.xyz/api_endpoints_for_server.php/prizes?check=1&time=3450 404 (Not Found)
```

2. **Time Qualification Issues**:
```
Time of 57ms did not qualify for a prize (fallback).
Time of 3450ms did not qualify for a prize (fallback).
```

3. **TCN Hardware Timeout**:
```
[VENDING SERVICE] TCN hardware dispense failed: Dispense timeout
```

## Expected Behavior on Actual Vending Machine

### When Running on Real Vending PC:

1. **API Endpoints Should Work**:
```
✅ Should be: https://vendinghanger.eeelab.xyz/api_endpoints_for_server.php/prizes?check=1&time=3450
❌ Current: 404 Not Found
```

2. **Time Qualification Should Work**:
```
✅ Expected: 3450ms (3.45 seconds) should qualify for SILVER prize
❌ Current: "did not qualify for a prize"
```

3. **TCN Hardware Should Connect**:
```
✅ Expected: Real TCN controller connection
❌ Current: Mock serial port + timeout
```

## Detailed Expected Log Sequence on Real Vending Machine

### For Silver Award (3-60 seconds):

```log
[GAME SCREEN] Game ended with time: 5000ms
[VENDING SERVICE] Attempting TCN hardware dispense for silver tier
[TCN SERIAL] Starting auto-detection...
[TCN SERIAL] Available ports: [{path: 'COM3', manufacturer: 'Prolific'}, ...]
[TCN SERIAL] Trying port: COM3
[TCN SERIAL] Connecting to COM3 at 115200 baud...
[TCN SERIAL] Connected to COM3
[TCN SERIAL] Testing connection...
[TCN SERIAL] Sent: STATUS
[TCN SERIAL] Received: STATUS: OK
[TCN SERIAL] Successfully connected to COM3
[TCN SERIAL] Sent: STATUS 1
[TCN SERIAL] Dispensing from channel 5
[TCN SERIAL] Sent: DISPENSE 5
[TCN SERIAL] Dispense command sent to channel 5
[TCN SERIAL] Received: DISPENSE 5: STARTING
[TCN SERIAL] Received: DISPENSE 5: SUCCESS
[VENDING SERVICE] TCN hardware dispense successful: silver from channel 5
[ELECTRON VENDING] Prize dispensing logged to API
[GAME SCREEN] Silver prize dispensed!
```

## Key Differences: Development vs Production

### Development (Current Setup):
- ❌ API endpoints return 404
- ❌ Time qualification fails (3450ms should qualify)
- ❌ Mock serial ports created
- ❌ Simulation mode activated
- ❌ Dispense timeout errors

### Production (Real Vending Machine):
- ✅ API endpoints respond correctly
- ✅ Time qualification works (3+ seconds = silver)
- ✅ Real COM ports detected
- ✅ Physical TCN controller connection
- ✅ Actual motor activation
- ✅ Real prize dispensing

## Problems to Fix

### 1. API Endpoint Issue
**Problem**: API URL is incorrect
```
Current: https://vendinghanger.eeelab.xyz/api_endpoints_for_server.php/prizes?check=1&time=3450
Should be: https://vendinghanger.eeelab.xyz/api_endpoints_for_server.php/prizes?check=1&time=3450
```

**Solution**: Check API endpoint configuration in `apiService.ts`

### 2. Time Threshold Issue
**Problem**: 3450ms should qualify for silver
```
Current logic: Time of 3450ms did not qualify for a prize
Should be: 3450ms (3.45 seconds) qualifies for SILVER
```

**Solution**: Check time comparison logic in frontend

### 3. TCN Connection Issue
**Problem**: Mock mode instead of real hardware
```
Current: [TCN SERIAL MOCK] Mock serial port created
Should be: Real TCN hardware connection
```

**Solution**: Deploy to actual vending PC with TCN hardware

## Expected Console Logs on Real Vending Machine

### Successful Silver Prize Dispensing:
```log
[GAME SCREEN] Game ended with time: 5000ms
[VENDING SERVICE] Attempting TCN hardware dispense for silver tier
[TCN SERIAL] Starting auto-detection...
[TCN SERIAL] Available ports: [{path: 'COM3', manufacturer: 'Prolific'}]
[TCN SERIAL] Trying port: COM3
[TCN SERIAL] Connecting to COM3 at 115200 baud...
[TCN SERIAL] Connected to COM3
[TCN SERIAL] Testing connection...
[TCN SERIAL] Sent: STATUS
[TCN SERIAL] Received: STATUS: OK
[TCN SERIAL] Connection test successful
[TCN SERIAL] Successfully connected to COM3
[TCN SERIAL] Sent: STATUS 1
[TCN SERIAL] Dispensing from channel 7
[TCN SERIAL] Sent: DISPENSE 7
[TCN SERIAL] Dispense command sent to channel 7
[TCN SERIAL] Received: DISPENSE 7: STARTING
[TCN SERIAL] Received: DISPENSE 7: SUCCESS
[VENDING SERVICE] TCN hardware dispense successful: silver from channel 7
[GAME SCREEN] Silver prize dispensed!
```

### Failed Silver Prize (Hardware Error):
```log
[GAME SCREEN] Game ended with time: 5000ms
[VENDING SERVICE] Attempting TCN hardware dispense for silver tier
[TCN SERIAL] Starting auto-detection...
[TCN SERIAL] Connected to COM3
[TCN SERIAL] Dispensing from channel 7
[TCN SERIAL] Sent: DISPENSE 7
[TCN SERIAL] Received: DISPENSE 7: FAILED
[TCN SERIAL] Error: Motor malfunction
[VENDING SERVICE] TCN hardware dispense failed: Motor malfunction
[GAME SCREEN] Failed to dispense prize
```

## Summary

Your current logs show you're **not on the actual vending machine** because:

1. **API 404 errors** indicate wrong endpoint configuration
2. **Time qualification failing** suggests frontend logic issue
3. **Mock serial ports** confirm development environment
4. **Dispense timeouts** indicate no real hardware

On a **real vending machine**, you would see:
- Successful API responses
- Correct time qualification (3+ seconds = silver)
- Real COM port detection
- Physical TCN controller responses
- Actual motor activation and prize delivery