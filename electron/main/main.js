"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = require("path");
const serialport_1 = require("serialport");
// Keep a global reference of the window object
let mainWindow = null;
let serialPort = null;
const isDev = process.env.NODE_ENV === 'development';
function createWindow() {
    // Create the browser window
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, '../preload/preload.js'),
        },
        icon: path.join(__dirname, '../../assets/icon.png'),
    });
    // Load the app
    if (isDev) {
        mainWindow.loadURL('https://vendinghanger.eeelab.xyz');
        mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
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
    try {
        // Try to detect available serial ports
        const ports = await serialport_1.SerialPort.list();
        console.log('Available serial ports:', ports);
        // Prioritize Arduino ports over Bluetooth
        let portPath = '/dev/ttyUSB0'; // default fallback
        // First try to find Arduino by manufacturer
        const arduinoPort = ports.find(port => port.manufacturer && port.manufacturer.toLowerCase().includes('arduino'));
        if (arduinoPort) {
            portPath = arduinoPort.path;
            console.log(`Found Arduino by manufacturer: ${portPath}`);
        }
        else {
            // If no manufacturer match, try to find USB modem ports (common for Arduino)
            const usbModemPort = ports.find(port => port.path.includes('usbmodem') || port.path.includes('tty.usbmodem'));
            if (usbModemPort) {
                portPath = usbModemPort.path;
                console.log(`Found USB modem port (likely Arduino): ${portPath}`);
            }
            else if (ports.length > 0) {
                // Fallback to first available port
                portPath = ports[0].path;
                console.log(`Using first available port: ${portPath}`);
            }
        }
        serialPort = new serialport_1.SerialPort({
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
    try {
        const ports = await serialport_1.SerialPort.list();
        return ports.map(port => ({
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
    try {
        if (serialPort && serialPort.isOpen) {
            await serialPort.close();
        }
        serialPort = new serialport_1.SerialPort({
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
