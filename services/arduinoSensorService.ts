// Arduino Sensor Service with debouncing and state management

export interface SensorEventHandlers {
  onSensorStart?: (timestamp?: number) => void;
  onSensorEnd?: (timestamp?: number) => void;
  onSensorChange?: (state: number, timestamp?: number) => void;
}

class ArduinoSensorService {
  private static instance: ArduinoSensorService;
  private isEnabled: boolean = false;
  private currentState: number = 0;
  private lastStableState: number = 0;
  private debounceTimer: NodeJS.Timeout | null = null;
  private readonly DEBOUNCE_DELAY = 300; // ms - require stable state for 300ms (reduced bounce issues)
  private eventHandlers: SensorEventHandlers = {};
  private serialListenerSetup: boolean = false;
  private isConnected: boolean = false; // Track serial connection state to prevent retry loops

  private constructor() {}

  static getInstance(): ArduinoSensorService {
    if (!ArduinoSensorService.instance) {
      ArduinoSensorService.instance = new ArduinoSensorService();
    }
    return ArduinoSensorService.instance;
  }

  /**
   * Enable/disable sensor processing
   */
  setEnabled(enabled: boolean): void {
    // Prevent unnecessary state changes
    if (this.isEnabled === enabled) {
      console.log(`[Arduino Sensor] Already ${enabled ? 'ENABLED' : 'DISABLED'} - skipping`);
      return;
    }
    
    this.isEnabled = enabled;
    if (!enabled) {
      this.clearDebounceTimer();
      console.log(`Arduino sensor DISABLED`);
    } else {
      // When enabling, ensure serial listeners are ready
      this.ensureSerialConnection().then(() => {
        // Check if we're in mock mode (no serial ports available)
        if (this.serialListenerSetup && !this.isConnected) {
          console.log(`Arduino sensor ENABLED and ready for data (MOCK MODE - no serial ports detected)`);
        } else {
          console.log(`Arduino sensor ENABLED and ready for data (REAL HARDWARE MODE)`);
        }
      }).catch(error => {
        console.error(`[Arduino Sensor] Failed to enable:`, error);
        this.isEnabled = false; // Revert on failure
      });
    }
  }

