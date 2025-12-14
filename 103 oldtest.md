(index):64 cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation
(anonymous) @ (index):64
index-n4SbO8kJ.js:49 Arduino sensor DISABLED
index-n4SbO8kJ.js:49 Arduino sensor service initialized
index-n4SbO8kJ.js:49 Arduino sensor DISABLED
index-n4SbO8kJ.js:54 Sync queue is empty.
index-n4SbO8kJ.js:49 Arduino sensor DISABLED
index-n4SbO8kJ.js:54 Setting up Arduino sensor service...
index-n4SbO8kJ.js:49 Arduino sensor ENABLED
index-n4SbO8kJ.js:49 Arduino sensor state reset
index-n4SbO8kJ.js:49 Arduino sensor ENABLED
index-n4SbO8kJ.js:49 Arduino sensor state reset
index-n4SbO8kJ.js:49 Arduino sensor ENABLED
index-n4SbO8kJ.js:54 [GAME SCREEN] Game ended with time: 16092ms
index-n4SbO8kJ.js:54 [VENDING SERVICE] Attempting TCN hardware dispense for silver tier
index-n4SbO8kJ.js:54 [VENDING SERVICE] TCN not connected, attempting auto-connect...
index-n4SbO8kJ.js:50 [TCN SERIAL] Starting auto-detection...
index-n4SbO8kJ.js:50 [TCN SERIAL] Available ports: (3) [{…}, {…}, {…}]
index-n4SbO8kJ.js:50 [TCN SERIAL] Trying port: COM3
index-n4SbO8kJ.js:50 [TCN SERIAL] Connecting to COM3 at 115200 baud...
index-n4SbO8kJ.js:49 [TCN SERIAL MOCK] Mock serial port created: {path: 'COM3', baudRate: 115200, dataBits: 8, parity: 'none', stopBits: 1, …}
index-n4SbO8kJ.js:49 [TCN SERIAL MOCK] Mock parser created: {delimiter: '\r\n'}
index-n4SbO8kJ.js:54 
        
        
       GET https://vendinghanger.eeelab.xyz/api_endpoints_for_server.php/prizes?check=1&time=16110 404 (Not Found)
request @ index-n4SbO8kJ.js:54
checkPrizeEligibility @ index-n4SbO8kJ.js:54
uy @ index-n4SbO8kJ.js:54
(anonymous) @ index-n4SbO8kJ.js:54
(anonymous) @ index-n4SbO8kJ.js:54
x @ index-n4SbO8kJ.js:54
Ir @ index-n4SbO8kJ.js:48
(anonymous) @ index-n4SbO8kJ.js:48
Fs @ index-n4SbO8kJ.js:48
$c @ index-n4SbO8kJ.js:48
fs @ index-n4SbO8kJ.js:49
y0 @ index-n4SbO8kJ.js:49
index-n4SbO8kJ.js:54 API request failed: Error: Endpoint not found
    at P0.request (index-n4SbO8kJ.js:54:17828)
    at async uy (index-n4SbO8kJ.js:54:21011)
    at async index-n4SbO8kJ.js:54:22588
request @ index-n4SbO8kJ.js:54
await in request (async)
checkPrizeEligibility @ index-n4SbO8kJ.js:54
uy @ index-n4SbO8kJ.js:54
(anonymous) @ index-n4SbO8kJ.js:54
(anonymous) @ index-n4SbO8kJ.js:54
x @ index-n4SbO8kJ.js:54
Ir @ index-n4SbO8kJ.js:48
(anonymous) @ index-n4SbO8kJ.js:48
Fs @ index-n4SbO8kJ.js:48
$c @ index-n4SbO8kJ.js:48
fs @ index-n4SbO8kJ.js:49
y0 @ index-n4SbO8kJ.js:49
index-n4SbO8kJ.js:54 Failed to check prize eligibility from API, using fallback: Error: Endpoint not found
    at P0.request (index-n4SbO8kJ.js:54:17828)
    at async uy (index-n4SbO8kJ.js:54:21011)
    at async index-n4SbO8kJ.js:54:22588
