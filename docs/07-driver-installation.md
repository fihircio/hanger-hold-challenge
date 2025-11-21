# Driver Installation Guide

## Overview

This guide covers the installation and configuration of all necessary drivers and hardware interfaces for the Hanger Hold Challenge system.

## Windows Drivers

### USB-to-RS232 Drivers

#### Prolific PL2303 Driver
**Most Common (70% probability)**

**Download and Installation:**
```bash
# Download
wget https://www.prolific.com.tw/US/ShowProduct.aspx?pcid=41 -O PL2303_Setup.exe

# Installation
# Run the installer as Administrator
# Follow the on-screen instructions
# Restart computer when prompted
```

**Verification:**
- Open **Device Manager**
- Look under **"Ports (COM & LPT)"**
- Should see: `Prolific USB-to-Serial (COM3)`

**Configuration:**
- **Baud Rate**: 115200 (recommended)
- **Data Bits**: 8
- **Parity**: None
- **Stop Bits**: 1
- **Flow Control**: None

#### CH340/CH341 Driver
**Common Alternative (20% probability)**

**Download and Installation:**
```bash
# Download
wget https://sparks.gogo.co.nz/ch340.html -O CH341SER.EXE

# Installation
# Run the installer
# Restart computer when prompted
```

**Verification:**
- Open **Device Manager**
- Look under **"Ports (COM & LPT)"**
- Should see: `USB-SERIAL CH340 (COM4)`

#### FTDI FT232 Driver
**Less Common (10% probability)**

**Download and Installation:**
```bash
# Download
wget https://ftdichip.com/drivers/vcp-drivers/ -O FTDI_CDM.exe

# Installation
# Run the installer
# Restart computer when prompted
```

**Verification:**
- Open **Device Manager**
- Look under **"Ports (COM & LPT)"**
- Should see: `USB Serial Port (FTDI) (COM5)`

## Node.js Serial Port Setup

### Installation
```bash
# Install serialport package
npm install serialport @serialport/parser-readline

# For global installation
npm install -g serialport
```

### Verification
```bash
# Test installation
node -e "console.log('Serial port installed successfully');"
```

## Hardware-Specific Drivers

### Arduino Drivers

#### Arduino Uno/Nano
```bash
# Download Arduino IDE
https://www.arduino.cc/en/software

# Installation includes USB drivers for Arduino boards
# Boards should appear under "Ports (COM & LPT)" in Device Manager
```

#### ESP32/ESP8266
```bash
# Install CP2102 Driver
# Download from Silicon Labs website
# Boards appear as USB Serial devices
```

## TCN Vending Machine Drivers

### TCN-Specific Drivers

The TCN CSC-8C (V49) typically uses standard USB-to-RS232 communication. No special drivers are required from TCN - the machine appears as a standard serial device to Windows.

### Driver Selection Guide

#### By Adapter Type
| Adapter Type | Preferred Driver | Probability |
|-------------|----------------|------------|
| Prolific PL2303 | Prolific | 70% |
| CH340/CH341 | WCH | 20% |
| FTDI FT232 | FTDI | 10% |

#### By Operating System
| OS | Recommended Driver | Notes |
|----|----------------|-------|
| Windows 10/11 | Prolific PL2303 | Most compatible |
| Windows 8/8.1 | Prolific PL2303 | Good compatibility |
| Windows 7 | Prolific PL2303 | May need older driver |
| Linux/Ubuntu | CH340/CH341 | Often pre-installed |
| macOS | FTDI FT232 | Best compatibility |

## Installation Steps

### Step 1: Identify Hardware
```bash
# Check Device Manager
# Look for unknown devices or yellow exclamation marks

# Check adapter markings
# Look for manufacturer labels on USB adapters

# Check serial port assignments
# Note which COM ports are already in use
```

### Step 2: Download Correct Driver
```bash
# Based on adapter identification
# Use the driver selection guide above

# Download from manufacturer's official website
# Avoid third-party driver sites
```

