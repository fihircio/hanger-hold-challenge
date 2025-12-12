# Arduino Sensor and Legacy Dispensing Fix Recommendations

## Executive Summary

Based on my analysis of the working directory changes compared to Git commit `36f4fe9` and the log file `-1765501595962.log`, I've identified specific, actionable fixes for both the Arduino sensor activation issues and legacy dispensing method failures. The root cause is a COM port allocation strategy that successfully separates services but leaves dispensing without a proper serial connection.

## Immediate Priority Fixes (Critical)

### 1. Fix Legacy Serial Dispensing Connection

**Problem**: Legacy dispensing fails with "Serial port is not open" error because no serial port is properly initialized for dispensing commands.

**Solution**: Modify [`electronVendingService.ts`](services/electronVendingService.ts) to establish a proper serial connection for legacy dispensing:

```typescript
// In the Legacy Serial method (around line 467), add connection establishment:
const legacySerialConnect = async () => {
  // Get available ports, excluding Arduino ports
  const ports = await window.electronAPI.getSerialPorts();
  const nonArduinoPorts = ports.filter((port: any) => {
    const path = port.path.toLowerCase();
    const mfr = (port.manufacturer || '').toLowerCase();
    // Exclude Arduino ports
    return !mfr.includes('arduino') && !path.includes('com6') && !path.includes('com7');
  });
  
  if (nonArduinoPorts.length > 0) {
    const connectResult = await window.electronAPI.connectSerialPort(nonArduinoPorts[0].path);
    if (connectResult.success) {
      console.log(`[ELECTRON VENDING] Legacy Serial connected to ${nonArduinoPorts[0].path}`);
      return true;
    }
  }
  return false;
};

// Add this before attempting to send commands
const connected = await legacySerialConnect();
if (!connected) {
  throw new Error('No available serial port for legacy dispensing');
}
```

### 2. Verify Arduino Sensor Data Reception

**Problem**: Arduino connects successfully but no sensor data is being received after initial connection.

**Solution**: Add data reception verification in [`arduinoSensorService.ts`](services/arduinoSensorService.ts):

```typescript
// After successful connection (around line 143), add data verification:
const verifyDataReception = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    let dataReceived = false;
    const timeout = setTimeout(() => {
      if (!dataReceived) {
        console.warn('[Arduino Sensor] No data received within timeout - connection may be unstable');
        resolve(false);
      }
    }, 5000); // 5 second timeout
    
    const tempListener = (data: string) => {
      if (data.trim() === '0' || data.trim() === '1') {
        dataReceived = true;
        clearTimeout(timeout);
        window.electronAPI.removeSerialDataListener(tempListener);
        console.log('[Arduino Sensor] Data reception verified');
        resolve(true);
      }
    };
    
    window.electronAPI.onSerialData(tempListener);
  });
};

// After connection establishment:
const dataVerified = await verifyDataReception();
if (!dataVerified) {
  console.error('[Arduino Sensor] Connection established but no data received - retrying...');
  // Implement retry logic here
}
```

### 3. Fix API Endpoint Issues

**Problem**: API calls are failing with 404 and 500 errors, preventing proper error logging.

**Solution**: Update API endpoints in [`electronVendingService.ts`](services/electronVendingService.ts):

```typescript
// Around line 91, fix the API endpoint:
const vendingResponse = await fetch(`${API_BASE_URL}/api/v1/vending/dispense`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prizeId: prizeIdForApi,
    scoreId: scoreIdNum
  })
});

// Around line 249, fix the logging endpoint:
fetch(`${API_BASE_URL}/api/v1/electron-vending/log`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(sanitizedElectronLogEntry)
});
```

## Medium Priority Fixes (Important)

### 4. Enhance COM Port Management

**Problem**: The COM port allocation strategy works but needs better coordination for dispensing.

**Solution**: Implement a shared port management system in [`electron/main/main.ts`](electron/main/main.ts):

```typescript
// Add around line 13:
let dispensingPortPath: string | null = null; // Track port for dispensing

// Modify the connect-serial-port handler (around line 367):
ipcMain.handle('connect-serial-port', async (event, portPath: string, baudRate?: number, purpose?: string) => {
  // ... existing code ...
  
  if (isArduinoPort) {
    arduinoPortPath = portPath;
  } else if (purpose === 'dispensing') {
    dispensingPortPath = portPath;
    console.log(`[SERIAL] Designated ${portPath} for dispensing operations`);
  }
  
  // ... rest of existing code ...
});

// Modify send-serial-command handler (around line 308):
ipcMain.handle('send-serial-command', async (event, command: string, purpose?: string) => {
  let targetPort = serialPort;
  
  // Enhanced port selection based on purpose
  if (purpose === 'dispensing' && dispensingPortPath && activeSerialPorts.has(dispensingPortPath)) {
    targetPort = activeSerialPorts.get(dispensingPortPath);
    console.log(`[SERIAL] Using dispensing port: ${dispensingPortPath}`);
  } else if (!targetPort || !targetPort.isOpen) {
    // ... existing fallback logic ...
  }
  
  // ... rest of existing code ...
});
```

### 5. Improve Error Handling and Recovery

**Problem**: Error handling doesn't provide adequate recovery mechanisms.

