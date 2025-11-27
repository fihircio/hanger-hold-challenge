# COM1 Priority Modification Guide for TCN Serial Service

## Great News! COM1 is Working ✅

Based on your PowerShell results:
- **Line 81**: "COM1 is accessible and can be opened" 
- **Line 11**: COM1 shows as "Communications Port" with 115200 baud rate
- This confirms COM1 is your working TCN controller connection

## Why System Still Uses Mock Mode

Even though COM1 is available, your application stays in mock mode because:
1. The `serialport` npm package fails to load native modules
2. The auto-detection logic doesn't prioritize COM1 properly
3. Mock fallback happens before real port detection

## Solution: Modify TCN Service to Prioritize COM1

### Step 1: Fix the autoConnect Method

Replace the existing `autoConnect` method in [`services/tcnSerialService.ts`](services/tcnSerialService.ts:184-231) with this modified version:

```typescript
/**
 * Auto-detect and connect to TCN vending controller - COM1 Priority Version
 */
async autoConnect(): Promise<boolean> {
  try {
    console.log('[TCN SERIAL] Starting COM1 priority auto-detection...');
    
    // CRITICAL: Force native mode if possible
    if (SerialPort === MockSerialPort) {
      console.error('[TCN SERIAL] CRITICAL: Still in mock mode - serialport package not loading properly');
      console.error('[TCN SERIAL] Try: npm rebuild serialport or npx electron-rebuild');
      return false;
    }
    
    console.log('[TCN SERIAL] Using native serialport implementation');
    
    // Get available serial ports
    const ports = await SerialPort.list();
    console.log('[TCN SERIAL] Available ports:', ports);
    
    // PRIORITY 1: Try COM1 first (your working TCN controller)
    const com1Port = ports.find(port => 
      port.path.toLowerCase().includes('com1') || 
      port.path.toLowerCase() === 'com1'
    );
    
    if (com1Port) {
      console.log('[TCN SERIAL] PRIORITY 1: Found COM1, attempting connection...');
      console.log(`[TCN SERIAL] COM1 Details:`, com1Port);
      const connected = await this.connect('COM1', 115200);
      if (connected) {
        console.log('[TCN SERIAL] ✓ Successfully connected to COM1 (TCN Controller)');
        return true;
      } else {
        console.log('[TCN SERIAL] ✗ Failed to connect to COM1');
      }
    } else {
      console.log('[TCN SERIAL] COM1 not found in port list');
    }
    
    // PRIORITY 2: Look for TCN-compatible USB adapters
    const tcnPorts = ports.filter(port => {
      const mfr = (port.manufacturer || '').toLowerCase();
      const path = (port.path || '').toLowerCase();

      return (
        mfr.includes('prolific') ||
        mfr.includes('ch340') ||
        mfr.includes('ftdi') ||
        mfr.includes('qinheng') ||
        path.includes('com') && !path.includes('com1') // Exclude COM1 (already tried)
      );
    });

    console.log(`[TCN SERIAL] Found ${tcnPorts.length} TCN-compatible ports:`, tcnPorts);

    // Try each TCN-compatible port
    for (const portInfo of tcnPorts) {
      console.log(`[TCN SERIAL] PRIORITY 2: Trying port: ${portInfo.path} (manufacturer=${portInfo.manufacturer || 'unknown'})`);
      const connected = await this.connect(portInfo.path, 115200);
      if (connected) {
        console.log(`[TCN SERIAL] ✓ Successfully connected to ${portInfo.path}`);
        return true;
      }
    }
    
    // PRIORITY 3: Try any remaining serial ports
    const remainingPorts = ports.filter(port => 
      !port.path.toLowerCase().includes('com1') && 
      !tcnPorts.some(tcnPort => tcnPort.path === port.path)
    );
    
    for (const portInfo of remainingPorts.slice(0, 3)) { // Limit to first 3
      console.log(`[TCN SERIAL] PRIORITY 3: Trying remaining port: ${portInfo.path}`);
      const connected = await this.connect(portInfo.path, 115200);
      if (connected) {
        console.log(`[TCN SERIAL] ✓ Successfully connected to ${portInfo.path}`);
        return true;
      }
    }
    
    console.error('[TCN SERIAL] ✗ Failed to connect to any serial port');
    console.error('[TCN SERIAL] Available ports were:', ports.map(p => p.path));
    return false;
  } catch (error) {
    console.error('[TCN SERIAL] Auto-detection failed:', error);
    return false;
  }
}
```

