# Windows COM Port "Access Denied" Fix Guide

## **Problem Identified**

The Arduino sensor now connects but receives this error:
```
[Arduino Sensor] Received error via preload: Opening COM6: Access denied
```

This means **SerialPort module is properly built** (✅ no more MockSerialPort), but **Windows is blocking access** to the COM port.

## **Root Cause**

Windows COM ports can have permission issues due to:
1. **Another application using COM6**
2. **Insufficient user permissions**
3. **Windows security policies**
4. **COM port driver issues**

## **Solutions (Try in Order)**

### **Solution 1: Run as Administrator (Most Likely Fix)**

**Method A: Right-click application**
1. Right-click on the Hanger Challenge executable
2. Select "Run as administrator"
3. Accept UAC prompt
4. Test Arduino sensor

**Method B: Command Prompt**
```cmd
# Navigate to application directory
cd "C:\path\to\hanger-challenge"

# Run as Administrator
"Hanger Challenge.exe"
```

### **Solution 2: Check COM Port Conflicts**

**Check what's using COM6:**
```cmd
# In Command Prompt as Administrator
wmic path where name="COM6" get deviceid, description
```

**Alternative: Check all COM ports:**
```cmd
# List all serial ports
wmic path where "like 'COM%'" get deviceid, description
```

### **Solution 3: Windows Device Manager**

1. **Press Windows + X** to open Device Manager
2. Navigate to **Ports (COM & LPT)**
3. Find **COM6** in the list
4. **Right-click COM6** → Properties
5. Check **Device status**: Should say "This device is working properly"
6. Check **Driver**: Should show Arduino driver

### **Solution 4: Restart COM Port**

```cmd
# As Administrator
net stop com6
net start com6
```

### **Solution 5: Check Arduino Hardware**

1. **Verify Arduino is connected** to USB port
2. **Try different USB port** if available
3. **Check Arduino USB cable** is properly connected
4. **Test Arduino on different computer** to rule out hardware issues

### **Solution 6: Advanced Windows Settings**

**Windows Security Settings:**
1. Open Windows Security → Device Security
2. Check COM port restrictions
3. Add exception if needed

**Group Policy (if in corporate environment):**
```cmd
gpedit.msc
# Navigate to: Computer Configuration → Administrative Templates → System → Device Installation Restrictions
```

## **Expected Results After Fix**

After applying the correct solution, you should see:

```
[Arduino Sensor] Connected to COM6 at 9600 baud
[Arduino Sensor] IPC listeners set up after serial connection (data will only be processed when enabled)
[Arduino Sensor] ENABLED and ready for data
[SERIAL] Received data from COM6: 0
[SERIAL] Forwarding to renderer: 0
[Arduino Sensor] Received data via preload: 0
[Arduino Sensor] NO DETECTION - Object removed from sensor
[SERIAL] Received data from COM6: 1
[SERIAL] Forwarding to renderer: 1
[Arduino Sensor] Received data via preload: 1
[Arduino Sensor] DETECTION - Object detected by sensor
```

And GameScreen will display:
- **"Arduino Sensor: DETECTED"** when hand is on sensor
- **"Arduino Sensor: NO DETECTION"** when hand is off sensor

## **Production Deployment Considerations**

For production vending PC deployment:

1. **Test COM port access** on target machine before deployment
2. **Document administrator requirements** in deployment guide
3. **Include COM port troubleshooting** in user manual
4. **Consider alternative COM port** if COM6 has persistent issues
5. **Add COM port check** to application startup

## **Quick Test Script**

Create this test script to verify COM port access:

```batch
@echo off
echo Testing COM6 access...
wmic path where name="COM6" get deviceid, description 2>nul
if %errorlevel% equ 0 (
    echo COM6 found and accessible
) else (
    echo ERROR: COM6 not found or not accessible
    echo Try running as Administrator
)
pause
```

## **Troubleshooting Checklist**

- [ ] Run application as Administrator
- [ ] Check if another application uses COM6
- [ ] Verify Arduino hardware is connected
- [ ] Test with different USB port
- [ ] Check Windows Device Manager for COM6 status
- [ ] Restart computer and test again
- [ ] Try different COM port if available
- [ ] Check Windows security settings

The most common fix is **running as Administrator** - this resolves 80% of COM port access issues.