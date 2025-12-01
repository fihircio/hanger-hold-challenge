# Electron Vending Service Implementation - Complete Guide

## Overview

This document describes the complete implementation of using `electronVendingService.ts` as the primary trigger chain for the vending system, replacing the previous `tcnIntegrationService.ts` primary role while maintaining it as a fallback.

## Architecture Changes

### New Primary Trigger Chain

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

### Key Improvements

1. **Centralized Inventory Management**: All slot tracking and load balancing now handled in one place
2. **Enhanced Error Handling**: Multi-level fallback system ensures reliability
3. **Better API Integration**: Direct communication with inventory endpoints
4. **Improved Logging**: Comprehensive tracking of all dispensing operations
5. **Smart Slot Selection**: Load balancing prevents slot overuse

## Implementation Details

### 1. Enhanced Electron Vending Service

#### New Methods Added

**handlePrizeDispensing(time: number, scoreId?: string): Promise<PrizeDispenseResult>**
- Primary entry point for prize dispensing
- Determines prize tier based on game time
- Handles slot selection with load balancing
- Manages Spring SDK and legacy fallbacks
- Integrates with inventory API

**Inventory Management Methods:**
- `initializeInventoryManagement()`: Sets up inventory tracking
- `syncSlotConfiguration()`: Syncs local config with storage
- `getNextAvailableSlot()`: Smart slot selection with load balancing
- `incrementSlotCount()`: Updates inventory after successful dispensing
- `getInventoryStatistics()`: Provides comprehensive inventory stats

#### Channel Configuration

```typescript
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
```

### 2. Updated Prize Service

#### New Primary Flow

```typescript
export const checkAndDispensePrize = async (time: number, scoreId?: string): Promise<Prize | null> => {
  // Use Electron Vending Service as primary trigger chain
  const result = await electronVendingService.handlePrizeDispensing(time, scoreId);
  
  if (result.success && result.slot) {
    // Create prize object based on successful dispensing
    const prize: Prize = {
      id: result.prizeId,
      name: `${result.tier.charAt(0).toUpperCase() + result.tier.slice(1)} Prize`,
      message: result.tier === 'gold' ? 'Incredible! You won Gold Prize!' : 'Amazing! You won Silver Prize!',
      slot: result.slot,
    };
    return prize;
  } else {
    // Fallback chain: API → TCN → Original vending
    // ... (detailed fallback logic)
  }
};
```

#### Fallback Chain

1. **Primary**: Electron Vending Service with Spring SDK
2. **Secondary**: API eligibility check + TCN Integration
3. **Tertiary**: Local fallback logic + Original vending service

### 3. Updated App.tsx Integration

#### Service Initialization

```typescript
useEffect(() => {
  // Initialize Electron Vending Service as primary trigger chain
  electronVendingService.initializeVending().then(success => {
    console.log(`[APP] Electron Vending Service initialization: ${success ? 'SUCCESS' : 'FAILED'}`);
  });
  
  // TCN Integration kept as fallback
  tcnIntegrationService.initialize().then(success => {
    console.log(`[APP] TCN Integration initialization: ${success ? 'SUCCESS' : 'FAILED'}`);
  });
}, []);
```

#### Updated Game Completion Handler

```typescript
const handleHoldComplete = useCallback(async (duration: number) => {
  console.log(`[APP] Game completed with duration: ${duration}ms - using new Electron Vending Service trigger chain`);
  
  // Prize Service now uses Electron Vending Service as primary trigger
  const awardedPrize = await prizeService.checkAndDispensePrize(duration, currentPlayerId || undefined);
  setPrize(awardedPrize);
  
  // ... rest of game completion logic
}, [playerDetails, currentPlayerId]);
```

## Inventory Management System

### Slot Configuration

- **Total Slots**: 46 (2 gold + 44 silver)
- **Gold Slots**: 24, 25
- **Silver Slots**: 1-8, 11-18, 21-23, 26-28, 31-38, 45-48, 51-58
- **Capacity**: 5 prizes per slot
- **Refill Threshold**: 80% (4 prizes)

### Load Balancing Algorithm

