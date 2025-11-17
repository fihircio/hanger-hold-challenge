// Enhanced vending service based on Spring Machine SDK protocol
// Provides comprehensive vending machine control with error handling and status monitoring

export enum SpringErrorCode {
  NORMAL = 0,
  PHOTOSENSOR_NO_EMISSION_SIGNAL = 1,
  PHOTOSENSOR_NO_CHANGE_SIGNAL = 2,
  PHOTOSENSOR_ALWAYS_OUTPUT = 3,
  NO_SHIPMENT_DETECTED = 4,
  P_MOS_SHORT_CIRCUIT_16 = 22,
  P_MOS_SHORT_CIRCUIT_17 = 23,
  N_MOS_SHORT_CIRCUIT_32 = 50,
  MOTOR_SHORT_CIRCUIT = 72,
  MOTOR_OPEN_CIRCUIT = 100,
  RAM_ERROR_MOTOR_TIMEOUT = 128,
  NO_RESPONSE_TIMEOUT = 129,
  DATA_INCOMPLETE = 130,
  CHECKSUM_ERROR = 131,
  ADDRESS_ERROR = 132,
  SLOT_NOT_EXISTS = 134,
  ERROR_CODE_OUT_OF_RANGE = 135,
  CONTINUOUS_NO_DETECTION = 144
}

export interface SpringError {
  code: SpringErrorCode;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestedAction: string;
}

export interface ChannelStatus {
  channel: number;
  isHealthy: boolean;
  hasProduct: boolean;
  errorCode: SpringErrorCode;
  lastChecked: Date;
}

export interface DispenseResult {
  success: boolean;
  error?: string;
  tier: 'gold' | 'silver' | 'bronze';
  channel: number | null;
  errorCode?: SpringErrorCode;
}

export interface ShipResult {
  success: boolean;
  channel: number;
  error?: string;
  errorCode?: SpringErrorCode;
}

export interface SelfCheckResult {
  success: boolean;
  errorCode: SpringErrorCode;
  message: string;
}

export interface VendingSystemStatus {
  connected: boolean;
  healthyChannels: number;
  totalChannels: number;
  lastError: SpringError | null;
  lastSelfCheck: SelfCheckResult | null;
}

export interface VendingEvent {
  type: string;
  channel?: number;
  status?: number;
  hasProduct?: boolean;
  errorCode?: SpringErrorCode;
  error?: string;
  data?: any;
}

// Spring SDK Command Constants
class SpringVendingCommands {
  static readonly QUERY_SLOT_STATUS = 0x01;
  static readonly SET_SPRING_SLOT = 0x02;
  static readonly SET_BELT_SLOT = 0x03;
  static readonly SET_SINGLE_SLOT = 0x04;
  static readonly SET_DOUBLE_SLOT = 0x05;
  static readonly SHIP_TEST = 0x10;
  static readonly SHIP_WITH_METHOD = 0x11;
  static readonly SELECT_SLOT = 0x12;
  static readonly SET_LED = 0x20;
  static readonly SET_BUZZER = 0x21;
  static readonly SET_GLASS_HEAT = 0x22;
  static readonly SET_TEMPERATURE = 0x23;
  static readonly SELF_CHECK = 0x30;
  static readonly RESET = 0x31;
  static readonly QUERY_STATUS = 0x32;
}

class SpringVendingService {
  private serialPort: any = null;
  private eventListeners: Map<string, Function[]> = new Map();
  private channelStatus: Map<number, ChannelStatus> = new Map();
  private isConnected: boolean = false;
  private lastError: SpringError | null = null;
  private lastSelfCheck: SelfCheckResult | null = null;
  