uy @ index-n4SbO8kJ.js:54
await in uy (async)
(anonymous) @ index-n4SbO8kJ.js:54
(anonymous) @ index-n4SbO8kJ.js:54
x @ index-n4SbO8kJ.js:54
Ir @ index-n4SbO8kJ.js:48
(anonymous) @ index-n4SbO8kJ.js:48
Fs @ index-n4SbO8kJ.js:48
$c @ index-n4SbO8kJ.js:48
fs @ index-n4SbO8kJ.js:49
y0 @ index-n4SbO8kJ.js:49
index-n4SbO8kJ.js:54 Time of 16110ms qualifies for Bronze Prize (fallback mode).
index-n4SbO8kJ.js:54 Attempting to dispense from slot 3.
index-n4SbO8kJ.js:49 [ELECTRON VENDING] Preparing to send command for slot 3...
index-n4SbO8kJ.js:49 [ELECTRON VENDING] Found available silver channel 1 with capacity
index-n4SbO8kJ.js:49 [ELECTRON VENDING] Selected silver channel 1 with capacity tracking
index-n4SbO8kJ.js:49 [ELECTRON VENDING] Command (HEX): 00 FF 01 FE AA 55
index-n4SbO8kJ.js:49 [ELECTRON VENDING] Command sent successfully to slot 1
index-n4SbO8kJ.js:49 [ELECTRON VENDING] Dispensed from silver channel 1 - 1 remaining
index-n4SbO8kJ.js:54 [PRIZE SERVICE] Vending for Bronze Prize initiated (fallback).
index-n4SbO8kJ.js:51 [TCN SERIAL] Connected to COM3
index-n4SbO8kJ.js:49 [TCN SERIAL MOCK] Event listener added: error
index-n4SbO8kJ.js:49 [TCN SERIAL MOCK] Event listener added: close
index-n4SbO8kJ.js:51 [TCN SERIAL] Testing connection...
index-n4SbO8kJ.js:49 [TCN SERIAL MOCK] Writing: STATUS

index-n4SbO8kJ.js:54 [TCN SERIAL] Sent: STATUS
index-n4SbO8kJ.js:52 [TCN SERIAL] Connection test successful
index-n4SbO8kJ.js:50 [TCN SERIAL] Successfully connected to COM3
index-n4SbO8kJ.js:49 [TCN SERIAL MOCK] Writing: STATUS 1

index-n4SbO8kJ.js:54 [TCN SERIAL] Sent: STATUS 1
index-n4SbO8kJ.js:52 [TCN SERIAL] Dispensing from channel 1
index-n4SbO8kJ.js:49 [TCN SERIAL MOCK] Writing: DISPENSE 1

index-n4SbO8kJ.js:54 [TCN SERIAL] Sent: DISPENSE 1
index-n4SbO8kJ.js:53 [TCN SERIAL] Dispense command sent to channel 1
index-n4SbO8kJ.js:49 Arduino sensor DISABLED
index-n4SbO8kJ.js:49 Arduino sensor DISABLED
index-n4SbO8kJ.js:51 [TCN SERIAL] Received: STATUS: OK
index-n4SbO8kJ.js:54 [VENDING SERVICE] TCN hardware dispense failed: Dispense timeout
X0 @ index-n4SbO8kJ.js:54
await in X0 (async)
x @ index-n4SbO8kJ.js:54
Ir @ index-n4SbO8kJ.js:48
(anonymous) @ index-n4SbO8kJ.js:48
Fs @ index-n4SbO8kJ.js:48
$c @ index-n4SbO8kJ.js:48
fs @ index-n4SbO8kJ.js:49
y0 @ index-n4SbO8kJ.js:49
index-n4SbO8kJ.js:49 Arduino sensor DISABLED
index-n4SbO8kJ.js:49 Arduino sensor DISABLED
index-n4SbO8kJ.js:49 Arduino sensor DISABLED
index-n4SbO8kJ.js:49 Arduino sensor DISABLED
index-n4SbO8kJ.js:54 Setting up Arduino sensor service...
index-n4SbO8kJ.js:49 Arduino sensor ENABLED
index-n4SbO8kJ.js:49 Arduino sensor state reset
index-n4SbO8kJ.js:49 Arduino sensor ENABLED
index-n4SbO8kJ.js:49 Arduino sensor state reset
index-n4SbO8kJ.js:49 Arduino sensor ENABLED
index-n4SbO8kJ.js:54 [GAME SCREEN] Game ended with time: 16456ms
index-n4SbO8kJ.js:54 [VENDING SERVICE] Attempting TCN hardware dispense for silver tier
index-n4SbO8kJ.js:49 [TCN SERIAL MOCK] Writing: STATUS 1

index-n4SbO8kJ.js:54 [TCN SERIAL] Sent: STATUS 1
index-n4SbO8kJ.js:52 [TCN SERIAL] Dispensing from channel 1
index-n4SbO8kJ.js:49 [TCN SERIAL MOCK] Writing: DISPENSE 1

