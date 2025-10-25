#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Copy public folder to out folder
const publicDir = path.join(__dirname, 'public');
const outDir = path.join(__dirname, 'out');
const outPublicDir = path.join(outDir, 'public');

// Check if public directory exists
if (!fs.existsSync(publicDir)) {
  console.log('No public directory found, skipping copy.');
  process.exit(0);
}

// Create out/public directory if it doesn't exist
if (!fs.existsSync(outPublicDir)) {
  fs.mkdirSync(outPublicDir, { recursive: true });
  console.log('Created out/public directory');
}

// Copy all files from public to out/public
try {
  const files = fs.readdirSync(publicDir);
  
  files.forEach(file => {
    const srcPath = path.join(publicDir, file);
    const destPath = path.join(outPublicDir, file);
    
    const stat = fs.statSync(srcPath);
    if (stat.isFile()) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied: ${file}`);
    }
  });
  
  console.log('✓ Public folder copied successfully to out/public');
} catch (error) {
  console.error('Error copying public folder:', error.message);
  process.exit(1);
}
