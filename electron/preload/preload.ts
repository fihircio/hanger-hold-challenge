import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Window control operations
  toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen'),
  isFullscreen: () => ipcRenderer.invoke('is-fullscreen'),
  
  // Serial port operations
  sendSerialCommand: (command: string) => ipcRenderer.invoke('send-serial-command', command),
  getSerialPorts: () => ipcRenderer.invoke('get-serial-ports'),
  connectSerialPort: (portPath: string) => ipcRenderer.invoke('connect-serial-port', portPath),
  disconnectSerialPort: () => ipcRenderer.invoke('disconnect-serial-port'),
  
  // Event listeners for serial data
  onSerialData: (callback: (data: string) => void) => {
    ipcRenderer.on('serial-data', (event, data) => callback(data));
  },
  onSerialError: (callback: (error: string) => void) => {
    ipcRenderer.on('serial-error', (event, error) => callback(error));
  },
  removeAllSerialListeners: () => {
    ipcRenderer.removeAllListeners('serial-data');
    ipcRenderer.removeAllListeners('serial-error');
  },
  
  // App information
  platform: process.platform,
  version: process.version,
  // TCN / Serial status
  getTcnStatus: () => ipcRenderer.invoke('get-tcn-status'),
});

// Type definitions for the exposed API
export interface ElectronAPI {
  toggleFullscreen: () => Promise<{ success: boolean; isFullScreen: boolean }>;
  isFullscreen: () => Promise<boolean>;
  sendSerialCommand: (command: string) => Promise<{ success: boolean }>;
  getSerialPorts: () => Promise<Array<{
    path: string;
    manufacturer?: string;
    serialNumber?: string;
    locationId?: string;
    vendorId?: string;
    productId?: string;
  }>>;
  connectSerialPort: (portPath: string) => Promise<{ success: boolean }>;
  disconnectSerialPort: () => Promise<{ success: boolean; message?: string }>;
  onSerialData: (callback: (data: string) => void) => void;
  onSerialError: (callback: (error: string) => void) => void;
  removeAllSerialListeners: () => void;
  platform: string;
  version: string;
  getTcnStatus: () => Promise<any>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}