index-n4SbO8kJ.js:54 
        
        
       GET https://vendinghanger.eeelab.xyz/api_endpoints_for_server.php/prizes?check=1&time=16476 404 (Not Found)
request @ index-n4SbO8kJ.js:54
checkPrizeEligibility @ index-n4SbO8kJ.js:54
uy @ index-n4SbO8kJ.js:54
(anonymous) @ index-n4SbO8kJ.js:54
(anonymous) @ index-n4SbO8kJ.js:54
x @ index-n4SbO8kJ.js:54
Ir @ index-n4SbO8kJ.js:48
(anonymous) @ index-n4SbO8kJ.js:48
Fs @ index-n4SbO8kJ.js:48
$c @ index-n4SbO8kJ.js:48
fs @ index-n4SbO8kJ.js:49
y0 @ index-n4SbO8kJ.js:49
index-n4SbO8kJ.js:54 [TCN SERIAL] Sent: DISPENSE 1
index-n4SbO8kJ.js:53 [TCN SERIAL] Dispense command sent to channel 1
index-n4SbO8kJ.js:54 API request failed: Error: Endpoint not found
    at P0.request (index-n4SbO8kJ.js:54:17828)
    at async uy (index-n4SbO8kJ.js:54:21011)
    at async index-n4SbO8kJ.js:54:22588
request @ index-n4SbO8kJ.js:54
await in request (async)
checkPrizeEligibility @ index-n4SbO8kJ.js:54
uy @ index-n4SbO8kJ.js:54
(anonymous) @ index-n4SbO8kJ.js:54
(anonymous) @ index-n4SbO8kJ.js:54
x @ index-n4SbO8kJ.js:54
Ir @ index-n4SbO8kJ.js:48
(anonymous) @ index-n4SbO8kJ.js:48
Fs @ index-n4SbO8kJ.js:48
$c @ index-n4SbO8kJ.js:48
fs @ index-n4SbO8kJ.js:49
y0 @ index-n4SbO8kJ.js:49
index-n4SbO8kJ.js:54 Failed to check prize eligibility from API, using fallback: Error: Endpoint not found
    at P0.request (index-n4SbO8kJ.js:54:17828)
    at async uy (index-n4SbO8kJ.js:54:21011)
    at async index-n4SbO8kJ.js:54:22588
uy @ index-n4SbO8kJ.js:54
await in uy (async)
(anonymous) @ index-n4SbO8kJ.js:54
(anonymous) @ index-n4SbO8kJ.js:54
x @ index-n4SbO8kJ.js:54
Ir @ index-n4SbO8kJ.js:48
(anonymous) @ index-n4SbO8kJ.js:48
Fs @ index-n4SbO8kJ.js:48
$c @ index-n4SbO8kJ.js:48
fs @ index-n4SbO8kJ.js:49
y0 @ index-n4SbO8kJ.js:49
index-n4SbO8kJ.js:54 Time of 16476ms qualifies for Bronze Prize (fallback mode).
index-n4SbO8kJ.js:54 Attempting to dispense from slot 3.
index-n4SbO8kJ.js:49 [ELECTRON VENDING] Preparing to send command for slot 3...
index-n4SbO8kJ.js:49 [ELECTRON VENDING] Found available silver channel 2 with capacity
index-n4SbO8kJ.js:49 [ELECTRON VENDING] Selected silver channel 2 with capacity tracking
index-n4SbO8kJ.js:49 [ELECTRON VENDING] Command (HEX): 00 FF 02 FD AA 55
index-n4SbO8kJ.js:49 [ELECTRON VENDING] Command sent successfully to slot 2
index-n4SbO8kJ.js:49 [ELECTRON VENDING] Dispensed from silver channel 2 - 1 remaining
index-n4SbO8kJ.js:54 [PRIZE SERVICE] Vending for Bronze Prize initiated (fallback).
index-n4SbO8kJ.js:49 Arduino sensor DISABLED
index-n4SbO8kJ.js:49 Arduino sensor DISABLED
index-n4SbO8kJ.js:54 [VENDING SERVICE] TCN hardware dispense failed: Dispense timeout
X0 @ index-n4SbO8kJ.js:54
await in X0 (async)
x @ index-n4SbO8kJ.js:54
Ir @ index-n4SbO8kJ.js:48
(anonymous) @ index-n4SbO8kJ.js:48
Fs @ index-n4SbO8kJ.js:48
$c @ index-n4SbO8kJ.js:48
fs @ index-n4SbO8kJ.js:49
y0 @ index-n4SbO8kJ.js:49
