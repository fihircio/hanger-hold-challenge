# Vending System Analysis Report

## Current Issues Identified

### 1. Time Threshold Problem
- **Issue**: Game ending with 57ms (below 3-second minimum for silver)
- **Expected**: Silver prizes require 3000ms minimum (3 seconds)
- **Fix**: Ensure game timer is working correctly and players hold for minimum 3 seconds

### 2. Channel Mapping Inconsistency
- **Issue**: PHP backend uses different channel mappings than frontend services
- **PHP Configuration**:
  - Gold: channels 1-5
  - Silver: channels 6-15
  - Bronze: channels 16-25
- **Frontend Configuration**:
  - Gold: channels 24-25
  - Silver: channels [1-8, 11-18, 21-23, 26-28, 31-38, 45-48, 51-58]
- **Fix**: Update PHP to match frontend channel mappings

### 3. Bronze Tier References
- **Issue**: PHP still references bronze prizes that were removed from frontend
- **Fix**: Remove all bronze tier references from PHP backend

### 4. Mock vs Real Hardware Detection
- **Current**: System correctly falls back to mock mode when hardware not detected
- **Expected**: This is correct behavior for development/testing
- **Real Hardware**: Will show different connection patterns when on actual vending PC

## Expected Behavior on Non-Vending PC (Development)

The following responses are **expected and correct** when not on actual vending PC:

1. **Mock Serial Port Creation**:
   ```
   [TCN SERIAL MOCK] Mock serial port created: {path: 'COM3', baudRate: 115200, ...}
   ```

2. **Simulation Mode Activation**:
   ```
   [VENDING SIMULATION] Dispensing silver prize...
   [VENDING SIMULATION] Command (HEX): 00 FF 06 F9 AA 55
   ```

3. **API Logging Attempts**:
   ```
   [VENDING SERVICE] API logging failed: [network error details]
   ```

## Silver Award Vending Flow (Current Working Method)

### Primary Method: TCN Serial Service
1. **GameScreen.tsx** detects silver award (3-60 seconds)
2. **vendingService.ts** attempts TCN hardware dispense
3. **tcnSerialService.ts** connects to TCN controller
4. Uses channels: [1-8, 11-18, 21-23, 26-28, 31-38, 45-48, 51-58]

### Secondary Method: Electron Vending Service
1. Falls back when TCN not available
2. **electronVendingService.ts** uses Spring SDK protocol
3. Enhanced with capacity tracking and rotation logic
4. Same channel configuration as TCN

### Fallback Method: Simulation
1. Activates when no hardware detected
2. **vendingService.ts** provides simulation
3. Maintains API logging for consistency
4. Uses simulated HEX commands: `00 FF XX XX AA 55`

## Error Analysis

### Current Errors in Logs
1. **Time Too Short**: `Time of 57ms did not qualify for a prize`
   - **Cause**: Game ended before 3-second minimum
   - **Solution**: Hold button for at least 3 seconds

2. **Mock Mode**: `[TCN SERIAL MOCK]` entries
   - **Cause**: Running without actual TCN hardware
   - **Status**: This is expected behavior in development

3. **API Connection Issues** (potential):
   - **Cause**: Network connectivity or API endpoint issues
   - **Solution**: Check backend API accessibility

## PHP Backend Fixes Needed

### Update Channel Mappings
```php
// Current (incorrect):
case 'gold':
    $channel = rand(1, 5); // Gold channels 1-5
    break;
case 'silver':
    $channel = rand(6, 15); // Silver channels 6-15
    break;

// Should be (correct):
case 'gold':
    $channels = [24, 25];
    $channel = $channels[array_rand($channels)];
    break;
case 'silver':
    $channels = [1, 2, 3, 4, 5, 6, 7, 8, 11, 12, 13, 14, 15, 16, 17, 18, 21, 22, 23, 26, 27, 28, 31, 32, 33, 34, 35, 36, 37, 38, 45, 46, 47, 48, 51, 52, 53, 54, 55, 56, 57, 58];
    $channel = $channels[array_rand($channels)];
    break;
```

### Remove Bronze Tier References
- Remove bronze case statements
- Update getTimeTier() function to only return gold/silver/none
- Update database queries to exclude bronze prizes

## Testing Recommendations

### For Development (Non-Vending PC)
1. **Test Time Thresholds**: Hold button for different durations
   - < 3 seconds: Should show "no prize"
   - 3-59 seconds: Should trigger silver prize simulation
   - 60+ seconds: Should trigger gold prize simulation

2. **Verify Console Logs**: Check for expected sequence:
   ```
   [GAME SCREEN] Game ended with time: XXXXms
   [VENDING SERVICE] Attempting TCN hardware dispense for silver tier
   [TCN SERIAL MOCK] Mock serial port created
   [VENDING SIMULATION] Dispensing silver prize...
   ```

### For Production (Actual Vending PC)
1. **Hardware Detection**: Should show real COM port detection
2. **TCN Connection**: Should connect to actual TCN controller
3. **Physical Dispensing**: Should activate real vending machine slots

## Conclusion

Your system is working as expected for development environment. The main issues are:
1. Game time too short (need to hold for 3+ seconds)
2. PHP backend channel mapping needs updating
3. Bronze tier references need removal from PHP

The mock/simulation behavior is correct and expected when not running on the actual vending PC.