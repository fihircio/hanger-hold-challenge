# Arduino Sensor Troubleshooting Guide

## Problem Analysis

Based on the log analysis starting from line 250, the Arduino sensor is not looping properly when enabled due to several critical issues:

### Root Causes Identified:

1. **SerialPort Module Not Loading Properly**
   - Error: `[TCN SERIAL] CRITICAL: serialport not available, using MockSerialPort`
   - The application is running in mock mode instead of real serial communication

2. **Sensor Enable/Disable Cycling**
   - Pattern shows sensor being ENABLED then immediately DISABLED
   - Prevents continuous sensor data processing

3. **Serial Port Connection Failures**
   - Error: `Error: Serial port is not open`
   - COM4 detected but connection fails

## Solutions Implemented

### 1. Fixed Arduino Sensor Service (`services/arduinoSensorService.ts`)

**Key Improvements:**
- Added state change prevention to avoid unnecessary enable/disable cycles
- Enhanced serial connection detection and automatic connection
- Better error handling without disabling sensor on errors
- Improved logging with consistent `[Arduino Sensor]` prefix

**New Features:**
- `ensureSerialConnection()` method that automatically connects to Arduino ports
- Smart port detection (looks for Arduino, FTDI, CH340 manufacturers)
- Graceful fallback to mock mode when no hardware available

### 2. Serial Port Configuration

**Arduino Sketch Requirements:**
```cpp
#define SENSOR_PIN 2

void setup() {
  Serial.begin(9600);  // Must match baud rate
  pinMode(SENSOR_PIN, INPUT);
}

void loop() {
  int state = digitalRead(SENSOR_PIN);
  Serial.println(state);  // Send 0 or 1
  delay(100); // 10 readings per second
}
```

## Immediate Actions Required

### 1. Rebuild SerialPort for Electron

The most critical issue is the SerialPort module not loading properly:

```bash
# Navigate to electron directory
cd electron

# Rebuild native modules for Electron
npm run rebuild-native

# Alternative manual rebuild
npx electron-rebuild -f -w win32 -a x64
```

### 2. Verify Arduino Connection

**Physical Connection:**
- Ensure Arduino is properly connected via USB
- Check COM port assignment in Device Manager
- Verify Arduino is powered on (LED indicator)

**Port Detection:**
- Arduino should appear as COM port (Windows) or /dev/ttyUSB* (Linux/Mac)
- Look for manufacturer: "Arduino", "FTDI", or "CH340"

### 3. Baud Rate Configuration

**Critical: Both must match:**
- Arduino sketch: `Serial.begin(9600)`
- Electron application: 9600 baud (default in service)

### 4. Testing Procedure

**Step 1: Verify Arduino Output**
```bash
# Test Arduino directly (use Arduino IDE Serial Monitor)
# Should see continuous 0/1 values when sensor is triggered
```

**Step 2: Check Application Logs**
- Look for `[Arduino Sensor] State change: 0 -> 1` messages
- Verify no `[TCN SERIAL] CRITICAL` errors
- Confirm `[Arduino Sensor] Connected to COMx` message

**Step 3: Test Sensor Loop**
1. Enable Arduino sensor in application
2. Trigger physical sensor (wave hand over sensor)
3. Verify continuous state changes in logs
4. Check that sensor stays ENABLED

## Expected Behavior After Fix

**Normal Operation Logs:**
```
[Arduino Sensor] Available ports: [{path: "COM4", manufacturer: "Arduino"}]
[Arduino Sensor] Attempting to connect to COM4
[Arduino Sensor] Connected to COM4
Arduino sensor ENABLED
[Arduino Sensor] State change: 0 -> 1
[Arduino Sensor] Stable state: 0 -> 1 @ 1234567890
[Arduino Sensor] START detected
[Arduino Sensor] State change: 1 -> 0
[Arduino Sensor] Stable state: 1 -> 0 @ 1234567990
[Arduino Sensor] END detected
```

## Troubleshooting Checklist

### ✅ Hardware Verification
- [ ] Arduino connected via USB
- [ ] Arduino power LED on
- [ ] Sensor connected to pin 2
- [ ] Device Manager shows COM port
- [ ] Correct driver installed (CH340/FTDI if using clone)

### ✅ Software Configuration
- [ ] SerialPort module rebuilt for Electron
- [ ] Baud rate matches (9600)
- [ ] No `[TCN SERIAL] CRITICAL` errors
- [ ] Application running in Electron (not browser)

### ✅ Sensor Operation
- [ ] Sensor shows ENABLED and stays enabled
- [ ] Continuous 0/1 data in logs when triggered
- [ ] No immediate DISABLE after ENABLE
- [ ] START/END events trigger correctly

## Common Issues & Solutions

### Issue: "Serial port is not open"
**Cause:** Port not properly initialized or already in use
**Solution:** 
1. Close Arduino IDE Serial Monitor
2. Restart application
3. Check if another program is using the port

### Issue: "serialport not available, using MockSerialPort"
**Cause:** Native module not rebuilt for Electron
**Solution:** Run `npm run rebuild-native` in electron directory

### Issue: Sensor immediately DISABLED after ENABLED
**Cause:** Multiple initialization calls or connection failures
**Solution:** Fixed in updated service - now prevents unnecessary state changes

### Issue: No sensor data received
**Cause:** Wrong baud rate or port
**Solution:** 
1. Verify Arduino sketch uses 9600 baud
2. Check correct COM port selected
3. Test with Arduino IDE Serial Monitor first

## Advanced Debugging

### Enable Detailed Logging
Add to main process for more serial debugging:
```javascript
// In electron/main/main.ts
serialPort.on('data', (data: any) => {
  const dataString = Buffer.from(data).toString('utf8').trim();
  console.log(`[SERIAL DEBUG] Raw data:`, data);
  console.log(`[SERIAL DEBUG] Parsed:`, dataString);
  console.log(`[SERIAL DEBUG] Timestamp:`, new Date().toISOString());
});
```

### Test with Mock Data
If hardware unavailable, test with mock data:
```javascript
// In browser console for testing
setInterval(() => {
  if (window.electronAPI) {
    // Simulate sensor data
    window.electronAPI.onSerialData?.(Math.random() > 0.5 ? '1' : '0');
  }
}, 100);
```

## Maintenance

### Regular Checks
1. Verify Arduino USB connection is secure
2. Check for Windows driver updates
3. Monitor log files for serial errors
4. Test sensor functionality weekly

### Performance Monitoring
- Watch for sensor debounce delays
- Monitor serial port error rates
- Check for memory leaks in long-running sessions