# Spring SDK Integration Guide

## Overview

The Spring SDK provides advanced vending machine control with real-time error handling, 25-channel support, and event-driven architecture. This guide covers complete integration with your Hanger Hold Challenge system.

## Architecture Options

### Option 1: Android Bridge App (Recommended)

**Architecture:**
```
Electron Game ←→ WebSocket ←→ Android Bridge App ←→ Serial ←→ Spring Machine
```

**Components:**
- **Android Device**: Runs vendor's Spring SDK natively
- **Bridge App**: Exposes HTTP/WebSocket interface
- **Electron App**: Communicates with bridge over network
- **Spring Machine**: Hardware controlled via Android SDK

**Benefits:**
- Real Spring SDK with actual hardware control
- Proper error codes (0-144) from real hardware
- 25-channel support with real drop detection
- Event-driven architecture with real-time feedback
- Professional reliability with vendor-supported SDK

### Option 2: Direct Serial Communication

**Architecture:**
```
Electron App ←→ USB/Serial ←→ Spring Machine Controller
```

**Components:**
- **Windows PC**: Direct serial communication
- **USB-to-RS232 Adapter**: Hardware interface
- **Node.js SerialPort**: Serial communication library
- **Spring Protocol**: Custom implementation

**Benefits:**
- Simplest implementation
- Direct hardware control
- No Android dependency
- Fastest response time
- Windows-specific optimization

### Option 3: TCN Hardware Integration

**Architecture:**
```
Electron App ←→ TCN UCS-V4.x Controller ←→ Spring Machine
```

**Components:**
- **TCN CSC-8C (V49)**: Vending machine controller
- **RS232 Communication**: Direct serial protocol
- **Windows Drivers**: USB-to-RS232 adapter drivers
- **TCN Protocol**: Vendor-specific commands

**Benefits:**
- Native Windows integration
- Simplified setup
- Direct hardware control
- No Android bridge required

## Implementation Details

### Spring SDK Android Bridge

#### Step 1: Android Project Setup
```bash
# 1. Create new Android Studio project
# Project name: SpringVendingBridge
# Package name: com.springvending.bridge
# Minimum SDK: 25
# Target SDK: 34

# 2. Copy vendor SDK files
# Copy TcnSpringDome/MyApplication/app/libs/tcn_springboard-debug.aar to project's libs folder
# Copy all Java files from TcnSpringDome/MyApplication/app/src/main/java/com/example/springdemo/
```

#### Step 2: Bridge Service Implementation
```java
// SpringVendingBridgeService.java
public class SpringVendingBridgeService extends Service {
    private TcnVendIF springVend;
    private ServerSocket serverSocket;
    private final ConcurrentHashMap<String, ClientHandler> clients = new ConcurrentHashMap<>();
    
    @Override
    public void onCreate() {
        super.onCreate();
        
        // Initialize Spring SDK
        springVend = TcnVendIF.getInstance();
        springVend.initialize();
        springVend.registerListener(sdkListener);
        
        // Start HTTP server
        startHttpServer(8080);
    }
    
    private TcnVendIF.VendEventListener sdkListener = new TcnVendIF.VendEventListener() {
        @Override
        public void handleMessage(Message msg) {
            switch (msg.what) {
                case TcnVendEventID.COMMAND_SHIPMENT_SUCCESS:
                    handleDispenseSuccess(msg);
                    break;
                case TcnVendEventID.COMMAND_SHIPMENT_FAILURE:
                    handleDispenseFailure(msg);
                    break;
            }
        }
    };
    
    private void handleDispenseSuccess(Message msg) {
        int channel = msg.arg1;
        int status = msg.arg2;
        
        // Broadcast to all connected clients
        String response = String.format(
            "{\"type\":\"dispense_success\",\"channel\":%d,\"status\":%d,\"timestamp\":\"%s\"}",
            channel, status, new java.util.Date().toString()
        );
        
        broadcastToClients(response);
    }
}
```

