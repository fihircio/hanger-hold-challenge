# PowerShell Commands for Vending PC COM Port Management

This guide provides PowerShell commands to list, test, and troubleshoot COM ports on your vending PC, specifically for the TCN vending machine controller system.

## Current System Status (from responselog.md)

Based on your console log, the system detected:
- **COM3**: Prolific chipset (connected in mock mode)
- **COM4**: CH340 chipset 
- **COM5**: FTDI chipset

The system is currently running in **MOCK mode**, which means it's simulating the serial communication even though real COM ports are detected.

## Basic COM Port Listing

### 1. List all COM ports with basic information
```powershell
# Simple COM port list
Get-WmiObject -Class Win32_SerialPort | Select-Object DeviceID, Description, MaxBaudRate
```

### 2. List COM ports with detailed information
```powershell
# Detailed COM port information
Get-WmiObject -Class Win32_SerialPort | Format-Table DeviceID, Description, MaxBaudRate, ProviderType, Status
```

### 3. Alternative method using PnP devices
```powershell
# Get COM ports through PnP devices
Get-PnpDevice -Class Ports | Where-Object {$_.Status -eq "OK"} | 
    Select-Object FriendlyName, InstanceId, Status | Format-Table -AutoSize
```

## Advanced COM Port Detection

### 4. List all COM ports with hardware details
```powershell
# Comprehensive COM port information
Get-WmiObject -Class Win32_SerialPort | ForEach-Object {
    [PSCustomObject]@{
        PortName = $_.DeviceID
        Description = $_.Description
        MaxBaudRate = $_.MaxBaudRate
        ProviderType = $_.ProviderType
        Status = $_.Status
        PNPDeviceID = $_.PNPDeviceID
        AttachedTo = $_.AttachedTo
    }
} | Format-Table -AutoSize
```

### 5. Get USB-to-Serial adapter information
```powershell
# Find USB-to-Serial adapters (Prolific, FTDI, CH340, etc.)
Get-PnpDevice -Class Ports | Where-Object {$_.FriendlyName -like "*COM*" -and $_.FriendlyName -like "*USB*"} |
    Select-Object FriendlyName, InstanceId, Status, Problem |
    Format-Table -AutoSize
```

### 6. Get detailed hardware information for specific COM ports
```powershell
# Get detailed info for COM3, COM4, COM5 (your detected ports)
$comPorts = "COM3", "COM4", "COM5"
foreach ($port in $comPorts) {
    Write-Host "=== Details for $port ===" -ForegroundColor Green
    Get-WmiObject -Class Win32_SerialPort | Where-Object {$_.DeviceID -eq $port} |
        Select-Object *
}
```

## COM Port Testing and Diagnostics

### 7. Test COM port availability
```powershell
# Check if COM ports are accessible
$comPorts = "COM3", "COM4", "COM5"
foreach ($port in $comPorts) {
    try {
        $portObj = [System.IO.Ports.SerialPort]::getportnames()
        if ($port -in $portObj) {
            Write-Host "$port is available" -ForegroundColor Green
        } else {
            Write-Host "$port is not detected by .NET" -ForegroundColor Red
        }
    } catch {
        Write-Host "Error checking $port : $_" -ForegroundColor Red
    }
}
```

### 8. Check COM port registry information
```powershell
# Check registry for COM port information
Get-ChildItem "HKLM:\HARDWARE\DEVICEMAP\SERIALCOMM" | ForEach-Object {
    $portName = $_.GetValue("\Device\Serial$($_.Name.Split('\')[-1])")
    Write-Host "Registry Entry: $portName"
}
```

### 9. Get driver information for COM ports
```powershell
# Get driver details for serial ports
Get-WmiObject -Class Win32_PnPEntity | Where-Object {$_.Name -like "*COM*"} |
    Select-Object Name, DeviceID, DriverVersion, DriverDate, Manufacturer |
    Format-Table -AutoSize
```

## Real-time COM Port Monitoring

