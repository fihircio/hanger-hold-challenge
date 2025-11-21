# Hanger Hold Challenge - Complete System Documentation

## Overview

The Hanger Hold Challenge is an interactive gaming system with vending machine integration. This comprehensive documentation covers all aspects of the system including setup, integration, deployment, and maintenance.

## System Architecture

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

## Documentation Structure

### 📚 **Core Documentation**
- [**System Overview**](./01-system-overview.md) - Complete system architecture and components
- [**Installation Guide**](./02-installation-guide.md) - Step-by-step setup instructions
- [**API Reference**](./03-api-reference.md) - Complete API documentation
- [**Deployment Guide**](./04-deployment-guide.md) - Production deployment instructions

### 🔧 **Hardware Integration**
- [**Spring SDK Integration**](./05-spring-sdk-integration.md) - Spring machine SDK implementation
- [**TCN Hardware Setup**](./06-tcn-hardware-setup.md) - TCN controller configuration
- [**Driver Installation**](./07-driver-installation.md) - Windows driver setup

### 🧪 **Testing & Troubleshooting**
- [**Testing Guide**](./08-testing-guide.md) - Comprehensive testing procedures
- [**Troubleshooting**](./09-troubleshooting.md) - Common issues and solutions
- [**API Testing**](./10-api-testing.md) - API endpoint testing with curl commands

### 📊 **Database & Migration**
- [**Database Schema**](./11-database-schema.md) - Database structure and migrations
- [**Migration Guide**](./12-migration-guide.md) - Database update procedures

## Key Features

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
│   └── vendingService.ts   # Vending control
├── components/            # React components
├── database/             # SQL migrations
└── docs/               # This documentation
```

## Getting Help

For issues and questions:
- Check the troubleshooting section
- Review API documentation
- Examine browser console logs
- Check Electron DevTools

## Version History

- v1.0.0 - Initial release with full system integration
- v1.1.0 - Spring SDK integration enhanced
- v1.2.0 - TCN hardware support added