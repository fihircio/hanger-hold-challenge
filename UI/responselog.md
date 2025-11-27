[TCN SERIAL] serialport not available, using MockSerialPort
index-QJah_dB5.js:50 [TCN SERIAL] Mode: MOCK
index-QJah_dB5.js:53 [TCN INTEGRATION] Initialized with 2 gold, 42 silver slots
index-QJah_dB5.js:53 [INVENTORY STORAGE] Database not initialized, attempting to initialize...
index-QJah_dB5.js:53 [INVENTORY STORAGE] Initializing database...
index-QJah_dB5.js:53 [TCN INTEGRATION] Initializing complete vending system...
index-QJah_dB5.js:53 [INVENTORY STORAGE] Initializing database...
index-QJah_dB5.js:49 Arduino sensor DISABLED
index-QJah_dB5.js:49 Arduino sensor service initialized
2
index-QJah_dB5.js:53 [INVENTORY STORAGE] Database initialized successfully
2
index-QJah_dB5.js:53 [TCN INTEGRATION] Loaded 44 slot records from storage
index-QJah_dB5.js:53 [TCN INTEGRATION] Step 1: Connecting to TCN hardware...
index-QJah_dB5.js:50 === TCN SERIAL AUTO-CONNECT ===
index-QJah_dB5.js:50 [TCN SERIAL] MODE: MOCK
index-QJah_dB5.js:50 [TCN SERIAL] Starting auto-detection...
index-QJah_dB5.js:50 [TCN SERIAL] Found 3 available ports: 
Array(3)
index-QJah_dB5.js:50 [TCN SERIAL] Serial implementation: NATIVE
index-QJah_dB5.js:50 [TCN SERIAL] Analyzing ports for TCN compatibility...
index-QJah_dB5.js:50 [TCN SERIAL] Port COM3: manufacturer="prolific", pnpId="N/A"
index-QJah_dB5.js:50 [TCN SERIAL] Port COM3: USB=true, COM=true, Unix=false, TCN=true
index-QJah_dB5.js:50 [TCN SERIAL] Port COM4: manufacturer="ch340", pnpId="N/A"
index-QJah_dB5.js:50 [TCN SERIAL] Port COM4: USB=true, COM=true, Unix=false, TCN=true
index-QJah_dB5.js:50 [TCN SERIAL] Port COM5: manufacturer="ftdi", pnpId="N/A"
index-QJah_dB5.js:50 [TCN SERIAL] Port COM5: USB=true, COM=true, Unix=false, TCN=true
index-QJah_dB5.js:50 [TCN SERIAL] Trying port: COM3 (manufacturer=Prolific)
index-QJah_dB5.js:50 [TCN SERIAL] Connecting to COM3 at 115200 baud... (mode=MOCK)
index-QJah_dB5.js:49 [TCN SERIAL MOCK] Mock serial port created: 
Object
index-QJah_dB5.js:49 [TCN SERIAL MOCK] Mock parser created: 
Object
index-QJah_dB5.js:51 [TCN SERIAL] Connected to COM3
index-QJah_dB5.js:51 [TCN SERIAL] Port details: path=undefined, baudRate=undefined
index-QJah_dB5.js:49 [TCN SERIAL MOCK] Event listener added: error
index-QJah_dB5.js:49 [TCN SERIAL MOCK] Event listener added: close
index-QJah_dB5.js:51 [TCN SERIAL] Testing connection...
index-QJah_dB5.js:49 [TCN SERIAL MOCK] Writing: STATUS
index-QJah_dB5.js:53 [TCN SERIAL] Sent: STATUS
index-QJah_dB5.js:52 [TCN SERIAL] Connection test successful
index-QJah_dB5.js:50 [TCN SERIAL] Successfully connected to COM3
index-QJah_dB5.js:53 [TCN INTEGRATION] TCN hardware connected successfully
index-QJah_dB5.js:53 [TCN INTEGRATION] Step 2: Initializing Arduino sensors...
index-QJah_dB5.js:49 Arduino sensor ENABLED
index-QJah_dB5.js:49 Arduino sensor state reset
index-QJah_dB5.js:53 [TCN INTEGRATION] Arduino sensors initialized
index-QJah_dB5.js:53 [TCN INTEGRATION] Integration complete
index-QJah_dB5.js:54 [APP] TCN Integration initialization: SUCCESS
index-QJah_dB5.js:51 [TCN SERIAL] Received: STATUS: OK
index-QJah_dB5.js:53 Sync queue is empty.

[TCN INTEGRATION] Manual gold prize dispensing requested
index-QJah_dB5.js:53 [TCN INTEGRATION] Selected slot 24 for gold tier (count: 4)
index-QJah_dB5.js:53 [TCN INTEGRATION] Manual dispensing from slot 24 for gold tier
index-QJah_dB5.js:52 === TCN CHANNEL DISPENSE ===
index-QJah_dB5.js:52 [TCN SERIAL] Channel: 24
index-QJah_dB5.js:52 [TCN SERIAL] Mode: MOCK
index-QJah_dB5.js:52 [TCN SERIAL] Port type: jn
index-QJah_dB5.js:52 [TCN SERIAL] Constructed HEX command: 00 FF 18 E7 AA 55
index-QJah_dB5.js:49 [TCN SERIAL MOCK] Writing: 00 FF 18 E7 AA 55
index-QJah_dB5.js:53 [TCN SERIAL] Sent: 00 FF 18 E7 AA 55
index-QJah_dB5.js:52 [TCN SERIAL] ✓ TCN HEX command sent to channel 24: 00 FF 18 E7 AA 55
index-QJah_dB5.js:52 [TCN SERIAL] Response time: 55ms
index-QJah_dB5.js:52 [TCN SERIAL] Waiting for dispense result...
index-QJah_dB5.js:52 [TCN SERIAL] Mock mode: simulating dispense result in 1s
index-QJah_dB5.js:53 [TCN INTEGRATION] Manual gold prize dispensed successfully from slot 24
index-QJah_dB5.js:53 [INVENTORY STORAGE] Updated slot 24: 5/5
index-QJah_dB5.js:53 [TCN INTEGRATION] Slot 24 count incremented: 5/5

