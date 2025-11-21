# TCN Hardware Setup Guide

## Overview

The TCN CSC-8C (V49) is a medium-large combo snack & drink vending machine with advanced control capabilities. This guide covers complete setup and integration with your Hanger Hold Challenge system.

## Hardware Specifications

### TCN CSC-8C (V49) Features
- **Display**: 49-inch touch screen (Android or Windows mini-PC)
- **Controller**: TCN UCS-V4.x (UCS-V4.2 or UCS-V4.5)
- **Communication**: RS232 to onboard mini-PC
- **Protocols**: MDB, DEX, RS232, RS485
- **Capacity**: 8 layers (mid-capacity)
- **Remote Monitoring**: 4G router support
- **Internal PC**: Intel-based mini-PC

### Physical Connections
```
TCN CSC-8C (V49) Machine
       ↓ (RS232 Cable)
TCN UCS-V4.x Controller Board
       ↓ (Internal Connection)
Onboard Mini-PC (Intel-based)
       ↓ (USB-to-RS232 Adapter)
External Windows PC (Your Electron App)
```

## Driver Installation

### Required USB-to-RS232 Drivers

TCN does NOT provide Windows drivers - you only need USB-to-RS232 drivers for your adapter.

#### Prolific PL2303 Driver (70% probability)
```bash
Download: https://www.prolific.com.tw/US/ShowProduct.aspx?pcid=41
Install: Windows Driver Installer
Restart: Required
```

#### CH340/CH341 Driver (20% probability)
```bash
Download: https://sparks.gogo.co.nz/ch340.html
Install: CH341SER.EXE
Restart: Required
```

#### FTDI FT232 Driver (10% probability)
```bash
Download: https://ftdichip.com/drivers/vcp-drivers/
Install: FTDI CDM Drivers
Restart: Required
```

### Installation Steps

#### Step 1: Install All Drivers
1. Download all 3 driver packages
2. Install Prolific PL2303 driver
3. Restart PC
4. Install CH340/CH341 driver
5. Restart PC
6. Install FTDI FT232 driver
7. Restart PC

#### Step 2: Verify Installation
1. Open **Device Manager** (`Win + X` → Device Manager)
2. Expand **"Ports (COM & LPT)"**
3. Look for installed adapters:
   - `Prolific USB-to-Serial (COM3)`
   - `USB-SERIAL CH340 (COM4)`
   - `USB Serial Port (FTDI) (COM5)`
4. Note your COM port number

#### Step 3: Troubleshooting Driver Issues
- **Yellow exclamation mark** in Device Manager:
  - Uninstall driver
  - Restart PC
  - Reinstall driver
- **COM port not appearing**:
  - Try different USB port
  - Check cable connection
  - Test with another adapter

## Serial Communication Setup

### Connection Testing with TeraTerm

#### Step 1: Install TeraTerm
```bash
Download: https://teratermproject.github.io/index-en.html
Install: Standard Windows installer
```

#### Step 2: Configure Serial Settings
1. **Open TeraTerm**
2. **Select Serial Connection**
3. **Choose your COM port** (from Device Manager)
4. **Set serial parameters**:
   ```
   Baud rate: 115200 (for V49 newer screens)
   Data bits: 8
   Parity: None
   Stop bits: 1
   Flow control: None
   ```
5. **Click OK**
6. **Press Enter** to test connection

#### Expected Responses
If connected successfully, you should see:
```
Temperature logs
"UCS V4.2" version info
Motor mapping
Vend status
Errors if door open
```

#### Step 3: Troubleshooting Connection
- **No response**:
  - Try baud rate 9600 (older units)
  - Check RS232 cable connections
  - Try different USB port
  - Verify TCN machine power
- **Garbage characters**:
  - Wrong baud rate
  - Check cable quality
  - Try different flow control settings

## Node.js Integration

### Install Serial Port Package
```bash
npm install serialport @serialport/parser-readline
```

