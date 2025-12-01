# New Trigger Chain Testing Guide

## Overview
This guide provides comprehensive testing procedures for the new primary trigger chain using Electron Vending Service.

## New Trigger Chain Architecture

```
Arduino Sensor (1→0 transition)
    ↓
onSensorEnd (arduinoSensorService.ts:139)
    ↓
GameScreen.onSensorEnd (GameScreen.tsx:77)
    ↓
App.handleHoldComplete (App.tsx:79)
    ↓
prizeService.checkAndDispensePrize (prizeService.ts:25) ← PRIMARY: Electron Vending Service
    ↓
electronVendingService.handlePrizeDispensing (electronVendingService.ts:262) ← NEW PRIMARY
    ↓
Spring SDK → Legacy → Fallback cascade
```

## Testing Phases

### Phase 1: Service Initialization Testing

#### 1.1 Electron Vending Service Initialization
```bash
# Test in browser console
electronVendingService.initializeVending().then(result => {
  console.log('Initialization result:', result);
}).catch(error => {
  console.error('Initialization error:', error);
});
```

**Expected Results:**
- Console: `[ELECTRON VENDING] Spring SDK service initialized successfully`
- Console: `[ELECTRON VENDING] Inventory management initialized`
- Return: `true`

#### 1.2 Arduino Sensor Service Integration
```bash
# Test sensor event handlers
arduinoSensorService.setEventHandlers({
  onSensorStart: (ts) => console.log('Sensor start:', ts),
  onSensorEnd: (ts) => console.log('Sensor end:', ts),
  onSensorChange: (state) => console.log('Sensor state:', state)
});
```

**Expected Results:**
- Serial listeners properly set up
- Debounce logic working (300ms delay)
- State transitions detected correctly

### Phase 2: Prize Tier Logic Testing

#### 2.1 Time-Based Tier Determination
```javascript
// Test different game times
const testTimes = [25000, 35000, 65000]; // No prize, Silver, Gold

testTimes.forEach(async (time) => {
  const result = await electronVendingService.handlePrizeDispensing(time);
  console.log(`Time ${time}ms -> Tier: ${result.tier}, Success: ${result.success}`);
});
```

**Expected Results:**
- 25000ms: `tier: 'bronze', success: false` (no prize)
- 35000ms: `tier: 'silver', success: true`
- 65000ms: `tier: 'gold', success: true`

#### 2.2 Slot Selection and Load Balancing
```javascript
// Test slot progression
for (let i = 0; i < 10; i++) {
  const result = await electronVendingService.handlePrizeDispensing(35000);
  console.log(`Test ${i+1}: Slot ${result.slot}, Channel ${result.channel}`);
}
```

**Expected Results:**
- Silver slots: 1, 2, 3, 4, 5, 6, 7, 8, 11, 12, 13, 14, 15, 16, 17, 18, 21, 22, 23, 26, 27, 28, 31, 32, 33, 34, 35, 36, 37, 38, 45, 46, 47, 48, 51, 52, 53, 54, 55, 56, 57, 58
- Gold slots: 24, 25
- Load balancing: least used slots selected first

### Phase 3: Inventory Management Testing

#### 3.1 Slot Count Tracking
```bash
# Check initial inventory
curl -X GET "http://vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/slots"

# After dispensing, check counts incremented
curl -X GET "http://vendinghanger.eeelab.xyz/apiendpoints.php/api/inventory/stats"
```

**Expected Results:**
- Initial counts: 0 for all slots
- After each successful dispense: count increments by 1
- Max capacity: 5 per slot

#### 3.2 Out of Stock Handling
```javascript
// Simulate empty slot by incrementing to max capacity
for (let i = 0; i < 5; i++) {
  await electronVendingService.handlePrizeDispensing(35000); // Same slot should fill up
}

// Next attempt should fail with out of stock
const result = await electronVendingService.handlePrizeDispensing(35000);
console.log('Out of stock test:', result);
```

**Expected Results:**
- After 5 dispenses: slot count = 5 (max capacity)
- 6th attempt: `success: false, error: "No available slots for silver tier"`
- Out of stock logged to server

### Phase 4: Error Handling and Fallback Testing

#### 4.1 Spring SDK Failure Simulation
```javascript
// Mock Spring SDK failure
const originalDispense = springVendingService.dispensePrizeByTier;
springVendingService.dispensePrizeByTier = () => Promise.resolve({
  success: false,
  error: 'Simulated Spring SDK failure'
});

// Test fallback to legacy method
const result = await electronVendingService.handlePrizeDispensing(35000);
console.log('Fallback test result:', result);

// Restore original method
springVendingService.dispensePrizeByTier = originalDispense;
```

**Expected Results:**
- Console: `[ELECTRON VENDING] Spring SDK not initialized, falling back to legacy method`
- Legacy serial command sent successfully
- Result: `success: true` (via fallback)

#### 4.2 Complete Service Failure Testing
```javascript
// Test complete fallback chain
const result = await prizeService.checkAndDispensePrize(35000);
console.log('Complete fallback test:', result);
```

**Expected Results:**
1. Primary: Electron Vending Service attempt
2. Secondary: API eligibility check
3. Tertiary: TCN Integration Service
4. Final: Original vending service

### Phase 5: Integration Testing

