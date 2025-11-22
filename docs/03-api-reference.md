# API Reference

## Base URL

**Development**: `http://localhost:8080/api`  
**Production**: `https://your-domain.com/api`

## Authentication

The API uses stateless authentication. Include API key in headers for production:
```bash
Authorization: Bearer your-api-key-here
```

## Response Format

All API responses follow this structure:
```json
{
  "success": true|false,
  "data": {...},
  "message": "Description",
  "timestamp": "2025-11-20T12:30:15Z"
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error description",
  "code": "ERROR_CODE",
  "timestamp": "2025-11-20T12:30:15Z"
}
```

## Endpoints

### Players

#### Create Player
```http
POST /players
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "existing": false
  }
}
```

#### Get Player
```http
GET /players/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }
}
```

#### Get All Players
```http
GET /players
```

**Response:**
```json
{
  "success": true,
  "data": {
    "players": [
      {
        "id": 123,
        "name": "John Doe",
        "email": "john@example.com"
      }
    ]
  }
}
```

### Scores

#### Submit Score
```http
POST /scores
Content-Type: application/json
```

**Request Body:**
```json
{
  "player_id": 123,
  "time": 45000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 456,
    "player_id": 123,
    "time": 45000,
    "prize": {
      "id": 2,
      "name": "Silver Prize",
      "message": "Great job!",
      "slot": 10,
      "time_threshold": 30000
    }
  }
}
```

#### Get Player Scores
```http
GET /scores?player_id={id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "scores": [
      {
        "id": 456,
        "time": 45000,
        "prize_id": 2,
        "dispensed": false,
        "created_at": "2025-11-20T12:30:15Z",
        "player_name": "John Doe"
      }
    ]
  }
}
```

### Prizes

#### Check Prize Eligibility
```http
GET /prizes?check=1&time={ms}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "eligible": true,
    "prize": {
      "id": 2,
      "name": "Silver Prize",
      "message": "Great job!",
      "slot": 10,
      "time_threshold": 30000
    }
  }
}
```

#### Get All Prizes
```http
GET /prizes
```

**Response:**
```json
{
  "success": true,
  "data": {
    "prizes": [
      {
        "id": 1,
        "name": "Gold Prize",
        "message": "Excellent!",
        "slot": 3,
        "time_threshold": 60000
      },
      {
        "id": 2,
        "name": "Silver Prize",
        "message": "Great job!",
        "slot": 10,
        "time_threshold": 30000
      },
      {
        "id": 3,
        "name": "Bronze Prize",
        "message": "Good effort!",
        "slot": 20,
        "time_threshold": 10000
      }
    ]
  }
}
```

### Vending

#### Basic Vending Status
```http
GET /vending/status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "operational",
    "logs": [
      {
        "id": 1,
        "prize_name": "Gold Prize",
        "player_name": "John Doe",
        "slot": 3,
        "success": true,
        "error_message": null,
        "created_at": "2025-11-20T12:30:15Z"
      }
    ]
  }
}
```

#### Enhanced Spring SDK Status
```http
GET /vending/status-enhanced
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "operational",
    "connection": true,
    "healthy_channels": 22,
    "total_channels": 25,
    "last_error": null,
    "last_self_check": {
      "success": true,
      "timestamp": "2025-11-20T10:00:00Z"
    },
    "recent_logs": [
      {
        "timestamp": "2025-11-20T12:30:15Z",
        "action": "dispensing_success",
        "tier": "gold",
        "channel": 3,
        "source": "spring_sdk"
      }
    ],
    "system_health": {
      "total_operations": 50,
      "successful_operations": 43,
      "success_rate_percentage": 86.0
    }
  }
}
```

#### System Diagnostics
```http
GET /vending/diagnostics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "diagnostics": {
      "overall_status": "pass",
      "tests": [
        {
          "name": "database_connection",
          "status": "pass",
          "message": "Database connection successful"
        },
        {
          "name": "spring_sdk_logger",
          "status": "pass",
          "message": "Spring SDK logging system operational"
        },
        {
          "name": "vending_logs_table",
          "status": "pass",
          "message": "vending_logs table exists"
        }
      ]
    },
    "timestamp": "2025-11-20T12:30:15Z"
  }
}
```

