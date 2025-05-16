// Script to generate metadata JSON files for all tokens in the gallery
// Run with: node scripts/generate_gallery_metadata.js

const fs = require('fs');
const path = require('path');

// Gallery token definitions (from gallery/page.tsx)
const tokens = [
  // Observer
  { role: 'Observer', id: 1, name: 'Mint & Slurp', description: 'Attended a blockchain workshop', image: 'mint_and_slurp.png' },
  { role: 'Observer', id: 2, name: 'Quad', description: 'Attended a speaker event', image: 'quad.png' },
  // Member
  { role: 'Member', id: 3, name: 'Trader', description: 'Full digital asset trading membership with voting rights', image: 'tradercard.png' },
  { role: 'Member', id: 4, name: 'Initiation', description: 'Full membership with voting rights', image: 'inititation.png' },
  { role: 'Member', id: 5, name: 'Trader Chill', description: 'Full custom membership with voting rights', image: 'trader_chill.png' },
  { role: 'Member', id: 6, name: "Let's Get This Party Started", description: 'Standard 2025 membership with voting rights', image: 'letsgetthispartystarted2k25.png' },
  { role: 'Member', id: 7, name: 'Custom membership', description: 'Full custom membership with voting rights', image: 'future.png' },
  // Officer
  { role: 'Officer', id: 8, name: 'President', description: 'Club leadership with maximum voting power', image: 'pres.png' },
  { role: 'Officer', id: 9, name: 'Vice President', description: 'Assists the President in club leadership and decision-making.', image: 'vp.png' },
  { role: 'Officer', id: 10, name: 'CFO', description: 'Financial officer with treasury access', image: 'trader.png' },
  { role: 'Officer', id: 11, name: 'Treasurer', description: "Manages the club's financial records and treasury.", image: 'tres.png' },
  { role: 'Officer', id: 12, name: 'Major Key Alert', description: 'Key-holder with administrative access', image: 'major_key_alert.png' },
  { role: 'Officer', id: 13, name: 'Officer', description: 'Administrative privileges and enhanced voting power', image: 'officer.png' },
  // Alumni
  { role: 'The Graduate', id: 14, name: 'The Graduate', description: 'For graduating or inactive members', image: 'the_graduate.png' },
  // Scholarship
  { role: 'Scholarship', id: 15, name: 'Rhodes Scholar', description: 'Awarded for merit or financial aid', image: 'rhodes_scholar.png' },
  // Founder Series
  { role: 'Founder Series', id: 16, name: 'Historical Glitch', description: 'For founding cohort or early backers', image: 'hist_glitch.png' },
  // Secret Sauce Token
  { role: 'Secret Sauce Token', id: 17, name: 'Secret Sauce', description: 'Earned from completing internal club course', image: 'secret_sauce.png' },
  // Gold Star Award
  { role: 'Gold Star Award', id: 18, name: 'Gold Star', description: 'For special recognition or contribution', image: 'gold_star.png' },
  // Loyalty Token
  { role: 'Loyalty Token', id: 19, name: 'Long Run', description: 'For milestones like 1-year membership', image: 'longrun.png' },
  // Art Drop
  { role: 'Art Drop', id: 20, name: 'Digital Art', description: 'Collectible + cultural fundraiser piece', image: 'digi_art.png' },
  // Replacement
  { role: 'Replacement', id: 21, name: 'The Fool', description: 'Burn-and-replace when access is lost', image: 'the_fool.png' },
];

const baseCID = 'bafybeibemcwls5jmwjaoswwsfrsx7hglqrqcjjw5ljuycl7zvqjwthutl4'; // Update if needed
const metadataDir = path.join(__dirname, '../Metadata');

for (const token of tokens) {
  const folder = path.join(metadataDir, token.role);
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
  const filePath = path.join(folder, `${token.id}.json`);
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

console.log('Gallery metadata generation complete.');
