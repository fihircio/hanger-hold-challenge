index-DB7sYWsH.js:50 [TCN SERIAL] CRITICAL: serialport not available, using MockSerialPort
(anonymous) @ index-DB7sYWsH.js:50
index-DB7sYWsH.js:50 [TCN SERIAL] Try: npm rebuild serialport or npx electron-rebuild
(anonymous) @ index-DB7sYWsH.js:50
index-DB7sYWsH.js:50 [TCN SERIAL] Mode: MOCK
index-DB7sYWsH.js:50 [TCN SERIAL] TCN Service initialized with COM1 priority
index-DB7sYWsH.js:53 [TCN INTEGRATION] Initialized with 2 gold, 42 silver slots
index-DB7sYWsH.js:53 [INVENTORY STORAGE] Database not initialized, attempting to initialize...
getAllSlotInventory @ index-DB7sYWsH.js:53
loadSlotData @ index-DB7sYWsH.js:53
ensureCacheValid @ index-DB7sYWsH.js:53
getSlotInventory @ index-DB7sYWsH.js:53
$ @ index-DB7sYWsH.js:53
(anonymous) @ index-DB7sYWsH.js:53
pa @ index-DB7sYWsH.js:48
bf @ index-DB7sYWsH.js:48
xt @ index-DB7sYWsH.js:48
bf @ index-DB7sYWsH.js:48
xt @ index-DB7sYWsH.js:48
bf @ index-DB7sYWsH.js:48
xt @ index-DB7sYWsH.js:48
bf @ index-DB7sYWsH.js:48
xt @ index-DB7sYWsH.js:48
bf @ index-DB7sYWsH.js:48
Kf @ index-DB7sYWsH.js:48
(anonymous) @ index-DB7sYWsH.js:48
Et @ index-DB7sYWsH.js:25
index-DB7sYWsH.js:53 [INVENTORY STORAGE] Initializing database...
index-DB7sYWsH.js:53 [SPRING VENDING] Initializing vending system...
index-DB7sYWsH.js:53 [TCN INTEGRATION] Initializing complete vending system...
index-DB7sYWsH.js:53 [INVENTORY STORAGE] Initializing database...
index-DB7sYWsH.js:49 [Arduino Sensor] Already DISABLED - skipping
index-DB7sYWsH.js:53 [SPRING VENDING] Available ports: [{…}]
index-DB7sYWsH.js:54 [SPRING VENDING] COM priority strategy: Using lower COM ports (COM1-5) for Spring Vending
index-DB7sYWsH.js:54 [SPRING VENDING] All available ports: ['COM6 (Arduino LLC (www.arduino.cc))']
index-DB7sYWsH.js:54 [SPRING VENDING] Filtered likely candidates: []
index-DB7sYWsH.js:54 [SPRING VENDING] No probed port responded. Falling back to first available NON-ARDUINO port.
connectToVendingController @ index-DB7sYWsH.js:54
await in connectToVendingController (async)
initializeVending @ index-DB7sYWsH.js:53
initializeVending @ index-DB7sYWsH.js:54
(anonymous) @ index-DB7sYWsH.js:54
pa @ index-DB7sYWsH.js:48
bf @ index-DB7sYWsH.js:48
xt @ index-DB7sYWsH.js:48
bf @ index-DB7sYWsH.js:48
xt @ index-DB7sYWsH.js:48
bf @ index-DB7sYWsH.js:48
Kf @ index-DB7sYWsH.js:48
(anonymous) @ index-DB7sYWsH.js:48
Et @ index-DB7sYWsH.js:25
index-DB7sYWsH.js:54 [SPRING VENDING] Arduino detected on COM6, no other ports available. Spring Vending falling back to MOCK mode.
connectToVendingController @ index-DB7sYWsH.js:54
await in connectToVendingController (async)
initializeVending @ index-DB7sYWsH.js:53
initializeVending @ index-DB7sYWsH.js:54
(anonymous) @ index-DB7sYWsH.js:54
pa @ index-DB7sYWsH.js:48
bf @ index-DB7sYWsH.js:48
xt @ index-DB7sYWsH.js:48
bf @ index-DB7sYWsH.js:48
xt @ index-DB7sYWsH.js:48
bf @ index-DB7sYWsH.js:48
Kf @ index-DB7sYWsH.js:48
(anonymous) @ index-DB7sYWsH.js:48
Et @ index-DB7sYWsH.js:25
index-DB7sYWsH.js:54 [SPRING VENDING] No suitable serial port found. Spring Vending will operate in MOCK mode.
connectToVendingController @ index-DB7sYWsH.js:54
await in connectToVendingController (async)
initializeVending @ index-DB7sYWsH.js:53
initializeVending @ index-DB7sYWsH.js:54
(anonymous) @ index-DB7sYWsH.js:54
pa @ index-DB7sYWsH.js:48
bf @ index-DB7sYWsH.js:48
xt @ index-DB7sYWsH.js:48
bf @ index-DB7sYWsH.js:48
xt @ index-DB7sYWsH.js:48
bf @ index-DB7sYWsH.js:48
Kf @ index-DB7sYWsH.js:48
(anonymous) @ index-DB7sYWsH.js:48
Et @ index-DB7sYWsH.js:25
index-DB7sYWsH.js:53 [SPRING VENDING] Initialization failed: Error: Failed to connect to vending controller
    at hS.initializeVending (index-DB7sYWsH.js:53:48360)
    at async gS.initializeVending (index-DB7sYWsH.js:54:23890)
