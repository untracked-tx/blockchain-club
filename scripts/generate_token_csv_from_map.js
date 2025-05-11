// generate_token_csv_from_map.js
// Usage: node scripts/generate_token_csv_from_map.js

const fs = require('fs');
const path = require('path');

// === EDIT THIS MAPPING AND BASE CID ===
const tokenRoleMap = {
  1: "Observer",
  2: "The Graduate",
  3: "Member",
  4: "Member",
  5: "Officer",
  6: "Officer",
  7: "Officer",
  8: "Officer",
  9: "Officer",
  10: "Officer",
  11: "Officer",
  12: "Officer",
  13: "Officer",
  14: "Officer",
  15: "Officer",
  16: "Officer",
  17: "Officer",
  18: "Officer",
  19: "Officer",
  20: "Art Drop",
  21: "Founder Series"
};
const baseCID = "bafy...xyz"; // <-- Replace with your actual base CID (no ipfs:// prefix)

const outputPath = path.join(__dirname, '../Metadata/tokens_upload.csv');

const header = 'tokenId,tokenURI\n';
let csv = header;

for (const [tokenId, role] of Object.entries(tokenRoleMap)) {
  const tokenURI = `ipfs://${baseCID}/${role}/${tokenId}.json`;
  csv += `${tokenId},${tokenURI}\n`;
}

fs.writeFileSync(outputPath, csv);
console.log(`CSV written to ${outputPath}`);