```typescript
private async getNextAvailableSlot(tier: 'gold' | 'silver'): Promise<number | null> {
  const tierSlots = this.prizeChannels[tier];
  const slotInventory = await inventoryStorageService.getSlotsByTier(tier);
  
  // Find slots with capacity
  const availableSlots = tierSlots.filter(slot => {
    const slotData = slotInventory.find(data => data.slot === slot);
    return slotData && slotData.dispenseCount < slotData.maxDispenses;
  });
  
  // Sort by dispense count (ascending) to use least used slots first
  const sortedSlots = availableSlots.sort((a, b) => {
    const countA = slotInventory.find(data => data.slot === a)?.dispenseCount || 0;
    const countB = slotInventory.find(data => data.slot === b)?.dispenseCount || 0;
    return countA - countB;
  });
  
  return sortedSlots[0]; // Return least used available slot
}
```

### API Integration

#### Inventory Endpoints Used

- **GET** `/api/inventory/slots` - Get all slot inventory
- **GET** `/api/inventory/slots/{tier}` - Get slots by tier
- **POST** `/api/inventory/slot/{slot}/increment` - Increment slot count
- **POST** `/api/inventory/log-dispensing` - Log dispensing events
- **POST** `/api/inventory/log-out-of-stock` - Log out of stock
- **GET** `/api/inventory/stats` - Get inventory statistics

#### Logging Strategy

