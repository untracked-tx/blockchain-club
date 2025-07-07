const fs = require('fs');
const path = require('path');

const metadataDir = '../metadata';
const files = fs.readdirSync(metadataDir).filter(file => file.endsWith('.json'));

console.log('// Updated token types based on metadata files:');
console.log('const types = [');

files.forEach(file => {
  const filePath = path.join(metadataDir, file);
  const metadata = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  const attributes = {};
  metadata.attributes.forEach(attr => {
    attributes[attr.trait_type] = attr.value;
  });
  
  const tokenType = attributes['Token Type'];
  const category = attributes['Category'];
  const maxSupply = parseInt(attributes['Max Supply']);
  const soulbound = attributes['Soulbound'] === 'True';
  
  // Convert mint access
  let mintAccess;
  switch(attributes['Mint Access']) {
    case 'OFFICER_ONLY': mintAccess = 0; break;
    case 'WHITELIST_ONLY': mintAccess = 1; break;
    case 'PUBLIC': mintAccess = 2; break;
    default: mintAccess = 1;
  }
  
  // Convert role
  const role = attributes['Role'] === 'None' ? null : attributes['Role'];
  
  // Set expiration based on category
  let expiresIn;
  if (category === 'Governance') {
    expiresIn = 365*24*3600; // 1 year
  } else {
    expiresIn = 10*365*24*3600; // 10 years
  }
  
  console.log(`  { typeName: "${tokenType}", category: "${category}", maxSupply: ${maxSupply}, mintAccess: ${mintAccess}, expiresIn: ${expiresIn}, role: ${role ? '"' + role + '"' : 'null'}${soulbound ? ', soulbound: true' : ''} },`);
});

console.log('];');