[TCN INTEGRATION] Manual silver prize dispensing requested
index-QJah_dB5.js:53 [TCN INTEGRATION] Selected slot 15 for silver tier (count: 0)
index-QJah_dB5.js:53 [TCN INTEGRATION] Manual dispensing from slot 15 for silver tier
index-QJah_dB5.js:52 === TCN CHANNEL DISPENSE ===
index-QJah_dB5.js:52 [TCN SERIAL] Channel: 15
index-QJah_dB5.js:52 [TCN SERIAL] Mode: MOCK
index-QJah_dB5.js:52 [TCN SERIAL] Port type: jn
index-QJah_dB5.js:52 [TCN SERIAL] Constructed HEX command: 00 FF 0F F0 AA 55
index-QJah_dB5.js:49 [TCN SERIAL MOCK] Writing: 00 FF 0F F0 AA 55
index-QJah_dB5.js:53 [TCN SERIAL] Sent: 00 FF 0F F0 AA 55
index-QJah_dB5.js:52 [TCN SERIAL] ✓ TCN HEX command sent to channel 15: 00 FF 0F F0 AA 55
index-QJah_dB5.js:52 [TCN SERIAL] Response time: 57ms
index-QJah_dB5.js:52 [TCN SERIAL] Waiting for dispense result...
index-QJah_dB5.js:52 [TCN SERIAL] Mock mode: simulating dispense result in 1s
index-QJah_dB5.js:53 [TCN INTEGRATION] Manual silver prize dispensed successfully from slot 15
index-QJah_dB5.js:53 [INVENTORY STORAGE] Updated slot 15: 1/5
index-QJah_dB5.js:53 [TCN INTEGRATION] Slot 15 count incremented: 1/5

=== TCN CHANNEL DISPENSE ===
index-QJah_dB5.js:52 [TCN SERIAL] Channel: 15
index-QJah_dB5.js:52 [TCN SERIAL] Mode: MOCK
index-QJah_dB5.js:52 [TCN SERIAL] Port type: jn
index-QJah_dB5.js:52 [TCN SERIAL] Constructed HEX command: 00 FF 0F F0 AA 55
index-QJah_dB5.js:49 [TCN SERIAL MOCK] Writing: 00 FF 0F F0 AA 55
index-QJah_dB5.js:53 [TCN SERIAL] Sent: 00 FF 0F F0 AA 55
index-QJah_dB5.js:52 [TCN SERIAL] ✓ TCN HEX command sent to channel 15: 00 FF 0F F0 AA 55
index-QJah_dB5.js:52 [TCN SERIAL] Response time: 57ms
index-QJah_dB5.js:52 [TCN SERIAL] Waiting for dispense result...
index-QJah_dB5.js:52 [TCN SERIAL] Mock mode: simulating dispense result in 1s
index-QJah_dB5.js:53 [TCN INTEGRATION] Manual silver prize dispensed successfully from slot 15
index-QJah_dB5.js:53 [INVENTORY STORAGE] Updated slot 15: 1/5
index-QJah_dB5.js:53 [TCN INTEGRATION] Slot 15 count incremented: 1/5
3index-QJah_dB5.js:49 Arduino sensor DISABLED
index-QJah_dB5.js:53 Setting up Arduino sensor service...
index-QJah_dB5.js:49 Arduino sensor ENABLED
index-QJah_dB5.js:49 Arduino sensor state reset
index-QJah_dB5.js:49 Arduino sensor ENABLED
index-QJah_dB5.js:49 Arduino sensor state reset
index-QJah_dB5.js:49 Arduino sensor ENABLED
index-QJah_dB5.js:54 [HOLD TIMER] end called: {value: 14445, isTimestamp: undefined, computedFromRef: 14445, startTimeRef: 1764216972688, timestamp: 1764216987164}
index-QJah_dB5.js:54 [APP] Game completed with duration: 14445ms
index-QJah_dB5.js:53 [GAME SCREEN] Game ended with time: 14445ms
index-QJah_dB5.js:54 Time of 14445ms qualifies for Silver Prize.
index-QJah_dB5.js:54 Attempting to dispense from slot 1.
index-QJah_dB5.js:53 [TCN INTEGRATION] Handling prize dispensing for game time: 14445ms
index-QJah_dB5.js:53 [TCN INTEGRATION] No prize awarded - game time too short
index-QJah_dB5.js:54 [PRIZE SERVICE] TCN Integration for Silver Prize completed.
index-QJah_dB5.js:53 Submitting score to API: {player_id: 23, time: 14445}
index-QJah_dB5.js:49 Arduino sensor DISABLED
index-QJah_dB5.js:49 Arduino sensor DISABLED