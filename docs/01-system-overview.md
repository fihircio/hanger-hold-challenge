# System Overview

## Architecture Components

The Hanger Hold Challenge system consists of multiple integrated components working together to provide an interactive gaming experience with real vending machine control.

### Core Components

#### 1. PHP Backend API
- RESTful API server with MySQL database
- Player management and scoring system
- Prize eligibility verification
- Vending operation logging
- CORS support for cross-origin requests

#### 2. React Frontend
- Web-based game interface
- Real-time timer display
- Player registration forms
- Leaderboard display
- Responsive design for various screen sizes

#### 3. Electron Desktop Application
- Native desktop application wrapper
- Serial communication for hardware control
- Cross-platform compatibility (Windows, macOS, Linux)
- Auto-updater capability
- Hardware abstraction layer

#### 4. Vending Machine Integration
- Spring SDK for advanced vending control
- TCN UCS-V4.x controller support
- 25-channel capacity
- Real-time error reporting
- Drop detection and confirmation

## Data Flow

```
Player Interaction → React Frontend → Electron App → Hardware Controller → Vending Machine
                                    ↓
                              PHP Backend ← Database Logging ← API Responses
```

### Integration Options

#### Option 1: Spring SDK Integration (Recommended)
- Android-based SDK with real hardware control
- Event-driven architecture with callbacks
- 25-channel support with proper error codes
- Requires Android bridge device or emulator

#### Option 2: TCN Direct Control
- Direct RS232 serial communication
- Windows-native driver integration
- Simplified protocol implementation
- USB-to-RS232 adapter required

#### Option 3: Legacy Simulation
- Software-based vending simulation
- 6-byte HEX protocol simulation
- Fallback for development/testing
- No hardware dependencies

## Hardware Specifications

### Spring Machine Controller
- **Model**: TCN CSC-8C (V49)
- **Display**: 49-inch touch screen
- **Controller**: TCN UCS-V4.2 or UCS-V4.5
- **Communication**: RS232 to onboard mini-PC
- **Channels**: 25 total (5 Gold, 10 Silver, 10 Bronze)
- **Protocols**: MDB, DEX, RS232, RS485

### Channel Mapping
```
Gold Prizes:   Channels 1-5
Silver Prizes:  Channels 6-15
Bronze Prizes:  Channels 16-25
Total Channels:  25 channels
```

### Time-to-Tier Mapping
```
≥ 60 seconds:  Gold Prize
30-59.999 sec:  Silver Prize
10-29.999 sec:  Bronze Prize
< 10 seconds:   No Prize
```

## Software Architecture

### Backend Services
- **VendingController**: Prize dispensing logic
- **PlayerController**: User management
- **ScoreController**: Game scoring
- **PrizeController**: Prize configuration
- **InventoryController**: Slot inventory management and tracking
- **SpringVendingLogger**: Enhanced logging
- **VendingDiagnostics**: System health monitoring

### Frontend Services
- **apiService**: HTTP communication
- **dataService**: State management
- **vendingService**: Hardware abstraction
- **springVendingService**: Spring SDK integration
- **tcnSerialService**: TCN hardware control
- **arduinoSensorService**: Game input handling
- **tcnIntegrationService**: TCN hardware integration with inventory tracking
- **inventoryStorageService**: Local inventory data persistence

## Database Schema

### Core Tables
- **players**: User information and profiles
- **scores**: Game results and timing
- **prizes**: Prize configuration and tiers
- **vending_logs**: Operation history and tracking
- **spring_vending_logs**: Enhanced Spring SDK logging
- **slot_inventory**: Individual slot tracking and dispensing counts
- **dispensing_logs**: Detailed dispensing event logging
- **out_of_stock_logs**: Out-of-stock event tracking

### Key Relationships
```
players → scores (one-to-many)
scores → prizes (many-to-one via time thresholds)
scores → vending_logs (one-to-many for dispensing)
scores → dispensing_logs (one-to-many for detailed tracking)
slot_inventory → dispensing_logs (one-to-many for slot usage)
```

## Security Considerations

### API Security
- HTTPS enforcement for production
- Input validation and sanitization
- SQL injection prevention
- CORS configuration
- Rate limiting for endpoints

### Hardware Security
- COM port access control
- Serial communication encryption
- Hardware command validation
- Error handling and recovery

## Performance Requirements

### System Specifications
- **Response Time**: < 2 seconds per operation
- **Success Rate**: > 95% for dispensing
- **Uptime**: > 99% during operating hours
- **Concurrent Users**: 50+ simultaneous connections

### Resource Limits
- **Memory Usage**: < 100MB for Electron app
- **CPU Usage**: < 50% during operations
- **Database Connections**: < 20 concurrent
- **Serial Buffer**: < 1KB per command

## Monitoring & Maintenance

### System Health Checks
- Database connection monitoring
- API endpoint availability
- Hardware communication status
- Error rate tracking
- Performance metrics collection

### Maintenance Procedures
- Daily log review
- Weekly system diagnostics
- Monthly database optimization
- Quarterly security updates

This overview provides the foundation for understanding how all system components work together to deliver a reliable gaming and vending experience.