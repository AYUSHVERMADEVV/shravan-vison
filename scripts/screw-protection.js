// This script helps prevent screw protection issues during deployment
const fs = require('fs');
const path = require('path');

// Configuration
const BUILD_DIR = path.join(process.cwd(), '.next');
const PUBLIC_DIR = path.join(process.cwd(), 'public');

// Function to check if directory exists
const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Function to create a placeholder file if directory is empty
const ensureDirNotEmpty = (dir) => {
  ensureDirExists(dir);
  
  const files = fs.readdirSync(dir);
  if (files.length === 0) {
    const placeholderFile = path.join(dir, '.placeholder');
    console.log(`Creating placeholder file: ${placeholderFile}`);
    fs.writeFileSync(placeholderFile, '# This file ensures the directory is not empty\n');
  }
};

// Check build directory
console.log('Checking build directory...');
ensureDirNotEmpty(BUILD_DIR);

// Check public directory
console.log('Checking public directory...');
ensureDirNotEmpty(PUBLIC_DIR);

console.log('Screw protection check completed.');