### Step 2: Add COM1 Force Connection Method

Add this new method to the `TCNSerialService` class:

```typescript
/**
 * Force connection to COM1 (for your specific vending PC setup)
 */
async forceConnectCOM1(): Promise<boolean> {
  try {
    console.log('[TCN SERIAL] FORCING COM1 CONNECTION...');
    
    if (SerialPort === MockSerialPort) {
      console.error('[TCN SERIAL] Cannot force COM1 - still in mock mode');
      return false;
    }
    
    console.log('[TCN SERIAL] Attempting direct COM1 connection...');
    const connected = await this.connect('COM1', 115200);
    
    if (connected) {
      console.log('[TCN SERIAL] ✓ FORCE CONNECTED to COM1 successfully!');
      return true;
    } else {
      console.log('[TCN SERIAL] ✗ Force connection to COM1 failed');
      return false;
    }
  } catch (error) {
    console.error('[TCN SERIAL] Force COM1 connection error:', error);
    return false;
  }
}
```

### Step 3: Modify Constructor to Add COM1 Priority

Update the constructor in [`services/tcnSerialService.ts`](services/tcnSerialService.ts:177-179):

```typescript
constructor() {
  this.initializeEventListeners();
  
  // Add COM1 priority for your vending PC
  console.log('[TCN SERIAL] TCN Service initialized with COM1 priority');
}
```

### Step 4: Update Integration Service

Modify your TCN integration service to use the new priority system. In the integration file that calls `autoConnect()`, add this:

```typescript
// Instead of just autoConnect(), try this sequence:
const connected = await tcnSerialService.autoConnect();
if (!connected) {
  console.log('[TCN INTEGRATION] Auto-connect failed, trying COM1 force...');
  const forceConnected = await tcnSerialService.forceConnectCOM1();
  if (!forceConnected) {
    console.error('[TCN INTEGRATION] All connection attempts failed');
    // Handle failure appropriately
  }
}
```

## Step 5: Fix the Serialport Package

The root issue is that the `serialport` package isn't loading properly. Run these commands:

```bash
# In your project directory
npm install serialport
npm rebuild serialport

# If using Electron
npm install --save-dev electron-rebuild
npx electron-rebuild
```

## Step 6: Add Environment Variable (Optional)

Create a `.env` file in your project root:

```
FORCE_COM1=true
SERIALPORT_DEBUG=true
```

And modify the service to use it:

```typescript
// At the top of the TCNSerialService class
private readonly FORCE_COM1 = process.env.FORCE_COM1 === 'true';
```

## Expected Results After Modifications

You should see these log messages:

```
[TCN SERIAL] Using native serialport implementation
[TCN SERIAL] Starting COM1 priority auto-detection...
[TCN SERIAL] PRIORITY 1: Found COM1, attempting connection...
[TCN SERIAL] ✓ Successfully connected to COM1 (TCN Controller)
[TCN INTEGRATION] TCN hardware connected successfully
```

Instead of:

```
[TCN SERIAL] Mode: MOCK
[TCN SERIAL MOCK] Mock serial port created
```

## Testing the Fix

1. Apply the code changes to [`services/tcnSerialService.ts`](services/tcnSerialService.ts)
2. Run the npm rebuild commands
3. Restart your application
4. Check the console logs for the new priority messages
5. Try dispensing a prize - it should use real COM1 instead of mock

## Troubleshooting

If it still doesn't work:

1. **Check serialport installation**: `npm list serialport`
2. **Verify Electron rebuild**: `npx electron-rebuild`
3. **Test COM1 manually**: Use the PowerShell test again to confirm COM1 is still accessible
4. **Check permissions**: Run as Administrator if needed

## Quick Implementation Checklist

- [ ] Replace `autoConnect` method with COM1 priority version
- [ ] Add `forceConnectCOM1` method
- [ ] Update constructor
- [ ] Run `npm rebuild serialport`
- [ ] Run `npx electron-rebuild` (if using Electron)
- [ ] Test the application
- [ ] Verify real COM1 connection in logs

The key insight is that COM1 is definitely working (as proven by your PowerShell test), but your application needs to be modified to prioritize it and ensure the serialport package loads properly instead of falling back to mock mode.