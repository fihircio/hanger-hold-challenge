import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';

// Global variables
let mainWindow: BrowserWindow | null = null;
let serialPort: any = null;
let serialPortError = false;
let SerialPortModule: any = null;
let SerialPort: any = null;
let SerialPortParser: any = null;

// ENHANCED: Support multiple serial ports for Arduino + Spring Vending
let activeSerialPorts: Map<string, any> = new Map(); // Track all active serial ports
let arduinoPortPath: string | null = null; // Track Arduino port separately

// Try to load SerialPort with error handling
try {
  SerialPortModule = require('serialport');
  SerialPort = SerialPortModule.SerialPort;
  SerialPortParser = SerialPortModule.ReadlineParser;
  console.log('SerialPort module loaded successfully');
} catch (error) {
  console.error('Failed to load SerialPort module:', error);
  serialPortError = true;
  
  // Show error dialog to user
  dialog.showErrorBox(
    'Serial Port Module Error',
    `Failed to load Serial Port module.\n\nError: ${error}\n\nThe application will run without serial port functionality.\n\nPlease contact support for assistance.`
  );
}

const isDev = process.env.NODE_ENV === 'development';

function createWindow(): void {
  // Create the browser window
  mainWindow = new BrowserWindow({
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
  } else {
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
    } else if (fs.existsSync(unpackedPath)) {
      indexPath = unpackedPath;
    } else if (fs.existsSync(alternativePath)) {
      indexPath = alternativePath;
    } else {
      console.error('Index.html not found at any of these paths:');
      console.error('  - ASAR path:', asarPath);
      console.error('  - Unpacked path:', unpackedPath);
      console.error('  - Alternative path:', alternativePath);
      
      dialog.showErrorBox(
        'File Not Found',
        `Could not find index.html at any expected location.\n\nPlease check your installation.`
      );
      return;
    }
    
    console.log('Loading index.html from:', indexPath);
    
    mainWindow.loadFile(indexPath).then(() => {
      console.log('Index.html loaded successfully');
    }).catch((error) => {
      console.error('Failed to load index.html:', error);
      dialog.showErrorBox(
        'Loading Error',
        `Failed to load index.html:\n${error.message}\n\nPlease check your installation.`
      );
    });
    
    mainWindow.webContents.openDevTools(); // Open DevTools for debugging
  }

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  // Initialize serial port
  initializeSerialPort();

  // Debug: log Node/Electron versions and serial module presence
  console.log('Process versions:', process.versions);
  console.log('SerialPort module loaded:', !!SerialPortModule, 'serialPortError:', serialPortError);

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}).catch(error => {
  console.error('Electron app initialization failed:', error);
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // On macOS it is common for applications to stay open
  if (process.platform !== 'darwin') app.quit();
});

