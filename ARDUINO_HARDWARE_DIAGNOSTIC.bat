@echo off
echo ========================================
echo ARDUINO HARDWARE DIAGNOSTIC TOOL
echo ========================================
echo.

echo This tool helps diagnose Arduino hardware and COM port issues
echo.

echo Step 1: Check COM6 status...
wmic path win32_serialport where "DeviceID='COM6'" get DeviceID, Description 2>nul
if %errorlevel% equ 0 (
    echo ✓ COM6 found in Windows Device Manager
) else (
    echo ✗ COM6 not found in Windows Device Manager
    echo   This means Windows doesn't see the Arduino device
)

echo.
echo Step 2: Check all COM ports...
wmic path win32_serialport get DeviceID, Description 2>nul
echo Available COM ports and devices:
wmic path win32_serialport get DeviceID, Description

echo.
echo Step 3: Check for Arduino-specific devices...
wmic path win32_serialport where "Description like 'Arduino%'" get DeviceID, Description 2>nul
echo Arduino devices found:
wmic path win32_serialport where "Description like 'Arduino%'" get DeviceID, Description

echo.
echo Step 4: Check USB devices...
wmic path win32_usbhub get DeviceID, Description 2>nul
echo USB devices found:
wmic path win32_usbhub get DeviceID, Description

echo.
echo Step 5: Test Arduino connection...
echo Testing if Arduino can be accessed on COM6...
echo.

REM Create a simple test script using CommonJS to avoid ES module issues
echo const { SerialPort } = require('serialport'); > test_arduino.cjs
echo const port = new SerialPort({ path: 'COM6', baudRate: 9600 }); >> test_arduino.cjs
echo port.on('open', () =^> console.log('Port opened')); >> test_arduino.cjs
echo port.on('data', (data) =^> console.log('Received:', data)); >> test_arduino.cjs
echo port.on('error', (err) =^> console.log('Error:', err)); >> test_arduino.cjs
echo setTimeout(() =^> port.close(), 5000); >> test_arduino.cjs
echo setTimeout(() =^> process.exit(0), 6000); >> test_arduino.cjs

echo Running Arduino test...
node test_arduino.cjs

echo.
echo ========================================
echo DIAGNOSTIC COMPLETE
echo ========================================
echo.
echo If Arduino is working properly, you should see:
echo - "Port opened"
echo - "Received: 0" or "Received: 1" when you place hand on sensor
echo - No "Access denied" errors
echo.
echo If you see "Access denied" or no data, try:
echo 1. Different USB cable
echo 2. Different USB port
echo 3. Check Arduino drivers in Device Manager
echo 4. Test Arduino on different computer
echo 5. Check if Arduino is powered and properly programmed
echo.

pause