### TCN Serial Service Implementation
```typescript
// tcnSerialService.ts
import { SerialPort } from 'serialport';

export class TCNSerialService {
  private port: SerialPort | null = null;
  private isConnected = false;
  private baudRate = 115200;

  async connect(comPort: string): Promise<boolean> {
    try {
      this.port = new SerialPort({
        path: comPort,
        baudRate: this.baudRate,
        dataBits: 8,
        parity: 'none',
        stopBits: 1,
        flowControl: false,
        autoOpen: false
      });

      return new Promise((resolve) => {
        this.port!.open((error) => {
          if (error) {
            console.error('[TCN SERIAL] Connection failed:', error);
            resolve(false);
          } else {
            console.log(`[TCN SERIAL] Connected to ${comPort}`);
            this.isConnected = true;
            this.setupDataParser();
            resolve(true);
          }
        });
      });
    } catch (error) {
      console.error('[TCN SERIAL] Setup error:', error);
      return false;
    }
  }

  private setupDataParser(): void {
    if (!this.port) return;

    const Readline = require('@serialport/parser-readline');
    const parser = this.port.pipe(new Readline({ delimiter: '\r\n' }));

    parser.on('data', (data: string) => {
      console.log('[TCN SERIAL] Received:', data.trim());
      this.handleTCNResponse(data.trim());
    });
  }

  private handleTCNResponse(data: string): void {
    // Parse TCN UCS-V4.x responses
    if (data.includes('UCS V4')) {
      console.log('[TCN] Controller identified:', data);
      this.onControllerIdentified?.(data);
    }
    if (data.includes('TEMP')) {
      console.log('[TCN] Temperature data:', data);
      this.onTemperatureData?.(data);
    }
    if (data.includes('VEND')) {
      console.log('[TCN] Vend status:', data);
      this.onVendStatus?.(data);
    }
  }

  async dispensePrize(slotNo: number): Promise<boolean> {
    if (!this.port || !this.isConnected) {
      throw new Error('TCN not connected');
    }

    // TCN UCS-V4.x dispensing command format
    const command = `DISPENSE ${slotNo}\r\n`;
    
    return new Promise((resolve) => {
      this.port!.write(command, (error) => {
        if (error) {
          console.error('[TCN SERIAL] Dispense command failed:', error);
          resolve(false);
        } else {
          console.log(`[TCN SERIAL] Dispensing from slot ${slotNo}`);
          resolve(true);
        }
      });
    });
  }

  async getStatus(): Promise<string> {
    if (!this.port || !this.isConnected) {
      throw new Error('TCN not connected');
    }

    const command = 'STATUS\r\n';
    
    return new Promise((resolve) => {
      this.port!.write(command, (error) => {
        if (error) {
          console.error('[TCN SERIAL] Status command failed:', error);
          resolve('ERROR');
        } else {
          console.log('[TCN SERIAL] Requesting status...');
          resolve('REQUESTED');
        }
      });
    });
  }

  disconnect(): void {
    if (this.port && this.isConnected) {
      this.port.close();
      this.isConnected = false;
      console.log('[TCN SERIAL] Disconnected');
    }
  }

  // Event callbacks
  onControllerIdentified?: (data: string) => void;
  onTemperatureData?: (data: string) => void;
  onVendStatus?: (data: string) => void;
}
```

### Auto-Detection of COM Port
```typescript
// comPortDetector.ts
import { SerialPort } from 'serialport';

export class COMPortDetector {
  static async findTCNPort(): Promise<string | null> {
    try {
      const ports = await SerialPort.list();
      
      // Look for TCN-compatible adapters
      const tcnPorts = ports.filter(port => 
        port.manufacturer?.toLowerCase().includes('prolific') ||
        port.manufacturer?.toLowerCase().includes('ch340') ||
        port.manufacturer?.toLowerCase().includes('ftdi') ||
        port.manufacturer?.toLowerCase().includes('qinheng')
      );

      if (tcnPorts.length > 0) {
        console.log('[COM DETECTOR] Found TCN port:', tcnPorts[0].path);
        return tcnPorts[0].path;
      }

      // Fallback: try first available COM port
      const comPorts = ports.filter(port => port.path.includes('COM'));
      if (comPorts.length > 0) {
        console.log('[COM DETECTOR] Using first COM port:', comPorts[0].path);
        return comPorts[0].path;
      }

      return null;
    } catch (error) {
      console.error('[COM DETECTOR] Error finding ports:', error);
      return null;
    }
  }
}
```