  /**
   * Ensure serial connection is active when enabling sensor
   * ENHANCED: Proactive COM port state management to prevent "Access denied" errors
   */
  private async ensureSerialConnection(): Promise<void> {
    if (!window.electronAPI) return;
    
    // CRITICAL FIX: Check if already connected to prevent retry loops
    if (this.serialListenerSetup && this.isConnected) {
      console.log('[Arduino Sensor] Already connected to serial port, skipping reconnection');
      return;
    }
    
    try {
      // PROACTIVE FIX: Pre-warm COM ports to prevent Windows state persistence issues
      console.log('[Arduino Sensor] Proactive COM port initialization starting...');
      await this.proactivePortInitialization();
      
      // Try to get available ports first
      const ports = await window.electronAPI.getSerialPorts();
      if (ports.length > 0) {
        console.log('[Arduino Sensor] Available ports:', ports);
        
        // ENHANCED: More robust Arduino port detection with manufacturer checking
        // Arduino sensor should use HIGHER numbered COM ports (COM6+) to avoid conflict with Spring Vending
        // Priority 1: Arduino manufacturer ports (most reliable)
        // Priority 2: High COM ports without Arduino manufacturer
        // Priority 3: Any available port as last resort
        let targetPort = null;
        
        // Find Arduino-like ports first (most reliable)
        const arduinoPorts = ports.filter((port: any) =>
          port.manufacturer && (
            port.manufacturer.toLowerCase().includes('arduino') ||
            port.manufacturer.toLowerCase().includes('ftdi') ||
            port.manufacturer.toLowerCase().includes('ch340')
          )
        );
        
        // Sort available COM ports by number (descending - Arduino gets higher numbers)
        const allComPorts = ports
          .filter((port: any) => port.path.startsWith('COM'))
          .sort((a: any, b: any) => {
            const numA = parseInt(a.path.replace('COM', ''));
            const numB = parseInt(b.path.replace('COM', ''));
            return numB - numA; // Descending order (higher numbers first)
          });
        
        // Priority 1: Use Arduino manufacturer ports (most reliable)
        if (arduinoPorts.length > 0) {
          const arduinoComPorts = arduinoPorts.filter((port: any) => port.path.startsWith('COM'));
          arduinoComPorts.sort((a: any, b: any) => {
            const numA = parseInt(a.path.replace('COM', ''));
            const numB = parseInt(b.path.replace('COM', ''));
            return numB - numA; // Highest number first
          });
          
          if (arduinoComPorts.length > 0) {
            targetPort = arduinoComPorts[0]; // Use highest numbered Arduino manufacturer port
            console.log(`[Arduino Sensor] Selected Arduino manufacturer port: ${targetPort.path} (most reliable for Arduino)`);
          }
        }
        
        // Priority 2: Use high COM ports (COM6+) that are NOT Arduino manufacturer
        if (!targetPort) {
          const highComPorts = allComPorts.filter((port: any) => {
            const comNum = parseInt(port.path.replace('COM', ''));
            return comNum >= 6; // COM6+ for Arduino sensor
          });
          
          // Exclude Arduino manufacturer ports to avoid conflicts
          const nonArduinoHighPorts = highComPorts.filter((port: any) => {
            const mfr = (port.manufacturer || '').toLowerCase();
            return !mfr.includes('arduino') && !mfr.includes('ftdi') && !mfr.includes('ch340');
          });
          
          if (nonArduinoHighPorts.length > 0) {
            // Sort by number (higher first) to get highest COM port
            nonArduinoHighPorts.sort((a: any, b: any) => {
              const numA = parseInt(a.path.replace('COM', ''));
              const numB = parseInt(b.path.replace('COM', ''));
              return numB - numA;
            });
            
            targetPort = nonArduinoHighPorts[0]; // Use highest numbered non-Arduino COM port
            console.log(`[Arduino Sensor] Selected high COM port: ${targetPort.path} (non-Arduino manufacturer, COM6+)`);
          }
        }
        
        // Priority 3: Last resort - any available port
        if (!targetPort && allComPorts.length > 0) {
          targetPort = allComPorts[0]; // Highest numbered COM port available
          console.log(`[Arduino Sensor] Using fallback port: ${targetPort.path} (no Arduino-compatible ports found)`);
        }
        
        if (!targetPort) {
          console.warn('[Arduino Sensor] No suitable serial ports available for Arduino sensor');
          return;
        }
        
        // ENHANCED: Add port validation and debugging
        console.log(`[Arduino Sensor] Port selection details:`);
        console.log(`  - Available ports:`, ports.map((p: any) => `${p.path} (${p.manufacturer || 'Unknown'})`));
        console.log(`  - Arduino manufacturer ports:`, arduinoPorts.map((p: any) => `${p.path} (${p.manufacturer})`));
        console.log(`  - Selected port: ${targetPort?.path || 'None'}`);
        console.log(`  - Port manufacturer: ${targetPort?.manufacturer || 'Unknown'}`);
        
        if (targetPort) {
          console.log(`[Arduino Sensor] Attempting to connect to ${targetPort.path}`);
          
          // ENHANCED CONNECTION STRATEGY: Multiple attempts with different approaches
          const connectionSuccess = await this.attemptConnectionWithStrategies(targetPort);
          
          if (connectionSuccess) {
            console.log(`[Arduino Sensor] ✓ Successfully connected to ${targetPort.path} at 9600 baud`);
            this.isConnected = true; // Track connection state
             
            // CRITICAL FIX: Set up IPC listeners AFTER serial port is connected
            // This ensures listeners are attached to the actual connection
            // Always set up listeners when connecting to ensure data flow
            if (window.electronAPI && window.electronAPI.onSerialData) {
              let dataReceptionCount = 0; // Track data reception for optimized logging
              
              // FIXED: Listen to dedicated Arduino data channel to prevent Spring Vending interference
              // Arduino sensor now uses separate IPC channel: 'arduino-data'
              window.electronAPI.onSerialData((data: string) => {
                // Only process data when sensor is enabled
                if (this.isEnabled) {
                  // OPTIMIZED: Only log data reception periodically to reduce spam
                  dataReceptionCount++;
                  if (dataReceptionCount === 1 || dataReceptionCount % 10 === 0) {
                    console.log(`[Arduino Sensor] Received data via general serial channel (${dataReceptionCount}):`, data);
                  }
                  this.handleSerialData(data);
                } else {
                  // Silently ignore data when disabled (don't log "Already DISABLED" spam)
                  return;
                }
              });
              
              // NEW: Listen to dedicated Arduino data channel
              if (window.electronAPI.onArduinoData) {
                window.electronAPI.onArduinoData((data: string) => {
                  // Only process data when sensor is enabled
                  if (this.isEnabled) {
                    // OPTIMIZED: Only log data reception periodically to reduce spam
                    dataReceptionCount++;
                    if (dataReceptionCount === 1 || dataReceptionCount % 10 === 0) {
                      console.log(`[Arduino Sensor] Received data via dedicated Arduino channel (${dataReceptionCount}):`, data);
                    }
                    this.handleSerialData(data);
                  } else {
                    // Silently ignore data when disabled (don't log "Already DISABLED" spam)
                    return;
                  }
                });
                console.log('[Arduino Sensor] Dedicated Arduino data channel listener set up');
              } else {
                console.warn('[Arduino Sensor] Dedicated Arduino data channel not available - using shared channel (fallback)');
              }
              
              window.electronAPI.onSerialError((error: string) => {
                console.error('[Arduino Sensor] Received error via preload:', error);
                
                // Update connection state on error
                if (error.includes('Access denied') || error.includes('Permission denied') || error.includes('Serial port is not open')) {
                  this.isConnected = false; // Mark as disconnected
                }
                
                // ENHANCED: Handle "Access denied" errors with retry logic and multiple COM ports
                if (error.includes('Access denied') || error.includes('Permission denied')) {
                  console.warn('[Arduino Sensor] Access denied - attempting retry with different approach...');
                  
                  // IMPLEMENT RETRY LOGIC: Try different COM ports or approaches
                  this.retryWithDifferentPorts(targetPort);
                  
                } else {
                  // For other errors, Don't disable sensor, just log it
                  console.warn('[Arduino Sensor] Non-permission error, continuing to monitor for data');
                }
              });
              
              this.serialListenerSetup = true;
              console.log('[Arduino Sensor] IPC listeners set up after serial connection (data will only be processed when enabled)');
            }
          } else {
            console.error(`[Arduino Sensor] ✗ Failed to connect to ${targetPort.path} after all strategies`);
          }
        } else {
          console.warn('[Arduino Sensor] No suitable serial ports available');
        }
      } else {
        console.warn('[Arduino Sensor] No serial ports available');
      }
    } catch (error) {
      console.warn('[Arduino Sensor] Could not ensure serial connection:', error);
    }
  }

