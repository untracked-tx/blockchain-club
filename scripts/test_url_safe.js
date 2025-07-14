// Test script to verify _toUrlSafe transformation matches contract logic
// The Solidity function converts:
// - A-Z to a-z (lowercase)
// - keeps a-z, 0-9 
// - replaces everything else with underscore

function toUrlSafe(str) {
  return str.split('').map(char => {
    const code = char.charCodeAt(0);
    
    // A-Z (0x41-0x5A) -> convert to lowercase
    if (code >= 0x41 && code <= 0x5A) {
      return char.toLowerCase();
    }
    // a-z (0x61-0x7A) -> keep as is
    else if (code >= 0x61 && code <= 0x7A) {
      return char;
    }
    // 0-9 (0x30-0x39) -> keep as is
    else if (code >= 0x30 && code <= 0x39) {
      return char;
    }
    // everything else -> underscore
    else {
      return '_';
    }
  }).join('');
}

// Test cases from the token types
const testCases = [
  "Trader",
  "Initiation", 
  "Trader Chill",
  "Let's Get This Party Started",
  "Custom Membership",
  "President",
  "Vice President",
  "CFO",
  "Treasurer",
  "Major Key Alert",
  "Officer",
  "The Graduate",
  "Rhodes Scholar",
  "Digital Art",
  "Mint & Slurp",
  "Quad",
  "Secret Sauce",
  "Founders Series",
  "Gold Star",
  "Long Run"
];

console.log("Token Type -> Expected Filename");
console.log("=".repeat(50));

testCases.forEach(tokenType => {
  const urlSafe = toUrlSafe(tokenType);
  console.log(`${tokenType} -> ${urlSafe}.json`);
});
