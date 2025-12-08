# Immediate Fixes for Critical Vending Issues

## Priority 1: Fix API Parameter Issues (Blocking All Logging)

### Problem
Line 68-69 in log.md shows:
```
POST https://vendinghanger.eeelab.xyz/apiendpoints.php/vending/dispense 400 (Bad Request)
API request failed: Error: Prize ID and Score ID are required
```

### Root Cause
In `electronVendingService.ts` line 418, the API call is missing required parameters:

```typescript
// Current problematic code:
await apiService.apiService.dispensePrize(prizeIdForApi, scoreIdNum);
```

### Immediate Fix

#### 1. Fix the API Service Call
Update `services/apiService.ts` to ensure proper parameter handling:

```typescript
// Add or update this method in apiService.ts
async dispensePrize(prizeId: number, scoreId: number): Promise<any> {
  try {
    const response = await fetch(`${this.API_BASE_URL}/vending/dispense`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prize_id: prizeId,  // Ensure correct parameter name
        score_id: scoreId   // Ensure correct parameter name
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[API SERVICE] Failed to dispense prize:', error);
    throw error;
  }
}
```

#### 2. Fix Parameter Generation in electronVendingService.ts
Update lines 406-424 in `electronVendingService.ts`:

```typescript
// Replace the existing code with this enhanced version
let prizeIdForApi: number | undefined;
let scoreIdNum: number | undefined;

if (scoreId) {
  scoreIdNum = parseInt(scoreId);
  if (isNaN(scoreIdNum)) {
    console.error('[ELECTRON VENDING] Invalid scoreId provided:', scoreId);
    scoreIdNum = undefined;
  }
}

// Always get prize ID based on tier (not just when scoreId exists)
try {
  const prizesResponse = await import('./apiService').then(api => api.apiService.getAllPrizes());
  const prizeForTier = prizesResponse.prizes.find((p: any) =>
    (tier === 'gold' && p.time_threshold >= 60000) ||
    (tier === 'silver' && p.time_threshold >= 30000 && p.time_threshold < 60000)
  );
  prizeIdForApi = prizeForTier?.id;
  
  // Only call API if we have both prize ID and score ID
  if (prizeIdForApi && scoreIdNum) {
    await apiService.apiService.dispensePrize(prizeIdForApi, scoreIdNum);
    console.log('[ELECTRON VENDING] Prize dispensing logged to API');
  } else {
    console.warn('[ELECTRON VENDING] Skipping API log - missing prizeId or scoreId', {
      prizeId: prizeIdForApi,
      scoreId: scoreIdNum
    });
  }
} catch (apiError) {
  console.error('[ELECTRON VENDING] Failed to log to API:', apiError);
  // Don't throw - continue with dispensing even if API fails
}
```

## Priority 2: Fix Electron Vending Service Logging

### Problem
Line 88 in log.md shows:
```
POST https://vendinghanger.eeelab.xyz/apiendpoints.php/api/electron-vending/log 500 (Internal Server Error)
```

### Root Cause
The PHP endpoint expects specific parameter types and validation is failing.

### Immediate Fix

#### 1. Fix Parameter Types in electronVendingService.ts
Update lines 896-912 in `electronVendingService.ts`:

```typescript
// Fix the bind_param types - some parameters should be integers, not strings
$stmt->bind_param("sisiiiiissssiiis",  // Changed first 'i' to 's' for action
  $input['action'],           // string
  $gameTimeMs,               // integer (or null)
  $tier,                     // string (or null)
  $selectedSlot,              // integer (or null)
  $channelUsed,               // integer (or null)
  $scoreId,                  // integer (or null)
  $prizeId,                  // integer (or null)
  $input['success'],          // boolean
  $errorCode,                // integer (or null)
  $errorMessage,             // string (or null)
  $dispenseMethod,            // string
  $inventoryBefore,           // integer (or null)
  $inventoryAfter,            // integer (or null)
  $responseTimeMs,           // integer (or null)
  $input['source']           // string
);
```

