# API and Serial/TCN Response Guide

This document describes the expected API responses (from `https://vendinghanger.eeelab.xyz/apiendpoints.php`) and the TCN/serial status outputs the Electron app exposes. Use this as a checklist when verifying the physical vending PC.

**Contents**
- Expected API endpoints and response shapes
- Expected responses when TCN serial is connected vs not connected
- Quick manual checks to run on the vending PC
- Additional recommendations to add to this guide

---

## 1) Key API endpoints (frontend usage)

All requests are sent to `https://vendinghanger.eeelab.xyz/apiendpoints.php` with a route suffix.

- POST /players
  - Request body: { name: string, email?: string, phone?: string }
  - Response: newly created or existing player object:
    {
      id: number,
      name: string,
      email?: string,
      phone?: string,
      existing?: boolean
    }
  - Notes: frontend expects `id` to be returned.

- GET /players?id={id}
  - Used to fetch a single player. The app calls `/players?id=23`.
  - Response: { id, name, email, phone }

- POST /scores
  - Request body: { player_id: number, time: number }
  - Response: { id, player_id, time, prize?: { ... } }
  - Server validation: `player_id > 0` and `time > 0` required.

- GET /prizes?check=1&time={ms}
  - Request: query contains time in milliseconds
  - Response: { eligible: boolean, prize?: { id, name, message, slot, time_threshold } }

- GET /prizes
  - Response: { prizes: [ { id, name, message, slot, time_threshold, active } ] }

- POST /vending/dispense
  - Request body: { prize_id: number, score_id: number }
  - Response (server):
    {
      success: true|false,
      score_id: number,
      prize_id: number,
      slot: number,
      command: string,
      response: string,
      // server may not return prize_name or log_id; client now treats them optional
    }
  - Frontend expects `success` and `slot` at minimum. `prize_name` and `log_id` are optional.

- GET /vending/status
  - Response: { status: 'operational', recent_logs: [...] }
  - Note: frontend calls `/vending/status` (no `/api` prefix).

- POST /api/inventory/log-dispensing
  - Request body: { slot: number, tier: 'gold'|'silver', success: 1|0, error?: string, timestamp: string, source: string }
  - Response: { success: true, message: string, data: { log_id, slot, tier, success, error, timestamp, source } }

- POST /api/inventory/log-out-of-stock
  - Request body: { tier: 'gold'|'silver', timestamp: string, source: string }
  - Response: { success: true, message: string, data: { log_id, tier, timestamp, source } }

---

## 2) Expected Electron / Maintenance TCN status output

The app exposes an IPC method (`getTcnStatus`) which returns an object describing serial and TCN status. Below are the recommended expected shapes and interpretation.

- When serial/TCN is connected (native mode)

  {
    connected: true,
    mode: 'native',          // 'mock' if using simulated serial
    port: 'COM3',
    baudRate: 115200,
    manufacturer?: 'FTDI' | 'Arduino LLC',
    vendorId?: 'XXXX',
    productId?: 'YYYY',
    lastError: null,
    connectedToTCN: true,   // true when TCN controller responded to handshake
    lastHandshake: '2025-11-26T12:34:56Z'
  }

  - Interpretation: app is connected to a real serial port, and the TCN controller responded to the handshake/identify sequence.
  - Recommended manual check: run a single test dispense from MaintenancePanel and watch for `DISPENSE_SUCCESS` event and a `vending_logs` entry on the server.

- When serial port available but TCN not responding (port open but controller silent)

  {
    connected: true,
    mode: 'native',
    port: 'COM5',
    baudRate: 115200,
    connectedToTCN: false,
    lastError: 'No expected handshake response from controller',
  }

  - Interpretation: cable/port is present but controller likely not powered / wrong baud / wrong cable.
  - Manual checks: verify power to TCN board, confirm correct COM mapping in Device Manager, try alternate baud rates.

