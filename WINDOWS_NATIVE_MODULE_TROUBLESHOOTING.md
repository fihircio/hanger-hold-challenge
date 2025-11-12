# Windows Native Module Troubleshooting Guide

## Issue: SerialPort Native Module Loading Error

You're experiencing this error:
```
Error: \\?\C:\Program Files (x86)\Hanger Challenge\resources\app.asar.unpacked\node_modules\@serialport\bindings-cpp\bindings.node
file folder is not a valid Win32 application.
```

## Root Cause

This error occurs when Electron applications with native dependencies (like SerialPort) are cross-compiled from one platform (macOS) to another (Windows). The native binaries (.node files) are platform-specific and won't work on the target platform.

## Solutions

### Solution 1: Rebuild Native Modules on Windows (Recommended)

1. **Install the application on Windows**
2. **Open Command Prompt as Administrator**
3. **Navigate to installation directory**:
   ```cmd
   cd "C:\Program Files\Hanger Challenge"
   ```
4. **Rebuild native modules**:
   ```cmd
   npm run rebuild-native
   ```
5. **Restart the application**

### Solution 2: Build on Windows Machine

The most reliable solution is to build the application directly on a Windows machine:

1. **Set up Windows environment**:
   - Windows 10/11 with Node.js
   - Visual Studio Build Tools (for native compilation)

2. **Clone your project**:
   ```cmd
   git clone <your-repo-url>
   cd hanger-hold-challenge/electron
   ```

3. **Install dependencies and build**:
   ```cmd
   npm install
   npm run build:win
   ```

### Solution 3: Use Docker/VM

1. **Install Docker Desktop** for Windows
2. **Create a Windows container**:
   ```dockerfile
   FROM mcr.microsoft.com/windows:2004
   # Install Node.js and build tools
   RUN powershell -Command "Set-ExecutionPolicy Bypass -Scope Process -Force"
   RUN Invoke-WebRequest -Uri https://nodejs.org/dist/v16.20.2/node-v16.20.2-x64.msi
   # Set up build environment
   WORKDIR /app
   COPY . .
   RUN npm install
   RUN npm run build:win
   ```

3. **Build inside container**:
   ```cmd
   docker build -t hanger-challenge-windows .
   ```

### Solution 4: Use GitHub Actions (CI/CD)

Set up automated builds for multiple platforms:

```yaml
name: Build Electron App
on:
  push:
    branches: [ main ]
jobs:
  build-macos:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm ci
      - name: Build for macOS
        run: npm run build:mac
  
  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm ci
      - name: Build for Windows
        run: npm run build:win
```

## Manual Fix Attempts

### Fix A: Update electron-rebuild Configuration

Add to your `electron/package.json`:

```json
{
  "scripts": {
    "postinstall": "electron-rebuild -f -w win32 -a x64",
    "rebuild-native": "electron-rebuild -f -w win32 -a x64"
  },
  "build": {
    "npmRebuild": true
  }
}
```

### Fix B: Exclude Native Modules from Packaging

Update your `electron/package.json` build configuration:

```json
{
  "build": {
    "files": [
      "main/**/*",
      "preload/**/*", 
      "../dist/**/*",
      "!node_modules/@serialport/bindings-cpp/**/*"
    ],
    "npmRebuild": true
  }
}
```

### Fix C: Use Prebuilt Binaries

Replace native modules with prebuilt versions:

```json
{
  "dependencies": {
    "@serialport/parser": "^12.0.0"
  },
  "devDependencies": {
    "electron-rebuild": "^3.2.13"
  }
}
```

Then update your code to use the parser instead of direct SerialPort:

```typescript
import { SerialPortParser } from '@serialport/parser';

// Create parser
const parser = new SerialPortParser();
parser.on('data', (data) => {
  console.log('Received data:', data);
});
```

## Testing Your Fix

### Step 1: Verify Native Module Loading

1. Install the rebuilt application
2. Check console for: "SerialPort module loaded successfully"
3. Open Developer Tools (F12) and check for errors

### Step 2: Test Serial Port Functionality

1. Connect Arduino device
2. Check if COM ports are detected
3. Test sending/receiving data

### Step 3: Verify Application Startup

1. Application should open without errors
2. Game should load from `index.html`
3. No "module not found" errors in console

## Advanced Troubleshooting

### Check Native Module Status

```cmd
# List all native modules
dir "C:\Program Files\Hanger Challenge\resources\app.asar.unpacked\node_modules"

# Check SerialPort specifically
dir "C:\Program Files\Hanger Challenge\resources\app.asar.unpacked\node_modules\@serialport"

# Verify bindings
dir "C:\Program Files\Hanger Challenge\resources\app.asar.unpacked\node_modules\@serialport\bindings-cpp"
```

### Manual Native Module Rebuild

```cmd
# Navigate to app directory
cd "C:\Program Files\Hanger Challenge\resources\app.asar.unpacked"

# Rebuild specific module
npx electron-rebuild -f -w win32 -a x64 -o @serialport/bindings-cpp

# Rebuild all modules
npx electron-rebuild -f -w win32 -a x64
```

### Clean Rebuild

```cmd
# Clean node_modules
rmdir /s "C:\Program Files\Hanger Challenge\resources\app.asar.unpacked\node_modules"

# Reinstall dependencies
npm install

# Rebuild
npm run rebuild-native
```

## Prevention Strategies

### 1. Platform-Specific Dependencies

Use conditional dependencies in package.json:

```json
{
  "dependencies": {
    "serialport": "^12.0.0"
  },
  "devDependencies": {
    "electron-rebuild": "^3.2.13"
  },
  "optionalDependencies": {
    "@serialport/bindings-cpp": "^12.0.1"
  }
}
```

### 2. Build Configuration

Configure electron-builder to handle native modules:

```json
{
  "build": {
    "beforeBuild": "npm run rebuild-native",
    "npmRebuild": true,
    "files": [
      "main/**/*",
      "preload/**/*",
      "../dist/**/*"
    ]
  }
}
```

### 3. Development Workflow

Use platform-specific development:

```bash
# On macOS/Linux
npm run dev

# On Windows (when building for Windows)
npm run dev:windows
```

## Support Resources

- [Electron Native Modules Guide](https://www.electronjs.org/docs/latest/api/native-modules)
- [electron-rebuild Documentation](https://github.com/electron/electron-rebuild)
- [SerialPort Documentation](https://serialport.io/docs/)
- [Cross-Platform Compilation Guide](https://www.electronjs.org/docs/latest/tutorial/tutorial-packaging-with-electron-builder)

## Quick Fix Checklist

- [ ] Rebuilt native modules for Windows
- [ ] Tested application startup on Windows
- [ ] Verified serial port detection
- [ ] Confirmed game loads properly
- [ ] No console errors on startup

---

**Note**: The most reliable solution is to build directly on the target platform. Cross-compilation of native modules often leads to compatibility issues.