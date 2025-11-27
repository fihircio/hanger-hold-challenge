# TCN Hardware Connection Guide - RS232 vs USB Detection

## Your Current Situation

Based on your PowerShell output:
```
DeviceID           Caption                         PNPDeviceID
COM1               Communications Port (COM1)      ACPI\PNP0501\0
```

**COM1 is an RS232 port** (motherboard serial port), not a USB-serial adapter. TCN vending machines typically connect via **USB-to-serial adapters**.

## Key Differences

### RS232 Port (COM1)
- **Manufacturer**: ACPI (motherboard)
- **PNP Device ID**: ACPI\PNP0501\0
- **Physical**: DB9 serial port on motherboard
- **Use Case**: Legacy industrial equipment, direct serial connections
- **TCN Compatibility**: **LOW** - Most modern TCN machines use USB

### USB-Serial Adapter (What TCN expects)
- **Manufacturer**: Prolific, CH340, FTDI, Qinheng
- **PNP Device ID**: USB\VID_xxxx&PID_xxxx\...
- **Physical**: USB dongle with serial chip
- **Use Case**: Modern vending machines, programming adapters
- **TCN Compatibility**: **HIGH** - Standard connection method

## What You Need

### 1. USB-to-Serial Adapter
TCN vending machines typically use one of these:
- **CH340** (most common, cheap Chinese adapters)
- **FTDI** (FT232R, FT230X chips)
- **Prolific** (PL2303HX chip)
- **Qinheng** (CH340 variant)

### 2. Correct Driver Installation
- **CH340**: Install from http://www.wch.cn/downloads/CH341SER_ZIP.html
- **FTDI**: Install from FTDI website
- **Prolific**: Install version 1.12+ (avoid older drivers)

## Testing Steps

### Step 1: Connect USB Adapter
1. Plug USB-to-serial adapter into PC
2. Connect TCN machine to adapter with appropriate cable
3. Wait for Windows to install drivers

### Step 2: Verify in Device Manager
1. Open Device Manager
2. Look under "Ports (COM & LPT)"
3. **Should see**: 
   ```
   USB-SERIAL CH340 (COM3)        <-- GOOD
   Communications Port (COM1)       <-- RS232, ignore for TCN
   ```

### Step 3: Test PowerShell Detection
```powershell
# List all serial ports with detailed info
Get-CimInstance Win32_SerialPort | Format-Table DeviceID, Caption, PNPDeviceID, Manufacturer -AutoSize

# Test specific COM port
try {
    $sp = New-Object System.IO.Ports.SerialPort 'COM3',115200,None,8,one
    $sp.Open()
    $sp.WriteLine('STATUS')
    Start-Sleep -Milliseconds 300
    $data = $sp.ReadExisting()
    $sp.Close()
    Write-Host "Response: $data"
} catch {
    Write-Host "Open failed: $($_.Exception.Message)"
}
```

## Expected Application Logs

### With USB Adapter Connected
```
=== SERIAL PORT DETECTION ===
SerialPort module status: LOADED
Available serial ports found: 2
Available serial ports: [
  {path: "COM1", manufacturer: "(Standard port types)", pnpId: "ACPI\\PNP0501\\0"},
  {path: "COM3", manufacturer: "CH340", pnpId: "USB\\VID_1A86&PID_7523\\..."}
]
Platform: win32

=== TCN SERIAL AUTO-CONNECT ===
[TCN SERIAL] MODE: NATIVE
[TCN SERIAL] Starting auto-detection...
[TCN SERIAL] Found 2 available ports: [...]
[TCN SERIAL] Analyzing ports for TCN compatibility...
[TCN SERIAL] Port COM1: manufacturer="(standard port types)", pnpId="ACPI\PNP0501\0"
[TCN SERIAL] Port COM1: USB=false, COM=true, Unix=false, TCN=false
[TCN SERIAL] Port COM3: manufacturer="ch340", pnpId="USB\VID_1A86&PID_7523\5&REV_0100"
[TCN SERIAL] Port COM3: USB=true, COM=true, Unix=false, TCN=true
[TCN SERIAL] Trying port: COM3 (manufacturer=CH340)
[TCN SERIAL] Connecting to COM3 at 115200 baud... (mode=NATIVE)
[TCN SERIAL] Connected to COM3
```

### Without USB Adapter (RS232 Only)
```
=== TCN SERIAL AUTO-CONNECT ===
[TCN SERIAL] MODE: NATIVE
[TCN SERIAL] Found 1 available ports: [...]
[TCN SERIAL] Analyzing ports for TCN compatibility...
[TCN SERIAL] Port COM1: manufacturer="(standard port types)", pnpId="ACPI\PNP0501\0"
[TCN SERIAL] Port COM1: USB=false, COM=true, Unix=false, TCN=false
[TCN SERIAL] Failed to connect to any TCN port
[TCN SERIAL] Auto-detection failed: Error: No available ports
```

## Troubleshooting

### If No USB Ports Appear
1. **Check USB Cable**: Try different USB port on PC
2. **Reinstall Drivers**: Uninstall and reinstall CH340/FTDI drivers
3. **Test Different Adapter**: CH340 adapters can be faulty
4. **Check Device Manager**: Look for "Unknown device" or yellow exclamation marks

### If USB Port Appears But Won't Connect
1. **Wrong Baud Rate**: TCN uses 115200, not 9600
2. **Port in Use**: Close other applications using COM port
3. **Hardware Issue**: Try different USB-serial adapter

### If Still Using RS232
Some very old TCN machines might use direct RS232, but this is rare. If you have such a machine:
- Use COM1 with 9600 baud rate
- May need null modem cable
- Check TCN manual for RS232 wiring

## Next Steps

1. **Get USB-Serial Adapter** (CH340 recommended)
2. **Install Proper Drivers**
3. **Connect TCN Machine**
4. **Run Application** - should now show NATIVE mode and HEX commands

The enhanced logging will now show exactly which ports are detected and why they're accepted or rejected for TCN use.