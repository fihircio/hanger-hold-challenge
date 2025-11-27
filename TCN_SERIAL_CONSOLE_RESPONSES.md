# TCN Serial Service - Expected Console Responses

This document outlines the expected console responses when using the TCN serial service in both mock and real hardware modes.

## Quick Detection Guide

### Mock Mode Indicators
- Look for `[TCN SERIAL] MODE: MOCK` at startup
- `[TCN SERIAL MOCK]` prefixes in logs
- `MODE: MOCK (SerialPort module failed to load)` in Electron main process
- `isMockMode: true` in TCN status response

### Native/Real Hardware Indicators
- Look for `[TCN SERIAL] MODE: NATIVE` at startup
- `SerialPort module status: LOADED` in Electron main process
- Real COM port paths like `COM3`, `COM4`, `/dev/ttyUSB0`, etc.
- `hasRealHardware: true` in TCN status response

---

## 1. Application Startup

### Mock Mode (SerialPort module not available)
```
=== SERIAL PORT STATUS ===
MODE: MOCK (SerialPort module failed to load)
REASON: SerialPort module not available
All serial operations will be simulated

Process versions: {...}
SerialPort module loaded: false serialPortError: true

[TCN SERIAL] Mode: MOCK
[TCN SERIAL] serialport not available, using MockSerialPort
```

### Native Mode (Real hardware)
```
=== SERIAL PORT DETECTION ===
SerialPort module status: LOADED
Available serial ports found: X
Available serial ports: [
  {path: "COM3", manufacturer: "Prolific", ...},
  {path: "COM4", manufacturer: "CH340", ...}
]
Platform: win32

Process versions: {...}
SerialPort module loaded: true serialPortError: false

[TCN SERIAL] Mode: NATIVE
[TCN SERIAL] Using native serialport implementation
```

---

## 2. TCN Auto-Connect

### Mock Mode
```
=== TCN SERIAL AUTO-CONNECT ===
[TCN SERIAL] MODE: MOCK
[TCN SERIAL] Starting auto-detection...
[TCN SERIAL] Found 3 available ports: [
  {path: 'COM3', manufacturer: 'Prolific'},
  {path: 'COM4', manufacturer: 'CH340'},
  {path: 'COM5', manufacturer: 'FTDI'}
]
[TCN SERIAL] Serial implementation: MOCK
[TCN SERIAL] Trying port: COM3 (manufacturer=Prolific)
[TCN SERIAL MOCK] Mock serial port created: {path: "COM3", baudRate: 115200, ...}
[TCN SERIAL MOCK] Event listener added: open
[TCN SERIAL MOCK] Mock parser created: {delimiter: "\r\n"}
[TCN SERIAL MOCK] Event listener added: open
[TCN SERIAL] Connected to COM3
[TCN SERIAL MOCK] Event listener added: data
[TCN SERIAL MOCK] Event listener added: error
[TCN SERIAL MOCK] Event listener added: close
```

### Native Mode
```
=== TCN SERIAL AUTO-CONNECT ===
[TCN SERIAL] MODE: NATIVE
[TCN SERIAL] Starting auto-detection...
[TCN SERIAL] Found 2 available ports: [
  {path: "COM3", manufacturer: "Prolific", pnpId: "USB\\VID_067B&PID_2303..."},
  {path: "COM4", manufacturer: "CH340", pnpId: "USB\\VID_1A86&PID_7523..."}
]
[TCN SERIAL] Serial implementation: NATIVE
[TCN SERIAL] Trying port: COM3 (manufacturer=Prolific)
[TCN SERIAL] Connecting to COM3 at 115200 baud... (mode=NATIVE)
[TCN SERIAL] Connected to COM3
[TCN SERIAL] Port details: path=COM3, baudRate=115200
```

---

## 3. Prize Dispensing Request

### Mock Mode
```
=== TCN DISPENSE REQUEST ===
[TCN SERIAL] Tier: GOLD
[TCN SERIAL] Mode: MOCK
[TCN SERIAL] Connected: true
[TCN SERIAL] Port type: MOCK
[TCN SERIAL] Available gold channels: [24, 25]
[TCN SERIAL] Selected channel: 24

=== TCN CHANNEL DISPENSE ===
[TCN SERIAL] Channel: 24
[TCN SERIAL] Mode: MOCK
[TCN SERIAL] Port type: MockSerialPort
[TCN SERIAL] Constructed HEX command: 00 FF 18 FF AA 55
[TCN SERIAL MOCK] Writing: 00 FF 18 FF AA 55
[TCN SERIAL] ✓ TCN HEX command sent to channel 24: 00 FF 18 FF AA 55
[TCN SERIAL] Response time: 45ms
[TCN SERIAL] Waiting for dispense result...
[TCN SERIAL] Mock mode: simulating dispense result in 1s
[TCN SERIAL MOCK] Event listener added: data
[TCN SERIAL MOCK] Event listener added: data
[TCN SERIAL] Received: STATUS: OK
```

