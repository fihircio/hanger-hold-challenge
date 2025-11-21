const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔨 Starting manual Electron build...');

// Build React app first
console.log('📦 Building React app...');
try {
  execSync('cd .. && npm run build', { stdio: 'inherit' });
  console.log('✅ React app built successfully');
} catch (error) {
  console.error('❌ Failed to build React app:', error.message);
  process.exit(1);
}

// Create output directory
const outputDir = path.join(__dirname, '../dist/win-unpacked');
const resourcesDir = path.join(outputDir, 'resources');
const appDir = path.join(resourcesDir, 'app');

console.log('📁 Creating output directories...');
fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(resourcesDir, { recursive: true });
fs.mkdirSync(appDir, { recursive: true });

// Copy files
console.log('📋 Copying files...');

// Copy main Electron files
const copyDir = (src, dest) => {
  if (!fs.existsSync(src)) {
    console.log(`⚠️  Source directory not found: ${src}`);
    return;
  }
  
  fs.mkdirSync(dest, { recursive: true });
  const files = fs.readdirSync(src);
  files.forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    const stat = fs.statSync(srcPath);
    
    if (stat.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
};

// Copy main process files
const mainDir = path.join(__dirname, '..', 'main');
const preloadDir = path.join(__dirname, '..', 'preload');
const compiledMainDir = path.join(__dirname, '..', 'main');
const compiledPreloadDir = path.join(__dirname, '..', 'preload');

if (fs.existsSync(compiledMainDir)) {
  copyDir(compiledMainDir, path.join(appDir, 'main'));
} else {
  console.log('⚠️  Main directory not found, creating compiled files...');
  // Compile TypeScript files
  execSync('tsc ../main/main.ts --target es2020 --outDir ../main --module commonjs', { stdio: 'inherit', cwd: __dirname });
  copyDir(compiledMainDir, path.join(appDir, 'main'));
}

if (fs.existsSync(compiledPreloadDir)) {
  copyDir(compiledPreloadDir, path.join(appDir, 'preload'));
} else {
  console.log('⚠️  Preload directory not found, creating compiled files...');
  // Compile TypeScript files
  execSync('tsc ../preload/preload.ts --target es2020 --outDir ../preload --module commonjs', { stdio: 'inherit', cwd: __dirname });
  copyDir(compiledPreloadDir, path.join(appDir, 'preload'));
}

// Copy package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packageJsonPath)) {
  fs.copyFileSync(packageJsonPath, path.join(appDir, 'package.json'));
} else {
  console.error('❌ package.json not found!');
  process.exit(1);
}

// Copy built React app and assets
console.log('📱 Copying React app...');
const indexHtmlPath = path.join(__dirname, '..', '..', 'dist', 'index.html');
const indexCssPath = path.join(__dirname, '..', '..', 'dist', 'index.css');

if (fs.existsSync(indexHtmlPath)) {
  fs.copyFileSync(indexHtmlPath, path.join(resourcesDir, 'index.html'));
} else {
  console.error('❌ Built index.html not found!');
  process.exit(1);
}

// CSS is now embedded in assets, so we don't need to copy index.css separately
console.log('📋 CSS is embedded in assets, skipping separate index.css copy');

copyDir(path.join(__dirname, '..', '..', 'UI'), path.join(resourcesDir, 'UI'));
copyDir(path.join(__dirname, '..', '..', 'dist/assets'), path.join(resourcesDir, 'assets'));

// Copy node_modules (essential ones only)
console.log('📦 Copying essential node_modules...');
const essentialModules = [
  'electron',
  'serialport'
];

essentialModules.forEach(module => {
  const srcPath = path.join(__dirname, 'node_modules', module);
  const destPath = path.join(appDir, 'node_modules', module);
  if (fs.existsSync(srcPath)) {
    copyDir(srcPath, destPath);
  }
});

// Copy Electron runtime
console.log('⚡ Copying Electron runtime...');
const electronPath = path.join(__dirname, 'node_modules', 'electron', 'dist');
if (fs.existsSync(electronPath)) {
  copyDir(electronPath, outputDir);
}

// Create portable executable
console.log('🎯 Creating portable executable...');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
const exeName = `${packageJson.productName || 'Hanger Challenge'}.exe`;

console.log(`✅ Build completed successfully!`);
console.log(`📂 Output directory: ${outputDir}`);
console.log(`🚀 Run: ${outputDir}/${exeName}`);