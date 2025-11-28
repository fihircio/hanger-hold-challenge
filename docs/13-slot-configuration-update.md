# Slot Configuration Update

## Overview

Updated the hex spring SDK slot configuration to support a custom slot arrangement with expanded channel range up to slot 58, including slot capacity tracking and intelligent rotation logic.

## New Slot Configuration

### Gold Tier
- **Slots**: 24, 25
- **HEX Commands**:
  - Slot 24: `00 FF 18 E7 AA 55`
  - Slot 25: `00 FF 19 E6 AA 55`

### Silver Tier
- **Slots**: 
  - 1, 2, 3, 4, 5, 6, 7, 8
  - 11, 12, 13, 14, 15, 16, 17, 18
  - 21, 22, 23, 26, 27, 28
  - 31, 32, 33, 34, 35, 36, 37, 38
  - 45, 46, 47, 48
  - 51, 52, 53, 54, 55, 56, 57, 58

## Key HEX Commands for Silver Tier

| Slot | HEX Command | Checksum |
|-------|-------------|-----------|
| 1     | `00 FF 01 FE AA 55` | 0xFE |
| 2     | `00 FF 02 FD AA 55` | 0xFD |
| 3     | `00 FF 03 FC AA 55` | 0xFC |
| 58    | `00 FF 3A C5 AA 55` | 0xC5 |

## Files Modified

### 1. `services/springVendingService.ts`
- Updated `prizeChannels` mapping with new slot arrangement
- Modified `queryAllChannelStatus()` to handle expanded slot range (up to 58)
- Updated `getSystemStatus()` to calculate total channels dynamically

### 2. `services/tcnSerialService.ts`
- Updated `prizeChannels` mapping to match spring vending service
- Modified `getSystemStatus()` to calculate total channels dynamically

### 3. `services/electronVendingService.ts`
- Updated slot-to-tier mapping logic to handle new configuration
- Gold tier: slots 24-25
- Silver tier: complex range matching new arrangement
- Bronze tier: fallback for unmapped slots

### 4. `services/slotConfigurationTest.ts` (New)
- Created test script to verify new slot configuration
- Tests HEX command generation for key slots
- Validates system status reporting

## Implementation Details

### Channel Selection Logic
The system now uses the following priority for slot selection:

1. **Health Check**: Verifies channel is healthy and has product
2. **Capacity Check**: Ensures slot has remaining capacity (max 5 per slot)
3. **Tier Mapping**: Selects appropriate channel based on prize tier
4. **Intelligent Rotation**: Cycles through available channels within tier with memory

### Slot Capacity Management
- **Maximum Capacity**: 5 items per slot
- **Tracking**: Each slot tracks `remainingCapacity` and `totalDispensed`
- **Auto-rotation**: When slot reaches capacity, system moves to next available slot
- **Real-time Updates**: Capacity updated after each successful dispensing

### Silver Tier Rotation Logic
- **Round-Robin**: Maintains index for each tier to ensure fair distribution
- **Memory**: Remembers last used slot and continues from next position
- **Capacity Awareness**: Skips slots with 0 remaining capacity
- **Fallback**: Moves to next available slot when current slot is empty

### Prize Duration Settings
- **Silver Tier**: 3 seconds timeout for dispensing
- **Other Tiers**: 10 seconds timeout for dispensing

### HEX Command Protocol
Maintains the same 6-byte protocol structure:
```
Byte 1: 0x00 (Command identifier)
Byte 2: 0xFF (Fixed value)
Byte 3: Slot Number (1-58)
Byte 4: Checksum (0xFF - Slot Number)
Byte 5: 0xAA (Delivery detection ON)
Byte 6: 0x55 (Delivery detection ON)
```

### Error Handling
- Supports all existing error codes (0-144)
- Enhanced timeout handling for extended channel range
- Improved logging for debugging

## Testing

### Manual Testing
Run the test script to verify configuration:
```typescript
import { testSlotConfiguration } from './services/slotConfigurationTest';
testSlotConfiguration();
```

### Expected Output
```
=== Testing New Slot Configuration ===

--- Spring Vending Service ---
Total channels: 58
Healthy channels: [dynamic based on hardware]

--- Slot Mappings ---
Gold slots: 24, 25
Silver slots: [1-8, 11-18, 21-23, 26-28, 31-38, 45-48, 51-58]

--- HEX Commands Test ---
Slot 1: 00 FF 01 FE AA 55
Slot 24: 00 FF 18 E7 AA 55
Slot 25: 00 FF 19 E6 AA 55
Slot 58: 00 FF 3A C5 AA 55

--- TCN Serial Service ---
TCN Total channels: 58
TCN Healthy channels: [dynamic based on hardware]
TCN Connected: [true/false]

=== Slot Configuration Test Complete ===
```

## Migration Notes

### Breaking Changes
- **Slot 1-3** are now **Silver tier** (previously Gold)
- **Slot 24-25** are now **Gold tier** (previously Bronze)
- **Total channels** increased from 25 to 58

### Compatibility
- All existing HEX command generation logic preserved
- Error handling and event systems unchanged
- API integration maintained

### Hardware Requirements
- Spring machine must support slots 1-58
- Drop detection sensors required for all slots
- Motor control for extended channel range

## Troubleshooting

### Common Issues
1. **Slot Not Found**: Verify hardware supports slot numbers up to 58
2. **Checksum Errors**: Ensure proper calculation: `0xFF - slotNumber`
3. **Timeout Issues**: Check serial connection and hardware response times

### Debug Commands
```typescript
// Check system status
const status = springVendingService.getSystemStatus();

// Test specific slot
const testResult = springVendingService.testChannel(24);

// Get channel status
const channelStatus = springVendingService.getChannelStatus(24);
```

## Future Enhancements

### Potential Improvements
1. **Dynamic Configuration**: Load slot mappings from configuration file
2. **Channel Groups**: Support for multiple prize tiers beyond gold/silver
3. **Load Balancing**: Intelligent channel selection based on usage statistics
4. **Real-time Monitoring**: WebSocket-based channel status updates

### Performance Optimizations
1. **Caching**: Cache channel status to reduce query frequency
2. **Batch Operations**: Query multiple channels simultaneously
3. **Connection Pooling**: Reuse serial connections for efficiency

This update provides a robust foundation for the expanded slot configuration while maintaining backward compatibility with existing vending machine protocols.