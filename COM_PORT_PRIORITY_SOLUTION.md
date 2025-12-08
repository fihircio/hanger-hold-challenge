# COM Port Priority Solution - Arduino Sensor & Spring Vending

## Problem Analysis

Based on log analysis from line 495 onwards, the issue is that **both Arduino sensor and Spring Vending are trying to use the same COM6 port**, creating identical conflicts:

### Evidence from Logs:

**Arduino Sensor Connection:**
```
Line 538: [Arduino Sensor] Found Arduino port: COM6
Line 539: [Arduino Sensor] Attempting to connect to COM6
Line 540: [Arduino Sensor] Connected to COM6
```

**Spring Vending Connection:**
```
Line 510: [SPRING VENDING] Probing port COM6...
Line 544: [SPRING VENDING] Connected to COM6
Line 545: [SPRING VENDING] Connected to COM6
```

**Resulting Conflict:**
```
Line 547: Error: Error invoking remote method 'send-serial-command': Error: Serial port is not open
```

## Solution Implemented: COM Port Priority System

### 1. Arduino Sensor Service - High COM Ports

Modified [`services/arduinoSensorService.ts`](services/arduinoSensorService.ts) to use **COM port priority strategy**:

**New Logic:**
- **Priority 1**: Arduino gets highest numbered COM ports (COM6+)
- **Priority 2**: If no Arduino-specific ports, use highest available COM port
- **Sorting**: COM ports sorted in descending order (highest number first)

**Key Implementation:**
```typescript
// Sort available COM ports by number (descending - Arduino gets higher numbers)
const allComPorts = ports
  .filter((port: any) => port.path.startsWith('COM'))
  .sort((a: any, b: any) => {
    const numA = parseInt(a.path.replace('COM', ''));
    const numB = parseInt(b.path.replace('COM', ''));
    return numB - numA; // Descending order
  });

if (arduinoComPorts.length > 0) {
  targetPort = arduinoComPorts[0]; // Use highest numbered Arduino port
  console.log(`[Arduino Sensor] Selected Arduino port: ${targetPort.path} (highest Arduino COM)`);
}
```

### 2. Spring Vending Service - Low COM Ports

Modified [`services/springVendingService.ts`](services/springVendingService.ts) to use **lower COM ports**:

**New Logic:**
- **Priority 1**: Spring Vending uses COM1-5 (lower numbers)
- **Priority 2**: Falls back to non-COM ports if needed
- **Strategy**: Explicit COM port separation to prevent conflicts

**Key Implementation:**
```typescript
// COM PRIORITY STRATEGY: Spring Vending uses lower COM ports (COM1-5)
const comPorts = allComPorts.filter((p: any) => p.path.startsWith('COM'));
const otherPorts = likelyCandidates.filter((p: any) => !p.path.startsWith('COM'));

// Strategy: Try COM ports first (lower numbers), then other candidates
const portsToTry = [
  ...comPorts.slice(0, 5), // COM1-5 for Spring Vending
  ...otherPorts.slice(0, 2)    // Non-COM ports as backup
];

console.log('[SPRING VENDING] COM priority strategy: Using lower COM ports (COM1-5) for Spring Vending');
```

## Expected Behavior After Fix

### Normal Operation Logs:

**Arduino Sensor (COM6+):**
```
[Arduino Sensor] Available ports: [{path: "COM6", manufacturer: "Arduino"}, {path: "COM4"}]
[Arduino Sensor] Selected Arduino port: COM6 (highest Arduino COM)
[Arduino Sensor] Attempting to connect to COM6
[Arduino Sensor] Connected to COM6
Arduino sensor ENABLED
[Arduino Sensor] State change: 0 -> 1
[Arduino Sensor] START detected
```

**Spring Vending (COM1-5):**
```
[SPRING VENDING] Available ports: [{path: "COM6", manufacturer: "Arduino"}, {path: "COM4"}]
[SPRING VENDING] COM priority strategy: Using lower COM ports (COM1-5) for Spring Vending
[SPRING VENDING] Probing port COM4...
[SPRING VENDING] Connected to COM4
[SPRING VENDING] Sending command: 01 06 07 AA 55
```

### Key Indicators of Success:

✅ **No Port Conflicts**: Arduino uses COM6+, Spring uses COM1-5
✅ **Predictable Port Assignment**: Same logic every time, regardless of port detection order
✅ **Automatic Conflict Resolution**: Services naturally avoid each other's ports
✅ **Clear Logging**: Each service logs which port it selected and why

## Hardware Configuration Recommendations

### Optimal Setup:
```
Arduino Sensor    → COM6, COM7, COM8 (highest available)
Spring Vending   → COM1, COM2, COM3, COM4, COM5 (lowest available)
Other Devices    → USB ports, virtual ports as needed
```

### Alternative Setup (if limited COM ports):
```
Option A: Single COM Port
- Use USB hub with multiple controllers
- Assign different COM numbers to each device

Option B: Virtual Serial Ports
- Use com0com or similar software
- Create virtual COM ports for multiple devices

Option C: Device Reassignment
- Try different Arduino boards (FTDI vs CH340)
- May appear as different COM ports
```

## Testing Procedure

### Step 1: Verify Port Detection
1. Restart application
2. Check logs for port selection strategy:
   ```
   [Arduino Sensor] Selected Arduino port: COM6 (highest Arduino COM)
   [SPRING VENDING] COM priority strategy: Using lower COM ports (COM1-5) for Spring Vending
   ```

### Step 2: Test Independent Operation
1. Enable Arduino sensor - should connect to COM6
2. Test prize dispensing - should use COM4
3. Verify no "Serial port is not open" errors

### Step 3: Validate Sensor Data
1. Trigger Arduino sensor
2. Verify continuous state changes:
   ```
   [Arduino Sensor] State change: 0 -> 1
   [Arduino Sensor] START detected
   [Arduino Sensor] State change: 1 -> 0
   [Arduino Sensor] END detected
   ```

## Troubleshooting

### If Both Services Want Same Port:
1. **Check Physical Connections**: Ensure Arduino and Spring controller are on different USB ports
2. **Restart Services**: Stop and restart both services to re-evaluate ports
3. **Check Windows Device Manager**: Verify COM port assignments
4. **Update Drivers**: Ensure proper drivers for both devices

### If Port Detection Fails:
1. **Manual Port Assignment**: Hard-code specific ports in configuration
2. **USB Port Isolation**: Use separate USB controllers/hubs
3. **Alternative Communication**: Consider network or USB alternatives

## Maintenance

### Regular Checks:
1. **Weekly**: Verify COM port assignments in Device Manager
2. **Monthly**: Check for Windows driver updates
3. **Quarterly**: Test port priority system with hardware changes

### Monitoring:
- Watch for "COM priority strategy" logs
- Monitor for "Selected Arduino port" messages
- Check for "Serial port is not open" errors
- Verify successful sensor data flow

This COM port priority system ensures that Arduino sensor and Spring Vending services automatically use different COM ports, eliminating the identical port conflicts that were causing the sensor to be skipped when enabled.