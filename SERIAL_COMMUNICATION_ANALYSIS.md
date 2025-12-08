# Serial Communication Analysis - Electron Vending Service

## Overview

This document analyzes how the Electron Vending Service handles serial communication, particularly focusing on the legacy fallback mechanism when the Spring SDK is unavailable.

## Key Findings from Commit Analysis

### Commit c82d66a863903b74f293669f2081e088b8f0a04a

This commit implemented several critical fixes:

1. **Score ID Consistency**: Fixed the order of operations to ensure score ID is generated before prize service usage
2. **Logging Endpoint**: Added comprehensive logging for Electron Vending Service operations
3. **API Endpoints**: Fixed missing POST endpoint for `/api/electron-vending/log`

### Serial Communication Implementation

The system uses a **three-tier fallback approach**:

1. **Primary: Legacy Serial Communication**
2. **Secondary: Spring SDK**
3. **Tertiary: Mock Mode**

## How Serial Communication Works

### 1. Legacy Serial as Primary Method

The [`electronVendingService.ts`](services/electronVendingService.ts:1) has been modified to prioritize legacy serial communication:

```typescript
// Modified to use legacy serial as primary method
async dispensePrize(gameTimeMs: number, scoreId: string): Promise<DispenseResult> {
  // Try legacy serial first (most reliable for Windows testing)
  const legacyResult = await this.dispensePrizeLegacy(tier, selectedSlot, scoreId);
  if (legacyResult.success) {
    return legacyResult;
  }
  
  // Fall back to Spring SDK if legacy fails
  const springResult = await this.dispensePrizeSpringSDK(tier, scoreId);
  if (springResult.success) {
    return springResult;
  }
  
  // Final fallback to mock mode
  return this.dispensePrizeMock(tier, scoreId);
}
```

### 2. Serial Port Communication Flow

#### Low-Level Implementation ([`main.ts`](electron/main/main.ts:1))

```typescript
// Serial port handling in main process
ipcMain.handle('serial:write', async (event, port: string, data: string) => {
  try {
    await serialPort.write(data);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
```

#### IPC Bridge ([`preload.ts`](electron/preload/preload.ts:1))

```typescript
// Bridge between renderer and main process
electronAPI.serialWrite: (port: string, data: string) => 
  ipcRenderer.invoke('serial:write', port, data)
```

#### Service Layer ([`tcnSerialService.ts`](services/tcnSerialService.ts:1))

```typescript
// High-level serial communication service
async sendVendingCommand(slot: number): Promise<boolean> {
  const command = this.formatVendingCommand(slot);
  const result = await window.electronAPI.serialWrite(this.port, command);
  return result.success;
}
```

### 3. Legacy Fallback Mechanism

When the Spring SDK is unavailable (common during Windows development), the system:

1. **Detects Spring SDK unavailability** through connection testing
2. **Automatically falls back to legacy serial** communication
3. **Uses COM3 port** (configurable) for direct hardware communication
4. **Sends binary commands** in the format: `00 FF [SLOT] FF AA 55`
5. **Expects response**: `00 5D 00 AA 07` for successful dispensing

### 4. Command Format and Protocol

#### Legacy Serial Command Structure
```
Format: 00 FF [SLOT] FF AA 55
Example: 00 FF 0C FF AA 55 (for slot 12)
```

#### Response Structure
```
Success: 00 5D 00 AA 07
Failure: Various error codes
```

### 5. Error Handling and Recovery

The system implements comprehensive error handling:

```typescript
// Multiple retry attempts with different strategies
for (const attempt of retryAttempts) {
  try {
    const result = await this.sendVendingCommand(slot);
    if (result.success) return result;
  } catch (error) {
    console.warn(`Attempt ${attempt} failed:`, error);
    await this.delay(1000); // Wait before retry
  }
}
```

## Serial Port Configuration

### Default Settings
- **Port**: COM3 (Windows) / ttyUSB0 (Linux)
- **Baud Rate**: 9600
- **Data Bits**: 8
- **Stop Bits**: 1
- **Parity**: None
- **Flow Control**: None

### Port Detection Logic

```typescript
// Automatic port detection
async detectVendingPort(): Promise<string | null> {
  const ports = await SerialPort.list();
  return ports.find(port => 
    port.path.includes('COM') || 
    port.path.includes('USB') ||
    port.manufacturer?.includes('FTDI')
  )?.path || null;
}
```

