# Arduino Sensor Final Solution - Serial Port Conflict Resolution

## Problem Identified

Based on log analysis from line 381 onwards, the Arduino sensor is being skipped when enabled due to a **serial port conflict**:

### Evidence from Logs:
1. **Line 424-425**: Arduino sensor successfully connects to COM4
   ```
   [Arduino Sensor] Attempting to connect to COM4
   [Arduino Sensor] Connected to COM4
   ```

2. **Line 429-430**: Spring Vending ALSO connects to COM4
   ```
   [SPRING VENDING] Connected to COM4
   [SPRING VENDING] Connected to COM4
   ```

3. **Line 432**: Serial port conflict causes failure
   ```
   Error: Error invoking remote method 'send-serial-command': Error: Serial port is not open
   ```

## Root Cause

**Both Arduino sensor and Spring Vending system are trying to use the same COM4 port simultaneously.** This creates a race condition where:

1. Arduino sensor connects to COM4 first
2. Spring Vending tries to connect to COM4 for vending operations
3. The port becomes unavailable to Arduino sensor
4. Arduino sensor stops receiving data and appears "skipped"

## Solution Implemented

### 1. Updated Arduino Sensor Service

Modified [`services/arduinoSensorService.ts`](services/arduinoSensorService.ts) with intelligent port selection:

**New Port Selection Strategy:**
1. **Priority 1**: Find Arduino-specific port (Arduino, FTDI, CH340) that's NOT COM4
2. **Priority 2**: Use any available port except COM4
3. **Priority 3**: Last resort - use COM4 but warn about potential conflict

**Key Improvements:**
```typescript
// Filter out COM4 to avoid Spring Vending conflict
const arduinoPorts = ports.filter((port: any) =>
  port.manufacturer && (
    port.manufacturer.toLowerCase().includes('arduino') ||
    port.manufacturer.toLowerCase().includes('ftdi') ||
    port.manufacturer.toLowerCase().includes('ch340')
  ) && port.path !== 'COM4'  // <-- Critical: Avoid COM4
);
```

### 2. Hardware Configuration Recommendations

#### Option A: Two Separate COM Ports (Recommended)
```
Arduino Sensor → COM3 (or COM5)
Spring Vending → COM4
```

#### Option B: USB Hub with Multiple Ports
```
USB Hub → Multiple COM ports
- Arduino on dedicated port
- Spring Vending on separate port
```

#### Option C: Single Port with Time Sharing (Not Recommended)
```
COM4 → Shared between Arduino and Spring
- Requires custom firmware to handle both sensor data and vending commands
- More complex implementation
```

## Immediate Actions Required

### 1. Physical Hardware Setup

**Check Available COM Ports:**
1. Open Windows Device Manager
2. Expand "Ports (COM & LPT)"
3. Note all available COM ports
4. Identify Arduino manufacturer

**Recommended Configuration:**
- If Arduino appears as COM3: Use COM3 for Arduino, COM4 for Spring
- If only COM4 available: Consider USB expansion or different Arduino

### 2. Software Configuration

**Arduino Sketch (No Changes Needed):**
```cpp
#define SENSOR_PIN 2

void setup() {
  Serial.begin(9600);  // Keep at 9600 baud
  pinMode(SENSOR_PIN, INPUT);
}

void loop() {
  int state = digitalRead(SENSOR_PIN);
  Serial.println(state);  // Send 0 or 1
  delay(100); // 10 readings per second
}
```

**Application Will Now:**
- Automatically detect available ports
- Avoid COM4 for Arduino sensor
- Use Spring Vending on COM4
- Prevent port conflicts

### 3. Testing Procedure

**Step 1: Verify Port Detection**
```
Expected logs:
[Arduino Sensor] Available ports: [{path: "COM3", manufacturer: "Arduino"}, {path: "COM4"}]
[Arduino Sensor] Found Arduino port: COM3
[Arduino Sensor] Attempting to connect to COM3
[Arduino Sensor] Connected to COM3
```

**Step 2: Test Sensor Operation**
1. Enable Arduino sensor in application
2. Trigger physical sensor
3. Verify continuous state changes:
   ```
   [Arduino Sensor] State change: 0 -> 1
   [Arduino Sensor] Stable state: 0 -> 1 @ 1234567890
   [Arduino Sensor] START detected
   ```

**Step 3: Test Spring Vending**
1. Test prize dispensing
2. Verify Spring Vending uses COM4:
   ```
   [SPRING VENDING] Connected to COM4
   [SPRING VENDING] Sending command: 01 06 07 AA 55
   ```

## Expected Behavior After Fix

### Normal Operation Logs:
```
[Arduino Sensor] Available ports: [{path: "COM3", manufacturer: "Arduino"}, {path: "COM4"}]
[Arduino Sensor] Found Arduino port: COM3
[Arduino Sensor] Attempting to connect to COM3
[Arduino Sensor] Connected to COM3
Arduino sensor ENABLED
[Arduino Sensor] State change: 0 -> 1
[Arduino Sensor] START detected
[Arduino Sensor] State change: 1 -> 0
[Arduino Sensor] END detected

[SPRING VENDING] Connected to COM4
[SPRING VENDING] Sending command: 01 06 07 AA 55
```

### Key Indicators of Success:
- ✅ Arduino sensor connects to COM3 (or any port ≠ COM4)
- ✅ Spring Vending connects to COM4
- ✅ No "Serial port is not open" errors
- ✅ Continuous sensor data when enabled
- ✅ Both systems work simultaneously

## Troubleshooting

### If Only One COM Port Available:

**Option 1: USB Expansion**
- Add USB-to-Serial adapter
- Creates additional COM port
- Dedicate one port to Arduino

**Option 2: Different Arduino Board**
- Use Arduino with different chip (FTDI vs CH340)
- May appear as different COM port
- Test with multiple Arduino boards

**Option 3: Virtual Serial Port**
- Use com0com virtual port software
- Split single physical port into multiple virtual ports
- Advanced solution for development

### If Port Detection Fails:

**Check Windows Device Manager:**
1. Right-click Arduino device
2. Select "Properties"
3. Check "Port Settings" tab
4. Note COM port number
5. Update drivers if needed

**Check Physical Connections:**
- USB cable securely connected
- Arduino power LED on
- Try different USB port
- Restart Arduino if needed

## Long-term Solution

### Hardware Recommendation:
```
Dedicated Arduino Uno/Nano → COM3 (Sensor input)
Spring Vending Controller → COM4 (Prize dispensing)
USB Hub → Multiple device support
```

### Software Architecture:
```
Arduino Sensor Service → COM3 → Sensor data processing
Spring Vending Service → COM4 → Prize dispensing
No port conflicts → Independent operation
```

## Maintenance

### Regular Checks:
1. **Weekly**: Verify COM port assignments in Device Manager
2. **Monthly**: Check for USB driver updates
3. **Quarterly**: Test sensor and vending independently
4. **Annually**: Consider hardware upgrades if issues persist

### Monitoring:
- Watch for "Serial port is not open" errors
- Monitor port conflict warnings
- Log successful sensor state changes
- Track vending operation success rates

This solution resolves the serial port conflict by ensuring Arduino sensor and Spring Vending use different COM ports, allowing both systems to operate simultaneously without interference.