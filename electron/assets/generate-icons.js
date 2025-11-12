const fs = require('fs');
const path = require('path');

// Create a simple SVG icon for the Hanger Challenge
const svgIcon = `<svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
  <rect width="256" height="256" fill="#4A90E2"/>
  <text x="128" y="128" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">
    Hanger
  </text>
  <text x="128" y="160" font-family="Arial, sans-serif" font-size="20" fill="white" text-anchor="middle" dominant-baseline="middle">
    Challenge
  </text>
</svg>`;

// Write the SVG file
fs.writeFileSync(path.join(__dirname, 'icon.svg'), svgIcon);

console.log('Created icon.svg');
console.log('Note: For production, you should convert this SVG to:');
console.log('  - icon.ico for Windows (use online converters or tools like png2ico)');
console.log('  - icon.icns for macOS (use iconutil or online converters)');
console.log('  - icon.png for Linux (256x256 PNG)');

// Create a simple placeholder PNG file (base64 encoded minimal PNG)
const pngIcon = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
  0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk start
  0x00, 0x00, 0x00, 0x20, 0x00, 0x00, 0x00, 0x20, // 32x32 dimensions
  0x08, 0x02, 0x00, 0x00, 0x00, 0xFC, 0x18, 0xED, // Bit depth, color type, compression
  0xA3, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, // IDAT chunk start
  0x54, 0x08, 0x99, 0x63, 0xF8, 0x0F, 0x00, 0x00, // Image data (simple blue square)
  0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, // More image data
  0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, // IEND chunk
  0xAE, 0x42, 0x60, 0x82 // PNG end
]);

fs.writeFileSync(path.join(__dirname, 'icon.png'), pngIcon);
console.log('Created placeholder icon.png');

// Create a simple ICO file (256x256 ICO)
const icoHeader = Buffer.from([
  0x00, 0x00, // Reserved
  0x01, 0x00, // Type (1 = ICO)
  0x01, 0x00, // Number of images (1)
  // Image directory entry
  0x00,       // Width (0 = 256)
  0x00,       // Height (0 = 256)
  0x00, 0x00, // Color palette (0 = no palette)
  0x01, 0x00, // Reserved
  0x01, 0x00, // Color planes (1)
  0x20, 0x00, // Bits per pixel (32)
  0x08, 0x04, 0x00, 0x00, // Size of image data (1032 bytes)
  0x16, 0x00, 0x00, 0x00, // Offset to image data (22 bytes)
  // BMP header for 256x256 32-bit image
  0x28, 0x00, 0x00, 0x00, // Header size (40)
  0x00, 0x01, 0x00, 0x00, // Width (256)
  0x00, 0x01, 0x00, 0x00, // Height (512, includes AND mask)
  0x01, 0x00, // Planes (1)
  0x20, 0x00, // Bits per pixel (32)
  0x00, 0x00, 0x00, 0x00, // Compression (0 = none)
  0x00, 0x00, 0x10, 0x00, // Image size (262144 bytes)
  0x00, 0x00, 0x00, 0x00, // X pixels per meter
  0x00, 0x00, 0x00, 0x00, // Y pixels per meter
  0x00, 0x00, 0x00, 0x00, // Colors used (0)
  0x00, 0x00, 0x00, 0x00  // Important colors (0)
]);

// Create a simple blue 256x256 image data (BGRA format, bottom-up)
const imageData = Buffer.alloc(256 * 256 * 4); // 256x256 pixels, 4 bytes per pixel
for (let i = 0; i < imageData.length; i += 4) {
  imageData[i] = 0xE2;     // B
  imageData[i + 1] = 0x90; // G
  imageData[i + 2] = 0x4A; // R
  imageData[i + 3] = 0xFF; // A
}

// Create AND mask (1 bit per pixel, all transparent)
const andMask = Buffer.alloc(256 * 256 / 8, 0x00);

const icoFile = Buffer.concat([icoHeader, imageData, andMask]);
fs.writeFileSync(path.join(__dirname, 'icon.ico'), icoFile);
console.log('Created 256x256 placeholder icon.ico');

console.log('\nIcon generation complete!');
console.log('For better quality icons, consider:');
console.log('1. Using a professional icon design tool');
console.log('2. Converting the SVG to proper multi-resolution ICO/ICNS files');
console.log('3. Testing the icons on actual target platforms');