## Integration with Spring SDK

### When Spring SDK is Available

1. **Primary method**: Spring SDK for Android communication
2. **Fallback**: Legacy serial if Spring SDK fails
3. **Final fallback**: Mock mode for testing

### When Spring SDK is Unavailable

1. **Primary method**: Legacy serial communication
2. **Fallback**: Mock mode
3. **No Spring SDK attempts**: Skips unavailable service

## Database Logging and Tracking

### Electron Vending Service Logs

All operations are logged to `electron_vending_logs` table with:

```sql
CREATE TABLE electron_vending_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  action VARCHAR(50),
  game_time_ms INT,
  tier VARCHAR(20),
  selected_slot INT,
  channel_used INT,
  score_id INT,
  prize_id INT,
  success BOOLEAN,
  error_code INT,
  error_message TEXT,
  dispense_method VARCHAR(50),
  inventory_before INT,
  inventory_after INT,
  response_time_ms INT,
  source VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Legacy Vending Logs

Simultaneous logging to `vending_logs` table for backward compatibility:

```sql
CREATE TABLE vending_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  score_id INT,
  prize_id INT,
  slot INT,
  command VARCHAR(50),
  response VARCHAR(50),
  success BOOLEAN,
  error_message TEXT,
  spring_channel INT,
  spring_tier VARCHAR(20),
  spring_success BOOLEAN,
  source VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Testing and Debugging

### Serial Communication Testing

Use the provided test scripts:

1. **PowerShell Script**: [`test_api.ps1`](test_api.ps1:1)
2. **PHP Script**: [`test_api_endpoints.php`](test_api_endpoints.php:1)
3. **Curl Commands**: [`curl_commands.md`](curl_commands.md:1)

### Debugging Serial Issues

1. **Check Port Availability**: Use Device Manager to verify COM3 exists
2. **Verify Permissions**: Ensure application has serial port access
3. **Test Hardware**: Use serial monitor to verify hardware responses
4. **Monitor Logs**: Check both application and system logs

## Common Issues and Solutions

### Issue 1: "Port not found" Error
**Solution**: 
- Verify COM3 exists in Device Manager
- Check USB drivers are installed
- Ensure no other application is using the port

### Issue 2: "Permission denied" Error
**Solution**:
- Run application as Administrator
- Check Windows firewall settings
- Verify user has serial port permissions

### Issue 3: No response from hardware
**Solution**:
- Check physical connections
- Verify power supply to vending machine
- Test with different baud rates
- Use serial port monitor to verify communication

### Issue 4: Spring SDK connection fails
**Solution**:
- This is expected during Windows development
- System automatically falls back to legacy serial
- No action required if legacy serial works

## Performance Considerations

### Serial Communication Speed
- **Command send**: ~10ms
- **Response wait**: ~500ms (typical)
- **Total operation**: ~1-2 seconds

### Retry Logic
- **Max retries**: 3 attempts
- **Delay between retries**: 1 second
- **Timeout per attempt**: 5 seconds

## Security Considerations

### Serial Port Security
- **Port validation**: Only allows configured ports
- **Command validation**: Strict format checking
- **Rate limiting**: Prevents command flooding

### Data Protection
- **Score ID validation**: Extracts numeric part safely
- **Input sanitization**: Prevents SQL injection
- **Error logging**: Comprehensive audit trail

## Future Enhancements

### Planned Improvements
1. **Real-time port monitoring**: Automatic reconnection on disconnect
2. **Command queuing**: Handle multiple dispensing requests
3. **Enhanced error recovery**: More sophisticated retry logic
4. **Performance metrics**: Track response times and success rates

### Scalability Considerations
1. **Multiple vending machines**: Support for multiple COM ports
2. **Network communication**: Remote vending machine control
3. **Load balancing**: Distribute dispensing across machines

## Conclusion

The Electron Vending Service implements a robust serial communication system with:

✅ **Legacy serial as primary method** for Windows testing
✅ **Automatic fallback** when Spring SDK unavailable
✅ **Comprehensive error handling** and retry logic
✅ **Dual logging** for complete audit trail
✅ **Flexible configuration** for different environments
✅ **Hardware abstraction** for easy testing

The system is designed to work reliably in both development and production environments, with the legacy serial communication providing a dependable fallback when the Spring SDK is unavailable.