initializeVending @ index-DB7sYWsH.js:53
await in initializeVending (async)
initializeVending @ index-DB7sYWsH.js:54
(anonymous) @ index-DB7sYWsH.js:54
pa @ index-DB7sYWsH.js:48
bf @ index-DB7sYWsH.js:48
xt @ index-DB7sYWsH.js:48
bf @ index-DB7sYWsH.js:48
xt @ index-DB7sYWsH.js:48
bf @ index-DB7sYWsH.js:48
Kf @ index-DB7sYWsH.js:48
(anonymous) @ index-DB7sYWsH.js:48
Et @ index-DB7sYWsH.js:25
index-DB7sYWsH.js:54 [APP] Electron Vending Service initialization: FAILED
index-DB7sYWsH.js:49 [Arduino Sensor] Available ports: [{…}]
index-DB7sYWsH.js:49 [Arduino Sensor] Found serial ports, setting up listeners
index-DB7sYWsH.js:49 [Arduino Sensor] IPC listeners will be set up when serial port connects
index-DB7sYWsH.js:49 Arduino sensor service initialized
2index-DB7sYWsH.js:53 [INVENTORY STORAGE] Database initialized successfully
2index-DB7sYWsH.js:53 [TCN INTEGRATION] Loaded 44 slot records from storage
index-DB7sYWsH.js:53 [TCN INTEGRATION] Step 1: Connecting to TCN hardware...
index-DB7sYWsH.js:50 === TCN SERIAL AUTO-CONNECT ===
index-DB7sYWsH.js:50 [TCN SERIAL] MODE: MOCK
index-DB7sYWsH.js:50 [TCN SERIAL] Starting COM1 priority auto-detection...
index-DB7sYWsH.js:50 [TCN SERIAL] CRITICAL: Still in mock mode - serialport package not loading properly
autoConnect @ index-DB7sYWsH.js:50
initialize @ index-DB7sYWsH.js:53
await in initialize (async)
(anonymous) @ index-DB7sYWsH.js:54
pa @ index-DB7sYWsH.js:48
bf @ index-DB7sYWsH.js:48
xt @ index-DB7sYWsH.js:48
bf @ index-DB7sYWsH.js:48
xt @ index-DB7sYWsH.js:48
bf @ index-DB7sYWsH.js:48
Kf @ index-DB7sYWsH.js:48
(anonymous) @ index-DB7sYWsH.js:48
Et @ index-DB7sYWsH.js:25
index-DB7sYWsH.js:50 [TCN SERIAL] Try: npm rebuild serialport or npx electron-rebuild
autoConnect @ index-DB7sYWsH.js:50
initialize @ index-DB7sYWsH.js:53
await in initialize (async)
(anonymous) @ index-DB7sYWsH.js:54
pa @ index-DB7sYWsH.js:48
bf @ index-DB7sYWsH.js:48
xt @ index-DB7sYWsH.js:48
bf @ index-DB7sYWsH.js:48
xt @ index-DB7sYWsH.js:48
bf @ index-DB7sYWsH.js:48
Kf @ index-DB7sYWsH.js:48
(anonymous) @ index-DB7sYWsH.js:48
Et @ index-DB7sYWsH.js:25
index-DB7sYWsH.js:50 [TCN SERIAL] PRODUCTION NOTE: In production, ensure serialport package is properly built
index-DB7sYWsH.js:53 [TCN INTEGRATION] Auto-connect failed, trying COM1 force connection...
initialize @ index-DB7sYWsH.js:53
await in initialize (async)
(anonymous) @ index-DB7sYWsH.js:54
pa @ index-DB7sYWsH.js:48
bf @ index-DB7sYWsH.js:48
xt @ index-DB7sYWsH.js:48
bf @ index-DB7sYWsH.js:48
xt @ index-DB7sYWsH.js:48
bf @ index-DB7sYWsH.js:48
Kf @ index-DB7sYWsH.js:48
(anonymous) @ index-DB7sYWsH.js:48
Et @ index-DB7sYWsH.js:25
index-DB7sYWsH.js:50 [TCN SERIAL] FORCING COM1 CONNECTION...
index-DB7sYWsH.js:50 [TCN SERIAL] Cannot force COM1 - still in mock mode
forceConnectCOM1 @ index-DB7sYWsH.js:50
initialize @ index-DB7sYWsH.js:53
await in initialize (async)
(anonymous) @ index-DB7sYWsH.js:54
pa @ index-DB7sYWsH.js:48
bf @ index-DB7sYWsH.js:48
xt @ index-DB7sYWsH.js:48
bf @ index-DB7sYWsH.js:48
xt @ index-DB7sYWsH.js:48
bf @ index-DB7sYWsH.js:48
Kf @ index-DB7sYWsH.js:48
(anonymous) @ index-DB7sYWsH.js:48
Et @ index-DB7sYWsH.js:25
index-DB7sYWsH.js:53 [TCN INTEGRATION] TCN hardware not available, will use simulation
initialize @ index-DB7sYWsH.js:53
await in initialize (async)
(anonymous) @ index-DB7sYWsH.js:54
pa @ index-DB7sYWsH.js:48
bf @ index-DB7sYWsH.js:48
xt @ index-DB7sYWsH.js:48
bf @ index-DB7sYWsH.js:48
xt @ index-DB7sYWsH.js:48
bf @ index-DB7sYWsH.js:48
Kf @ index-DB7sYWsH.js:48
(anonymous) @ index-DB7sYWsH.js:48
Et @ index-DB7sYWsH.js:25
index-DB7sYWsH.js:53 [TCN INTEGRATION] Step 2: Initializing Arduino sensors...
index-DB7sYWsH.js:53 [TCN INTEGRATION] Arduino sensor service initialized (GameScreen will manage activation)
index-DB7sYWsH.js:53 [TCN INTEGRATION] Integration complete
index-DB7sYWsH.js:54 [APP] TCN Integration initialization: SUCCESS
3index-DB7sYWsH.js:49 [Arduino Sensor] Already DISABLED - skipping
index-DB7sYWsH.js:53 Sync queue is empty.
index-DB7sYWsH.js:53 [GameScreen] Setting up Arduino sensor service...
index-DB7sYWsH.js:49 [Arduino Sensor] State reset - ready for new game
index-DB7sYWsH.js:53 [GameScreen] Arduino sensor service initialized, setting up handlers...
index-DB7sYWsH.js:49 [Arduino Sensor] Already ENABLED - skipping
index-DB7sYWsH.js:53 [GameScreen] Arduino sensor service enabled
index-DB7sYWsH.js:49 [Arduino Sensor] State reset - ready for new game
index-DB7sYWsH.js:53 [GameScreen] Arduino sensor state reset
index-DB7sYWsH.js:49 [Arduino Sensor] Available ports: [{…}]
index-DB7sYWsH.js:49 [Arduino Sensor] Selected Arduino port: COM6 (highest Arduino COM to avoid Spring Vending conflict)
index-DB7sYWsH.js:49 [Arduino Sensor] Attempting to connect to COM6
index-DB7sYWsH.js:49 [Arduino Sensor] Connected to COM6 at 9600 baud
index-DB7sYWsH.js:49 [Arduino Sensor] IPC listeners set up after serial connection (data will only be processed when enabled)
index-DB7sYWsH.js:49 Arduino sensor ENABLED and ready for data
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 1
index-DB7sYWsH.js:49 Arduino sensor state change: 0 -> 1
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 1
index-DB7sYWsH.js:49 Arduino sensor state change: 0 -> 1
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 1
index-DB7sYWsH.js:49 Arduino sensor state change: 0 -> 1
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 1
index-DB7sYWsH.js:49 Arduino sensor state change: 0 -> 1
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 1
index-DB7sYWsH.js:49 Arduino sensor state change: 0 -> 1
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 1
index-DB7sYWsH.js:49 Arduino sensor state change: 0 -> 1
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 1
index-DB7sYWsH.js:49 Arduino sensor state change: 0 -> 1
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 1
index-DB7sYWsH.js:49 Arduino sensor state change: 0 -> 1
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 1
index-DB7sYWsH.js:49 Arduino sensor state change: 0 -> 1
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 1
index-DB7sYWsH.js:49 Arduino sensor state change: 0 -> 1
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 1
index-DB7sYWsH.js:49 Arduino sensor state change: 0 -> 1
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 1
index-DB7sYWsH.js:49 Arduino sensor state change: 0 -> 1
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 1
index-DB7sYWsH.js:49 Arduino sensor state change: 0 -> 1
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 1
index-DB7sYWsH.js:49 Arduino sensor state change: 0 -> 1
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 1
index-DB7sYWsH.js:49 Arduino sensor state change: 0 -> 1
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 1
index-DB7sYWsH.js:49 Arduino sensor state change: 0 -> 1
3index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 [Arduino Sensor] Stable state: 0 -> 1 @ 1765213538318
index-DB7sYWsH.js:53 [GameScreen] Arduino sensor state change: 1 ts= 1765213538318
index-DB7sYWsH.js:53 [GameScreen] Arduino: DETECTION - Object detected by sensor
index-DB7sYWsH.js:49 [Arduino Sensor] START detected - object detected
index-DB7sYWsH.js:53 [GameScreen] Arduino sensor START detected - triggering hold start @ 1765213538318
index-DB7sYWsH.js:49 [Arduino Sensor] Already ENABLED - skipping
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 
index-DB7sYWsH.js:49 Invalid sensor value received: 
handleSerialData @ index-DB7sYWsH.js:49
(anonymous) @ index-DB7sYWsH.js:49
(anonymous) @ VM40:18
emit @ VM39 sandbox_bundle:2
onMessage @ VM39 sandbox_bundle:2
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 
index-DB7sYWsH.js:49 Invalid sensor value received: 
handleSerialData @ index-DB7sYWsH.js:49
(anonymous) @ index-DB7sYWsH.js:49
(anonymous) @ VM40:18
emit @ VM39 sandbox_bundle:2
onMessage @ VM39 sandbox_bundle:2
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 
index-DB7sYWsH.js:49 Invalid sensor value received: 
handleSerialData @ index-DB7sYWsH.js:49
(anonymous) @ index-DB7sYWsH.js:49
(anonymous) @ VM40:18
emit @ VM39 sandbox_bundle:2
onMessage @ VM39 sandbox_bundle:2
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 
index-DB7sYWsH.js:49 Invalid sensor value received: 
handleSerialData @ index-DB7sYWsH.js:49
(anonymous) @ index-DB7sYWsH.js:49
(anonymous) @ VM40:18
emit @ VM39 sandbox_bundle:2
onMessage @ VM39 sandbox_bundle:2
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 0
index-DB7sYWsH.js:49 Arduino sensor state change: 1 -> 0
3index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 1
index-DB7sYWsH.js:49 [Arduino Sensor] Stable state: 1 -> 0 @ 1765213571129
index-DB7sYWsH.js:53 [GameScreen] Arduino sensor state change: 0 ts= 1765213571129
index-DB7sYWsH.js:53 [GameScreen] Arduino: NO DETECTION - Object removed from sensor
index-DB7sYWsH.js:49 [Arduino Sensor] END detected - object removed
index-DB7sYWsH.js:53 [GameScreen] Arduino sensor END detected - triggering hold end @ 1765213571129
index-DB7sYWsH.js:54 [HOLD TIMER] end called: {value: 1765213571129, isTimestamp: true, computedFromRef: 32811, startTimeRef: 1765213538318, timestamp: 1765213571181}
index-DB7sYWsH.js:54 [APP] Game completed with duration: 32811ms - using new Electron Vending Service trigger chain
index-DB7sYWsH.js:54 [PRIZE SERVICE] Using Electron Vending Service as primary trigger for time: 32811ms
index-DB7sYWsH.js:54 [ELECTRON VENDING] Handling prize dispensing for game time: 32811ms, scoreId: score_1765213571181
index-DB7sYWsH.js:54 [ELECTRON VENDING] Game time 32811ms qualifies for silver prize
index-DB7sYWsH.js:54 [ELECTRON VENDING] Selected slot 27 for silver tier (count: 0)
index-DB7sYWsH.js:54 [ELECTRON VENDING] Selected slot 27 for silver prize
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 1
index-DB7sYWsH.js:49 Arduino sensor state change: 0 -> 1
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 1
index-DB7sYWsH.js:49 Arduino sensor state change: 0 -> 1
index-DB7sYWsH.js:53 
        
        
       POST https://vendinghanger.eeelab.xyz/apiendpoints.php/vending/dispense 404 (Not Found)
