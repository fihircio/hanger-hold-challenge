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
// ENHANCED: Support multiple serial ports for Arduino + Spring Vending
let activeSerialPorts = new Map(); // Track all active serial ports
let arduinoPortPath = null; // Track Arduino port separately
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
        // Arduino sensor: HIGH COM ports (COM6+) or Arduino manufacturer
        // Spring Vending: LOW COM ports or specific USB-Serial adapters
        const isWindows = process.platform === 'win32';
        let portPath = isWindows ? 'COM1' : '/dev/ttyUSB0'; // default fallback
        // 1. Identify Arduino Ports (to exclude them from Vending)
        const arduinoPorts = ports.filter((port) => port.manufacturer && (port.manufacturer.toLowerCase().includes('arduino')
        // We do NOT include FTDI/CH340 here as those are often Vending Machines too
        // Only explicit "Arduino" brand is safe to exclude
        ));
        // 2. Identify Vending Candidates (Prolific, CH340, FTDI)
        // These are almost always the Vending Machine USB adapters
        const vendingCandidates = ports.filter((port) => {
            const mfr = (port.manufacturer || '').toLowerCase();
            const isArduino = mfr.includes('arduino');
            const isUsbSerial = mfr.includes('prolific') || mfr.includes('ch340') || mfr.includes('ftdi') || mfr.includes('silicon labs');
            return isUsbSerial && !isArduino;
        });
        console.log('Port classification:');
        console.log('- Arduino candidates:', arduinoPorts.map((p) => p.path));
        console.log('- Vending USB candidates:', vendingCandidates.map((p) => p.path));
        // SELECTION LOGIC
        if (vendingCandidates.length > 0) {
            // PRIORITY 1: USB-to-Serial Adapter (Best guess for Vending Machine)
            // Pick the lowest COM number among candidates (usually COM3/COM4)
            const sortedCandidates = vendingCandidates.sort((a, b) => {
                const numA = parseInt(a.path.replace('COM', '')) || 999;
                const numB = parseInt(b.path.replace('COM', '')) || 999;
                return numA - numB;
            });
            portPath = sortedCandidates[0].path;
            console.log(`[SERIAL] Selected USB-Serial adapter for vending: ${portPath} (${sortedCandidates[0].manufacturer})`);
        }
        else {
            // PRIORITY 2: Fallback to COM1 or First Available
            const com1Port = ports.find((port) => port.path === 'COM1');
            if (com1Port) {
                portPath = 'COM1';
                console.log(`[SERIAL] No USB adapters found. Defaulting to standard COM1.`);
            }
            else if (ports.length > 0) {
                // Exclude recognized Arduino ports if possible
                const nonArduinoPorts = ports.filter((p) => !arduinoPorts.some((ap) => ap.path === p.path));
                if (nonArduinoPorts.length > 0) {
                    portPath = nonArduinoPorts[0].path;
                    console.log(`[SERIAL] Using first available non-Arduino port: ${portPath}`);
                }
                else {
                    // absolute last resort
                    portPath = ports[0].path;
                    console.log(`[SERIAL] Using absolute fallback port: ${portPath}`);
                }
            }
            else {
                console.warn('[SERIAL] No serial ports available for main serial communication');
                return;
            }
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
                // CRITICAL FIX: DON'T set serialPortError = true - this triggers mock mode
                // serialPortError = true; // <-- REMOVED: Prevents all serial commands
                console.log('[SERIAL] Port initialization failed, but will allow emergency connection attempts');
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
// Add serial port reset function
async function resetSerialPorts() {
    console.log('[SERIAL] Resetting all serial ports...');
    // Close all active ports
    for (const [portPath, port] of activeSerialPorts.entries()) {
        try {
            if (port.isOpen) {
                await port.close();
                console.log(`[SERIAL] Closed port: ${portPath}`);
            }
        }
        catch (error) {
            console.error(`[SERIAL] Error closing port ${portPath}:`, error);
        }
    }
    // Clear all references
    activeSerialPorts.clear();
    arduinoPortPath = null;
    serialPort = null;
    // Wait for ports to fully release
    await new Promise(resolve => setTimeout(resolve, 2000));
    // Reinitialize
    await initializeSerialPort();
}
// IPC handlers for serial communication - VERSION 1.0.3 COMPATIBLE
electron_1.ipcMain.handle('send-serial-command', async (event, command) => {
    // Only block if SerialPort module is truly unavailable
    if (serialPortError && !SerialPortModule) {
        console.warn('[SERIAL] Command blocked - Serial Port module not available');
        return { success: false, error: 'Serial Port module not available' };
    }
    // VERSION 1.0.3 COMPATIBLE: Force real connection - NO SIMULATION
    if (!serialPort || !serialPort.isOpen) {
        console.log('[SERIAL] No port available - attempting emergency connection to COM1');
        // EMERGENCY CONNECTION: Try to connect to COM1 immediately (like version 1.0.3)
        try {
            const ports = await SerialPortModule.SerialPort.list();
            const com1Port = ports.find((port) => port.path === 'COM1');
            if (com1Port) {
                console.log('[SERIAL] Found COM1, attempting emergency connection...');
                serialPort = new SerialPort({
                    path: 'COM1',
                    baudRate: 9600,
                    dataBits: 8,
                    parity: 'none',
                    stopBits: 1,
                });
                // Wait for connection
                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => reject(new Error('Connection timeout')), 5000);
                    serialPort.on('open', () => {
                        clearTimeout(timeout);
                        console.log('[SERIAL] Emergency COM1 connection successful');
                        resolve();
                    });
                    serialPort.on('error', (err) => {
                        clearTimeout(timeout);
                        reject(err);
                    });
                });
            }
            else {
                throw new Error('COM1 not available for emergency connection');
            }
        }
        catch (error) {
            console.error('[SERIAL] Emergency connection failed:', error);
            throw new Error(`No serial port available and emergency connection failed: ${error.message}`);
        }
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
        // ENHANCED: Check if this is an Arduino port (COM6+)
        const comNum = parseInt(portPath.replace('COM', ''));
        const isArduinoPort = !isNaN(comNum) && comNum >= 6;
        if (isArduinoPort) {
            console.log(`[SERIAL] Detected Arduino port connection: ${portPath}`);
            arduinoPortPath = portPath;
        }
        else {
            console.log(`[SERIAL] Detected main serial port connection: ${portPath}`);
        }
        // Close existing port if it's the same path
        // OPTIMIZATION: If port is already open and valid, reuse it (Fast Path)
        // This prevents unnecessary hardware resets and speeds up page reloads
        if (activeSerialPorts.has(portPath)) {
            const existingPort = activeSerialPorts.get(portPath);
            if (existingPort && existingPort.isOpen) {
                console.log(`[SERIAL] FAST PATH: Port ${portPath} is already open. Reusing existing connection.`);
                // Update references just in case
                if (isArduinoPort) {
                    arduinoPortPath = portPath;
                }
                else {
                    serialPort = existingPort;
                }
                return { success: true };
            }
        }
        // If we get here, we need to open a fresh connection
        // Close existing global instance if it matches but wasn't in active map (stale reference)
        if (serialPort && serialPort.isOpen && serialPort.path === portPath) {
            console.log(`[SERIAL] Closing stale global reference for ${portPath}`);
            await serialPort.close();
        }
        // Accept an optional baud rate parameter from the renderer
        const br = baudRate || 9600;
        const newSerialPort = new SerialPort({
            path: portPath,
            baudRate: br,
            dataBits: 8,
            parity: 'none',
            stopBits: 1,
        });
        console.log(`[SERIAL] Connecting to ${portPath} at baud ${br}`);
        // CRITICAL FIX: Set up data listeners for the NEW serial port instance
        // This ensures Arduino data is actually received and forwarded
        newSerialPort.on('open', () => {
            console.log(`[SERIAL] Port ${portPath} opened successfully at ${br} baud`);
            // Track the active port
            activeSerialPorts.set(portPath, newSerialPort);
            // Update main serial port reference if this is the main serial port
            if (!isArduinoPort) {
                serialPort = newSerialPort;
            }
        });
        newSerialPort.on('error', (err) => {
            console.error(`[SERIAL] Port ${portPath} error:`, err);
            if (mainWindow) {
                mainWindow.webContents.send('serial-error', err.message);
            }
            // Remove from active ports on error
            activeSerialPorts.delete(portPath);
            if (isArduinoPort && arduinoPortPath === portPath) {
                arduinoPortPath = null;
            }
        });
        newSerialPort.on('data', (data) => {
            const dataString = Buffer.from(data).toString('utf8').trim();
            console.log(`[SERIAL] Received data from ${portPath}:`, dataString);
            // Forward data to renderer process with SEPARATE channels to prevent conflicts
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