```typescript
private async logDispensingToServer(
  slot: number,
  tier: string,
  success: boolean,
  prizeId?: number,
  scoreId?: number,
  error?: string
): Promise<void> {
  // Log to local inventory storage
  await inventoryStorageService.addDispensingLog({
    slot, tier, success, error,
    timestamp: new Date().toISOString(),
    source: 'electron_vending'
  });

  // Log to backend API (non-blocking)
  fetch(`${API_BASE_URL}/api/inventory/log-dispensing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      slot, tier, success, error,
      timestamp: new Date().toISOString(),
      source: 'electron_vending'
    })
  }).catch(err => {
    console.warn('[ELECTRON VENDING] Failed to log dispensing to server (will queue for later):', err);
  });
}
```

## Error Handling and Fallbacks

### Multi-Level Fallback System

1. **Spring SDK Failure** → Legacy Serial Commands
2. **Electron Vending Service Failure** → TCN Integration Service
3. **TCN Integration Failure** → Original Vending Service
4. **Complete Service Failure** → Local Fallback Logic

### Error Recovery Strategies

```typescript
// Example: Spring SDK failure handling
if (this.isInitialized) {
  const result = await this.springService.dispensePrizeByTier(tier);
  
  if (!result.success) {
    console.error(`Spring SDK failed: ${result.error}`);
    
    // Fallback to legacy method
    return await this.dispensePrizeLegacy(selectedSlot, tier, prizeIdForApi, scoreIdNum);
  }
} else {
  // Direct to legacy if Spring SDK not initialized
  return await this.dispensePrizeLegacy(selectedSlot, tier, prizeIdForApi, scoreIdNum);
}
```

## Testing and Validation

### Comprehensive Testing Strategy

See [`NEW_TRIGGER_CHAIN_TESTING_GUIDE.md`](NEW_TRIGGER_CHAIN_TESTING_GUIDE.md) for detailed testing procedures.

### Key Test Areas

1. **Service Initialization**: All services start correctly
2. **Prize Tier Logic**: Time thresholds work as expected
3. **Slot Selection**: Load balancing prevents overuse
4. **Inventory Tracking**: Counts update accurately
5. **Error Handling**: Fallbacks work reliably
6. **API Integration**: Server communication successful
7. **End-to-End Flow**: Complete game cycle works

## Deployment Procedures

### Pre-Deployment Checklist

- [ ] All TypeScript errors resolved
- [ ] Inventory management tables created
- [ ] API endpoints tested and accessible
- [ ] Spring SDK dependencies installed
- [ ] Serial port configuration verified
- [ ] Backup of existing system created

### Deployment Steps

1. **Database Setup**
   ```bash
   # Run complete migration
   mysql -u username -p database_name < backend/complete_migration.sql
   ```

2. **Backend Deployment**
   ```bash
   # Upload updated API endpoints
   cp backend/api_endpoints_for_server.php /path/to/server/
   ```

3. **Frontend Deployment**
   ```bash
   # Build and deploy updated frontend
   npm run build
   # Deploy build files to server
   ```

4. **Service Configuration**
   ```bash
   # Verify Spring SDK installation
   # Check serial port permissions
   # Test Electron API availability
   ```

### Post-Deployment Verification

1. **Service Health Check**
   ```javascript
   // Test in browser console
   electronVendingService.initializeVending().then(result => {
     console.log('Health check:', result);
   });
   ```

2. **Inventory Sync Verification**
   ```bash
   curl -X GET "http://your-server.com/apiendpoints.php/api/inventory/stats"
   ```

3. **End-to-End Game Test**
   - Complete full game cycle
   - Verify prize dispensing
   - Check inventory updates

## Monitoring and Maintenance

### Key Performance Metrics

- **Dispensing Success Rate**: Target >99%
- **Average Response Time**: Target <2 seconds
- **Slot Utilization**: Monitor distribution
- **Error Rate**: Target <1%
- **Inventory Accuracy**: 100% sync required

### Regular Maintenance Tasks

- **Daily**: Check error logs and system health
- **Weekly**: Inventory reconciliation and refill planning
- **Monthly**: Performance review and optimization
- **Quarterly**: Complete system health check

### Alerting Setup

```javascript
// Example monitoring thresholds
const ALERT_THRESHOLDS = {
  dispensingFailureRate: 0.05, // 5%
  averageResponseTime: 3000, // 3 seconds
  inventorySyncDelay: 60000, // 1 minute
  consecutiveFailures: 3
};
```

## Migration from Old System

### Data Migration

1. **Existing Vending Logs**: Preserve in `vending_logs` table
2. **Slot Configuration**: Initialize new `slot_inventory` table
3. **Dispensing History**: Migrate to new logging system

### Backward Compatibility

- **TCN Integration Service**: Maintained as fallback
- **Original Vending Service**: Available as final fallback
- **API Endpoints**: Legacy endpoints still supported
- **Database Schema**: Existing tables preserved

## Troubleshooting Guide

### Common Issues and Solutions

#### Issue 1: Electron Vending Service Not Initializing
**Symptoms**: Console shows initialization errors
**Solutions**:
- Verify Electron environment: `typeof window.electronAPI !== 'undefined'`
- Check Spring SDK installation
- Verify serial port availability

#### Issue 2: Inventory Counts Not Updating
**Symptoms**: Slot counts remain at 0 after dispensing
**Solutions**:
- Check API endpoint connectivity
- Verify database permissions
- Check `inventoryStorageService` initialization

#### Issue 3: Load Balancing Not Working
**Symptoms**: Same slot used repeatedly
**Solutions**:
- Verify `getNextAvailableSlot` logic
- Check `incrementSlotCount` execution
- Ensure database transactions complete

#### Issue 4: Error Cascades Not Triggering
**Symptoms**: System fails completely on first error
**Solutions**:
- Verify fallback chain implementation
- Check error handling in each service
- Ensure proper error propagation

## Success Criteria

The implementation is considered successful when:

1. **Reliability**: 99%+ successful dispensing when inventory available
2. **Performance**: Dispensing completes within 2 seconds
3. **Accuracy**: Prize tiers match time thresholds correctly
4. **Inventory**: Slot counts stay synchronized across all systems
5. **Error Handling**: Graceful degradation when services fail
6. **User Experience**: Smooth game flow without interruptions
7. **Maintainability**: Clear code structure and documentation

## Future Enhancements

### Planned Improvements

1. **Real-time Inventory Dashboard**: Web interface for monitoring
2. **Advanced Analytics**: Usage patterns and predictive maintenance
3. **Mobile Management**: App for remote inventory management
4. **Enhanced Error Recovery**: Automatic retry with exponential backoff
5. **Performance Optimization**: Caching and connection pooling

### Scalability Considerations

- **Multiple Vending Machines**: Support for distributed systems
- **Cloud Integration**: Remote inventory synchronization
- **Load Balancing**: Advanced algorithms for high-traffic scenarios
- **Monitoring**: Real-time alerts and notifications

This comprehensive implementation provides a robust, scalable, and maintainable vending system with Electron Vending Service as the primary trigger chain while preserving all existing functionality and adding enhanced inventory management capabilities.