- When using mocked serial (no native serialport available or explicitly in simulation)

  {
    connected: false,
    mode: 'mock',
    mockActive: true,
    lastError: null
  }

  - Interpretation: app is simulating dispense outcomes. Good for dev or when hardware absent. The app will still increment slot counts and call the server logging endpoints in simulated flow.

- When no serial ports are present / port failed to open

  {
    connected: false,
    mode: 'native',
    lastError: 'No matching serial ports found' // or 'Failed to open COMx: Access denied'
  }

  - Interpretation: check USB connection, drivers, Device Manager privileges.

---

## 3) Quick checklist to run on the vending PC

- Networking & API
  - From the vending PC, run:

```powershell
# Check vending status
Invoke-RestMethod -Uri "https://vendinghanger.eeelab.xyz/apiendpoints.php/vending/status" -Method GET

# Check prizes eligibility sample
Invoke-RestMethod -Uri "https://vendinghanger.eeelab.xyz/apiendpoints.php/prizes?check=1&time=65000" -Method GET
```

- Serial/Hardware
  - Open the app and go to MaintenancePanel -> `Refresh TCN Status` and confirm `mode` and `connected` fields.
  - If `mode: mock` and you expect hardware, ensure drivers are installed and restart the app.
  - Run a `test dispense` and verify a) the hardware actuates, b) server receives `/api/inventory/log-dispensing` entry.

- Database
  - Connect to MySQL and verify tables exist:

```sql
SHOW TABLES;
SELECT COUNT(*) FROM players;
SELECT COUNT(*) FROM slot_inventory;
SELECT * FROM prizes LIMIT 5;
```

- Logs and files
  - Ensure `spring_vending.log` (if using Spring SDK) is present and writable by web server process.
  - On Windows kiosk, open the app console or set VERBOSE logging to capture serial traces.

---

## 4) Review of `complete_migration.sql` (summary & notes)

I reviewed the uploaded SQL migration. Key points:

- Schema coverage: the migration includes `players`, `scores`, `prizes`, `vending_logs`, `spring_vending_logs`, `slot_inventory`, `dispensing_logs`, and `out_of_stock_logs` — these match the server endpoints used by the app.
- `scores.time` is documented as milliseconds which matches the frontend (use ms throughout).
- `prizes` seeds use `time_threshold` values `60000` and `30000` (ms) which match the PHP `getTimeTier` logic.
- `vending_logs` includes `spring_*` columns for Spring SDK integration and foreign keys to `scores` and `prizes` — good for traceability.

Recommendations / cautions:
- Admin user: the migration inserts an admin user with a password hash. Confirm the hash matches your intended default password; otherwise provide instructions to reset the password (bcrypt) via a small PHP script or SQL update using a known bcrypt string.
- Character sets and permissions: confirm MySQL user has appropriate privileges and default charset `utf8mb4` is supported.
- Indexes: the script has proper indexes for common queries.

---

## 5) Suggested additions to this guide (next steps)

- Add a short Troubleshooting section with exact error strings and recommended actions (e.g., "No handshake from controller" → "Confirm power and check Device Manager COM mapping").
- Add a persistent `last_used_port` preference test: document how to inspect or force a specific COM port from the Maintenance UI.
- Add a step-by-step test plan that a kiosk operator can follow: 1) Power on, 2) Open app, 3) Refresh TCN status, 4) Run test dispense, 5) Check server logs and DB entries. Include expected outputs for each step.
- Add a `VERBOSE_TCN_LOG` toggle and where logs are stored on disk for long-term diagnostics (paths and rotation policy).
- Add example `curl`/PowerShell commands for each endpoint and example request/response payloads to paste into a terminal.

---

If you want, I can:
- Commit the small frontend changes I applied (already done) and push them if you want.
- Add a small PHP snippet to make `/players/{id}` work server-side instead of changing the client.
- Add a `MaintenancePanel` test button that writes the last-used port to disk for persistent testing.

Tell me which follow-ups you'd like and I'll implement them next.