#### 5.1 End-to-End Game Flow
```bash
# Manual testing steps:
1. Launch application
2. Complete intro video and instructions
3. Enter player details
4. Start game (READY state)
5. Simulate Arduino sensor: send "1" then "0" via serial
6. Verify game ends with correct time
7. Check prize awarded based on time
8. Verify dispensing attempt logged
```

**Expected Results:**
- Arduino sensor state changes detected
- Game time calculated correctly
- Prize tier determined by time threshold
- Electron Vending Service handles dispensing
- Inventory counts updated
- API logs created

#### 5.2 Database Integration Verification
```bash
# Check vending_logs table
mysql -u eeelab46_vendinghangeruser -p eeelab46_vendinghangerdb -e "
SELECT * FROM vending_logs ORDER BY created_at DESC LIMIT 5;"

# Check dispensing_logs table
mysql -u eeelab46_vendinghangeruser -p eeelab46_vendinghangerdb -e "
SELECT * FROM dispensing_logs ORDER BY created_at DESC LIMIT 5;"

# Check slot_inventory table
mysql -u eeelab46_vendinghangeruser -p eeelab46_vendinghangerdb -e "
SELECT * FROM slot_inventory ORDER BY slot;"
```

**Expected Results:**
- Vending logs: Spring SDK columns populated
- Dispensing logs: Success/failure tracked
- Slot inventory: Counts incremented correctly

### Phase 6: Performance and Stress Testing

#### 6.1 Rapid Dispensing Test
```javascript
// Test multiple rapid dispensing
const promises = [];
for (let i = 0; i < 20; i++) {
  promises.push(electronVendingService.handlePrizeDispensing(35000));
}

const results = await Promise.all(promises);
console.log('Rapid dispensing results:', results);
```

**Expected Results:**
- All requests handled without race conditions
- Slot counts accurate despite concurrent access
- No duplicate slot selections

#### 6.2 Memory and Resource Usage
```bash
# Monitor memory usage during extended testing
# In browser console:
performance.memory;

# Check for memory leaks during repeated game cycles
```

**Expected Results:**
- Stable memory usage
- No memory leaks in event handlers
- Proper cleanup in service methods

## Test Checklist

### Pre-Deployment Checklist
- [ ] Electron Vending Service initializes successfully
- [ ] Arduino sensor events trigger correctly
- [ ] Prize tier logic matches time thresholds
- [ ] Slot load balancing works as expected
- [ ] Inventory counts increment properly
- [ ] Out of stock situations handled gracefully
- [ ] Error cascades work correctly
- [ ] API integration functions properly
- [ ] Database logs are accurate
- [ ] Performance is acceptable

### Post-Deployment Verification
- [ ] No TypeScript errors in console
- [ ] All services load without errors
- [ ] Game flow completes successfully
- [ ] Prize dispensing works reliably
- [ ] Inventory management stays synchronized
- [ ] Error handling prevents system crashes
- [ ] User experience remains smooth

## Troubleshooting Guide

### Common Issues and Solutions

#### Issue 1: Electron Vending Service fails to initialize
**Symptoms:** Console shows initialization error
**Causes:** Missing Electron API, Spring SDK not available
**Solutions:**
- Verify running in Electron environment
- Check Spring SDK dependencies
- Ensure serial ports available

#### Issue 2: Arduino sensor not triggering
**Symptoms:** Game doesn't end when sensor changes
**Causes:** Serial port disconnected, sensor disabled
**Solutions:**
- Check serial port connections
- Verify sensor service enabled
- Check debounce timing (300ms)

#### Issue 3: Wrong prize tier awarded
**Symptoms:** Time thresholds not matching expected tiers
**Causes:** Time calculation error, tier logic incorrect
**Solutions:**
- Verify time in milliseconds
- Check `determinePrizeTierByTime` logic
- Ensure consistent time units

#### Issue 4: Inventory counts not updating
**Symptoms:** Slot counts stay at 0 after dispensing
**Causes:** API call failing, storage service error
**Solutions:**
- Check network connectivity
- Verify API endpoints accessible
- Check inventory storage service initialization

#### Issue 5: Multiple dispensing from same slot
**Symptoms:** Load balancing not working
**Causes:** Slot selection logic error, count not updating
**Solutions:**
- Verify `getNextAvailableSlot` logic
- Check `incrementSlotCount` execution
- Ensure database transactions complete

## Success Criteria

The new trigger chain is considered successful when:

1. **Reliability:** 99%+ successful dispensing when inventory available
2. **Performance:** Dispensing completes within 2 seconds
3. **Accuracy:** Prize tiers match time thresholds correctly
4. **Inventory:** Slot counts stay synchronized across all systems
5. **Error Handling:** Graceful degradation when services fail
6. **User Experience:** Smooth game flow without interruptions

## Monitoring and Maintenance

### Key Metrics to Track
- Dispensing success rate
- Average dispensing time
- Slot utilization distribution
- Error frequency by type
- Inventory turnover rate

### Regular Maintenance Tasks
- Weekly inventory reconciliation
- Monthly performance review
- Quarterly system health check
- Annual load testing refresh

This comprehensive testing guide ensures the new Electron Vending Service primary trigger chain works reliably and maintains all existing functionality while providing enhanced inventory management and error handling capabilities.