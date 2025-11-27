# COM Port Analysis and Mock Mode Solution

## Problem Analysis

Based on your PowerShell results and the application logs, here's what's happening:

### 1. COM Port Status
- **COM1**: "Communications Port" - This is your real TCN controller (115200 baud)
- **COM3, COM4, COM5, COM6**: USB Serial Devices with "CM_PROB_PHANTOM" status - These are phantom devices

### 2. Why System Stays in Mock Mode

Looking at the [`tcnSerialService.ts`](services/tcnSerialService.ts:62-80) code:

```typescript
try {
  // Try to load 'serialport' (may not be installed in web / test environments)
  const serialportPkg = require('serialport');
  SerialPort = serialportPkg.default || serialportPkg;
  console.log('[TCN SERIAL] Using native serialport implementation');
} catch (e) {
  console.error('[TCN SERIAL] serialport not available, using MockSerialPort:', e);
}
```

The system falls back to mock mode when:
1. The `serialport` npm package is not properly installed
2. The native serialport module fails to load (common in Electron apps)
3. The serialport package can't access system COM ports

### 3. Detection Logic Issue

The auto-detection in [`tcnSerialService.ts`](services/tcnSerialService.ts:194-211) looks for:
```typescript
const tcnPorts = ports.filter(port => {
  const mfr = (port.manufacturer || '').toLowerCase();
  const path = (port.path || '').toLowerCase();

  return (
    mfr.includes('prolific') ||
    mfr.includes('ch340') ||
    mfr.includes('ftdi') ||
    mfr.includes('qinheng') ||
    path.includes('com') ||  // This should match COM1
    path.startsWith('/dev/tty') ||
    path.startsWith('/dev/cu') ||
    path.includes('usbserial')
  );
});
```

COM1 should be detected, but the mock mode is preventing real connection attempts.

## Solution Steps

### Step 1: Fix Phantom USB Devices

Run these PowerShell commands to clean up phantom devices:

```powershell
# Remove phantom USB serial devices
Get-PnpDevice -Class Ports | Where-Object {$_.Problem -eq "CM_PROB_PHANTOM"} | ForEach-Object {
    Write-Host "Removing phantom device: $($_.FriendlyName)"
    Remove-PnpDevice -InstanceId $_.InstanceId -ErrorAction SilentlyContinue
}

# Scan for hardware changes
Write-Host "Scanning for hardware changes..."
Get-PnpDevice -Class Ports | Where-Object {$_.Status -eq "Unknown"} | ForEach-Object {
    Write-Host "Rescanning: $($_.FriendlyName)"
    Enable-PnpDevice -InstanceId $_.InstanceId -ErrorAction SilentlyContinue
}
```

### Step 2: Test COM1 Connectivity

```powershell
# Test COM1 availability and connectivity
try {
    $port = New-Object System.IO.Ports.SerialPort "COM1", 115200, 'None', 8, 1
    $port.Open()
    if ($port.IsOpen) {
        Write-Host "COM1 is accessible and can be opened" -ForegroundColor Green
        $port.Close()
    } else {
        Write-Host "COM1 cannot be opened" -ForegroundColor Red
    }
} catch {
    Write-Host "Error accessing COM1: $($_.Exception.Message)" -ForegroundColor Red
}
```

### Step 3: Fix the TCN Serial Service

The main issue is that the application is falling back to mock mode. Here are the fixes:

#### Option A: Install/Rebuild Serialport Package

```bash
# In your project directory
npm install serialport
npm rebuild serialport
```

#### Option B: Modify TCN Service to Force Native Mode

Create a modified version that prioritizes COM1:

```typescript
// In services/tcnSerialService.ts - modify the autoConnect method
async autoConnect(): Promise<boolean> {
  try {
    console.log('[TCN SERIAL] Starting auto-detection...');
    
    // First, try to force native mode if COM1 is available
    if (SerialPort !== MockSerialPort) {
      const ports = await SerialPort.list();
      console.log('[TCN SERIAL] Available ports:', ports);
      
      // Prioritize COM1 for TCN controller
      const com1Port = ports.find(port => port.path.toLowerCase().includes('com1'));
      if (com1Port) {
        console.log('[TCN SERIAL] Found COM1, attempting connection...');
        const connected = await this.connect('COM1', 115200);
        if (connected) {
          console.log('[TCN SERIAL] Successfully connected to COM1');
          return true;
        }
      }
      
      // Fall back to other ports
      const tcnPorts = ports.filter(port => {
        const mfr = (port.manufacturer || '').toLowerCase();
        const path = (port.path || '').toLowerCase();
        return mfr.includes('prolific') || mfr.includes('ch340') || 
               mfr.includes('ftdi') || mfr.includes('qinheng') || 
               path.includes('com');
      });
      
      for (const portInfo of tcnPorts) {
        if (portInfo.path.toLowerCase().includes('com1')) continue; // Already tried COM1
        console.log(`[TCN SERIAL] Trying port: ${portInfo.path}`);
        const connected = await this.connect(portInfo.path, 115200);
        if (connected) return true;
      }
    }
    
    console.error('[TCN SERIAL] Failed to connect to any TCN port');
    return false;
  } catch (error) {
    console.error('[TCN SERIAL] Auto-detection failed:', error);
    return false;
  }
}
```