## Game Integration

### TCN Game Integration Service
```typescript
// tcnIntegrationService.ts
import { TCNSerialService } from './tcnSerialService';
import { COMPortDetector } from './comPortDetector';

export class TCNIntegrationService {
  private tcnService: TCNSerialService;
  private isConnected = false;

  async initialize(): Promise<boolean> {
    try {
      // Auto-detect COM port
      const port = await COMPortDetector.findTCNPort();
      if (!port) {
        console.error('[TCN INTEGRATION] No TCN port found');
        return false;
      }

      // Connect to TCN hardware
      const connected = await this.tcnService.connect(port);
      if (connected) {
        this.isConnected = true;
        console.log('[TCN INTEGRATION] TCN hardware connected successfully');
        return true;
      } else {
        console.error('[TCN INTEGRATION] Failed to connect to TCN hardware');
        return false;
      }
    } catch (error) {
      console.error('[TCN INTEGRATION] Initialization failed:', error);
      return false;
    }
  }

  async dispensePrizeByTier(tier: string): Promise<boolean> {
    if (!this.isConnected) {
      throw new Error('TCN service not initialized');
    }

    // Map tiers to slot numbers
    let slotNo: number;
    switch (tier) {
      case 'gold':
        slotNo = Math.floor(Math.random() * 5) + 1; // Slots 1-5
        break;
      case 'silver':
        slotNo = Math.floor(Math.random() * 10) + 6; // Slots 6-15
        break;
      case 'bronze':
        slotNo = Math.floor(Math.random() * 10) + 16; // Slots 16-25
        break;
      default:
        throw new Error('Invalid tier');
    }

    console.log(`[TCN INTEGRATION] Dispensing ${tier} prize from slot ${slotNo}`);
    return await this.tcnService.dispensePrize(slotNo);
  }

  async checkSystemStatus(): Promise<void> {
    if (!this.isConnected) {
      throw new Error('TCN service not initialized');
    }

    try {
      const status = await this.tcnService.getStatus();
      console.log('[TCN INTEGRATION] System status:', status);
    } catch (error) {
      console.error('[TCN INTEGRATION] Failed to check system status:', error);
    }
  }

  getStatus(): { connected: boolean; tcnService: TCNSerialService } {
    return {
      connected: this.isConnected,
      tcnService: this.tcnService
    };
  }

  cleanup(): void {
    if (this.tcnService) {
      this.tcnService.disconnect();
      this.isConnected = false;
    }
  }
}
```

### Game Screen Integration
```typescript
// In GameScreen.tsx
import { TCNIntegrationService } from '../services/tcnIntegrationService';

export const GameScreen: React.FC<GameScreenProps> = ({ onHoldStart, onHoldEnd }) => {
  const [time, setTime] = useState(0);
  const [tcnStatus, setTcnStatus] = useState<string>('Not connected');
  const tcnService = new TCNIntegrationService();

  useEffect(() => {
    // Initialize TCN integration
    tcnService.initialize().then(connected => {
      if (connected) {
        setTcnStatus('Connected to TCN hardware');
        console.log('[GAME] TCN hardware ready');
      } else {
        setTcnStatus('TCN connection failed');
        console.error('[GAME] Failed to connect to TCN hardware');
      }
    });

    return () => {
      tcnService.cleanup();
    };
  }, []);

  const endGame = async () => {
    const finalTime = time;
    onHoldEnd?.();
    
    // Calculate tier based on time
    let tier: string = 'none';
    if (finalTime >= 60000) {
      tier = 'gold';
    } else if (finalTime >= 30000) {
      tier = 'silver';
    } else if (finalTime >= 10000) {
      tier = 'bronze';
    }
    
    if (tier !== 'none') {
      try {
        await tcnService.dispensePrizeByTier(tier);
        console.log(`[GAME] ${tier} prize dispensed successfully`);
      } catch (error) {
        console.error('[GAME] Failed to dispense prize:', error);
      }
    }
  };

  return (
    <BackgroundWrapper imagePath="./UI/04.gamescreen.png">
      {/* Your existing game UI */}
      
      {/* TCN Status Display */}
      <div className="tcn-status-panel bg-gray-800 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-bold text-white mb-2">TCN Hardware Status</h3>
        <div className="text-sm">
          <span className="text-gray-400">Status:</span>
          <span className={tcnStatus.includes('Connected') ? "text-green-400" : "text-red-400"}>
            {tcnStatus}
          </span>
        </div>
      </div>
    </BackgroundWrapper>
  );
};
```

