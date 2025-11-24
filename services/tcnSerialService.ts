// TCN Serial Service for direct communication with TCN CSC-8C (V49) vending machine
// Based on TCN UCS-V4.x controller board communication protocol

// Mock implementations for development - replace with real hardware when available
class MockSerialPort {
  constructor(options: any) {
    console.log('[TCN SERIAL MOCK] Mock serial port created:', options);
  }
  
  static async list(): Promise<any[]> {
    // Return mock COM ports for testing
    return [
      { path: 'COM3', manufacturer: 'Prolific' },
      { path: 'COM4', manufacturer: 'CH340' },
      { path: 'COM5', manufacturer: 'FTDI' }
    ];
  }
  
  open(callback: Function) {
    setTimeout(() => callback(null), 100);
  }
  
  write(data: any, callback?: Function) {
    console.log('[TCN SERIAL MOCK] Writing:', data);
    if (callback) setTimeout(() => callback(null), 50);
  }
  
  pipe(parser: any) {
    return parser;
  }
  
  on(event: string, handler: Function) {
    console.log(`[TCN SERIAL MOCK] Event listener added: ${event}`);
  }
  
  close(callback?: Function) {
    console.log('[TCN SERIAL MOCK] Port closed');
    if (callback) setTimeout(() => callback(null), 50);
  }
}

class MockReadlineParser {
  constructor(options?: any) {
    console.log('[TCN SERIAL MOCK] Mock parser created:', options);
  }
  
  on(event: string, handler: Function) {
    // Simulate some test data after delay
    if (event === 'data') {
      setTimeout(() => {
        handler('STATUS: OK\r\n');
      }, 1000);
    }
  }
}

// Use mock classes for now - replace with real serialport when hardware is available
const SerialPort = MockSerialPort;
const ReadlineParser = MockReadlineParser;

export enum TCNErrorCode {
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

export interface TCNChannelStatus {
  channel: number;
  isHealthy: boolean;
  hasProduct: boolean;
  errorCode: TCNErrorCode;
  lastChecked: Date;
}

export interface TCNDispenseResult {
  success: boolean;
  channel: number;
  error?: string;
  errorCode?: TCNErrorCode;
  responseTime?: number;
}

export interface TCNSystemStatus {
  connected: boolean;
  port: string;
  baudRate: number;
  healthyChannels: number;
  totalChannels: number;
  lastError: string | null;
  lastResponse: Date | null;
}

export interface TCNEvent {
  type: 'DISPENSING' | 'DISPENSE_SUCCESS' | 'DISPENSE_FAILURE' | 'STATUS_RESPONSE' | 'ERROR';
  channel?: number;
  errorCode?: TCNErrorCode;
  message?: string;
  data?: any;
  timestamp: Date;
}

// TCN UCS-V4.x Command Constants
class TCNCommands {
  static readonly DISPENSE = 0x11;
  static readonly TEST_SLOT = 0x10;
  static readonly SELECT_SLOT = 0x12;
  static readonly QUERY_STATUS = 0x32;
  static readonly SELF_CHECK = 0x30;
  static readonly RESET = 0x31;
  static readonly QUERY_SLOT_STATUS = 0x01;
}

export class TCNSerialService {
  private port: any = null;
  private parser: any = null;
  private isConnected: boolean = false;
  private eventListeners: Map<string, Function[]> = new Map();
  private channelStatus: Map<number, TCNChannelStatus> = new Map();
  private lastError: string | null = null;
  private lastResponse: Date | null = null;
  private responseTimeout: NodeJS.Timeout | null = null;
  
  // Channel mapping for prize tiers
  private readonly prizeChannels = {
    gold: [24, 25],
    silver: [
      1, 2, 3, 4, 5, 6, 7, 8,
      11, 12, 13, 14, 15, 16, 17, 18,
      21, 22, 23, 26, 27, 28,
      31, 32, 33, 34, 35, 36, 37, 38,
      45, 46, 47, 48,
      51, 52, 53, 54, 55, 56, 57, 58
    ],
    bronze: []
  };

  constructor() {
    this.initializeEventListeners();
  }