  // Gold, Silver, Bronze channel mapping (1-25 channels total)
  private readonly prizeChannels = {
    gold: [1, 2, 3, 4, 5],
    silver: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    bronze: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25]
  };

  // Error descriptions and actions
  private readonly errorDescriptions: Map<SpringErrorCode, SpringError> = new Map([
    [SpringErrorCode.NORMAL, {
      code: SpringErrorCode.NORMAL,
      description: 'Normal operation',
      severity: 'low',
      suggestedAction: 'No action required'
    }],
    [SpringErrorCode.NO_SHIPMENT_DETECTED, {
      code: SpringErrorCode.NO_SHIPMENT_DETECTED,
      description: 'No shipment detected (empty channel)',
      severity: 'medium',
      suggestedAction: 'Refill channel or check product placement'
    }],
    [SpringErrorCode.MOTOR_SHORT_CIRCUIT, {
      code: SpringErrorCode.MOTOR_SHORT_CIRCUIT,
      description: 'Motor short circuit',
      severity: 'critical',
      suggestedAction: 'Replace motor or check wiring'
    }],
    [SpringErrorCode.MOTOR_OPEN_CIRCUIT, {
      code: SpringErrorCode.MOTOR_OPEN_CIRCUIT,
      description: 'Motor open circuit',
      severity: 'critical',
      suggestedAction: 'Replace motor or check connections'
    }],
    [SpringErrorCode.RAM_ERROR_MOTOR_TIMEOUT, {
      code: SpringErrorCode.RAM_ERROR_MOTOR_TIMEOUT,
      description: 'Motor rotation timeout',
      severity: 'high',
      suggestedAction: 'Check for obstructions or motor failure'
    }],
    [SpringErrorCode.NO_RESPONSE_TIMEOUT, {
      code: SpringErrorCode.NO_RESPONSE_TIMEOUT,
      description: 'No response from controller',
      severity: 'high',
      suggestedAction: 'Check serial connection and power'
    }],
    [SpringErrorCode.SLOT_NOT_EXISTS, {
      code: SpringErrorCode.SLOT_NOT_EXISTS,
      description: 'Channel does not exist',
      severity: 'medium',
      suggestedAction: 'Check channel number and configuration'
    }]
  ]);

  constructor() {
    this.initializeEventListeners();
  }

  async initializeVending(): Promise<boolean> {
    try {
      console.log('[SPRING VENDING] Initializing vending system...');
      
      // Initialize serial connection
      await this.connectToVendingController();
      
      if (!this.isConnected) {
        throw new Error('Failed to connect to vending controller');
      }
      
      // Perform self-check
      const selfCheck = await this.performSelfCheck();
      if (!selfCheck.success) {
        console.warn('[SPRING VENDING] Self-check warnings:', selfCheck.message);
      }
      
      // Query all channel statuses
      await this.queryAllChannelStatus();
      
      // Enable drop detection
      await this.setDropDetection(true);
      
      console.log('[SPRING VENDING] Initialization complete');
      return true;
    } catch (error) {
      console.error('[SPRING VENDING] Initialization failed:', error);
      this.lastError = {
        code: SpringErrorCode.NO_RESPONSE_TIMEOUT,
        description: 'Initialization failed',
        severity: 'high',
        suggestedAction: 'Check hardware connections'
      };
      return false;
    }
  }

  private async connectToVendingController(): Promise<void> {
    if (!this.isElectron()) {
      console.warn('[SPRING VENDING] Not running in Electron environment');
      return;
    }

    try {
      // Get available serial ports
      const ports = await window.electronAPI.getSerialPorts();
      console.log('[SPRING VENDING] Available ports:', ports);
      
      // Try to find vending controller (look for COM ports on Windows)
      const vendingPort = ports.find((port: any) => 
        port.path.startsWith('COM') && !port.path.includes('Bluetooth')
      ) || ports[0]; // Fallback to first port
      
      if (!vendingPort) {
        throw new Error('No suitable serial port found');
      }
      
      // Connect to the port
      const connectResult = await window.electronAPI.connectSerialPort(vendingPort.path);
      
      if (connectResult.success) {
        this.isConnected = true;
        this.serialPort = vendingPort.path;
        console.log(`[SPRING VENDING] Connected to ${vendingPort.path}`);
        
        // Set up data listener
        this.setupDataListener();
      } else {
        throw new Error(`Failed to connect to ${vendingPort.path}`);
      }
    } catch (error) {
      console.error('[SPRING VENDING] Connection failed:', error);
      this.isConnected = false;
      throw error;
    }
  }

  private setupDataListener(): void {
    if (!this.isElectron()) return;
    
    window.electronAPI.removeAllSerialListeners();
    window.electronAPI.onSerialData((data: string) => {
      this.processIncomingData(data);
    });
    
    window.electronAPI.onSerialError((error: string) => {
      console.error('[SPRING VENDING] Serial error:', error);
      this.lastError = {
        code: SpringErrorCode.NO_RESPONSE_TIMEOUT,
        description: `Serial communication error: ${error}`,
        severity: 'high',
        suggestedAction: 'Check cable connections'
      };
    });
  }

  private processIncomingData(data: string): void {
    try {
      console.log('[SPRING VENDING] Received data:', data);
      
      // Parse the response based on Spring SDK protocol
      const parsedResponse = this.parseSpringResponse(data);
      
      if (parsedResponse) {
        this.emitEvent(parsedResponse.type, parsedResponse);
      }
    } catch (error) {
      console.error('[SPRING VENDING] Failed to parse incoming data:', error);
    }
  }

  private parseSpringResponse(data: string): VendingEvent | null {
    // This is a simplified parser - you'll need to adapt based on actual protocol
    const bytes = data.split(' ').map(b => parseInt(b, 16));
    
    if (bytes.length < 4) return null;
    
    const command = bytes[0];
    const channel = bytes[1];
    const status = bytes[2];
    const errorCode = bytes[3];
    
    // Map Spring SDK responses to events
    switch (command) {
      case 0x81: // Slot status response
        return {
          type: 'SLOT_STATUS',
          channel,
          status,
          errorCode,
          hasProduct: status === 0
        };
      case 0x91: // Shipping status
        return {
          type: status === 1 ? 'SHIPPING' : status === 2 ? 'SHIPMENT_SUCCESS' : 'SHIPMENT_FAILURE',
          channel,
          status,
          errorCode,
          error: this.getErrorMessage(errorCode)
        };
      case 0xA1: // Self-check result
        return {
          type: 'SELF_CHECK_RESULT',
          errorCode,
          error: this.getErrorMessage(errorCode)
        };
      default:
        return {
          type: 'UNKNOWN_RESPONSE',
          data: bytes
        };
    }
  }

  async dispensePrizeByTier(tier: 'gold' | 'silver' | 'bronze'): Promise<DispenseResult> {
    const availableChannels = this.prizeChannels[tier];
    const workingChannel = await this.findWorkingChannel(availableChannels);
    
    if (!workingChannel) {
      return {
        success: false,
        error: `No working channels available for ${tier} tier`,
        tier,
        channel: null
      };
    }

    return await this.dispenseFromChannel(workingChannel, tier);
  }

  private async dispenseFromChannel(channel: number, tier: string): Promise<DispenseResult> {
    try {
      console.log(`[SPRING VENDING] Dispensing ${tier} prize from channel ${channel}`);
      
      // Select channel first
      const selectResult = await this.selectChannel(channel);
      if (!selectResult.success) {
        throw new Error(`Channel selection failed: ${selectResult.error}`);
      }
      
      // Start shipping with drop detection
      const shipResult = await this.shipWithDetection(channel);
      
      if (shipResult.success) {
        console.log(`[SPRING VENDING] Successfully dispensed ${tier} prize from channel ${channel}`);
        this.logDispensing(channel, tier, true);
      } else {
        console.error(`[SPRING VENDING] Failed to dispense from channel ${channel}: ${shipResult.error}`);
        this.logDispensing(channel, tier, false, shipResult.error);
      }
      
      return {
        success: shipResult.success,
        error: shipResult.error,
        tier: tier as 'gold' | 'silver' | 'bronze',
        channel,
        errorCode: shipResult.errorCode
      };
    } catch (error) {
      console.error(`[SPRING VENDING] Error dispensing from channel ${channel}:`, error);
      return {
        success: false,
        error: error.message,
        tier: tier as 'gold' | 'silver' | 'bronze',
        channel,
        errorCode: SpringErrorCode.RAM_ERROR_MOTOR_TIMEOUT
      };
    }
  }

  private async shipWithDetection(channel: number): Promise<ShipResult> {
    return new Promise((resolve) => {
      const command = this.buildSpringCommand(SpringVendingCommands.SHIP_WITH_METHOD, {
        channel,
        method: 1, // Test method
        amount: "0",
        tradeNo: this.generateTradeNumber()
      });
      
      // Set up listener for shipping events
      const shippingListener = (event: VendingEvent) => {
        switch (event.type) {
          case 'SHIPPING':
            console.log(`[SPRING VENDING] Shipping in progress for channel ${channel}`);
            break;
          case 'SHIPMENT_SUCCESS':
            this.removeEventListener('SHIPPING', shippingListener);
            this.removeEventListener('SHIPMENT_SUCCESS', shippingListener);
            this.removeEventListener('SHIPMENT_FAILURE', shippingListener);
            resolve({ success: true, channel });
            break;
          case 'SHIPMENT_FAILURE':
            this.removeEventListener('SHIPPING', shippingListener);
            this.removeEventListener('SHIPMENT_SUCCESS', shippingListener);
            this.removeEventListener('SHIPMENT_FAILURE', shippingListener);
            resolve({ 
              success: false, 
              channel, 
              error: event.error,
              errorCode: event.errorCode 
            });
            break;
        }
      };
      
      this.addEventListener('SHIPPING', shippingListener);
      this.addEventListener('SHIPMENT_SUCCESS', shippingListener);
      this.addEventListener('SHIPMENT_FAILURE', shippingListener);
      
      // Send command with timeout
      this.sendSpringCommand(command);
      
      // Set timeout for shipping (10 seconds)
      setTimeout(() => {
        this.removeEventListener('SHIPPING', shippingListener);
        this.removeEventListener('SHIPMENT_SUCCESS', shippingListener);
        this.removeEventListener('SHIPMENT_FAILURE', shippingListener);
        resolve({ 
          success: false, 
          channel, 
          error: 'Shipping timeout',
          errorCode: SpringErrorCode.NO_RESPONSE_TIMEOUT 
        });
      }, 10000);
    });
  }

  private async selectChannel(channel: number): Promise<{success: boolean, error?: string}> {
    return new Promise((resolve) => {
      const command = this.buildSpringCommand(SpringVendingCommands.SELECT_SLOT, { channel });
      
      const selectListener = (event: VendingEvent) => {
        if (event.type === 'SELECT_GOODS') {
          this.removeEventListener('SELECT_GOODS', selectListener);
          resolve({ success: true });
        } else if (event.type === 'INVALID_CHANNEL') {
          this.removeEventListener('SELECT_GOODS', selectListener);
          resolve({ success: false, error: 'Invalid channel' });
        }
      };
      
      this.addEventListener('SELECT_GOODS', selectListener);
      this.addEventListener('INVALID_CHANNEL', selectListener);
      
      this.sendSpringCommand(command);
      
      setTimeout(() => {
        this.removeEventListener('SELECT_GOODS', selectListener);
        this.removeEventListener('INVALID_CHANNEL', selectListener);
        resolve({ success: false, error: 'Channel selection timeout' });
      }, 3000);
    });
  }

  private async findWorkingChannel(channels: number[]): Promise<number | null> {
    for (const channel of channels) {
      const status = await this.queryChannelStatus(channel);
      if (status.isHealthy && status.hasProduct) {
        return channel;
      }
    }
    return null;
  }

  async queryChannelStatus(channel: number): Promise<ChannelStatus> {
    const command = this.buildSpringCommand(SpringVendingCommands.QUERY_SLOT_STATUS, { channel });
    
    return new Promise((resolve) => {
      const statusListener = (event: VendingEvent) => {
        if (event.type === 'SLOT_STATUS' && event.channel === channel) {
          this.removeEventListener('SLOT_STATUS', statusListener);
          
          const channelStatus: ChannelStatus = {
            channel,
            isHealthy: event.errorCode === SpringErrorCode.NORMAL,
            hasProduct: event.hasProduct || false,
            errorCode: event.errorCode || SpringErrorCode.NORMAL,
            lastChecked: new Date()
          };
          
          this.channelStatus.set(channel, channelStatus);
          resolve(channelStatus);
        }
      };
      
      this.addEventListener('SLOT_STATUS', statusListener);
      this.sendSpringCommand(command);
      
      // Timeout after 2 seconds
      setTimeout(() => {
        this.removeEventListener('SLOT_STATUS', statusListener);
        const timeoutStatus: ChannelStatus = {
          channel,
          isHealthy: false,
          hasProduct: false,
          errorCode: SpringErrorCode.NO_RESPONSE_TIMEOUT,
          lastChecked: new Date()
        };
        this.channelStatus.set(channel, timeoutStatus);
        resolve(timeoutStatus);
      }, 2000);
    });
  }

  private async queryAllChannelStatus(): Promise<void> {
    console.log('[SPRING VENDING] Querying all channel status...');
    const promises = [];
    
    for (let i = 1; i <= 25; i++) {
      promises.push(this.queryChannelStatus(i));
    }
    
    await Promise.all(promises);
    console.log('[SPRING VENDING] Channel status query complete');
  }

  async performSelfCheck(): Promise<SelfCheckResult> {
    const command = this.buildSpringCommand(SpringVendingCommands.SELF_CHECK);
    
    return new Promise((resolve) => {
      const checkListener = (event: VendingEvent) => {
        if (event.type === 'SELF_CHECK_RESULT') {
          this.removeEventListener('SELF_CHECK_RESULT', checkListener);
          
          const result: SelfCheckResult = {
            success: event.errorCode === SpringErrorCode.NORMAL,
            errorCode: event.errorCode || SpringErrorCode.NORMAL,
            message: this.getErrorMessage(event.errorCode)
          };
          
          this.lastSelfCheck = result;
          resolve(result);
        }
      };
      
      this.addEventListener('SELF_CHECK_RESULT', checkListener);
      this.sendSpringCommand(command);
      
      setTimeout(() => {
        this.removeEventListener('SELF_CHECK_RESULT', checkListener);
        const timeoutResult: SelfCheckResult = {
          success: false,
          errorCode: SpringErrorCode.NO_RESPONSE_TIMEOUT,
          message: 'Self-check timeout'
        };
        this.lastSelfCheck = timeoutResult;
        resolve(timeoutResult);
      }, 5000);
    });
  }

  private async setDropDetection(enabled: boolean): Promise<boolean> {
    try {
      console.log(`[SPRING VENDING] ${enabled ? 'Enabling' : 'Disabling'} drop detection`);
      // This would be implemented based on the actual Spring SDK protocol
      return true;
    } catch (error) {
      console.error('[SPRING VENDING] Failed to set drop detection:', error);
      return false;
    }
  }

  private buildSpringCommand(command: number, parameters?: any): string {
    // Build command based on Spring SDK protocol
    // This is a simplified implementation - you'll need to adapt based on actual protocol
    const bytes = [command];
    
    if (parameters?.channel) {
      bytes.push(parameters.channel);
    }
    
    // Add checksum and protocol markers
    const checksum = bytes.reduce((sum, byte) => sum + byte, 0) & 0xFF;
    bytes.push(checksum, 0xAA, 0x55);
    
    return bytes.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
  }

  private sendSpringCommand(command: string): void {
    if (!this.isElectron() || !this.isConnected) {
      console.warn('[SPRING VENDING] Cannot send command - not connected');
      return;
    }
    
    console.log('[SPRING VENDING] Sending command:', command);
    window.electronAPI.sendSerialCommand(command);
  }

  private generateTradeNumber(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getErrorMessage(errorCode: SpringErrorCode): string {
    const error = this.errorDescriptions.get(errorCode);
    return error ? error.description : 'Unknown error';
  }

  private logDispensing(channel: number, tier: string, success: boolean, error?: string): void {
    const logEntry = {
      timestamp: new Date(),
      channel,
      tier,
      success,
      error
    };
    
    console.log('[SPRING VENDING] Dispense log:', logEntry);
    // You could also send this to your backend API
  }

  // Event system
  private initializeEventListeners(): void {
    // Initialize with empty arrays for common event types
    const eventTypes = [
      'SLOT_STATUS', 'SHIPPING', 'SHIPMENT_SUCCESS', 'SHIPMENT_FAILURE',
      'SELECT_GOODS', 'INVALID_CHANNEL', 'SELF_CHECK_RESULT'
    ];
    
    eventTypes.forEach(type => {
      this.eventListeners.set(type, []);
    });
  }

  addEventListener(eventType: string, listener: Function): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(listener);
  }

  removeEventListener(eventType: string, listener: Function): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emitEvent(eventType: string, data: VendingEvent): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`[SPRING VENDING] Error in event listener:`, error);
        }
      });
    }
  }

  // Public API methods
  async getSystemStatus(): Promise<VendingSystemStatus> {
    const healthyChannels = Array.from(this.channelStatus.values())
      .filter(status => status.isHealthy).length;
    
    return {
      connected: this.isConnected,
      healthyChannels,
      totalChannels: 25,
      lastError: this.lastError,
      lastSelfCheck: this.lastSelfCheck
    };
  }

  async testChannel(channel: number): Promise<boolean> {
    try {
      const command = this.buildSpringCommand(SpringVendingCommands.SHIP_TEST, { channel });
      this.sendSpringCommand(command);
      return true;
    } catch (error) {
      console.error(`[SPRING VENDING] Failed to test channel ${channel}:`, error);
      return false;
    }
  }

  getChannelStatus(channel: number): ChannelStatus | undefined {
    return this.channelStatus.get(channel);
  }

  getAllChannelStatus(): ChannelStatus[] {
    return Array.from(this.channelStatus.values());
  }

  getLastError(): SpringError | null {
    return this.lastError;
  }

  getLastSelfCheckResult(): SelfCheckResult | null {
    return this.lastSelfCheck;
  }

  private isElectron(): boolean {
    return typeof window !== 'undefined' && !!window.electronAPI;
  }

  async disconnect(): Promise<void> {
    if (this.isElectron() && this.isConnected) {
      await window.electronAPI.disconnectSerialPort();
      this.isConnected = false;
      this.serialPort = null;
      console.log('[SPRING VENDING] Disconnected from vending controller');
    }
  }
}

export const springVendingService = new SpringVendingService();