### 10. Monitor COM port connection changes
```powershell
# Monitor for COM port changes (run in separate PowerShell window)
Write-Host "Monitoring COM port changes... Press Ctrl+C to stop" -ForegroundColor Yellow
while ($true) {
    $currentPorts = Get-WmiObject -Class Win32_SerialPort | Select-Object -ExpandProperty DeviceID
    Start-Sleep -Seconds 5
    $newPorts = Get-WmiObject -Class Win32_SerialPort | Select-Object -ExpandProperty DeviceID
    
    $added = Compare-Object $currentPorts $newPorts | Where-Object {$_.SideIndicator -eq "=>"}
    $removed = Compare-Object $currentPorts $newPorts | Where-Object {$_.SideIndicator -eq "<="}
    
    if ($added) {
        Write-Host "COM Port Added: $($added.InputObject)" -ForegroundColor Green
    }
    if ($removed) {
        Write-Host "COM Port Removed: $($removed.InputObject)" -ForegroundColor Red
    }
}
```

## TCN-Specific Commands

### 11. Check for TCN-compatible adapters
```powershell
# Look for TCN-compatible USB adapters (Prolific, CH340, FTDI)
$tcnAdapters = Get-PnpDevice -Class Ports | Where-Object {
    $_.FriendlyName -match "(Prolific|CH340|FTDI|Qinheng)" -and 
    $_.FriendlyName -match "COM"
}

if ($tcnAdapters) {
    Write-Host "TCN-Compatible Adapters Found:" -ForegroundColor Green
    $tcnAdapters | Select-Object FriendlyName, InstanceId, Status | Format-Table -AutoSize
} else {
    Write-Host "No TCN-compatible adapters found" -ForegroundColor Red
}
```

### 12. Test COM port connectivity for TCN
```powershell
# Test COM port connectivity (basic test)
function Test-ComPort {
    param([string]$PortName)
    
    try {
        $port = New-Object System.IO.Ports.SerialPort $PortName, 115200, 'None', 8, 1
        $port.Open()
        $status = $port.IsOpen
        $port.Close()
        return $status
    } catch {
        Write-Host "Error testing $PortName : $_" -ForegroundColor Red
        return $false
    }
}

# Test your detected COM ports
$comPorts = "COM3", "COM4", "COM5"
foreach ($port in $comPorts) {
    $result = Test-ComPort -PortName $port
    if ($result) {
        Write-Host "$port - Test PASSED" -ForegroundColor Green
    } else {
        Write-Host "$port - Test FAILED" -ForegroundColor Red
    }
}
```

## Troubleshooting Commands

### 13. Check for COM port conflicts
```powershell
# Check for COM port conflicts or errors
Get-PnpDevice -Class Ports | Where-Object {$_.Problem -ne $null} |
    Select-Object FriendlyName, InstanceId, Problem, Status |
    Format-Table -AutoSize
```

### 14. Reset COM port drivers
```powershell
# Reset USB COM port drivers (requires admin)
# WARNING: This will disconnect and reconnect USB serial devices
Write-Host "Resetting USB COM port drivers..." -ForegroundColor Yellow
Get-PnpDevice -Class Ports | Where-Object {$_.FriendlyName -like "*USB*"} |
    ForEach-Object {
        Write-Host "Resetting: $($_.FriendlyName)"
        Disable-PnpDevice -InstanceId $_.InstanceId -Confirm:$false
        Start-Sleep -Seconds 2
        Enable-PnpDevice -InstanceId $_.InstanceId -Confirm:$false
        Start-Sleep -Seconds 2
    }
Write-Host "Reset complete" -ForegroundColor Green
```

## Quick Reference Commands

### Quick COM Port Summary
```powershell
# One-line command to get all COM port info
Get-WmiObject -Class Win32_SerialPort | Format-Table DeviceID, Description, MaxBaudRate, Status -AutoSize
```

### Check TCN Adapter Status
```powershell
# Quick check for TCN adapters
Get-PnpDevice -Class Ports | Where-Object {$_.FriendlyName -match "(Prolific|CH340|FTDI)"} | Select-Object FriendlyName, Status
```

## Notes for Your Vending System

1. **COM3 (Prolific)**: Your system tried to connect to this port first
2. **COM4 (CH340)**: Common with Arduino clones, good backup option
3. **COM5 (FTDI)**: Reliable chipset, also good option

3. **Mock Mode**: Your application is running in mock mode, which means it's simulating hardware communication even when real COM ports are available. To disable mock mode, you may need to:
   - Ensure the `serialport` npm package is properly installed
   - Check if Electron is properly accessing native modules
   - Verify your application configuration

4. **Baud Rate**: Your system uses 115200 baud rate for TCN communication

## Next Steps

1. Run these commands on your vending PC to verify COM port availability
2. Test connectivity with each COM port
3. If needed, update your application to use real COM ports instead of mock mode
4. Document which COM port works best with your TCN hardware