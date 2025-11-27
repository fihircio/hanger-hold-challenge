@echo off
echo ========================================
echo TCN Vending PC - COM1 Fix Script
echo ========================================
echo.

echo Step 1: Cleaning up phantom USB devices...
powershell -Command "Get-PnpDevice -Class Ports | Where-Object {$_.Problem -eq 'CM_PROB_PHANTOM'} | ForEach-Object { Remove-PnpDevice -InstanceId $_.InstanceId -ErrorAction SilentlyContinue }"

echo.
echo Step 2: Rebuilding serialport package...
call npm rebuild serialport

echo.
echo Step 3: Rebuilding for Electron (if needed)...
call npx electron-rebuild

echo.
echo Step 4: Testing COM1 connectivity...
powershell -Command "try { $port = New-Object System.IO.Ports.SerialPort 'COM1', 115200, 'None', 8, 1; $port.Open(); if ($port.IsOpen) { Write-Host 'COM1 is accessible and can be opened' -ForegroundColor Green; $port.Close() } else { Write-Host 'COM1 cannot be opened' -ForegroundColor Red } } catch { Write-Host 'Error accessing COM1:' $_.Exception.Message -ForegroundColor Red }"

echo.
echo ========================================
echo Fix complete! Restart your application.
echo ========================================
echo.
echo Expected results:
echo - [TCN SERIAL] Using native serialport implementation
echo - [TCN SERIAL] PRIORITY 1: Found COM1, attempting connection...
echo - [TCN SERIAL] Successfully connected to COM1 (TCN Controller)
echo.
pause