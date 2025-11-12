# Hanger Challenge Electron Application

This is the Electron wrapper for the Hanger Hold Challenge game, providing desktop functionality with actual serial communication for vending machine control.

## Installation

1. Install dependencies:
```bash
npm install
```

2. Build the frontend first:
```bash
cd ..
npm run build
```

## Development

Run in development mode (with hot reload):
```bash
npm run dev
```

This will:
- Compile the main process TypeScript files
- Start the React development server
- Launch Electron with the development server

## Building

Build for production:
```bash
npm run build
```

Build for Windows:
```bash
npm run build:win
```

## Serial Communication

The Electron app provides real serial communication with vending machines:

### Features:
- Automatic port detection
- Manual port selection
- Real-time data monitoring
- Error handling and logging
- Hex command construction and parsing

### Serial Port Configuration:
- Baud Rate: 9600
- Data Bits: 8
- Parity: None
- Stop Bits: 1

### Vend Protocol:
The application uses the 6-byte HEX protocol:
- Byte 1: 0x00 (Command)
- Byte 2: 0xFF (Fixed)
- Byte 3: Slot number (1-80)
- Byte 4: Checksum (0xFF - Slot Number)
- Byte 5: 0xAA (Delivery detection ON)
- Byte 6: 0x55 (Delivery detection ON)

## API Exposure

The preload script exposes the following APIs to the renderer process:

### Serial Operations:
- `window.electronAPI.sendSerialCommand(command)` - Send hex command
- `window.electronAPI.getSerialPorts()` - Get available ports
- `window.electronAPI.connectSerialPort(path)` - Connect to port
- `window.electronAPI.disconnectSerialPort()` - Disconnect

### Event Listeners:
- `window.electronAPI.onSerialData(callback)` - Listen for data
- `window.electronAPI.onSerialError(callback)` - Listen for errors

### System Info:
- `window.electronAPI.platform` - Get OS platform
- `window.electronAPI.version` - Get Electron version

## Security

The application uses:
- Context isolation for security
- Preload scripts for safe API exposure
- No direct node integration in renderer

## Troubleshooting

### Serial Port Issues:
1. Check device permissions
2. Verify port is not in use
3. Confirm cable connections
4. Check device compatibility

### Build Issues:
1. Clear node_modules and reinstall
2. Update Node.js to latest LTS
3. Check platform-specific dependencies