# Spring SDK Time-Based Tier Mapping Implementation

## 🎯 **Updated Functionality**

I've successfully implemented **Option 1: Time-Based Tier Mapping** in your [`backend/api_endpoints_for_server.php`](backend/api_endpoints_for_server.php) file.

## 📋 **Changes Made**

### **1. Added `getTimeTier()` Function** (Lines 69-77)
```php
function getTimeTier(int $timeMs): string {
    if ($timeMs >= 60000) {      // 60+ seconds = Gold
        return 'gold';
    } elseif ($timeMs >= 30000) { // 30-59 seconds = Silver
        return 'silver';
    } else {                       // <30 seconds = Bronze
        return 'bronze';
    }
}
```

### **2. Enhanced Spring SDK Endpoint** (Lines 467-485)
The `/vending/dispense-spring` endpoint now automatically determines tier from score time if not provided:

```php
// If tier not provided, get it from score time
if (empty($tier) && $score_id > 0) {
    $stmt = $conn->prepare("SELECT time FROM scores WHERE id = ?");
    $stmt->bind_param("i", $score_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $scoreData = $result->fetch_assoc();
    
    if ($scoreData) {
        $tier = getTimeTier((int)$scoreData['time']);
    }
}
```

## 🎮 **How It Works Now**

### **Automatic Tier Detection:**
1. **Game creates score** with time in milliseconds
2. **Spring SDK endpoint** automatically looks up score time
3. **Time converted to tier** using `getTimeTier()` function
4. **Appropriate channel selected** based on tier

### **Manual Tier Override:**
You can still manually specify tier if needed:
```bash
curl -X POST https://vendinghanger.eeelab.xyz/api_endpoints_for_server.php/vending/dispense-spring \
  -H "Content-Type: application/json" \
  -d '{"score_id": 123}'  # Tier auto-determined from score time
```

OR

```bash
curl -X POST https://vendinghanger.eeelab.xyz/api_endpoints_for_server.php/vending/dispense-spring \
  -H "Content-Type: application/json" \
  -d '{"score_id": 123, "tier": "gold"}'  # Manual tier override
```

## 📊 **Time → Tier Mapping**

| **Score Time** | **Tier** | **Channels** | **Prize ID** |
|----------------|------------|---------------|----------------|
| **≥ 60 seconds** | Gold | 1-5 | 1 |
| **30-59 seconds** | Silver | 6-15 | 2 |
| **< 30 seconds** | Bronze | 16-25 | 3 |

## 🔄 **Integration Flow**

### **Simplified Game Integration:**
```javascript
// 1. Player holds button for 45 seconds
const timeMs = 45000;

// 2. Create score
const scoreResponse = await fetch('/api/scores', {
    method: 'POST',
    body: JSON.stringify({
        player_id: 123,
        time: timeMs
    })
});
const { id: scoreId } = await scoreResponse.json();

// 3. Spring SDK dispensing (tier auto-detected!)
const vendingResponse = await fetch('/api/vending/dispense-spring', {
    method: 'POST',
    body: JSON.stringify({
        score_id: scoreId  // No tier needed - auto-detected!
    })
});
```

## ✅ **Benefits**

1. **Automatic Tier Detection**: No need to calculate tier in frontend
2. **Consistent Logic**: All tier calculation in one place
3. **Backward Compatible**: Still supports manual tier specification
4. **Error Handling**: Better validation and error messages
5. **Time-Based**: Uses actual game performance for prize determination

## 🧪 **Testing**

### **Test Auto-Detection:**
```bash
# Create a score first
curl -X POST https://vendinghanger.eeelab.xyz/api_endpoints_for_server.php/scores \
  -H "Content-Type: application/json" \
  -d '{"player_id": 1, "time": 45000}'

# Then dispense (tier auto-detected as "silver")
curl -X POST https://vendinghanger.eeelab.xyz/api_endpoints_for_server.php/vending/dispense-spring \
  -H "Content-Type: application/json" \
  -d '{"score_id": 1}'
```

### **Expected Response:**
```json
{
  "success": true,
  "tier": "silver",
  "channel": 12,
  "message": "silver prize dispensed successfully via Spring SDK",
  "spring_sdk_used": true
}
```

Your Spring SDK now automatically maps game performance (hold time) to appropriate prize tiers, making the integration seamless and intelligent!