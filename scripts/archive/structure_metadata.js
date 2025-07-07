// Script to automate moving/copying metadata files into role-based subfolders for IPFS upload
// Usage: node scripts/structure_metadata.js

const fs = require('fs');
const path = require('path');

// Map of tokenId to role (add more as needed)
const tokenRoleMap = {
  1: 'Officer',
  2: 'The Graduate',
  // Add more mappings here as needed
};

const metadataDir = path.join(__dirname, '../Metadata');

for (const [tokenId, role] of Object.entries(tokenRoleMap)) {
  const src = path.join(metadataDir, `${tokenId}.json`);
  const destDir = path.join(metadataDir, role);
  const dest = path.join(destDir, `${tokenId}.json`);

  if (!fs.existsSync(src)) {
    console.warn(`Source file not found: ${src}`);
    continue;
  }
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
  console.log(`Copied ${src} -> ${dest}`);
}

console.log('Metadata structuring complete.');