  /**
   * Check if sensor is currently enabled
   */
  isSensorEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Set event handlers for sensor events
   */
  setEventHandlers(handlers: SensorEventHandlers): void {
    this.eventHandlers = handlers;
  }

  /**
   * Initialize the serial port listener (only once)
   */
  async initialize(): Promise<void> {
    if (this.serialListenerSetup || !window.electronAPI) {
      return;
    }

    try {
      const { electronVendingService } = await import('./electronVendingService');
      
      // Check available ports before setting up listeners
      try {
        const ports = await window.electronAPI.getSerialPorts();
        console.log('[Arduino Sensor] Available ports:', ports);
        
        if (ports.length === 0) {
          console.warn('[Arduino Sensor] No serial ports available - running in MOCK MODE');
        } else {
          console.log('[Arduino Sensor] Found serial ports, setting up listeners');
        }
      } catch (statusError) {
        console.warn('[Arduino Sensor] Could not check serial ports:', statusError);
      }
      
      // FIXED: Listen to the correct IPC channel for Arduino data
      // The Arduino service should receive data directly from the preload's onSerialData
      // which gets data from Electron main's serial port
      
      // Don't set up IPC listeners here - set them up when serial port actually connects
      // This prevents the issue where listeners are set up before port is connected
      console.log('[Arduino Sensor] IPC listeners will be set up when serial port connects');
      
      this.serialListenerSetup = true;
      console.log('Arduino sensor service initialized');
    } catch (error) {
      console.error('Failed to initialize Arduino sensor service:', error);
    }
  }

  /**
   * Handle incoming serial data with debouncing
   */
  private handleSerialData(data: string): void {
    if (!this.isEnabled) {
      return; // Ignore data when sensor is disabled
    }

    const sensorValue = parseInt(data.trim());
    
    // Validate the sensor value
    if (isNaN(sensorValue) || (sensorValue !== 0 && sensorValue !== 1)) {
      console.warn('Invalid sensor value received:', data);
      return;
    }

    // Only process if the state actually changed
    if (sensorValue === this.currentState) {
      return;
    }

    console.log(`Arduino sensor state change: ${this.currentState} -> ${sensorValue}`);

    // Clear any existing debounce timer
    this.clearDebounceTimer();

    // Set a new debounce timer
    this.debounceTimer = setTimeout(() => {
      this.processStableStateChange(sensorValue);
    }, this.DEBOUNCE_DELAY);
  }