// Serial port initialization with Arduino/Spring Vending coordination
async function initializeSerialPort(): Promise<void> {
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
    const arduinoPorts = ports.filter((port: any) =>
      port.manufacturer && (
        port.manufacturer.toLowerCase().includes('arduino') ||
        port.manufacturer.toLowerCase().includes('ftdi') ||
        port.manufacturer.toLowerCase().includes('ch340')
      )
    );
    
    // Sort COM ports by number
    const sortedComPorts = ports
      .filter((port: any) => port.path.startsWith('COM'))
      .sort((a: any, b: any) => {
        const numA = parseInt(a.path.replace('COM', ''));
        const numB = parseInt(b.path.replace('COM', ''));
        return numA - numB;
      });

    // PRIORITY: Use LOW COM ports for main serial communication (Spring Vending/TCN)
    // HIGH COM ports (COM6+) will be reserved for Arduino sensor service
    const lowComPorts = sortedComPorts.filter((port: any) => {
      const comNum = parseInt(port.path.replace('COM', ''));
      return comNum <= 5; // COM1-5 for main serial
    });

    const highComPorts = sortedComPorts.filter((port: any) => {
      const comNum = parseInt(port.path.replace('COM', ''));
      return comNum >= 6; // COM6+ for Arduino sensor
    });

    console.log('Port allocation strategy:');
    console.log('- Low COM ports (COM1-5) for main serial:', lowComPorts.map((p: any) => p.path));
    console.log('- High COM ports (COM6+) for Arduino sensor:', highComPorts.map((p: any) => p.path));
    console.log('- Arduino-specific ports:', arduinoPorts.map((p: any) => `${p.path} (${p.manufacturer})`));

    // Select port for main serial communication (Spring Vending/TCN)
    // ENHANCED: Force COM1 for vending machine regardless of other ports
    // Priority 1: COM1 (forced for vending machine)
    // Priority 2: Other low COM ports if COM1 not available
    // Priority 3: Arduino ports if no low COM ports available
    // Priority 4: Any available port as last resort
    
    const com1Port = lowComPorts.find((port: any) => port.path === 'COM1');
    if (com1Port) {
      // Force COM1 for vending machine
      portPath = 'COM1';
      console.log(`[SERIAL] FORCING COM1 for main serial (vending machine) - ${com1Port.manufacturer || 'Unknown manufacturer'}`);
    } else if (lowComPorts.length > 0) {
      // Use first available low COM port
      portPath = lowComPorts[0].path;
      console.log(`Selected low COM port for main serial: ${portPath}`);
    } else if (arduinoPorts.length > 0) {
      // Use Arduino port if no low COM ports (but this might cause conflicts)
      portPath = arduinoPorts[0].path;
      console.log(`Using Arduino port for main serial (potential conflict): ${portPath}`);
    } else if (ports.length > 0) {
      // Use first available port as last resort
      portPath = ports[0].path;
      console.log(`Using first available port for main serial: ${portPath}`);
    } else {
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
      } catch (openErr) {
        console.warn(`Failed to open ${portPath} at baud ${br}:`, openErr);
        // try next baud rate
      }
    }

    if (!opened) {
      // Last resort: try default 9600 in case constructor didn't throw but port not open
      try {
        serialPort = new SerialPort({ path: portPath, baudRate: 9600, dataBits: 8, parity: 'none', stopBits: 1 });
        console.log(`[SERIAL] Created fallback serial port for ${portPath} at 9600 baud`);
      } catch (fallbackError) {
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

    serialPort.on('error', (err: any) => {
      console.error(`[SERIAL] Serial port error:`, err);
      if (mainWindow) {
        mainWindow.webContents.send('serial-error', err.message);
      }
    });

    serialPort.on('data', (data: any) => {
      const dataString = Buffer.from(data).toString('utf8').trim();
      console.log(`[SERIAL] Received data from ${portPath}:`, dataString);
      console.log(`[SERIAL] Forwarding to renderer: ${dataString}`);
      // Forward data to renderer process as plain text (Arduino sends 0 or 1)
      if (mainWindow) {
        mainWindow.webContents.send('serial-data', dataString);
      } else {
        console.error('[SERIAL] CRITICAL: mainWindow is null, cannot forward data');
      }
    });

  } catch (error) {
    console.error('Failed to initialize serial port:', error);
  }
}

// IPC handlers for window control
ipcMain.handle('toggle-fullscreen', async () => {
  if (!mainWindow) {
    throw new Error('Main window is not available');
  }
  
  const isFullScreen = mainWindow.isFullScreen();
  mainWindow.setFullScreen(!isFullScreen);
  
  return { success: true, isFullScreen: !isFullScreen };
});

ipcMain.handle('is-fullscreen', async () => {
  if (!mainWindow) {
    throw new Error('Main window is not available');
  }
  
  return mainWindow.isFullScreen();
});

