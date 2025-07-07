// upload_and_generate_csv.js
// Usage: NFT_STORAGE_KEY=your_key node scripts/upload_and_generate_csv.js
// This script uploads the Metadata folder to NFT.Storage, gets the CID, and generates a CSV for NFT.Storage.

const fs = require('fs');
const path = require('path');
const { NFTStorage, File } = require('nft.storage');
const mime = require('mime');

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

const METADATA_DIR = path.join(__dirname, '../Metadata');
const OUTPUT_CSV = path.join(METADATA_DIR, 'tokens_upload.csv');

function walkDir(dir) {
  let files = [];
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      files = files.concat(walkDir(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

async function main() {
  const apiKey = process.env.NFT_STORAGE_KEY;
  if (!apiKey) {
    console.error('Set NFT_STORAGE_KEY env variable.');
    process.exit(1);
  }
  const client = new NFTStorage({ token: apiKey });

  // Gather all files in Metadata folder (excluding the CSV itself)
  const allFiles = walkDir(METADATA_DIR).filter(f => !f.endsWith('tokens_upload.csv'));
  const filesForUpload = allFiles.map(f => {
    const rel = path.relative(METADATA_DIR, f);
    return new File([
      fs.readFileSync(f)
    ], rel, { type: mime.getType(f) || 'application/octet-stream' });
  });

  console.log('Uploading Metadata folder to NFT.Storage...');
  const cid = await client.storeDirectory(filesForUpload);
  console.log('Upload complete. CID:', cid);

  // Generate CSV
  const header = 'tokenID,cid\n';
  let csv = header;
  for (const tokenId of Object.keys(tokenRoleMap)) {
    csv += `${tokenId},${cid}\n`;
  }
  fs.writeFileSync(OUTPUT_CSV, csv);
  console.log('CSV written to', OUTPUT_CSV);
}

main().catch(e => { console.error(e); process.exit(1); });