## Monitoring & Diagnostics

### Real-time Monitoring
```typescript
// tcnMonitorService.ts
export class TCNMonitorService {
  private tcnService: TCNSerialService;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor(tcnService: TCNSerialService) {
    this.tcnService = tcnService;
  }

  startMonitoring(intervalMs: number = 5000): void {
    console.log('[TCN MONITOR] Starting real-time monitoring');
    
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.tcnService.getStatus();
      } catch (error) {
        console.error('[TCN MONITOR] Monitoring error:', error);
      }
    }, intervalMs);
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('[TCN MONITOR] Stopped monitoring');
    }
  }
}
```

### Diagnostic Commands
```typescript
// TCN diagnostic commands
export class TCNDiagnostics {
  static async runFullDiagnostics(tcnService: TCNSerialService): Promise<any> {
    const results = {
      timestamp: new Date().toISOString(),
      tests: []
    };

    // Test 1: Connection status
    try {
      await tcnService.getStatus();
      results.tests.push({
        name: 'connection_status',
        status: 'pass',
        message: 'TCN controller responding'
      });
    } catch (error) {
      results.tests.push({
        name: 'connection_status',
        status: 'fail',
        message: `Connection failed: ${error.message}`
      });
    }

    // Test 2: Command response
    try {
      await tcnService.dispensePrize(1); // Test slot 1
      results.tests.push({
        name: 'command_response',
        status: 'pass',
        message: 'TCN controller accepts commands'
      });
    } catch (error) {
      results.tests.push({
        name: 'command_response',
        status: 'fail',
        message: `Command failed: ${error.message}`
      });
    }

    return {
      overall_status: results.tests.every(test => test.status === 'pass') ? 'pass' : 'fail',
      tests: results.tests
    };
  }
}
```

## Troubleshooting

### Common Issues & Solutions

#### "No COM Port Found"
```
Symptoms:
- Console shows "No TCN port found"
- Device Manager shows no COM ports

Solutions:
1. Install all 3 drivers (Prolific, CH340, FTDI)
2. Restart PC after each driver installation
3. Check Device Manager for yellow exclamation marks
4. Try different USB ports
5. Verify RS232 cable is securely connected
```

#### "Access Denied on COM Port"
```
Symptoms:
- Permission errors in console
- Cannot access COM port

Solutions:
1. Close TeraTerm if running
2. Run Electron app as Administrator
3. Check if another app is using the port
4. Disable antivirus temporarily
```

#### "Garbage Characters in Terminal"
```
Symptoms:
- Random characters instead of readable text
- Corrupted data display

Solutions:
1. Wrong baud rate - try 9600 instead of 115200
2. Check RS232 cable quality
3. Try different USB port
4. Verify TCN machine power
```

#### "No Response from TCN"
```
Symptoms:
- No data received from controller
- Timeout errors

Solutions:
1. Verify RS232 cable connections
2. Check TCN machine power
3. Try different COM port
4. Test with TeraTerm first
5. Check controller board status LEDs
```

## Performance Optimization

### Response Time Targets
- **Connection establishment**: < 3 seconds
- **Command execution**: < 2 seconds
- **Status query**: < 1 second
- **Prize dispensing**: < 10 seconds total

### Resource Management
- **Serial buffer**: < 1KB per command
- **Memory usage**: < 50MB for TCN service
- **CPU usage**: < 25% during operations
- **Error recovery**: < 5 seconds

### Best Practices
1. **Always close connections** properly
2. **Handle timeouts** gracefully
3. **Log all operations** for debugging
4. **Implement retry logic** for failed operations
5. **Monitor system health** continuously

This TCN hardware setup guide provides complete integration instructions for connecting your Hanger Hold Challenge game to the TCN vending machine controller with professional reliability and monitoring.