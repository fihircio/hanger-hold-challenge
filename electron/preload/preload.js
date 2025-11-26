"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    // Window control operations
    toggleFullscreen: () => electron_1.ipcRenderer.invoke('toggle-fullscreen'),
    isFullscreen: () => electron_1.ipcRenderer.invoke('is-fullscreen'),
    // Serial port operations
    sendSerialCommand: (command) => electron_1.ipcRenderer.invoke('send-serial-command', command),
    getSerialPorts: () => electron_1.ipcRenderer.invoke('get-serial-ports'),
    connectSerialPort: (portPath) => electron_1.ipcRenderer.invoke('connect-serial-port', portPath),
    disconnectSerialPort: () => electron_1.ipcRenderer.invoke('disconnect-serial-port'),
    // Event listeners for serial data
    onSerialData: (callback) => {
        electron_1.ipcRenderer.on('serial-data', (event, data) => callback(data));
    },
    onSerialError: (callback) => {
        electron_1.ipcRenderer.on('serial-error', (event, error) => callback(error));
    },
    removeAllSerialListeners: () => {
        electron_1.ipcRenderer.removeAllListeners('serial-data');
        electron_1.ipcRenderer.removeAllListeners('serial-error');
    },
    // App information
    platform: process.platform,
    version: process.version,
    // TCN / Serial status
    getTcnStatus: () => electron_1.ipcRenderer.invoke('get-tcn-status'),
});