  /**
   * Auto-detect and connect to TCN vending controller
   */
  async autoConnect(): Promise<boolean> {
    try {
      console.log('[TCN SERIAL] Starting auto-detection...');
      
      // Get available serial ports
      const ports = await SerialPort.list();
      console.log('[TCN SERIAL] Available ports:', ports);
      
      // Look for TCN-compatible adapters (Prolific, CH340, FTDI)
      const tcnPorts = ports.filter(port => 
        port.manufacturer?.toLowerCase().includes('prolific') ||
        port.manufacturer?.toLowerCase().includes('ch340') ||
        port.manufacturer?.toLowerCase().includes('ftdi') ||
        port.manufacturer?.toLowerCase().includes('qinheng') ||
        port.path.includes('COM')
      );

      // Try each likely port
      const portsToTry = tcnPorts.length > 0 ? tcnPorts : ports.slice(0, 5);
      
      for (const portInfo of portsToTry) {
        console.log(`[TCN SERIAL] Trying port: ${portInfo.path}`);
        const connected = await this.connect(portInfo.path, 115200);
        if (connected) {
          console.log(`[TCN SERIAL] Successfully connected to ${portInfo.path}`);
          return true;
        }
      }
      
      console.error('[TCN SERIAL] Failed to connect to any TCN port');
      return false;
    } catch (error) {
      console.error('[TCN SERIAL] Auto-detection failed:', error);
      return false;
    }
  }

  /**
   * Connect to TCN vending controller on specific port
   */
  async connect(portPath: string, baudRate: number = 115200): Promise<boolean> {
    try {
      console.log(`[TCN SERIAL] Connecting to ${portPath} at ${baudRate} baud...`);
      
      this.port = new SerialPort({
        path: portPath,
        baudRate: baudRate,
        dataBits: 8,
        parity: 'none',
        stopBits: 1,
        flowControl: false,
        autoOpen: false
      });

      this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

      return new Promise((resolve) => {
        this.port!.open((error) => {
          if (error) {
            console.error(`[TCN SERIAL] Failed to open ${portPath}:`, error);
            resolve(false);
          } else {
            console.log(`[TCN SERIAL] Connected to ${portPath}`);
            this.isConnected = true;
            this.setupDataParser();
            
            // Test connection with status query
            this.testConnection().then(success => {
              resolve(success);
            });
          }
        });
      });
    } catch (error) {
      console.error(`[TCN SERIAL] Connection error for ${portPath}:`, error);
      return false;
    }
  }

  /**
   * Set up data parser for incoming TCN responses
   */
  private setupDataParser(): void {
    if (!this.parser) return;

    this.parser.on('data', (data: string) => {
      this.handleIncomingData(data);
    });

    this.port!.on('error', (error: any) => {
      console.error('[TCN SERIAL] Port error:', error);
      this.lastError = `Port error: ${error.message}`;
      this.emitEvent('ERROR', {
        type: 'ERROR',
        message: error.message,
        timestamp: new Date()
      } as TCNEvent);
    });

    this.port!.on('close', () => {
      console.log('[TCN SERIAL] Port closed');
      this.isConnected = false;
    });
  }

  /**
   * Handle incoming data from TCN controller
   */
  private handleIncomingData(data: string): void {
    try {
      const trimmedData = data.trim();
      console.log(`[TCN SERIAL] Received: ${trimmedData}`);
      this.lastResponse = new Date();

      // Parse TCN response format
      const parsedResponse = this.parseTCNResponse(trimmedData);
      
      if (parsedResponse) {
        this.emitEvent(parsedResponse.type, parsedResponse);
      }
    } catch (error) {
      console.error('[TCN SERIAL] Failed to parse incoming data:', error);
    }
  }

  /**
   * Parse TCN UCS-V4.x response format
   */
  private parseTCNResponse(data: string): TCNEvent | null {
    // TCN responses can be in various formats
    // Handle common response patterns
    
    // Status response: "STATUS: OK" or "STATUS: ERROR X"
    if (data.includes('STATUS:')) {
      if (data.includes('OK')) {
        return {
          type: 'STATUS_RESPONSE',
          message: 'Controller ready',
          timestamp: new Date()
        };
      } else if (data.includes('ERROR')) {
        const errorCode = parseInt(data.split('ERROR')[1].trim()) || 999;
        return {
          type: 'ERROR',
          errorCode: errorCode as TCNErrorCode,
          message: `TCN Error ${errorCode}`,
          timestamp: new Date()
        };
      }
    }

    // Dispensing response: "DISPENSE X: STARTING", "DISPENSE X: SUCCESS", "DISPENSE X: FAILED"
    if (data.includes('DISPENSE')) {
      const parts = data.split(' ');
      const channel = parseInt(parts[1]) || 0;
      const status = parts[2] || 'UNKNOWN';
      
      if (status.includes('STARTING')) {
        return {
          type: 'DISPENSING',
          channel,
          message: `Dispensing from channel ${channel}`,
          timestamp: new Date()
        };
      } else if (status.includes('SUCCESS')) {
        return {
          type: 'DISPENSE_SUCCESS',
          channel,
          message: `Successfully dispensed from channel ${channel}`,
          timestamp: new Date()
        };
      } else if (status.includes('FAILED')) {
        return {
          type: 'DISPENSE_FAILURE',
          channel,
          message: `Failed to dispense from channel ${channel}`,
          timestamp: new Date()
        };
      }
    }

    // Temperature response: "TEMP: 25.5C"
    if (data.includes('TEMP:')) {
      console.log(`[TCN SERIAL] Temperature reading: ${data}`);
      return null; // Temperature is logged but not used for events
    }

    // Version info: "UCS V4.2"
    if (data.includes('UCS V4')) {
      console.log(`[TCN SERIAL] Controller version: ${data}`);
      return {
        type: 'STATUS_RESPONSE',
        message: `Controller identified: ${data}`,
        timestamp: new Date()
      };
    }

    // Generic response - log but don't create event
    console.log(`[TCN SERIAL] Unparsed response: ${data}`);
    return null;
  }

