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
    // Debug: log Node/Electron versions and serial module presence
    console.log('Process versions:', process.versions);
    console.log('SerialPort module loaded:', !!SerialPortModule, 'serialPortError:', serialPortError);
    electron_1.app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the dock icon is clicked
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
}).catch(error => {
    console.error('Electron app initialization failed:', error);
});
// Quit when all windows are closed
electron_1.app.on('window-all-closed', () => {
    // On macOS it is common for applications to stay open
    if (process.platform !== 'darwin')
        electron_1.app.quit();
});
// Serial port initialization with Arduino/Spring Vending coordination
async function initializeSerialPort() {
    // Skip serial port initialization if module failed to load
    if (serialPortError) {
        console.log('=== SERIAL PORT STATUS ===');
        console.log('MODE: MOCK (SerialPort module failed to load)');
        console.log('REASON: SerialPort module not available');
        console.log('All serial operations will be simulated');
        return;
    }
    try {
        // Try to detect available serial ports
        const ports = await SerialPortModule.SerialPort.list();
        console.log('=== SERIAL PORT DETECTION ===');
        console.log('SerialPort module status: LOADED');
        console.log('Available serial ports found:', ports.length);
        console.log('Available serial ports:', ports);
        console.log('Platform:', process.platform);
        // ENHANCED PORT ALLOCATION STRATEGY
        // Arduino sensor: HIGH COM ports (COM6+)
        // Spring Vending: LOW COM ports (COM1-5)
        // This prevents conflicts between services
        const isWindows = process.platform === 'win32';
        let portPath = isWindows ? 'COM1' : '/dev/ttyUSB0'; // default fallback
        // Separate Arduino and Spring Vending ports
        const arduinoPorts = ports.filter((port) => port.manufacturer && (port.manufacturer.toLowerCase().includes('arduino') ||
            port.manufacturer.toLowerCase().includes('ftdi') ||
            port.manufacturer.toLowerCase().includes('ch340')));
        // Sort COM ports by number
        const sortedComPorts = ports
            .filter((port) => port.path.startsWith('COM'))
            .sort((a, b) => {
            const numA = parseInt(a.path.replace('COM', ''));
            const numB = parseInt(b.path.replace('COM', ''));
            return numA - numB;
        });
        // PRIORITY: Use LOW COM ports for main serial communication (Spring Vending/TCN)
        // HIGH COM ports (COM6+) will be reserved for Arduino sensor service
        const lowComPorts = sortedComPorts.filter((port) => {
            const comNum = parseInt(port.path.replace('COM', ''));
            return comNum <= 5; // COM1-5 for main serial
        });
        const highComPorts = sortedComPorts.filter((port) => {
            const comNum = parseInt(port.path.replace('COM', ''));
            return comNum >= 6; // COM6+ for Arduino sensor
        });
        console.log('Port allocation strategy:');
        console.log('- Low COM ports (COM1-5) for main serial:', lowComPorts.map((p) => p.path));
        console.log('- High COM ports (COM6+) for Arduino sensor:', highComPorts.map((p) => p.path));
        console.log('- Arduino-specific ports:', arduinoPorts.map((p) => `${p.path} (${p.manufacturer})`));
        // Select port for main serial communication (Spring Vending/TCN)
        // Priority 1: Low COM ports (COM1-5)
        // Priority 2: Arduino ports if no low COM ports available
        // Priority 3: Any available port
        if (lowComPorts.length > 0) {
            portPath = lowComPorts[0].path;
            console.log(`Selected low COM port for main serial: ${portPath}`);
        }
        else if (arduinoPorts.length > 0) {
            // Use Arduino port if no low COM ports (but this might cause conflicts)
            portPath = arduinoPorts[0].path;
            console.log(`Using Arduino port for main serial (potential conflict): ${portPath}`);
        }
        else if (ports.length > 0) {
            portPath = ports[0].path;
            console.log(`Using first available port for main serial: ${portPath}`);
        }
        else {
            console.warn('No serial ports available for main serial communication');
            return;
        }
        // Try common baud rates (prefer 115200 for modern devices like TCN/Arduino) and fall back to 9600
        const candidateBaudRates = [115200, 9600];
        let opened = false;
        for (const br of candidateBaudRates) {
            try {
                serialPort = new SerialPort({
                    path: portPath,
                    baudRate: br,
                    dataBits: 8,
                    parity: 'none',
                    stopBits: 1,
                });
                // Wait briefly for open event; some SerialPort builds expose .open callback
                // We'll attach listeners and break if successful
                serialPort.on('open', () => {
                    console.log(`Serial port ${portPath} opened at baud ${br}`);
                });
                // If no error thrown by constructor, assume success for now
                opened = true;
                break;
            }
            catch (openErr) {
                console.warn(`Failed to open ${portPath} at baud ${br}:`, openErr);
                // try next baud rate
            }
        }
        if (!opened) {
            // Last resort: try default 9600 in case constructor didn't throw but port not open
            try {
                serialPort = new SerialPort({ path: portPath, baudRate: 9600, dataBits: 8, parity: 'none', stopBits: 1 });
                console.log(`[SERIAL] Created fallback serial port for ${portPath} at 9600 baud`);
            }
            catch (fallbackError) {
                console.error(`[SERIAL] Failed to create fallback serial port:`, fallbackError);
                serialPort = null;
                serialPortError = true;
                return;
            }
        }
        serialPort.on('open', () => {
            console.log(`[SERIAL] Serial port ${portPath} opened successfully at ${serialPort.baudRate} baud`);
        });
        serialPort.on('error', (err) => {
            console.error(`[SERIAL] Serial port error:`, err);
            if (mainWindow) {
                mainWindow.webContents.send('serial-error', err.message);
            }
        });
        serialPort.on('data', (data) => {
            const dataString = Buffer.from(data).toString('utf8').trim();
            console.log(`[SERIAL] Received data from ${portPath}:`, dataString);
            console.log(`[SERIAL] Forwarding to renderer: ${dataString}`);
            // Forward data to renderer process as plain text (Arduino sends 0 or 1)
            if (mainWindow) {
                mainWindow.webContents.send('serial-data', dataString);
            }
            else {
                console.error('[SERIAL] CRITICAL: mainWindow is null, cannot forward data');
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
// IPC handlers for serial communication - VERSION 1.0.3 COMPATIBLE (SIMPLIFIED)
electron_1.ipcMain.handle('send-serial-command', async (event, command) => {
    if (serialPortError) {
        console.warn('[SERIAL] Command blocked - Serial Port module not available');
        return { success: false, error: 'Serial Port module not available' };
    }
    if (!serialPort) {
        console.warn('[SERIAL] Command blocked - No serial port initialized');
        throw new Error('Serial port is not initialized. Please connect to a port first.');
    }
    if (!serialPort.isOpen) {
        console.warn('[SERIAL] Command blocked - Serial port is not open');
        throw new Error('Serial port is not open. Please connect to a port first.');
    }
    try {
        // Convert hex string to bytes
        const bytes = command.split(' ').map(byte => parseInt(byte, 16));
        const buffer = Buffer.from(bytes);
        // Send to serial port
        serialPort.write(buffer);
        console.log('[SERIAL] Sent command to serial port:', command);
        return { success: true };
    }
    catch (error) {
        console.error('[SERIAL] Failed to send serial command:', error);
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
electron_1.ipcMain.handle('connect-serial-port', async (event, portPath, baudRate) => {
    if (serialPortError) {
        throw new Error('Serial Port module is not available. Please reinstall the application.');
    }
    try {
        if (serialPort && serialPort.isOpen) {
            await serialPort.close();
        }
        // Accept an optional baud rate parameter from the renderer
        const br = baudRate || 9600;
        serialPort = new SerialPort({
            path: portPath,
            baudRate: br,
            dataBits: 8,
            parity: 'none',
            stopBits: 1,
        });
        console.log(`[SERIAL] Connecting to ${portPath} at baud ${br}`);
        // CRITICAL FIX: Set up data listeners for the NEW serial port instance
        // This ensures Arduino data is actually received and forwarded
        serialPort.on('open', () => {
            console.log(`[SERIAL] Port ${portPath} opened successfully at ${br} baud`);
        });
        serialPort.on('error', (err) => {
            console.error(`[SERIAL] Port ${portPath} error:`, err);
            if (mainWindow) {
                mainWindow.webContents.send('serial-error', err.message);
            }
        });
        serialPort.on('data', (data) => {
            const dataString = Buffer.from(data).toString('utf8').trim();
            console.log(`[SERIAL] Received data from ${portPath}:`, dataString);
            console.log(`[SERIAL] Forwarding to renderer: ${dataString}`);
            // Forward data to renderer process as plain text (Arduino sends 0 or 1)
            if (mainWindow) {
                // Use separate channels for Arduino vs other devices
                if (isArduinoPort) {
                    console.log(`[SERIAL] Forwarding Arduino data to dedicated channel: ${dataString}`);
                    mainWindow.webContents.send('arduino-data', dataString);
                    // CRITICAL FIX: Also send to general serial-data channel for Arduino sensor service compatibility
                    mainWindow.webContents.send('serial-data', dataString);
                }
                else {
                    console.log(`[SERIAL] Forwarding serial data to general channel: ${dataString}`);
                    mainWindow.webContents.send('serial-data', dataString);
                }
            }
            else {
                console.error('[SERIAL] CRITICAL: mainWindow is null, cannot forward data');
            }
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
// IPC handler to return TCN / serial status for the renderer (maintenance)
electron_1.ipcMain.handle('get-tcn-status', async () => {
    try {
        const connected = !!(serialPort && serialPort.isOpen);
        const mode = serialPortError ? 'mock' : 'native';
        const portInfo = serialPort ? {
            path: serialPort.path,
            baudRate: serialPort.baudRate
        } : null;
        console.log('=== TCN STATUS REQUEST ===');
        console.log('Mode:', mode.toUpperCase());
        console.log('Connected:', connected);
        console.log('Port Info:', portInfo);
        // Also collect available ports list when serial module is present
        let ports = [];
        if (!serialPortError && SerialPortModule && SerialPortModule.SerialPort && SerialPortModule.SerialPort.list) {
            try {
                const listed = await SerialPortModule.SerialPort.list();
                ports = listed.map((p) => ({ path: p.path, manufacturer: p.manufacturer, vendorId: p.vendorId, productId: p.productId, serialNumber: p.serialNumber }));
            }
            catch (listErr) {
                console.error('Failed to list serial ports for status:', listErr);
            }
        }
        // Basic status summary
        const status = {
            connected,
            mode,
            port: portInfo ? portInfo.path : null,
            baudRate: portInfo ? portInfo.baudRate : null,
            ports,
            lastError: null,
            connectedToTCN: connected, // best-effort; more advanced handshake can update this
            timestamp: new Date().toISOString(),
            // Add explicit detection flags
            isMockMode: serialPortError,
            hasRealHardware: ports.length > 0 && !serialPortError,
            serialModuleLoaded: !!SerialPortModule && !serialPortError
        };
        return status;
    }
    catch (err) {
        console.error('Error in get-tcn-status handler:', err);
        return { connected: false, mode: serialPortError ? 'mock' : 'native', lastError: err?.message || String(err) };
    }
});
// IPC handler for resetting serial ports
electron_1.ipcMain.handle('reset-serial-ports', async () => {
    try {
        console.log('[SERIAL] Resetting serial ports via IPC call...');
        await resetSerialPorts();
        return { success: true, message: 'Serial ports reset successfully' };
    }
    catch (error) {
        console.error('[SERIAL] Failed to reset serial ports:', error);
        return { success: false, message: error.message };
    }
});
// Clean up on app quit
electron_1.app.on('before-quit', async () => {
    if (serialPort && serialPort.isOpen) {
        await serialPort.close();
    }
});