// Add serial port reset function
async function resetSerialPorts(): Promise<void> {
  console.log('[SERIAL] Resetting all serial ports...');
  
  // Close all active ports
  for (const [portPath, port] of activeSerialPorts.entries()) {
    try {
      if (port.isOpen) {
        await port.close();
        console.log(`[SERIAL] Closed port: ${portPath}`);
      }
    } catch (error) {
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
ipcMain.handle('send-serial-command', async (event, command: string) => {
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
      const com1Port = ports.find((port: any) => port.path === 'COM1');
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
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Connection timeout')), 5000);
          serialPort.on('open', () => {
            clearTimeout(timeout);
            console.log('[SERIAL] Emergency COM1 connection successful');
            resolve();
          });
          serialPort.on('error', (err: any) => {
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
      throw new Error(`No serial port available and emergency connection failed: ${(error as Error).message}`);
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
  } catch (error) {
    console.error('[SERIAL] Failed to send serial command:', error);
    throw error;
  }
});

ipcMain.handle('get-serial-ports', async () => {
  if (serialPortError) {
    console.log('Serial port module not available, returning empty port list');
    return [];
  }
  
  try {
    const ports = await SerialPortModule.SerialPort.list();
    return ports.map((port: any) => ({
      path: port.path,
      manufacturer: port.manufacturer,
      serialNumber: port.serialNumber,
      locationId: port.locationId,
      vendorId: port.vendorId,
      productId: port.productId,
    }));
  } catch (error) {
    console.error('Failed to get serial ports:', error);
    return [];
  }
});

ipcMain.handle('connect-serial-port', async (event, portPath: string, baudRate?: number) => {
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
    } else {
      console.log(`[SERIAL] Detected main serial port connection: ${portPath}`);
    }

    // Close existing port if it's the same path
    if (serialPort && serialPort.isOpen && serialPort.path === portPath) {
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

    newSerialPort.on('error', (err: any) => {
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

    newSerialPort.on('data', (data: any) => {
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
        } else {
          console.log(`[SERIAL] Forwarding serial data to general channel: ${dataString}`);
          mainWindow.webContents.send('serial-data', dataString);
        }
      } else {
        console.error('[SERIAL] CRITICAL: mainWindow is null, cannot forward data');
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to connect to serial port:', error);
    throw error;
  }
});

ipcMain.handle('disconnect-serial-port', async () => {
  if (serialPortError) {
    throw new Error('Serial Port module is not available. Please reinstall the application.');
  }
  
  try {
    if (serialPort && serialPort.isOpen) {
      await serialPort.close();
      return { success: true };
    }
    return { success: false, message: 'No port to disconnect' };
  } catch (error) {
    console.error('Failed to disconnect serial port:', error);
    throw error;
  }
});

// IPC handler to return TCN / serial status for the renderer (maintenance)
ipcMain.handle('get-tcn-status', async () => {
  try {
    const connected = !!(serialPort && serialPort.isOpen);
    const mode = serialPortError ? 'mock' : 'native';
    const portInfo: any = serialPort ? {
      path: serialPort.path,
      baudRate: serialPort.baudRate
    } : null;

    console.log('=== TCN STATUS REQUEST ===');
    console.log('Mode:', mode.toUpperCase());
    console.log('Connected:', connected);
    console.log('Port Info:', portInfo);

    // Also collect available ports list when serial module is present
    let ports: any[] = [];
    if (!serialPortError && SerialPortModule && SerialPortModule.SerialPort && SerialPortModule.SerialPort.list) {
      try {
        const listed = await SerialPortModule.SerialPort.list();
        ports = listed.map((p: any) => ({ path: p.path, manufacturer: p.manufacturer, vendorId: p.vendorId, productId: p.productId, serialNumber: p.serialNumber }));
      } catch (listErr) {
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
  } catch (err) {
    console.error('Error in get-tcn-status handler:', err);
    return { connected: false, mode: serialPortError ? 'mock' : 'native', lastError: (err as any)?.message || String(err) };
  }
});

// IPC handler for resetting serial ports
ipcMain.handle('reset-serial-ports', async () => {
  try {
    console.log('[SERIAL] Resetting serial ports via IPC call...');
    await resetSerialPorts();
    return { success: true, message: 'Serial ports reset successfully' };
  } catch (error) {
    console.error('[SERIAL] Failed to reset serial ports:', error);
    return { success: false, message: (error as Error).message };
  }
});

// Clean up on app quit
app.on('before-quit', async () => {
  if (serialPort && serialPort.isOpen) {
    await serialPort.close();
  }
});