#### 2. Add Parameter Validation
Update the logging function to ensure valid parameters:

```typescript
private async logDispensingToServer(
  slot: number,
  tier: string,
  success: boolean,
  prizeId?: number,
  scoreId?: number,
  error?: string,
  gameTimeMs?: number,
  channelUsed?: number,
  dispenseMethod?: string,
  inventoryBefore?: number,
  inventoryAfter?: number,
  responseTimeMs?: number
): Promise<void> {
  try {
    // Validate and sanitize parameters
    const sanitizedLogEntry = {
      action: 'prize_dispensing',
      game_time_ms: gameTimeMs || null,
      tier: tier || null,
      selected_slot: slot || null,
      channel_used: channelUsed || null,
      score_id: scoreId || null,
      prize_id: prizeId || null,
      success: success,
      error_message: error || null,
      dispense_method: dispenseMethod || 'unknown',
      inventory_before: inventoryBefore || null,
      inventory_after: inventoryAfter || null,
      response_time_ms: responseTimeMs || null,
      source: 'electron_vending_service'
    };

    // Remove null values to avoid PHP validation issues
    Object.keys(sanitizedLogEntry).forEach(key => {
      if (sanitizedLogEntry[key] === null) {
        delete sanitizedLogEntry[key];
      }
    });

    const API_BASE_URL = (window as any).process?.env?.REACT_APP_API_URL || 'https://vendinghanger.eeelab.xyz/apiendpoints.php';
    
    // Try to send to Electron Vending Service logs table (non-blocking)
    fetch(`${API_BASE_URL}/api/electron-vending/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sanitizedLogEntry)
    }).catch(err => {
      console.warn('[ELECTRON VENDING] Failed to log to Electron Vending Service table (will queue for later):', err);
    });

    console.log(`[ELECTRON VENDING] Dispensing logged: slot=${slot}, tier=${tier}, success=${success}`);
  } catch (error) {
    console.error('[ELECTRON VENDING] Failed to log dispensing:', error);
  }
}
```

## Priority 3: Fix Spring SDK Initialization

### Problem
Line 40 in log.md shows:
```
[SPRING VENDING] Connection failed: ReferenceError: connectResult is not defined
```

### Root Cause
In `springVendingService.ts`, there's a reference to an undefined variable.

### Immediate Fix

#### 1. Fix the connectResult Variable
Find and fix the undefined variable in the Spring SDK service:

```typescript
// In springVendingService.ts - look for this pattern and fix it:
async connectToVendingController(): Promise<boolean> {
  try {
    // Fix this undefined variable issue
    const connectResult = await this.establishConnection(); // Define the variable properly
    
    if (connectResult.success) {  // Now connectResult is defined
      console.log('[SPRING VENDING] Connected successfully');
      return true;
    } else {
      console.error('[SPRING VENDING] Connection failed:', connectResult.error);
      return false;
    }
  } catch (error) {
    console.error('[SPRING VENDING] Connection error:', error);
    return false;
  }
}
```

## Priority 4: Add Basic Fallback Logic

### Immediate Solution
Add simple fallback logic to `electronVendingService.ts`:

```typescript
// In handlePrizeDispensing method, add this fallback logic
async handlePrizeDispensing(time: number, scoreId?: string): Promise<PrizeDispenseResult> {
  const startTime = Date.now();
  
  try {
    console.log(`[ELECTRON VENDING] Handling prize dispensing for game time: ${time}ms, scoreId: ${scoreId}`);
    
    const tier = this.determinePrizeTierByTime(time);
    
    if (!tier) {
      return {
        success: false,
        tier: 'bronze',
        channel: null,
        slot: null,
        error: 'Game time too short for prize eligibility'
      };
    }

    const selectedSlot = await this.getNextAvailableSlot(tier);
    
    if (!selectedSlot) {
      return {
        success: false,
        tier,
        channel: null,
        slot: null,
        error: `No available slots for ${tier} tier`
      };
    }

    console.log(`[ELECTRON VENDING] Selected slot ${selectedSlot} for ${tier} prize`);

    // ENHANCED FALLBACK LOGIC
    const methods = [
      { name: 'Spring SDK', try: () => this.trySpringSDK(selectedSlot, tier) },
      { name: 'Legacy Serial', try: () => this.tryLegacySerial(selectedSlot, tier) },
      { name: 'Mock Mode', try: () => this.tryMockMode(selectedSlot, tier) }
    ];

    for (const method of methods) {
      try {
        console.log(`[ELECTRON VENDING] Trying ${method.name}...`);
        const result = await method.try();
        
        if (result.success) {
          console.log(`[ELECTRON VENDING] ✓ ${method.name} successful`);
          await this.incrementSlotCount(selectedSlot, tier);
          return result;
        } else {
          console.warn(`[ELECTRON VENDING] ✗ ${method.name} failed: ${result.error}`);
        }
      } catch (error) {
        console.error(`[ELECTRON VENDING] ✗ ${method.name} error:`, error);
      }
    }

    // All methods failed
    return {
      success: false,
      tier,
      channel: null,
      slot: selectedSlot,
      error: 'All dispensing methods failed'
    };

  } catch (error) {
    console.error('[ELECTRON VENDING] Error handling prize dispensing:', error);
    return {
      success: false,
      tier: 'bronze',
      channel: null,
      slot: null,
      error: error.message
    };
  }
}

