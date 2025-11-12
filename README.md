# Hanger Hold Challenge - Complete System

A comprehensive gaming system with backend API, web frontend, and desktop application for vending machine integration.

## Overview

The Hanger Hold Challenge is an interactive game where players compete to hold a button/position for the longest time. The system includes:

- **PHP Backend API** - RESTful API with MySQL database
- **React Frontend** - Web-based game interface
- **Electron Desktop App** - Native application with serial communication
- **Vending Integration** - Real hardware control for prize dispensing

## Quick Start

### Backend Setup
```bash
cd backend
composer install
cp .env.example .env
# Configure database in .env
php -S localhost:8080 -t public
```

### Frontend Setup
```bash
npm install
npm run dev
```

### Electron Setup
```bash
cd electron
npm install
npm run dev
```

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App    │    │   PHP Backend  │    │ Vending Machine │
│   (Frontend)   │◄──►│   (API Server)  │◄──►│   (Hardware)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       ▲                       ▲
         │                       │                       │
         └───────────────────────┴───────────────────────┘
                    ┌─────────────────┐
                    │   Electron App  │
                    │ (Desktop App)  │
                    └─────────────────┘
```

## Features

### Game Features
- Player registration and scoring
- Real-time leaderboard
- Prize tier system (Gold, Silver, Bronze)
- Offline/online synchronization
- Responsive design

### Backend Features
- RESTful API design
- MySQL database integration
- Prize eligibility checking
- Vending operation logging
- CORS support

### Desktop Features
- Native serial communication
- Hardware vending control
- Cross-platform support
- Auto-updater capability

## Project Structure

```
hanger-hold-challenge/
├── backend/                 # PHP API server
│   ├── public/            # Web root
│   ├── src/               # PHP source code
│   │   ├── Controllers/    # API controllers
│   │   ├── Models/         # Database models
│   │   └── dependencies.php # DI container
│   ├── config/             # Configuration files
│   └── composer.json       # PHP dependencies
├── electron/               # Desktop application
│   ├── main/              # Main process
│   ├── preload/            # Preload scripts
│   └── package.json       # Electron dependencies
├── services/              # Frontend services
│   ├── apiService.ts      # API communication
│   ├── dataService.ts     # Data management
│   ├── prizeService.ts    # Prize logic
│   ├── vendingService.ts   # Vending control
│   └── electronVendingService.ts # Serial comm
├── components/            # React components
├── database/             # SQL migrations
└── DEPLOYMENT.md         # Deployment guide
```

## API Documentation

### Endpoints

#### Players
- `POST /api/players` - Create player
- `GET /api/players/{id}` - Get player

#### Scores
- `POST /api/scores` - Submit score
- `GET /api/leaderboard` - Get leaderboard

#### Prizes
- `GET /api/prizes/check?time={ms}` - Check eligibility
- `GET /api/prizes` - List all prizes

#### Vending
- `POST /api/vending/dispense` - Dispense prize
- `GET /api/vending/status` - Get status

## Development

### Prerequisites
- Node.js 16+
- PHP 8.0+
- MySQL 5.7+
- Composer
- Git

### Installation

1. **Clone Repository**:
```bash
git clone <repository-url>
cd hanger-hold-challenge
```

2. **Backend Setup**:
```bash
cd backend
composer install
cp .env.example .env
# Edit .env with database credentials
```

3. **Frontend Setup**:
```bash
npm install
cp .env.example .env.local
# Edit .env.local with API URL
```

4. **Database Setup**:
```bash
mysql -u root -p < database/migrations/001_create_players_table.sql
mysql -u root -p < database/migrations/002_create_scores_table.sql
mysql -u root -p < database/migrations/003_create_prizes_table.sql
mysql -u root -p < database/migrations/004_create_vending_logs_table.sql
mysql -u root -p < database/migrations/005_seed_prizes.sql
```

### Running

1. **Development Mode**:
```bash
# Terminal 1: Start backend
cd backend && php -S localhost:8080 -t public

# Terminal 2: Start frontend
npm run dev

# Terminal 3: Start Electron (optional)
cd electron && npm run dev
```

2. **Production Mode**:
```bash
# Build frontend
npm run build

# Build Electron
cd electron && npm run build:win
```

## Hardware Integration

### Vending Machine Protocol

The system uses a 6-byte HEX command structure:

| Byte | Value | Description |
|-------|--------|-------------|
| 1 | 0x00 | Command |
| 2 | 0xFF | Fixed |
| 3 | Slot | Slot number (1-80) |
| 4 | Checksum | 0xFF - Slot Number |
| 5 | 0xAA | Delivery detection ON |
| 6 | 0x55 | Delivery detection ON |

### Serial Configuration
- Baud Rate: 9600
- Data Bits: 8
- Parity: None
- Stop Bits: 1

## Testing

### Unit Tests
```bash
# Backend tests
cd backend && composer test

# Frontend tests
npm test
```

### Integration Tests
```bash
# Test API endpoints
curl -X GET http://localhost:8080/api/prizes
curl -X POST http://localhost:8080/api/players -H "Content-Type: application/json" -d '{"name":"Test"}'
```

### Hardware Tests
1. Connect vending machine
2. Run Electron app
3. Test prize dispensing
4. Verify serial communication

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy

1. **Backend**:
```bash
# Deploy to server
rsync -av backend/ user@server:/var/www/api/
```

2. **Frontend**:
```bash
# Build and deploy
npm run build
rsync -av build/ user@server:/var/www/html/
```

3. **Desktop**:
```bash
# Build distributable
cd electron && npm run build:win
# Distribute .exe installer
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## License

This project is licensed under the ISC License.

## Support

For issues and questions:
- Check [DEPLOYMENT.md](DEPLOYMENT.md) troubleshooting section
- Review API documentation
- Examine browser console logs
- Check Electron DevTools

## Version History

- v1.0.0 - Initial release with full system integration
