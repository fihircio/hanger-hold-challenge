
// Electron API interface for window.electronAPI
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
  resetSerialPorts: () => Promise<{ success: boolean; message?: string; error?: string }>;
  platform: string;
  version: string;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export enum GameState {
  VIDEO,
  INSTRUCTIONS,
  HOWTO,
  READY,
  HOLDING,
  GAME_OVER,
  ENTER_DETAILS,
  LEADERBOARD,
}

export interface Score {
  id: string;
  name: string;
  email: string;
  phone: string;
  time: number; // in milliseconds
}