request @ index-DB7sYWsH.js:53
dispensePrize @ index-DB7sYWsH.js:53
handlePrizeDispensing @ index-DB7sYWsH.js:54
await in handlePrizeDispensing (async)
ES @ index-DB7sYWsH.js:54
(anonymous) @ index-DB7sYWsH.js:54
(anonymous) @ index-DB7sYWsH.js:54
(anonymous) @ index-DB7sYWsH.js:53
setTimeout (async)
onSensorEnd @ index-DB7sYWsH.js:53
processStableStateChange @ index-DB7sYWsH.js:49
(anonymous) @ index-DB7sYWsH.js:49
setTimeout (async)
handleSerialData @ index-DB7sYWsH.js:49
(anonymous) @ index-DB7sYWsH.js:49
(anonymous) @ VM40:18
emit @ VM39 sandbox_bundle:2
onMessage @ VM39 sandbox_bundle:2
index-DB7sYWsH.js:53 API request failed: Error: Score not found
    at uS.request (index-DB7sYWsH.js:53:42465)
    at async gS.handlePrizeDispensing (index-DB7sYWsH.js:54:17619)
    at async ES (index-DB7sYWsH.js:54:30584)
    at async index-DB7sYWsH.js:54:34006
request @ index-DB7sYWsH.js:53
await in request (async)
dispensePrize @ index-DB7sYWsH.js:53
handlePrizeDispensing @ index-DB7sYWsH.js:54
await in handlePrizeDispensing (async)
ES @ index-DB7sYWsH.js:54
(anonymous) @ index-DB7sYWsH.js:54
(anonymous) @ index-DB7sYWsH.js:54
(anonymous) @ index-DB7sYWsH.js:53
setTimeout (async)
onSensorEnd @ index-DB7sYWsH.js:53
processStableStateChange @ index-DB7sYWsH.js:49
(anonymous) @ index-DB7sYWsH.js:49
setTimeout (async)
handleSerialData @ index-DB7sYWsH.js:49
(anonymous) @ index-DB7sYWsH.js:49
(anonymous) @ VM40:18
emit @ VM39 sandbox_bundle:2
onMessage @ VM39 sandbox_bundle:2
index-DB7sYWsH.js:54 [ELECTRON VENDING] API logging failed (will continue with dispensing): Error: Score not found
    at uS.request (index-DB7sYWsH.js:53:42465)
    at async gS.handlePrizeDispensing (index-DB7sYWsH.js:54:17619)
    at async ES (index-DB7sYWsH.js:54:30584)
    at async index-DB7sYWsH.js:54:34006
