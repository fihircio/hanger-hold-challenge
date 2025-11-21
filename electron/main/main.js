"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = require("path");
// Global variables
let mainWindow = null;
let serialPort = null;
let serialPortError = false;
let SerialPortModule = null;
let SerialPort = null;
let SerialPortParser = null;
// Try to load SerialPort with error handling
try {
    SerialPortModule = require('serialport');
    SerialPort = SerialPortModule.SerialPort;
    SerialPortParser = SerialPortModule.ReadlineParser;
    console.log('SerialPort module loaded successfully');
}
catch (error) {
    console.error('Failed to load SerialPort module:', error);
    serialPortError = true;
    // Show error dialog to user
    electron_1.dialog.showErrorBox('Serial Port Module Error', `Failed to load Serial Port module.\n\nError: ${error}\n\nThe application will run without serial port functionality.\n\nPlease contact support for assistance.`);
}
const isDev = process.env.NODE_ENV === 'development';
function createWindow() {
    // Create the browser window
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: false,
            preload: path.join(__dirname, '../preload/preload.js'),
        },
    });
    // Load the app
    if (isDev) {
        mainWindow.loadURL('https://vendinghanger.eeelab.xyz');
        mainWindow.webContents.openDevTools();
    }
    else {
        // Try multiple possible paths for index.html to handle different build configurations
        const fs = require('fs');
        let indexPath = '';
        // Path 1: For ASAR builds (standard electron-builder)
        const asarPath = path.join(__dirname, '../index.html');
        // Path 2: For unpackaged builds (like manual-build.js)
        const unpackedPath = path.join(__dirname, '../../index.html');
        // Path 3: Alternative path for some electron-builder configurations
        const alternativePath = path.join(process.resourcesPath, 'index.html');
        if (fs.existsSync(asarPath)) {
            indexPath = asarPath;
        }
        else if (fs.existsSync(unpackedPath)) {
            indexPath = unpackedPath;
        }
        else if (fs.existsSync(alternativePath)) {
            indexPath = alternativePath;
        }
        else {
            console.error('Index.html not found at any of these paths:');
            console.error('  - ASAR path:', asarPath);
            console.error('  - Unpacked path:', unpackedPath);
            console.error('  - Alternative path:', alternativePath);
            electron_1.dialog.showErrorBox('File Not Found', `Could not find index.html at any expected location.\n\nPlease check your installation.`);
            return;
        }
        console.log('Loading index.html from:', indexPath);
        mainWindow.loadFile(indexPath).then(() => {
            console.log('Index.html loaded successfully');
        }).catch((error) => {
            console.error('Failed to load index.html:', error);
            electron_1.dialog.showErrorBox('Loading Error', `Failed to load index.html:\n${error.message}\n\nPlease check your installation.`);
        });
        mainWindow.webContents.openDevTools(); // Open DevTools for debugging
    }
    // Emitted when the window is closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