#### Option C: Add COM1 Force Configuration

Add a configuration option to force COM1 usage:

```typescript
// Add to the constructor or as environment variable
private readonly FORCE_COM1 = process.env.FORCE_COM1 === 'true' || true; // Set to true for your system

async autoConnect(): Promise<boolean> {
  try {
    // If forcing COM1, try it first regardless of detection
    if (this.FORCE_COM1 && SerialPort !== MockSerialPort) {
      console.log('[TCN SERIAL] Forcing COM1 connection...');
      const connected = await this.connect('COM1', 115200);
      if (connected) {
        console.log('[TCN SERIAL] Successfully connected to COM1');
        return true;
      }
    }
    
    // Continue with normal detection...
  } catch (error) {
    console.error('[TCN SERIAL] Auto-detection failed:', error);
    return false;
  }
}
```

### Step 4: Electron-Specific Fix

If you're running in Electron, the serialport package might need special handling:

```bash
# Install electron-rebuild
npm install --save-dev electron-rebuild

# Rebuild native modules for Electron
npx electron-rebuild
```

### Step 5: Test the Fix

After implementing the changes:

1. Restart your application
2. Check the console logs for:
   - `[TCN SERIAL] Using native serialport implementation` (instead of mock)
   - `[TCN SERIAL] Successfully connected to COM1`

## Quick PowerShell Script to Fix Everything

```powershell
# Complete fix script
Write-Host "=== Vending PC COM Port Fix Script ===" -ForegroundColor Yellow

# Step 1: Remove phantom devices
Write-Host "Step 1: Removing phantom USB devices..." -ForegroundColor Cyan
Get-PnpDevice -Class Ports | Where-Object {$_.Problem -eq "CM_PROB_PHANTOM"} | ForEach-Object {
    Write-Host "Removing: $($_.FriendlyName)"
    Remove-PnpDevice -InstanceId $_.InstanceId -ErrorAction SilentlyContinue
}

# Step 2: Test COM1
Write-Host "Step 2: Testing COM1 connectivity..." -ForegroundColor Cyan
try {
    $port = New-Object System.IO.Ports.SerialPort "COM1", 115200, 'None', 8, 1
    $port.Open()
    if ($port.IsOpen) {
        Write-Host "✓ COM1 is accessible" -ForegroundColor Green
        $port.Close()
    } else {
        Write-Host "✗ COM1 cannot be opened" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Error accessing COM1: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 3: Show current COM port status
Write-Host "Step 3: Current COM port status..." -ForegroundColor Cyan
Get-WmiObject -Class Win32_SerialPort | Select-Object DeviceID, Description, MaxBaudRate, Status

Write-Host "=== Fix Complete ===" -ForegroundColor Green
Write-Host "Now restart your application and check if it connects to COM1" -ForegroundColor Yellow
```

## Expected Results

After applying these fixes, you should see:

1. **Application Logs**:
   - `[TCN SERIAL] Using native serialport implementation`
   - `[TCN SERIAL] Successfully connected to COM1`
   - No more `[TCN SERIAL] Mode: MOCK` messages

2. **PowerShell Results**:
   - COM1 shows as accessible
   - No phantom USB devices
   - Clean COM port listing

3. **Functionality**:
   - Real prize dispensing instead of mock dispensing
   - Actual TCN hardware communication
   - Real inventory updates

## Troubleshooting

If it still doesn't work:

1. **Check Node.js/Electron Version**: Ensure serialport supports your Node.js version
2. **Permissions**: Run PowerShell as Administrator
3. **Driver Issues**: Update COM1 driver in Device Manager
4. **Hardware Test**: Use a terminal program like PuTTY to test COM1 manually

The key issue is that your application is falling back to mock mode when it should be using the real COM1 port for your TCN controller.