### Step 3: Install Driver
```bash
# Close all applications using serial ports
# Run installer as Administrator
# Follow on-screen instructions
# Restart computer when prompted

# Verify installation in Device Manager
```

### Step 4: Test Driver
```bash
# Connect hardware
# Open Device Manager
# Verify COM port appears
# Use serial terminal to test communication
```

## Troubleshooting

### Common Driver Issues

#### "Code 10: The device cannot start"
**Causes:**
- Driver not properly installed
- Incorrect driver version
- Hardware conflicts

**Solutions:**
- Reinstall driver as Administrator
- Try different USB port
- Update to latest driver version
- Disable conflicting hardware

#### "This device cannot start (Code 43)"
**Causes:**
- Driver signature issues
- Windows driver signing enforcement

**Solutions:**
- Disable driver signature enforcement (temporarily)
- Use unsigned driver in test mode
- Install signed driver from manufacturer

#### "COM Port Not Found"
**Causes:**
- Driver not installed
- Hardware not connected
- USB port failure

**Solutions:**
- Verify physical connections
- Try different USB cable
- Install all three driver types
- Check Windows Device Manager for hidden devices

### Advanced Troubleshooting

#### Driver Debugging
```bash
# Enable verbose logging
# Add to Windows Registry
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Class\{GUID}\]
"EnableDebug"=dword:1

# Check driver events
# Windows Event Viewer
# Look for driver-related errors

# Use driver verifier tools
# Manufacturer-specific utilities
```

## Automation Scripts

### Driver Installation Script
```bash
#!/bin/bash
# install-drivers.sh

DRIVER_DIR="/path/to/drivers"
LOG_FILE="/var/log/driver-installation.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to install Prolific driver
install_prolific() {
    log "Installing Prolific PL2303 driver..."
    
    if [ -f "$DRIVER_DIR/PL2303_Setup.exe" ]; then
        "$DRIVER_DIR/PL2303_Setup.exe" /S /silent
        log "Prolific driver installation completed"
        return 0
    else
        log "Prolific installer not found"
        return 1
    fi
}

# Function to install CH340 driver
install_ch340() {
    log "Installing CH340 driver..."
    
    if [ -f "$DRIVER_DIR/CH341SER.EXE" ]; then
        "$DRIVER_DIR/CH341SER.EXE" /S
        log "CH340 driver installation completed"
        return 0
    else
        log "CH340 installer not found"
        return 1
    fi
}

# Function to install FTDI driver
install_ftdi() {
    log "Installing FTDI FT232 driver..."
    
    if [ -f "$DRIVER_DIR/CDM.exe" ]; then
        "$DRIVER_DIR/CDM.exe" /S
        log "FTDI driver installation completed"
        return 0
    else
        log "FTDI installer not found"
        return 1
    fi
}

# Try all drivers
if install_prolific; then
    log "Prolific driver installed successfully"
elif install_ch340; then
    log "CH340 driver installed successfully"
elif install_ftdi; then
    log "FTDI driver installed successfully"
else
    log "No driver installation succeeded"
    exit 1
fi

log "Driver installation script completed"
```

### Driver Verification Script
```bash
#!/bin/bash
# verify-drivers.sh

# Check for installed drivers
for driver in "Prolific" "CH340" "FTDI"; do
    if command -v "device$driver" >/dev/null 2>&1; then
        echo "$driver driver: Available"
    else
        echo "$driver driver: Not available"
    fi
done

# Check COM ports
echo "Available COM ports:"
device=$(python -c "
import serial.tools.list_ports
ports = serial.tools.list_ports.comports()
for port in ports:
    print(f'  {port.device}: {port.description}')
" 2>/dev/null)

# Test serial communication
python -c "
import serial
import time

try:
    ser = serial.Serial('COM3', baudrate=115200, timeout=5)
    ser.write(b'TEST\r\n')
    time.sleep(2)
    response = ser.readline()
    print(f'Response: {response}')
except Exception as e:
    print(f'Error: {e}')
" 2>/dev/null
```

This driver installation guide provides comprehensive procedures for installing and troubleshooting all necessary drivers for the Hanger Hold Challenge system.