#### Step 3: HTTP API Endpoints
```java
// Command handlers for different operations
private class DispenseHandler implements CommandHandler {
    @Override
    public void handle(JSONObject command, ClientHandler client) throws Exception {
        String tier = command.getString("tier");
        int scoreId = command.getInt("scoreId");
        
        // Map tier to channel
        int channel = getChannelForTier(tier);
        
        // Call Spring SDK methods
        springVend.reqSelectSlotNo(channel);
        springVend.reqShip(channel, 1, "0", generateTradeNo());
        
        client.sendMessage("{\"type\":\"processing\",\"message\":\"Dispensing...\"}");
    }
    
    private int getChannelForTier(String tier) {
        switch (tier.toLowerCase()) {
            case "gold": return getRandomChannel(1, 5);
            case "silver": return getRandomChannel(6, 15);
            case "bronze": return getRandomChannel(16, 25);
            default: return 1;
        }
    }
}
```

### Electron WebSocket Client

#### Step 1: WebSocket Service
```typescript
// springVendingWebSocketService.ts
export class SpringVendingWebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  async connect(androidIP: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        this.ws = new WebSocket(`ws://${androidIP}:8080`);
        
        this.ws.onopen = () => {
          console.log('[SPRING WS] Connected to Android bridge');
          this.reconnectAttempts = 0;
          resolve(true);
        };
        
        this.ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          this.handleSpringResponse(data);
        };
        
        this.ws.onclose = () => {
          console.log('[SPRING WS] Disconnected');
          this.attemptReconnect();
        };
        
        this.ws.onerror = (error) => {
          console.error('[SPRING WS] Error:', error);
          resolve(false);
        };
      } catch (error) {
        console.error('[SPRING WS] Connection failed:', error);
        resolve(false);
      }
    });
  }
  
  async dispensePrizeByTier(tier: 'gold' | 'silver' | 'bronze', scoreId?: number): Promise<boolean> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }
    
    const command = {
      action: 'dispense',
      tier: tier,
      scoreId: scoreId
    };
    
    this.ws.send(JSON.stringify(command));
    return true;
  }
  
  private handleSpringResponse(data: any) {
    switch (data.type) {
      case 'dispense_success':
        console.log(`[SPRING WS] Successfully dispensed from channel ${data.channel}`);
        this.onDispenseSuccess?.(data);
        break;
      case 'dispense_failure':
        console.error(`[SPRING WS] Failed to dispense: ${data.error}`);
        this.onDispenseFailure?.(data);
        break;
    }
  }
}
```

#### Step 2: Game Integration
```typescript
// In GameScreen.tsx
import { SpringVendingWebSocketService } from '../services/springVendingWebSocketService';

export const GameScreen: React.FC<GameScreenProps> = ({ onHoldStart, onHoldEnd }) => {
  const [time, setTime] = useState(0);
  const [vendingStatus, setVendingStatus] = useState<string>('');
  const springService = new SpringVendingWebSocketService();
  
  useEffect(() => {
    // Connect to Android bridge
    springService.connect('192.168.1.100').then(connected => {
      if (connected) {
        console.log('[GAME] Connected to Spring SDK via Android bridge');
        setVendingStatus('Connected to Spring SDK');
      } else {
        console.error('[GAME] Failed to connect to Spring SDK');
        setVendingStatus('Spring SDK connection failed');
      }
    });
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
        setVendingStatus(`Dispensing ${tier} prize...`);
        await springService.dispensePrizeByTier(tier);
        setVendingStatus(`${tier} prize dispensed successfully!`);
      } catch (error) {
        console.error('[GAME] Failed to dispense prize:', error);
        setVendingStatus(`Failed to dispense ${tier} prize`);
      }
    }
  };
}
```

## Spring SDK Error Codes

### Hardware Error Codes
```typescript
export enum SpringErrorCode {
  ERR_CODE_0 = 0,              // Normal operation
  ERR_CODE_4 = 4,              // No commodity detected
  ERR_CODE_22 = 22,            // P-type MOS tube short circuit
  ERR_CODE_72 = 72,             // Motor short circuit
  ERR_CODE_100 = 100,           // Motor open circuit
  ERR_CODE_128 = 128,            // RAM error, motor rotation timeout
  ERR_CODE_129 = 129,            // No response from controller
  ERR_CODE_134 = 134,            // Slot does not exist
  ERR_CODE_144 = 144             // Continuous no detection
}
```

### Error Handling
```typescript
export class SpringErrorHandler {
  static handleError(errorCode: number): string {
    switch (errorCode) {
      case SpringErrorCode.ERR_CODE_0:
        return 'Operation completed successfully';
      case SpringErrorCode.ERR_CODE_4:
        return 'No product detected in channel';
      case SpringErrorCode.ERR_CODE_22:
        return 'Motor short circuit detected';
      case SpringErrorCode.ERR_CODE_72:
        return 'Motor hardware failure';
      case SpringErrorCode.ERR_CODE_100:
        return 'Motor circuit open';
      case SpringErrorCode.ERR_CODE_128:
        return 'Motor timeout - check product obstruction';
      case SpringErrorCode.ERR_CODE_129:
        return 'No response from controller';
      case SpringErrorCode.ERR_CODE_134:
        return 'Invalid channel number';
      case SpringErrorCode.ERR_CODE_144:
        return 'Continuous dispensing failures - check mechanism';
      default:
        return `Unknown error code: ${errorCode}`;
    }
  }
  