handlePrizeDispensing @ index-DB7sYWsH.js:54
await in handlePrizeDispensing (async)
ES @ index-DB7sYWsH.js:54
(anonymous) @ index-DB7sYWsH.js:54
(anonymous) @ index-DB7sYWsH.js:54
(anonymous) @ index-DB7sYWsH.js:53
setTimeout (async)
onSensorEnd @ index-DB7sYWsH.js:53
processStableStateChange @ index-DB7sYWsH.js:49
(anonymous) @ index-DB7sYWsH.js:49
setTimeout (async)
handleSerialData @ index-DB7sYWsH.js:49
(anonymous) @ index-DB7sYWsH.js:49
(anonymous) @ VM40:18
emit @ VM39 sandbox_bundle:2
onMessage @ VM39 sandbox_bundle:2
index-DB7sYWsH.js:54 [ELECTRON VENDING] Using Legacy Serial for silver prize dispensing
index-DB7sYWsH.js:54 [ELECTRON VENDING] Constructed HEX command: 00 FF 1B E4 AA 55
index-DB7sYWsH.js:53 [INVENTORY STORAGE] Updated slot 27: 1/5
index-DB7sYWsH.js:54 [ELECTRON VENDING] Slot 27 count incremented for silver tier
index-DB7sYWsH.js:53 [INVENTORY STORAGE] Dispensing log synced successfully
index-DB7sYWsH.js:54 [ELECTRON VENDING] Dispensing logged to both tables: slot=27, tier=silver, success=true
index-DB7sYWsH.js:54 [ELECTRON VENDING] ✓ Legacy Serial successful for silver prize
index-DB7sYWsH.js:54 [PRIZE SERVICE] Electron Vending Service successfully dispensed Silver Prize from slot 27.
index-DB7sYWsH.js:54 
        
        
       POST https://vendinghanger.eeelab.xyz/apiendpoints.php/api/electron-vending/log net::ERR_ABORTED 500 (Internal Server Error)
