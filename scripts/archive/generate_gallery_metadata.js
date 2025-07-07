// Script to generate flat metadata JSON files for all tokens in the gallery
// Run with: node scripts/generate_gallery_metadata.js

const fs = require('fs');
const path = require('path');

// Gallery token definitions (edit as needed)
const tokens = [
  { role: 'Observer', id: 1, name: 'Mint & Slurp', description: 'Attended a blockchain hang', image: 'mint_and_slurp.png' },
  { role: 'Observer', id: 2, name: 'Quad', description: 'Attended a speaker event', image: 'quad.png' },
  { role: 'Member', id: 3, name: 'Trader', description: 'Full digital asset trading membership with voting rights', image: 'tradercard.png' },
  { role: 'Member', id: 4, name: 'Initiation', description: 'Full membership with voting rights', image: 'initiation.png' }, // fixed typo!
  { role: 'Member', id: 5, name: 'Trader Chill', description: 'Full custom membership with voting rights', image: 'trader_chill.png' },
  { role: 'Member', id: 6, name: "Let's Get This Party Started", description: 'Standard 2025 membership with voting rights', image: 'letsgetthispartystarted2k25.png' },
  { role: 'Member', id: 7, name: 'Custom membership', description: 'Full custom membership with voting rights', image: 'future.png' },
  { role: 'Officer', id: 8, name: 'President', description: 'Club leadership with maximum voting power', image: 'pres.png' },
  { role: 'Officer', id: 9, name: 'Vice President', description: 'Assists the President in club leadership and decision-making.', image: 'vp.png' },
  { role: 'Officer', id: 10, name: 'CFO', description: 'Financial officer with treasury access', image: 'trader.png' },
  { role: 'Officer', id: 11, name: 'Treasurer', description: "Manages the club's financial records and treasury.", image: 'tres.png' },
  { role: 'Officer', id: 12, name: 'Major Key Alert', description: 'Key-holder with administrative access', image: 'major_key_alert.png' },
  { role: 'Officer', id: 13, name: 'Officer', description: 'Administrative privileges and enhanced voting power', image: 'officer.png' },
  { role: 'The Graduate', id: 14, name: 'The Graduate', description: 'For graduating or inactive members', image: 'the_graduate.png' },
  { role: 'Scholarship', id: 15, name: 'Rhodes Scholar', description: 'Awarded for merit or financial aid', image: 'rhodes_scholar.png' },
  { role: 'Founder Series', id: 16, name: 'Historical Glitch', description: 'For founding cohort or early backers', image: 'hist_glitch.png' },
  { role: 'Secret Sauce Token', id: 17, name: 'Secret Sauce', description: 'Earned from completing internal club course', image: 'secret_sauce.png' },
  { role: 'Gold Star Award', id: 18, name: 'Gold Star', description: 'For special recognition or contribution', image: 'gold_star.png' },
  { role: 'Loyalty Token', id: 19, name: 'Long Run', description: 'For milestones like 1-year membership', image: 'longrun.png' },
  { role: 'Art Drop', id: 20, name: 'Digital Art', description: 'Collectible + cultural fundraiser piece', image: 'digi_art.png' },
  { role: 'Replacement', id: 21, name: 'The Fool', description: 'Burn-and-replace when access is lost', image: 'the_fool.png' },
];

const baseCID = 'bafybeig73cxuszpu5cjhiaehfc7qootdk5k7qhml4cam73uvqhb2lkz3iu'; // Update as needed
const metadataDir = path.join(__dirname, '../MetadataFlat'); // Output directory (flat)

if (!fs.existsSync(metadataDir)) fs.mkdirSync(metadataDir, { recursive: true });

for (const token of tokens) {
  // You can use `${token.role.toLowerCase()}_${token.id}.json` for extra clarity, or just `${token.id}.json` for simple sequential files.
  const filePath = path.join(metadataDir, `${token.id}.json`);
  const meta = {
    name: token.name,
    description: token.description,
    image: `ipfs://${baseCID}/${token.image}`,
    attributes: [
      { trait_type: 'Role', value: token.role },
      { trait_type: 'Gallery', value: 'Blockchain Club' },
      { trait_type: 'Created', value: '2025-05-09' }
    ]
  };
  fs.writeFileSync(filePath, JSON.stringify(meta, null, 2));
  console.log(`Wrote ${filePath}`);
}

console.log('✅ Flat gallery metadata generation complete.');
console.log('📂 Metadata files are located in the MetadataFlat directory.');