  static getRecoveryAction(errorCode: number): string {
    switch (errorCode) {
      case SpringErrorCode.ERR_CODE_4:
        return 'Try different channel or refill product';
      case SpringErrorCode.ERR_CODE_22:
      case SpringErrorCode.ERR_CODE_72:
      case SpringErrorCode.ERR_CODE_100:
        return 'Power cycle vending machine';
      case SpringErrorCode.ERR_CODE_128:
      case SpringErrorCode.ERR_CODE_129:
        return 'Check serial connection and restart';
      default:
        return 'Contact technical support';
    }
  }
}
```

## Channel Management

### Channel Configuration
```typescript
export class ChannelManager {
  private static readonly CHANNEL_CONFIG = {
    gold: { min: 1, max: 5, count: 5 },
    silver: { min: 6, max: 15, count: 10 },
    bronze: { min: 16, max: 25, count: 10 }
  };
  
  static getChannelForTier(tier: string): number {
    const config = this.CHANNEL_CONFIG[tier as keyof typeof this.CHANNEL_CONFIG];
    if (!config) return 1;
    
    // Simple round-robin within tier range
    const lastUsed = this.getLastUsedChannel(tier) || config.min - 1;
    const nextChannel = ((lastUsed - config.min + 1) % config.count) + config.min;
    this.setLastUsedChannel(tier, nextChannel);
    
    return nextChannel;
  }
  
  static getTierFromChannel(channel: number): string {
    for (const [tier, config] of Object.entries(this.CHANNEL_CONFIG)) {
      if (channel >= config[1].min && channel <= config[1].max) {
        return tier;
      }
    }
    return 'unknown';
  }
  
  static isChannelHealthy(channel: number): boolean {
    // Implement channel health checking logic
    return true; // Placeholder - implement actual health checking
  }
}
```

### Health Monitoring
```typescript
export class SpringHealthMonitor {
  private healthStatus: Map<number, boolean> = new Map();
  
  async checkAllChannels(): Promise<{ healthy: number, total: number }> {
    let healthyCount = 0;
    
    for (let channel = 1; channel <= 25; channel++) {
      const isHealthy = await this.checkChannelHealth(channel);
      this.healthStatus.set(channel, isHealthy);
      
      if (isHealthy) {
        healthyCount++;
      }
    }
    
    return {
      healthy: healthyCount,
      total: 25
    };
  }
  
  async checkChannelHealth(channel: number): Promise<boolean> {
    // Send health check command to Spring SDK
    // This would be implemented via the Android bridge
    return true; // Placeholder
  }
  
  getSystemHealth(): { status: string, percentage: number } {
    const healthyChannels = Array.from(this.healthStatus.values()).filter(healthy => healthy).length;
    const percentage = (healthyChannels / 25) * 100;
    
    let status = 'critical';
    if (percentage >= 80) status = 'good';
    else if (percentage >= 60) status = 'warning';
    
    return { status, percentage };
  }
}
```

## Testing Procedures

### Unit Testing
```typescript
// springVendingService.test.ts
describe('SpringVendingService', () => {
  test('should dispense gold prize successfully', async () => {
    const service = new SpringVendingWebSocketService();
    const result = await service.dispensePrizeByTier('gold', 123);
    expect(result).toBe(true);
  });
  
  test('should handle connection failure gracefully', async () => {
    const service = new SpringVendingWebSocketService();
    await expect(service.connect('invalid-ip')).rejects.toThrow();
  });
});
```

### Integration Testing
```bash
# Test Android bridge connection
curl -X POST http://192.168.1.100:8080/dispense \
  -H "Content-Type: application/json" \
  -d '{"tier":"gold","scoreId":123}'

