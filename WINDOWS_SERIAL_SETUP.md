# Windows Serial Port Setup Guide

## Overview
This guide covers setting up serial communication between your Hanger Challenge Electron app and Arduino devices on Windows.

## Arduino Driver Installation

### Option 1: Arduino IDE (Recommended)
1. Download and install [Arduino IDE](https://www.arduino.cc/en/software)
2. Connect your Arduino via USB
3. Open Arduino IDE
4. Go to **Tools → Board** and select your Arduino model
5. Go to **Tools → Port** and note the COM port number
6. Drivers are automatically installed with Arduino IDE

### Option 2: Manual Driver Installation

#### For Genuine Arduino Boards:
- Drivers are included in Windows 10/11 automatically
- No additional installation needed

#### For Arduino Clones (CH340/CH341):
1. Download drivers from [WCH.cn](http://www.wch.cn/downloads/CH341SER_ZIP.html)
2. Extract and run `CH341SER.EXE`
3. Follow installation wizard
4. Restart computer

#### For FTDI-based Boards:
1. Download drivers from [FTDI](https://ftdichip.com/drivers/vcp-drivers/)
2. Install FTDI VCP drivers
3. Restart computer

## Finding Your COM Port

### Method 1: Device Manager
1. Press **Windows + X** and select **Device Manager**
2. Expand **Ports (COM & LPT)**
3. Look for your Arduino (usually shows as "Arduino Uno" or "USB-SERIAL CH340")
4. Note the COM port number (e.g., COM3, COM4)

### Method 2: Arduino IDE
1. Open Arduino IDE
2. Go to **Tools → Port**
3. Available COM ports are listed
4. Your Arduino will be highlighted when connected

### Method 3: Using Command Prompt
```cmd
# List all COM ports
mode

# Or using PowerShell
[System.IO.Ports.SerialPort]::getportnames()
```

## Common COM Port Names on Windows

| Device Type | Typical Port Name | Example |
|-------------|------------------|----------|
| Arduino Uno | USB-SERIAL CH340 | COM3 |
| Arduino Nano | USB-SERIAL CH340 | COM4 |
| Arduino Mega | Arduino Mega | COM5 |
| Genuine Arduino | Arduino Uno | COM3 |
| Bluetooth | Bluetooth Device | COM6, COM7 |

## Troubleshooting Serial Port Issues

### Port Not Listed in Device Manager
1. **Check USB Connection**:
   - Try different USB cable
   - Try different USB port
   - Check for bent pins

2. **Driver Issues**:
   - Uninstall and reinstall drivers
   - Check for yellow exclamation marks in Device Manager
   - Try "Update driver" → "Browse my computer"

3. **Windows Updates**:
   - Install latest Windows updates
   - Some drivers are included in Windows updates

### "Access Denied" Errors
1. **Run as Administrator**:
   - Right-click application
   - Select "Run as administrator"

2. **Close Other Applications**:
   - Close Arduino IDE
   - Close serial monitors
   - Close other apps using COM ports

3. **Check Port Permissions**:
   - Only one application can use a COM port at a time

### "Port Already in Use" Errors
1. **Identify Using Application**:
   - Open Resource Monitor
   - Go to "CPU" tab
   - Search for "COM" in "Associated Handles"

2. **Restart Computer**:
   - Clears stuck port connections
   - First troubleshooting step

## Testing Serial Connection

### Using Arduino IDE
1. Connect Arduino
2. Open Arduino IDE
3. Select correct Board and Port
4. Upload Blink example:
   ```cpp
   void setup() {
     pinMode(LED_BUILTIN, OUTPUT);
   }
   void loop() {
     digitalWrite(LED_BUILTIN, HIGH);
     delay(1000);
     digitalWrite(LED_BUILTIN, LOW);
     delay(1000);
   }
   ```
5. If LED blinks, connection is working

### Using Serial Monitor
1. Open Arduino IDE
2. Go to **Tools → Serial Monitor**
3. Set baud rate to 9600
4. Send test messages

## Application-Specific Settings

### Hanger Challenge App Configuration
The app is configured to:
- **Baud Rate**: 9600
- **Data Bits**: 8
- **Parity**: None
- **Stop Bits**: 1
- **Flow Control**: None

### Automatic Detection
The app will:
1. Scan all available COM ports
2. Identify Arduino devices by manufacturer
3. Skip Bluetooth COM ports
4. Connect to first suitable Arduino found

### Manual Port Selection
If auto-detection fails:
1. Open the application
2. Go to Settings/Configuration
3. Select "Serial Port"
4. Choose correct COM port from dropdown
5. Click "Connect"

## Advanced Troubleshooting

### Registry Issues
```cmd
# Check COM port registry entries
reg query HKLM\HARDWARE\DEVICEMAP\SERIALCOMM

# Reset COM ports (advanced)
reg delete HKLM\HARDWARE\DEVICEMAP\SERIALCOMM /va
```

### Power Management
1. **Disable USB Power Saving**:
   - Device Manager → Universal Serial Bus controllers
   - Right-click "USB Root Hub"
   - Properties → Power Management
   - Uncheck "Allow computer to turn off this device"

2. **Disable Selective Suspend**:
   - Power Options → Change plan settings
   - Change advanced power settings
   - USB settings → USB selective suspend
   - Set to "Disabled"

## Virtual COM Ports

### For Bluetooth Devices
- May appear as COM ports
- Automatically filtered out by the app
- Can be manually selected if needed

### For USB-to-Serial Adapters
- Works with most adapters
- Requires proper drivers
- May need manual port selection

## Performance Tips

1. **Use USB 2.0 Ports** for better compatibility
2. **Avoid USB Hubs** when possible
3. **Use Short USB Cables** for reliable connection
4. **Close Other Serial Applications** while running the app
5. **Restart Arduino** by pressing reset button if connection issues

## Support Resources

- [Arduino Troubleshooting](https://www.arduino.cc/en/Guide/Troubleshooting)
- [Windows Serial Port Help](https://support.microsoft.com/en-us/windows)
- [CH340 Driver Support](http://www.wch.cn/downloads/CH341SER_ZIP.html)

---

**Note**: This guide covers the most common serial port scenarios on Windows. If you encounter issues not covered here, please check the Windows Event Viewer for detailed error messages.