logDispensingToServer @ index-DB7sYWsH.js:54
await in logDispensingToServer (async)
try @ index-DB7sYWsH.js:54
await in try (async)
handlePrizeDispensing @ index-DB7sYWsH.js:54
await in handlePrizeDispensing (async)
ES @ index-DB7sYWsH.js:54
(anonymous) @ index-DB7sYWsH.js:54
(anonymous) @ index-DB7sYWsH.js:54
(anonymous) @ index-DB7sYWsH.js:53
setTimeout (async)
onSensorEnd @ index-DB7sYWsH.js:53
processStableStateChange @ index-DB7sYWsH.js:49
(anonymous) @ index-DB7sYWsH.js:49
setTimeout (async)
handleSerialData @ index-DB7sYWsH.js:49
(anonymous) @ index-DB7sYWsH.js:49
(anonymous) @ VM40:18
emit @ VM39 sandbox_bundle:2
onMessage @ VM39 sandbox_bundle:2
index-DB7sYWsH.js:53 Submitting score to API: {player_id: 12, time: 32811}
index-DB7sYWsH.js:49 [Arduino Sensor] Received data via preload: 1
index-DB7sYWsH.js:49 Arduino sensor state change: 0 -> 1
index-DB7sYWsH.js:53 [GameScreen] Cleaning up Arduino sensor service...
index-DB7sYWsH.js:49 Arduino sensor DISABLED
index-DB7sYWsH.js:49 [Arduino Sensor] Already DISABLED - skipping
5index-DB7sYWsH.js:49 [Arduino Sensor] Already DISABLED - skipping
index-DB7sYWsH.js:53 [GameScreen] Setting up Arduino sensor service...
index-DB7sYWsH.js:49 [Arduino Sensor] State reset - ready for new game
index-DB7sYWsH.js:53 [GameScreen] Arduino sensor service initialized, setting up handlers...
index-DB7sYWsH.js:49 [Arduino Sensor] Already ENABLED - skipping
index-DB7sYWsH.js:53 [GameScreen] Arduino sensor service enabled
index-DB7sYWsH.js:49 [Arduino Sensor] State reset - ready for new game
index-DB7sYWsH.js:53 [GameScreen] Arduino sensor state reset
index-DB7sYWsH.js:49 [Arduino Sensor] Available ports: [{…}]
index-DB7sYWsH.js:49 [Arduino Sensor] Selected Arduino port: COM6 (highest Arduino COM to avoid Spring Vending conflict)
index-DB7sYWsH.js:49 [Arduino Sensor] Attempting to connect to COM6
index-DB7sYWsH.js:49 [Arduino Sensor] Connected to COM6 at 9600 baud
index-DB7sYWsH.js:49 [Arduino Sensor] IPC listeners set up after serial connection (data will only be processed when enabled)
index-DB7sYWsH.js:49 Arduino sensor ENABLED and ready for data
index-DB7sYWsH.js:49 [Arduino Sensor] Received error via preload: Opening COM6: Access denied
(anonymous) @ index-DB7sYWsH.js:49
(anonymous) @ VM40:21
emit @ VM39 sandbox_bundle:2
onMessage @ VM39 sandbox_bundle:2
index-DB7sYWsH.js:49 [Arduino Sensor] Access denied - attempting retry with different approach...
(anonymous) @ index-DB7sYWsH.js:49
(anonymous) @ VM40:21
emit @ VM39 sandbox_bundle:2
onMessage @ VM39 sandbox_bundle:2
index-DB7sYWsH.js:49 [Arduino Sensor] Starting retry logic for Access denied error...
index-DB7sYWsH.js:49 [Arduino Sensor] Received error via preload: Opening COM6: Access denied
(anonymous) @ index-DB7sYWsH.js:49
(anonymous) @ VM40:21
emit @ VM39 sandbox_bundle:2
onMessage @ VM39 sandbox_bundle:2
index-DB7sYWsH.js:49 [Arduino Sensor] Access denied - attempting retry with different approach...
(anonymous) @ index-DB7sYWsH.js:49
(anonymous) @ VM40:21
emit @ VM39 sandbox_bundle:2
onMessage @ VM39 sandbox_bundle:2
index-DB7sYWsH.js:49 [Arduino Sensor] Starting retry logic for Access denied error...
2index-DB7sYWsH.js:49 [Arduino Sensor] All retry attempts failed