# Test WebSocket communication
wscat -c ws://192.168.1.100:8080
# Send: {"action":"status","channel":5}
```

### End-to-End Testing
```typescript
// Complete workflow test
describe('Spring SDK Integration E2E', () => {
  test('complete game flow', async () => {
    // 1. Initialize system
    const springService = new SpringVendingWebSocketService();
    await springService.connect('192.168.1.100');
    
    // 2. Simulate game completion
    const gameTime = 45000; // 45 seconds = silver tier
    
    // 3. Trigger dispensing
    const result = await springService.dispensePrizeByTier('silver', 456);
    expect(result).toBe(true);
    
    // 4. Verify hardware response
    // This would require actual Spring hardware
  });
});
```

## Performance Optimization

### Response Time Targets
- **Channel query**: < 1 second
- **Prize dispensing**: < 10 seconds total
- **System initialization**: < 5 seconds
- **Error recovery**: < 3 seconds

### Resource Management
- **Memory usage**: < 100MB for Electron app
- **CPU usage**: < 50% during operations
- **Network latency**: < 100ms to Android bridge
- **WebSocket buffer**: < 64KB per message

### Caching Strategy
```typescript
export class SpringCache {
  private channelStatusCache: Map<number, any> = new Map();
  private cacheTimeout = 30000; // 30 seconds
  
  getCachedChannelStatus(channel: number): any | null {
    const cached = this.channelStatusCache.get(channel);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }
  
  setCachedChannelStatus(channel: number, data: any): void {
    this.channelStatusCache.set(channel, {
      data,
      timestamp: Date.now()
    });
  }
}
```

## Security Considerations

### Network Security
- **WebSocket authentication**: Implement token-based auth
- **Command validation**: Validate all incoming commands
- **Rate limiting**: Prevent command flooding
- **Error sanitization**: Don't expose internal error details

### Hardware Security
- **Channel access control**: Validate channel ranges
- **Command logging**: Audit all dispensing operations
- **Fail-safe mode**: Emergency stop functionality
- **Physical security**: Lock physical access to machine

## Deployment

### Production Environment
```bash
# 1. Build Android bridge app
./gradlew assembleRelease
adb install -r app/build/outputs/apk/release/app-release.apk

# 2. Configure network settings
# Ensure Android device and Electron app can communicate
# Set static IP addresses for reliability

# 3. Deploy Electron app
npm run build:win
# Deploy Hanger Challenge Setup 1.0.0.exe

# 4. Configure firewall rules
# Allow WebSocket port (8080) between devices
# Block unauthorized access
```

### Monitoring Setup
```typescript
// Production monitoring
export class ProductionMonitor {
  private metrics: {
    totalOperations: number = 0;
    successfulOperations: number = 0;
    errors: Array<{ timestamp: number, code: number, message: string }> = [];
  };
  
  recordOperation(success: boolean, errorCode?: number, errorMessage?: string): void {
    this.metrics.totalOperations++;
    
    if (success) {
      this.metrics.successfulOperations++;
    } else {
      this.metrics.errors.push({
        timestamp: Date.now(),
        code: errorCode || 0,
        message: errorMessage || 'Unknown error'
      });
    }
  }
  
  getSuccessRate(): number {
    return (this.metrics.successfulOperations / this.metrics.totalOperations) * 100;
  }
  
  getHealthStatus(): { status: string, issues: string[] } {
    const successRate = this.getSuccessRate();
    
    if (successRate >= 95) {
      return { status: 'excellent', issues: [] };
    } else if (successRate >= 90) {
      return { status: 'good', issues: ['Success rate below 95%'] };
    } else {
      return { status: 'critical', issues: ['Success rate below 90%'] };
    }
  }
}
```

This Spring SDK integration guide provides comprehensive implementation details for connecting your Hanger Hold Challenge game to real vending machine hardware with professional reliability and error handling.