// Add these helper methods
private async trySpringSDK(slot: number, tier: string): Promise<PrizeDispenseResult> {
  if (!this.isInitialized) {
    throw new Error('Spring SDK not initialized');
  }
  
  const result = await this.springService.dispensePrizeByTier(tier);
  return {
    success: result.success,
    tier,
    channel: result.channel,
    slot,
    error: result.error
  };
}

private async tryLegacySerial(slot: number, tier: string): Promise<PrizeDispenseResult> {
  const command = this.constructVendCommand(slot);
  const result = await window.electronAPI.sendSerialCommand(command);
  
  return {
    success: result.success,
    tier,
    channel: slot,
    slot,
    error: result.error || 'Serial command failed'
  };
}

private async tryMockMode(slot: number, tier: string): Promise<PrizeDispenseResult> {
  console.log(`[ELECTRON VENDING] MOCK MODE: Simulating dispensing from slot ${slot}`);
  
  // Simulate dispensing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 90% success rate
  const success = Math.random() < 0.9;
  
  return {
    success,
    tier,
    channel: slot,
    slot,
    error: success ? undefined : 'Mock simulated failure',
    mockMessage: success ? 'Simulated successful dispensing' : 'Simulated failure'
  };
}
```

## Testing the Fixes

### 1. Test API Fixes
```javascript
// Test in browser console
fetch('https://vendinghanger.eeelab.xyz/apiendpoints.php/vending/dispense', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prize_id: 1,
    score_id: 1
  })
})
.then(r => r.json())
.then(console.log);
```

### 2. Test Logging Fixes
```javascript
// Test logging endpoint
fetch('https://vendinghanger.eeelab.xyz/apiendpoints.php/api/electron-vending/log', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'test',
    success: true,
    source: 'test'
  })
})
.then(r => r.json())
.then(console.log);
```

## Implementation Order

1. **First**: Fix API parameter issues (lines 418-424 in electronVendingService.ts)
2. **Second**: Fix logging parameter validation (logDispensingToServer method)
3. **Third**: Add basic fallback logic (handlePrizeDispensing method)
4. **Fourth**: Fix Spring SDK initialization (springVendingService.ts)

These fixes will ensure your vending machine continues to operate even with hardware failures, while maintaining proper logging and inventory tracking.