  /**
   * Test connection with basic status query
   */
  private async testConnection(): Promise<boolean> {
    try {
      console.log('[TCN SERIAL] Testing connection...');
      
      // Send status query command
      const success = await this.sendCommand('STATUS\r\n', 3000);
      
      if (success) {
        console.log('[TCN SERIAL] Connection test successful');
        return true;
      } else {
        console.error('[TCN SERIAL] Connection test failed');
        return false;
      }
    } catch (error) {
      console.error('[TCN SERIAL] Connection test error:', error);
      return false;
    }
  }

  /**
   * Dispense prize by tier (gold, silver, bronze)
   */
  async dispensePrizeByTier(tier: 'gold' | 'silver' | 'bronze'): Promise<TCNDispenseResult> {
    if (!this.isConnected || !this.port) {
      throw new Error('TCN not connected');
    }

    const availableChannels = this.prizeChannels[tier];
    const workingChannel = await this.findWorkingChannel(availableChannels);
    
    if (!workingChannel) {
      return {
        success: false,
        channel: 0,
        error: `No working channels available for ${tier} tier`
      };
    }

    return await this.dispenseFromChannel(workingChannel);
  }

  /**
   * Dispense from specific channel
   */
  async dispenseFromChannel(channel: number): Promise<TCNDispenseResult> {
    if (!this.isConnected || !this.port) {
      throw new Error('TCN not connected');
    }

    const startTime = Date.now();
    
    try {
      console.log(`[TCN SERIAL] Dispensing from channel ${channel}`);
      
      // Send dispense command
      const command = `DISPENSE ${channel}\r\n`;
      const success = await this.sendCommand(command, 10000);
      
      const responseTime = Date.now() - startTime;
      
      if (success) {
        console.log(`[TCN SERIAL] Dispense command sent to channel ${channel}`);
        
        // Wait for dispense completion
        const result = await this.waitForDispenseResult(channel, 15000);
        
        return {
          success: result.success,
          channel,
          error: result.error,
          errorCode: result.errorCode,
          responseTime
        };
      } else {
        return {
          success: false,
          channel,
          error: 'Failed to send dispense command',
          responseTime
        };
      }
    } catch (error) {
      console.error(`[TCN SERIAL] Error dispensing from channel ${channel}:`, error);
      return {
        success: false,
        channel,
        error: error.message,
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Wait for dispense result from TCN controller
   */
  private async waitForDispenseResult(channel: number, timeoutMs: number): Promise<TCNDispenseResult> {
    return new Promise((resolve) => {
      let resolved = false;
      
      const dispenseListener = (event: TCNEvent) => {
        if (event.channel === channel) {
          switch (event.type) {
            case 'DISPENSE_SUCCESS':
              if (!resolved) {
                resolved = true;
                this.removeEventListener('DISPENSE_SUCCESS', dispenseListener);
                this.removeEventListener('DISPENSE_FAILURE', dispenseListener);
                resolve({
                  success: true,
                  channel,
                  error: (event as any).error || undefined
                });
              }
              break;
              
            case 'DISPENSE_FAILURE':
              if (!resolved) {
                resolved = true;
                this.removeEventListener('DISPENSE_SUCCESS', dispenseListener);
                this.removeEventListener('DISPENSE_FAILURE', dispenseListener);
                resolve({
                  success: false,
                  channel,
                  error: event.message,
                  errorCode: event.errorCode
                });
              }
              break;
          }
        }
      };
      
      this.addEventListener('DISPENSE_SUCCESS', dispenseListener);
      this.addEventListener('DISPENSE_FAILURE', dispenseListener);
      
      // Set timeout
      const timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          this.removeEventListener('DISPENSE_SUCCESS', dispenseListener);
          this.removeEventListener('DISPENSE_FAILURE', dispenseListener);
          resolve({
            success: false,
            channel,
            error: 'Dispense timeout',
            errorCode: TCNErrorCode.NO_RESPONSE_TIMEOUT
          });
        }
      }, timeoutMs);
      
      // For mock system, simulate immediate response after a short delay
      if (this.port instanceof MockSerialPort) {
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            this.removeEventListener('DISPENSE_SUCCESS', dispenseListener);
            this.removeEventListener('DISPENSE_FAILURE', dispenseListener);
            clearTimeout(timeoutId);
            
            // Simulate success for mock testing
            resolve({
              success: true,
              channel,
              error: undefined
            });
          }
        }, 1000); // 1 second delay for mock response
      }
    });
  }

  /**
   * Find a working channel from the available channels
   */
  private async findWorkingChannel(channels: number[]): Promise<number | null> {
    for (const channel of channels) {
      const status = await this.queryChannelStatus(channel);
      if (status.isHealthy) {
        return channel;
      }
    }
    return null;
  }

  /**
   * Query status of specific channel
   */
  async queryChannelStatus(channel: number): Promise<TCNChannelStatus> {
    const defaultStatus: TCNChannelStatus = {
      channel,
      isHealthy: false,
      hasProduct: false,
      errorCode: TCNErrorCode.NO_RESPONSE_TIMEOUT,
      lastChecked: new Date()
    };

    if (!this.isConnected || !this.port) {
      return defaultStatus;
    }

    try {
      const command = `STATUS ${channel}\r\n`;
      const success = await this.sendCommand(command, 3000);
      
      if (success) {
        // For now, assume channel is healthy if command succeeds
        // In real implementation, you'd parse the actual status response
        return {
          channel,
          isHealthy: true,
          hasProduct: true, // Assume has product
          errorCode: TCNErrorCode.NORMAL,
          lastChecked: new Date()
        };
      }
    } catch (error) {
      console.error(`[TCN SERIAL] Failed to query channel ${channel}:`, error);
    }

    return defaultStatus;
  }

  /**
   * Send command to TCN controller
   */
  private async sendCommand(command: string, timeoutMs: number = 5000): Promise<boolean> {
    if (!this.port || !this.isConnected) {
      return false;
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.error(`[TCN SERIAL] Command timeout: ${command.trim()}`);
        resolve(false);
      }, timeoutMs);

      this.port.write(command, (error) => {
        clearTimeout(timeout);
        
        if (error) {
          console.error(`[TCN SERIAL] Write error:`, error);
          resolve(false);
        } else {
          console.log(`[TCN SERIAL] Sent: ${command.trim()}`);
          resolve(true);
        }
      });
    });
  }

  /**
   * Get system status
   */
  getSystemStatus(): TCNSystemStatus {
    const healthyChannels = Array.from(this.channelStatus.values())
      .filter(status => status.isHealthy).length;

    // Compute total channels from configured prizeChannels
    const channelLists = Object.values(this.prizeChannels) as number[][];
    const allChannels = channelLists.flat();
    const totalChannels = allChannels.length > 0 ? Math.max(...allChannels) : 0;

    return {
      connected: this.isConnected,
      port: this.port?.path || 'Unknown',
      baudRate: this.port?.baudRate || 0,
      healthyChannels,
      totalChannels,
      lastError: this.lastError,
      lastResponse: this.lastResponse
    };
  }

  /**
   * Event system
   */
  private initializeEventListeners(): void {
    const eventTypes = ['DISPENSING', 'DISPENSE_SUCCESS', 'DISPENSE_FAILURE', 'STATUS_RESPONSE', 'ERROR'];
    
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

  private emitEvent(eventType: string, data: TCNEvent): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`[TCN SERIAL] Error in event listener:`, error);
        }
      });
    }
  }

  /**
   * Disconnect from TCN controller
   */
  async disconnect(): Promise<void> {
    if (this.port && this.isConnected) {
      console.log('[TCN SERIAL] Disconnecting...');
      
      return new Promise((resolve) => {
        this.port.close((error) => {
          this.isConnected = false;
          this.port = null;
          this.parser = null;
          
          if (error) {
            console.error('[TCN SERIAL] Disconnect error:', error);
          } else {
            console.log('[TCN SERIAL] Disconnected successfully');
          }
          
          resolve();
        });
      });
    }
  }

  /**
   * Check if connected to TCN controller
   */
  isConnectedToTCN(): boolean {
    return this.isConnected;
  }
}

export const tcnSerialService = new TCNSerialService();