### Native Mode
```
=== TCN DISPENSE REQUEST ===
[TCN SERIAL] Tier: GOLD
[TCN SERIAL] Mode: NATIVE
[TCN SERIAL] Connected: true
[TCN SERIAL] Port type: NATIVE
[TCN SERIAL] Available gold channels: [24, 25]
[TCN SERIAL] Selected channel: 24

=== TCN CHANNEL DISPENSE ===
[TCN SERIAL] Channel: 24
[TCN SERIAL] Mode: NATIVE
[TCN SERIAL] Port type: SerialPort
[TCN SERIAL] Constructed HEX command: 00 FF 18 FF AA 55
[TCN SERIAL] Sent: 00 FF 18 FF AA 55
[TCN SERIAL] ✓ TCN HEX command sent to channel 24: 00 FF 18 FF AA 55
[TCN SERIAL] Response time: 12ms
[TCN SERIAL] Waiting for dispense result...
[TCN SERIAL] Received: DISPENSE 24: STARTING
[TCN SERIAL] Received: DISPENSE 24: SUCCESS
```

---

## 4. TCN Status Request

### Mock Mode
```
=== TCN STATUS REQUEST ===
Mode: MOCK
Connected: true
Port Info: {path: "COM3", baudRate: 115200}

Response to renderer:
{
  "connected": true,
  "mode": "mock",
  "port": "COM3",
  "baudRate": 115200,
  "ports": [...],
  "lastError": null,
  "connectedToTCN": true,
  "timestamp": "2025-11-26T13:45:00.000Z",
  "isMockMode": true,
  "hasRealHardware": false,
  "serialModuleLoaded": false
}
```

### Native Mode
```
=== TCN STATUS REQUEST ===
Mode: NATIVE
Connected: true
Port Info: {path: "COM3", baudRate: 115200}

Response to renderer:
{
  "connected": true,
  "mode": "native",
  "port": "COM3",
  "baudRate": 115200,
  "ports": [...],
  "lastError": null,
  "connectedToTCN": true,
  "timestamp": "2025-11-26T13:45:00.000Z",
  "isMockMode": false,
  "hasRealHardware": true,
  "serialModuleLoaded": true
}
```

---

## 5. Error Scenarios

### Mock Mode - No SerialPort Module
```
=== SERIAL PORT STATUS ===
MODE: MOCK (SerialPort module failed to load)
REASON: SerialPort module not available
All serial operations will be simulated

[TCN SERIAL] Mode: MOCK
[TCN SERIAL] serialport not available, using MockSerialPort
```

### Native Mode - No Hardware Connected
```
=== SERIAL PORT DETECTION ===
SerialPort module status: LOADED
Available serial ports found: 0
Available serial ports: []
Platform: win32

[TCN SERIAL] Mode: NATIVE
[TCN SERIAL] Using native serialport implementation

=== TCN SERIAL AUTO-CONNECT ===
[TCN SERIAL] MODE: NATIVE
[TCN SERIAL] Starting auto-detection...
[TCN SERIAL] Found 0 available ports: []
[TCN SERIAL] Serial implementation: NATIVE
[TCN SERIAL] Failed to connect to any TCN port
[TCN SERIAL] Auto-detection failed: Error: No available ports
```

---

## 6. Key Differences Summary

| Aspect | Mock Mode | Native Mode |
|--------|-----------|------------|
| **Startup Message** | `MODE: MOCK` | `MODE: NATIVE` |
| **Port Detection** | Shows fake COM ports | Shows real hardware ports |
| **Command Logging** | `[TCN SERIAL MOCK] Writing:` | `[TCN SERIAL] Sent:` |
| **Response Simulation** | Automatic after 1s delay | Depends on hardware response |
| **Error Handling** | Simulated success/failure | Real hardware errors |
| **Status Flags** | `isMockMode: true` | `isMockMode: false` |
| **Hardware Detection** | `hasRealHardware: false` | `hasRealHardware: true` |

---

## 7. Troubleshooting Checklist

### If you see MOCK mode but expect NATIVE:
1. Check if `serialport` package is installed: `npm list serialport`
2. Verify Electron main process shows `SerialPort module loaded: true`
3. Look for any serialport loading errors in startup logs

### If you see NATIVE mode but no ports:
1. Check physical USB/serial connections
2. Verify device drivers are installed (CH340, FTDI, Prolific)
3. Check Windows Device Manager for COM ports
4. Try different USB cables or ports

### If commands are sent but no response:
1. Verify baud rate matches hardware (115200 vs 9600)
2. Check TCN controller power and connections
3. Verify HEX command format: `00 FF [SLOT] [CHECKSUM] AA 55`
4. Test with known working channel numbers

---

## 8. Expected HEX Commands

Based on the current channel mapping:

| Tier | Channels | Example HEX Commands |
|------|----------|---------------------|
| Gold | 24, 25 | `00 FF 18 FF AA 55`, `00 FF 19 FF AA 55` |
| Silver | 1-8, 11-18, 21-23, 26-28, 31-38, 45-48, 51-58 | `00 FF 01 FF AA 55`, `00 FF 02 FF AA 55`, etc. |

**Note:** Previously working slots 1, 2, 3 should now send:
- Slot 1: `00 FF 01 FF AA 55`
- Slot 2: `00 FF 02 FF AA 55` 
- Slot 3: `00 FF 03 FF AA 55`

This should restore the ability to trigger slots that were working before the protocol mismatch was introduced.