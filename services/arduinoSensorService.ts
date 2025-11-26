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
    this.isEnabled = enabled;
    if (!enabled) {
      this.clearDebounceTimer();
    }
    console.log(`Arduino sensor ${enabled ? 'ENABLED' : 'DISABLED'}`);
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
      
      electronVendingService.setupSerialListeners(
        (data: string) => {
          this.handleSerialData(data);
        },
        (error: string) => {
          console.error('Arduino sensor error:', error);
        }
      );
      
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
   */
  private processStableStateChange(newState: number): void {
    if (!this.isEnabled) {
      return;
    }

    const oldState = this.lastStableState;
    this.lastStableState = newState;
    this.currentState = newState;

    const ts = Date.now();
    console.log(`Stable sensor state: ${oldState} -> ${newState} @ ${ts}`);

    // Trigger appropriate events (include timestamp for clearer ordering)
    if (this.eventHandlers.onSensorChange) {
      try { this.eventHandlers.onSensorChange(newState, ts); } catch (e) { console.error('onSensorChange handler failed', e); }
    }

    // Trigger start/end events based on state transitions
    if (oldState === 0 && newState === 1) {
      // Rising edge: sensor detected something
      console.log('Arduino sensor START detected');
      if (this.eventHandlers.onSensorStart) {
        try { this.eventHandlers.onSensorStart(ts); } catch (e) { console.error('onSensorStart handler failed', e); }
      }
    } else if (oldState === 1 && newState === 0) {
      // Falling edge: sensor no longer detecting
      console.log('Arduino sensor END detected');
      if (this.eventHandlers.onSensorEnd) {
        try { this.eventHandlers.onSensorEnd(ts); } catch (e) { console.error('onSensorEnd handler failed', e); }
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
    console.log('Arduino sensor state reset');
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.clearDebounceTimer();
    this.isEnabled = false;
    this.eventHandlers = {};
    if (this.serialListenerSetup && window.electronAPI) {
      const { electronVendingService } = require('./electronVendingService');
      electronVendingService.setupSerialListeners(); // Clear listeners
      this.serialListenerSetup = false;
    }
  }
}

export const arduinoSensorService = ArduinoSensorService.getInstance();