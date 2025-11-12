# Hanger Challenge Backend API

This is the backend API for the Hanger Hold Challenge game, built with Slim PHP framework and MySQL database.

## Installation

1. Install dependencies:
```bash
composer install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Configure your database settings in `.env` file

4. Create the database and run migrations:
```sql
-- Create database
CREATE DATABASE hanger_challenge;

-- Run migrations in order:
source database/migrations/001_create_players_table.sql
source database/migrations/002_create_scores_table.sql
source database/migrations/003_create_prizes_table.sql
source database/migrations/004_create_vending_logs_table.sql
source database/migrations/005_seed_prizes.sql
```

## Running the Server

Development server:
```bash
composer start
```

This will start the server on `http://localhost:8080`

## API Endpoints

### Players
- `POST /api/players` - Create a new player
- `GET /api/players/{id}` - Get player by ID

### Scores
- `POST /api/scores` - Submit a new score
- `GET /api/leaderboard` - Get leaderboard (optional `?limit=N` parameter)

### Prizes
- `GET /api/prizes/check?time={milliseconds}` - Check prize eligibility
- `GET /api/prizes` - Get all active prizes

### Vending
- `POST /api/vending/dispense` - Dispense a prize
- `GET /api/vending/status` - Get vending machine status and recent logs

## Example Requests

### Create Player
```json
POST /api/players
{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
}
```

### Submit Score
```json
POST /api/scores
{
    "player_id": 1,
    "time": 45000
}
```

### Check Prize Eligibility
```
GET /api/prizes/check?time=45000
```

### Dispense Prize
```json
POST /api/vending/dispense
{
    "prize_id": 2,
    "score_id": 1
}