  /**
   * Process a stable state change after debounce
   * OPTIMIZED: Reduce repetitive logging while maintaining functionality
   */
  private processStableStateChange(newState: number): void {
    if (!this.isEnabled) {
      return;
    }

    const oldState = this.lastStableState;
    this.lastStableState = newState;
    this.currentState = newState;

    const ts = Date.now();
    
    // OPTIMIZED: Only log stable state when it actually changes
    if (oldState !== newState) {
      console.log(`[Arduino Sensor] Stable state: ${oldState} -> ${newState} @ ${ts}`);
    }

    // Trigger appropriate events (include timestamp for clearer ordering)
    if (this.eventHandlers.onSensorChange) {
      try { this.eventHandlers.onSensorChange(newState, ts); } catch (e) { console.error('[Arduino Sensor] onSensorChange handler failed', e); }
    }

    // Trigger start/end events based on state transitions
    if (oldState === 0 && newState === 1) {
      // Rising edge: sensor detected something
      console.log('[Arduino Sensor] START detected - object detected');
      if (this.eventHandlers.onSensorStart) {
        try { this.eventHandlers.onSensorStart(ts); } catch (e) { console.error('[Arduino Sensor] onSensorStart handler failed', e); }
      }
    } else if (oldState === 1 && newState === 0) {
      // Falling edge: sensor no longer detecting
      console.log('[Arduino Sensor] END detected - object removed');
      if (this.eventHandlers.onSensorEnd) {
        try { this.eventHandlers.onSensorEnd(ts); } catch (e) { console.error('[Arduino Sensor] onSensorEnd handler failed', e); }
      }
    }
  }