// This method will be called when Electron has finished initialization
electron_1.app.whenReady().then(() => {
    createWindow();
    // Initialize serial port
    initializeSerialPort();
    electron_1.app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the dock icon is clicked
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
// Quit when all windows are closed
electron_1.app.on('window-all-closed', () => {
    // On macOS it is common for applications to stay open
    if (process.platform !== 'darwin')
        electron_1.app.quit();
});
// Serial port initialization
async function initializeSerialPort() {
    // Skip serial port initialization if module failed to load
    if (serialPortError) {
        console.log('Skipping serial port initialization due to module loading error');
        return;
    }
    try {
        // Try to detect available serial ports
        const ports = await SerialPortModule.SerialPort.list();
        console.log('Available serial ports:', ports);
        // Platform-specific default port
        const isWindows = process.platform === 'win32';
        let portPath = isWindows ? 'COM1' : '/dev/ttyUSB0'; // default fallback
        // First try to find Arduino by manufacturer
        const arduinoPort = ports.find((port) => port.manufacturer && (port.manufacturer.toLowerCase().includes('arduino') ||
            port.manufacturer.toLowerCase().includes('ftdi') ||
            port.manufacturer.toLowerCase().includes('ch340')));
        if (arduinoPort) {
            portPath = arduinoPort.path;
            console.log(`Found Arduino by manufacturer: ${portPath}`);
        }
        else {
            // Platform-specific port detection
            if (isWindows) {
                // On Windows, look for COM ports
                const comPort = ports.find((port) => port.path.startsWith('COM') &&
                    !port.path.includes('Bluetooth'));
                if (comPort) {
                    portPath = comPort.path;
                    console.log(`Found COM port: ${portPath}`);
                }
                else if (ports.length > 0) {
                    portPath = ports[0].path;
                    console.log(`Using first available port: ${portPath}`);
                }
            }
            else {
                // On macOS/Linux, look for USB modem ports (common for Arduino)
                const usbModemPort = ports.find((port) => port.path.includes('usbmodem') ||
                    port.path.includes('tty.usbmodem') ||
                    port.path.includes('ttyACM') ||
                    port.path.includes('ttyUSB'));
                if (usbModemPort) {
                    portPath = usbModemPort.path;
                    console.log(`Found USB modem port (likely Arduino): ${portPath}`);
                }
                else if (ports.length > 0) {
                    // Avoid Bluetooth ports on macOS/Linux
                    const nonBluetoothPort = ports.find((port) => !port.path.includes('Bluetooth') &&
                        !port.path.includes('Baud'));
                    if (nonBluetoothPort) {
                        portPath = nonBluetoothPort.path;
                        console.log(`Using first non-Bluetooth port: ${portPath}`);
                    }
                    else {
                        portPath = ports[0].path;
                        console.log(`Using first available port: ${portPath}`);
                    }
                }
            }
        }
        serialPort = new SerialPort({
            path: portPath,
            baudRate: 9600,
            dataBits: 8,
            parity: 'none',
            stopBits: 1,
        });
        serialPort.on('open', () => {
            console.log(`Serial port ${portPath} opened`);
        });
        serialPort.on('data', (data) => {
            const dataString = Buffer.from(data).toString('utf8').trim();
            console.log('Received data from serial port:', dataString);
            // Forward data to renderer process as plain text (Arduino sends 0 or 1)
            if (mainWindow) {
                mainWindow.webContents.send('serial-data', dataString);
            }
        });
        serialPort.on('error', (err) => {
            console.error('Serial port error:', err);
            if (mainWindow) {
                mainWindow.webContents.send('serial-error', err.message);
            }
        });
    }
    catch (error) {
        console.error('Failed to initialize serial port:', error);
    }
}
// IPC handlers for window control
electron_1.ipcMain.handle('toggle-fullscreen', async () => {
    if (!mainWindow) {
        throw new Error('Main window is not available');
    }
    const isFullScreen = mainWindow.isFullScreen();
    mainWindow.setFullScreen(!isFullScreen);
    return { success: true, isFullScreen: !isFullScreen };
});
electron_1.ipcMain.handle('is-fullscreen', async () => {
    if (!mainWindow) {
        throw new Error('Main window is not available');
    }
    return mainWindow.isFullScreen();
});
// IPC handlers for serial communication
electron_1.ipcMain.handle('send-serial-command', async (event, command) => {
    if (serialPortError) {
        throw new Error('Serial Port module is not available. Please reinstall the application.');
    }
    if (!serialPort || !serialPort.isOpen) {
        throw new Error('Serial port is not open');
    }
    try {
        // Convert hex string to bytes
        const bytes = command.split(' ').map(byte => parseInt(byte, 16));
        const buffer = Buffer.from(bytes);
        // Send to serial port
        serialPort.write(buffer);
        console.log('Sent command to serial port:', command);
        return { success: true };
    }
    catch (error) {
        console.error('Failed to send serial command:', error);
        throw error;
    }
});
electron_1.ipcMain.handle('get-serial-ports', async () => {
    if (serialPortError) {
        console.log('Serial port module not available, returning empty port list');
        return [];
    }
    try {
        const ports = await SerialPortModule.SerialPort.list();
        return ports.map((port) => ({
            path: port.path,
            manufacturer: port.manufacturer,
            serialNumber: port.serialNumber,
            locationId: port.locationId,
            vendorId: port.vendorId,
            productId: port.productId,
        }));
    }
    catch (error) {
        console.error('Failed to get serial ports:', error);
        return [];
    }
});
electron_1.ipcMain.handle('connect-serial-port', async (event, portPath) => {
    if (serialPortError) {
        throw new Error('Serial Port module is not available. Please reinstall the application.');
    }
    try {
        if (serialPort && serialPort.isOpen) {
            await serialPort.close();
        }
        serialPort = new SerialPort({
            path: portPath,
            baudRate: 9600,
            dataBits: 8,
            parity: 'none',
            stopBits: 1,
        });
        return { success: true };
    }
    catch (error) {
        console.error('Failed to connect to serial port:', error);
        throw error;
    }
});
electron_1.ipcMain.handle('disconnect-serial-port', async () => {
    if (serialPortError) {
        throw new Error('Serial Port module is not available. Please reinstall the application.');
    }
    try {
        if (serialPort && serialPort.isOpen) {
            await serialPort.close();
            return { success: true };
        }
        return { success: false, message: 'No port to disconnect' };
    }
    catch (error) {
        console.error('Failed to disconnect serial port:', error);
        throw error;
    }
});
// Clean up on app quit
electron_1.app.on('before-quit', async () => {
    if (serialPort && serialPort.isOpen) {
        await serialPort.close();
    }
});