#### Legacy Prize Dispensing
```http
POST /vending/dispense
Content-Type: application/json
```

**Request Body:**
```json
{
  "prize_id": 1,
  "score_id": 123
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "score_id": 123,
    "prize_id": 1,
    "prize_name": "Gold Prize",
    "slot": 3,
    "command": "00 FF 03 FC AA 55",
    "response": "00 5D 00 AA 07",
    "log_id": 45
  }
}
```

#### Spring SDK Prize Dispensing
```http
POST /vending/dispense-spring
Content-Type: application/json
```

**Request Body:**
```json
{
  "tier": "gold",
  "score_id": 123
}
```

**Auto-tier Detection (tier optional):**
```json
{
  "score_id": 123
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tier": "gold",
    "channel": 3,
    "message": "gold prize dispensed successfully via Spring SDK",
    "spring_sdk_used": true
  }
}
```

## Error Codes

### HTTP Status Codes
- `200` - Success
- `400` - Bad Request (missing/invalid parameters)
- `401` - Unauthorized (invalid API key)
- `404` - Not Found (endpoint doesn't exist)
- `500` - Internal Server Error

### Application Error Codes
- `PLAYER_NOT_FOUND` - Player ID doesn't exist
- `INVALID_TIME` - Invalid time value
- `PRIZE_NOT_ELIGIBLE` - Time doesn't qualify for prize
- `VENDING_FAILED` - Prize dispensing failed
- `SPRING_SDK_ERROR` - Spring SDK specific error
- `DATABASE_ERROR` - Database operation failed
- `INVENTORY_ERROR` - Inventory management error
- `SLOT_NOT_FOUND` - Slot number not found
- `SLOT_FULL` - Slot has reached maximum dispense count

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- **Players**: 10 requests per minute
- **Scores**: 60 requests per minute
- **Prizes**: 30 requests per minute
- **Vending**: 20 requests per minute

Rate limit headers are included in responses:
```bash
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640995200
```

## CORS Configuration

For development, these origins are allowed:
- `http://localhost:3000` (React dev server)
- `http://localhost:8080` (PHP dev server)

For production, configure your specific domain:
```bash
Access-Control-Allow-Origin: https://your-domain.com
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## Testing Examples

### Using curl

**Create player and submit score:**
```bash
# Create player
PLAYER_ID=$(curl -s -X POST http://localhost:8080/api/players \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Player","email":"test@example.com"}' | \
  jq -r '.data.id')

# Submit score
curl -X POST http://localhost:8080/api/scores \
  -H "Content-Type: application/json" \
  -d "{\"player_id\":$PLAYER_ID,\"time\":45000}"
```

**Test vending:**
```bash
# Check eligibility
curl "http://localhost:8080/api/prizes?check=1&time=45000"

# Dispense prize
curl -X POST http://localhost:8080/api/vending/dispense-spring \
  -H "Content-Type: application/json" \
  -d '{"tier":"silver","score_id":123}'
```

### Using JavaScript

```javascript
// API client example
class HangerAPI {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    const response = await fetch(url, config);
    return response.json();
  }

  async createPlayer(playerData) {
    return await this.request('/players', {
      method: 'POST',
      body: JSON.stringify(playerData)
    });
  }

  async submitScore(playerId, time) {
    return await this.request('/scores', {
      method: 'POST',
      body: JSON.stringify({ player_id: playerId, time })
    });
  }

  async dispensePrize(tier, scoreId) {
    return await this.request('/vending/dispense-spring', {
      method: 'POST',
      body: JSON.stringify({ tier, score_id: scoreId })
    });
  }
}

// Usage
const api = new HangerAPI('http://localhost:8080/api');

const player = await api.createPlayer({
  name: 'John Doe',
  email: 'john@example.com'
});

const score = await api.submitScore(player.data.id, 45000);

const result = await api.dispensePrize('silver', score.data.id);
```

## WebSocket Support (Optional)

For real-time updates, WebSocket connections are supported:

```javascript
const ws = new WebSocket('ws://localhost:8080/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case 'vending_status':
      console.log('Vending status updated:', data.status);
      break;
    case 'leaderboard_update':
      console.log('Leaderboard updated:', data.scores);
      break;
  }
};
```

This API reference provides complete documentation for all available endpoints and usage patterns.