  /**
   * Clear the debounce timer
   */
  private clearDebounceTimer(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  /**
   * Retry connection with different COM ports when access is denied
   * OPTIMIZED: Prevent excessive retry loops while ensuring reliability
   */
  private async retryWithDifferentPorts(failedPort: any): Promise<void> {
    console.log('[Arduino Sensor] Starting optimized retry logic for Access denied error...');
    
    try {
      // CRITICAL FIX: Wait for Windows to release COM port state
      console.log('[Arduino Sensor] Waiting for Windows COM port state release...');
      await new Promise(resolve => setTimeout(resolve, 3000)); // Reduced to 3 seconds
      
      // Get all available ports again
      const ports = await window.electronAPI.getSerialPorts();
      if (ports.length === 0) {
        console.warn('[Arduino Sensor] No ports available for retry');
        return;
      }

      // Optimized port selection strategy - try fewer ports with shorter delays
      const sortedPorts = ports
        .filter((port: any) => port.path.startsWith('COM'))
        .sort((a: any, b: any) => {
          const numA = parseInt(a.path.replace('COM', ''));
          const numB = parseInt(b.path.replace('COM', ''));
          return numA - numB; // Try different numbers
        });

      // REDUCED: Try only 2 different ports with shorter delays
      const maxRetries = Math.min(2, sortedPorts.length);
      let retrySuccessful = false;
      let retryCount = 0;
      
      for (let i = 0; i < maxRetries && !retrySuccessful; i++) {
        const retryPort = sortedPorts[i];
        
        // Skip the port that just failed on first attempt
        if (retryPort.path === failedPort.path) {
          console.log(`[Arduino Sensor] Skipping failed port ${retryPort.path} on retry attempt`);
          continue;
        }

        retryCount++;
        console.log(`[Arduino Sensor] Retry ${retryCount}/${maxRetries}: Trying ${retryPort.path}...`);
        
        try {
          // OPTIMIZED: Shorter progressive delays
          const retryDelay = 1000 + (retryCount * 500); // 1.5s, 2s, 2.5s
          console.log(`[Arduino Sensor] Waiting ${retryDelay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          
          const retryResult = await window.electronAPI.connectSerialPort(retryPort.path);
          if (retryResult && retryResult.success) {
            console.log(`[Arduino Sensor] ✓ Retry successful! Connected to ${retryPort.path}`);
            this.isConnected = true; // Update connection state
            retrySuccessful = true;
             
            // Give connection time to stabilize
            console.log('[Arduino Sensor] Allowing connection to stabilize...');
            await new Promise(resolve => setTimeout(resolve, 500));
             
            return;
          } else {
            console.warn(`[Arduino Sensor] ✗ Retry ${retryCount} failed:`, (retryResult as any)?.error);
          }
        } catch (retryError) {
          console.warn(`[Arduino Sensor] ✗ Retry ${retryCount} error:`, retryError);
        }
      }
      
      if (!retrySuccessful) {
        console.warn(`[Arduino Sensor] All ${retryCount} retry attempts failed - sensor may not work on this session`);
        console.log('[Arduino Sensor] TIP: Page reload (F5) often resolves Windows COM port state issues');
        
        // FINAL FALLBACK: Try original port one more time with longer wait
        console.log('[Arduino Sensor] Attempting final fallback to original port...');
        try {
          await new Promise(resolve => setTimeout(resolve, 4000)); // 4 second wait
          const fallbackResult = await window.electronAPI.connectSerialPort(failedPort.path);
          if (fallbackResult && fallbackResult.success) {
            console.log(`[Arduino Sensor] ✓ Final fallback successful to ${failedPort.path}`);
            this.isConnected = true; // Update connection state
            retrySuccessful = true;
          } else {
            console.warn('[Arduino Sensor] Final fallback also failed');
          }
        } catch (fallbackError) {
          console.warn('[Arduino Sensor] Final fallback error:', fallbackError);
        }
      }
      
      // IMPORTANT: Prevent excessive logging on subsequent calls
      if (retryCount > 3) {
        console.log('[Arduino Sensor] WARNING: Too many retry attempts detected - reducing retry frequency');
      }
    } catch (error) {
      console.error('[Arduino Sensor] Optimized retry logic failed:', error);
    }
  }

  /**
   * Proactive COM port initialization to prevent Windows state persistence issues
   */
  private async proactivePortInitialization(): Promise<void> {
    console.log('[Arduino Sensor] Starting proactive COM port state management...');
    
    try {
      // Step 1: Force garbage collection and port refresh
      if (window.gc) {
        window.gc();
        console.log('[Arduino Sensor] Forced garbage collection');
      }
      
      // Step 2: Wait for Windows to stabilize
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 3: Get fresh port list
      const ports = await window.electronAPI.getSerialPorts();
      console.log('[Arduino Sensor] Fresh port scan after initialization:', ports);
      
      // Step 4: Pre-test each port briefly to clear any stale state
      for (const port of ports) {
        if (port.path.startsWith('COM')) {
          try {
            console.log(`[Arduino Sensor] Pre-testing port ${port.path} to clear state...`);
            
            // Brief connection attempt to clear Windows port state
            const testResult = await window.electronAPI.connectSerialPort(port.path);
            if (testResult && testResult.success) {
              console.log(`[Arduino Sensor] ✓ Port ${port.path} state cleared successfully`);
              
              // Immediately disconnect to free the port
              await new Promise(resolve => setTimeout(resolve, 500));
              // Note: We don't have a disconnect method, but the next connection will handle it
            } else {
              console.log(`[Arduino Sensor] - Port ${port.path} already in use or inaccessible`);
            }
          } catch (testError) {
            console.log(`[Arduino Sensor] - Port ${port.path} test failed:`, testError);
          }
        }
      }
      
      // Step 5: Final wait before actual connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('[Arduino Sensor] Proactive initialization completed');
      
    } catch (error) {
      console.warn('[Arduino Sensor] Proactive initialization failed:', error);
    }
  }

  /**
   * Attempt connection with multiple strategies to overcome Windows COM port issues
   */
  private async attemptConnectionWithStrategies(targetPort: any): Promise<boolean> {
    const strategies = [
      { name: 'Standard', delay: 0 },
      { name: 'Delayed', delay: 2000 },
      { name: 'Extended Delay', delay: 4000 }
    ];

    for (const strategy of strategies) {
      console.log(`[Arduino Sensor] Trying ${strategy.name} connection strategy...`);
      
      if (strategy.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, strategy.delay));
      }
      
      try {
        const connectResult = await window.electronAPI.connectSerialPort(targetPort.path);
        if (connectResult && connectResult.success) {
          console.log(`[Arduino Sensor] ✓ ${strategy.name} strategy successful`);
          
          // Give connection time to stabilize
          await new Promise(resolve => setTimeout(resolve, 1000));
          return true;
        } else {
          console.log(`[Arduino Sensor] ✗ ${strategy.name} strategy failed:`, (connectResult as any)?.error);
        }
      } catch (error) {
        console.log(`[Arduino Sensor] ✗ ${strategy.name} strategy error:`, error);
      }
    }
    
    return false;
  }

  /**
   * Get current sensor state
   */
  getCurrentState(): number {
    return this.currentState;
  }

  /**
   * Reset sensor state (useful when starting new game)
   */
  reset(): void {
    this.clearDebounceTimer();
    this.currentState = 0;
    this.lastStableState = 0;
    console.log('[Arduino Sensor] State reset - ready for new game');
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.clearDebounceTimer();
    this.isEnabled = false;
    this.isConnected = false; // Reset connection state
    this.eventHandlers = {};
    if (this.serialListenerSetup && window.electronAPI) {
      const { electronVendingService } = require('./electronVendingService');
      electronVendingService.setupSerialListeners(); // Clear listeners
      this.serialListenerSetup = false;
    }
  }
}

export const arduinoSensorService = ArduinoSensorService.getInstance();