**Solution**: Add robust error handling in [`electronVendingService.ts`](services/electronVendingService.ts):

```typescript
// Add around line 462, enhance the dispensing methods array:
const dispensingMethods = [
  {
    name: 'Legacy Serial',
    try: async () => {
      try {
        // Add connection check before sending
        const ports = await window.electronAPI.getSerialPorts();
        if (ports.length === 0) {
          throw new Error('No serial ports available');
        }
        
        // ... existing legacy serial code ...
      } catch (error) {
        console.error('[ELECTRON VENDING] Legacy Serial connection failed:', error);
        return {
          success: false,
          tier,
          channel: null,
          slot: selectedSlot,
          error: `Legacy Serial connection failed: ${error.message}`,
          prizeId: prizeIdForApi,
          scoreId: scoreIdNum
        };
      }
    }
  },
  // ... other methods ...
];
```

### 6. Add Arduino Sensor Health Monitoring

**Problem**: No mechanism to verify Arduino sensor is actually working after connection.

**Solution**: Add health monitoring in [`arduinoSensorService.ts`](services/arduinoSensorService.ts):

```typescript
// Add around line 562:
private healthCheckInterval: NodeJS.Timeout | null = null;

// Add method around line 570:
private startHealthMonitoring(): void {
  this.healthCheckInterval = setInterval(() => {
    if (this.isEnabled && this.isConnected) {
      const timeSinceLastData = Date.now() - this.lastDataReceived;
      if (timeSinceLastData > 10000) { // 10 seconds
        console.warn('[Arduino Sensor] No data received for 10 seconds - connection may be lost');
        // Trigger reconnection
        this.ensureSerialConnection();
      }
    }
  }, 5000); // Check every 5 seconds
}

private stopHealthMonitoring(): void {
  if (this.healthCheckInterval) {
    clearInterval(this.healthCheckInterval);
    this.healthCheckInterval = null;
  }
}

// Modify setEnabled method (around line 32) to include:
setEnabled(enabled: boolean): void {
  // ... existing code ...
  
  if (enabled) {
    this.startHealthMonitoring();
  } else {
    this.stopHealthMonitoring();
  }
}
```

## Long-term Improvements (Recommended)

### 7. Implement Unified Serial Port Manager

Create a centralized serial port management service to coordinate all serial communications:

```typescript
// New file: services/serialPortManager.ts
class SerialPortManager {
  private static instance: SerialPortManager;
  private activePorts: Map<string, any> = new Map();
  private portAssignments: Map<string, string> = new Map(); // purpose -> port path
  
  static getInstance(): SerialPortManager {
    if (!SerialPortManager.instance) {
      SerialPortManager.instance = new SerialPortManager();
    }
    return SerialPortManager.instance;
  }
  
  async assignPort(purpose: string, preferences?: any): Promise<string | null> {
    // Implement intelligent port assignment based on purpose
    // Arduino sensor -> HIGH COM ports
    // Dispensing -> LOW COM ports
    // TCN -> Specific port detection
  }
  
  async releasePort(purpose: string): Promise<void> {
    // Implement proper port release
  }
  
  async sendCommand(purpose: string, command: string): Promise<any> {
    // Send command using appropriate port
  }
}
```

### 8. Add Hardware Detection and Auto-Configuration

Implement automatic hardware detection to configure ports based on actual connected devices:

```typescript
// Add to serialPortManager.ts
async detectHardware(): Promise<Map<string, any>> {
  const ports = await window.electronAPI.getSerialPorts();
  const detectedHardware = new Map();
  
  for (const port of ports) {
    // Try to identify hardware by manufacturer and port response
    if (port.manufacturer?.toLowerCase().includes('arduino')) {
      detectedHardware.set('arduino', port);
    } else if (port.manufacturer?.toLowerCase().includes('ftdi')) {
      detectedHardware.set('spring_vending', port);
    } else if (port.path.startsWith('COM1')) {
      detectedHardware.set('tcn', port);
    }
  }
  
  return detectedHardware;
}
```

## Implementation Priority

1. **Immediate (Critical)**: Fixes 1-3 to restore basic functionality
2. **Short-term (Important)**: Fixes 4-6 to improve reliability
3. **Long-term (Recommended)**: Fixes 7-8 for robust architecture

## Testing Strategy

After implementing fixes:

1. **Arduino Sensor Test**:
   - Verify connection to COM7
   - Confirm data reception with actual sensor input
   - Check health monitoring functionality

2. **Legacy Dispensing Test**:
   - Confirm serial port establishment for dispensing
   - Test command sending and response
   - Verify error handling and recovery

3. **Integration Test**:
   - Test complete game flow from sensor to dispensing
   - Verify API logging works correctly
   - Check fallback mechanisms

## Expected Outcomes

After implementing these fixes:

- **Arduino sensor** will properly receive and process data
- **Legacy dispensing** will have a dedicated serial connection
- **API errors** will be resolved with correct endpoints
- **System reliability** will improve with better error handling
- **Maintenance** will be easier with unified port management

The system should be able to handle the complete game flow: Arduino sensor detects object → timer starts → timer stops → prize dispensing occurs via serial command → success is logged to API.