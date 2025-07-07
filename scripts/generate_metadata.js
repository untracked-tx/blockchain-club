const ethers = require("ethers");
require("dotenv").config();

// --- LOAD DEPLOYMENT INFO ---
const deployment = require("../deployments/deployment.json");
const CONTRACT_ADDRESS = deployment.BlockchainClubMembership.address;
const abi = deployment.BlockchainClubMembership.abi;

// --- AMOY PROVIDER ---
const AMOY_RPC = "https://rpc-amoy.polygon.technology";
const provider = new ethers.JsonRpcProvider(AMOY_RPC);

const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

// Function to convert string to URL-safe format (same as contract)
function toUrlSafe(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

// Token types and their metadata
const tokenMetadata = {
  // Member tokens
  "Trader": {
    name: "Trader",
    description: "Member with trading expertise and voting rights",
    image: "https://your-domain.com/images/trader.png",
    attributes: [
      { trait_type: "Category", value: "Governance" },
      { trait_type: "Role", value: "Member" },
      { trait_type: "Access Level", value: "Standard" },
      { trait_type: "Voting Power", value: "1x" }
    ]
  },
  "Initiation": {
    name: "Initiation",
    description: "Full membership with voting rights",
    image: "https://your-domain.com/images/initiation.png",
    attributes: [
      { trait_type: "Category", value: "Governance" },
      { trait_type: "Role", value: "Member" },
      { trait_type: "Access Level", value: "Standard" },
      { trait_type: "Voting Power", value: "1x" }
    ]
  },
  "Trader Chill": {
    name: "Trader Chill",
    description: "Full custom membership with voting rights",
    image: "https://your-domain.com/images/trader_chill.png",
    attributes: [
      { trait_type: "Category", value: "Governance" },
      { trait_type: "Role", value: "Member" },
      { trait_type: "Access Level", value: "Standard" },
      { trait_type: "Voting Power", value: "1x" }
    ]
  },
  "Let's Get This Party Started": {
    name: "Let's Get This Party Started",
    description: "Standard 2025 membership with voting rights",
    image: "https://your-domain.com/images/letsgetthispartystarted2k25.png",
    attributes: [
      { trait_type: "Category", value: "Governance" },
      { trait_type: "Role", value: "Member" },
      { trait_type: "Access Level", value: "Standard" },
      { trait_type: "Voting Power", value: "1x" }
    ]
  },
  "Custom Membership": {
    name: "Custom Membership",
    description: "Full custom membership with voting rights",
    image: "https://your-domain.com/images/future.png",
    attributes: [
      { trait_type: "Category", value: "Governance" },
      { trait_type: "Role", value: "Member" },
      { trait_type: "Access Level", value: "Standard" },
      { trait_type: "Voting Power", value: "1x" }
    ]
  },
  
  // Officer tokens
  "President": {
    name: "President",
    description: "Club leadership with maximum voting power",
    image: "https://your-domain.com/images/pres.png",
    attributes: [
      { trait_type: "Category", value: "Governance" },
      { trait_type: "Role", value: "Officer" },
      { trait_type: "Access Level", value: "Executive" },
      { trait_type: "Voting Power", value: "5x" }
    ]
  },
  "Vice President": {
    name: "Vice President",
    description: "Assists the President in club leadership and decision-making",
    image: "https://your-domain.com/images/vp.png",
    attributes: [
      { trait_type: "Category", value: "Governance" },
      { trait_type: "Role", value: "Officer" },
      { trait_type: "Access Level", value: "Executive" },
      { trait_type: "Voting Power", value: "3x" }
    ]
  },
  "CFO": {
    name: "CFO",
    description: "Financial officer with treasury access",
    image: "https://your-domain.com/images/trader.png",
    attributes: [
      { trait_type: "Category", value: "Governance" },
      { trait_type: "Role", value: "Officer" },
      { trait_type: "Access Level", value: "Executive" },
      { trait_type: "Voting Power", value: "3x" }
    ]
  },
  "Treasurer": {
    name: "Treasurer",
    description: "Manages the club's financial records and treasury",
    image: "https://your-domain.com/images/tres.png",
    attributes: [
      { trait_type: "Category", value: "Governance" },
      { trait_type: "Role", value: "Officer" },
      { trait_type: "Access Level", value: "Executive" },
      { trait_type: "Voting Power", value: "3x" }
    ]
  },
  "Major Key Alert": {
    name: "Major Key Alert",
    description: "Key-holder with administrative access",
    image: "https://your-domain.com/images/major_key_alert.png",
    attributes: [
      { trait_type: "Category", value: "Governance" },
      { trait_type: "Role", value: "Officer" },
      { trait_type: "Access Level", value: "Executive" },
      { trait_type: "Voting Power", value: "3x" }
    ]
  },
  "Officer": {
    name: "Officer",
    description: "Administrative privileges and enhanced voting power",
    image: "https://your-domain.com/images/officer.png",
    attributes: [
      { trait_type: "Category", value: "Governance" },
      { trait_type: "Role", value: "Officer" },
      { trait_type: "Access Level", value: "Executive" },
      { trait_type: "Voting Power", value: "3x" }
    ]
  },
  
  // Supporter tokens
  "The Graduate": {
    name: "The Graduate",
    description: "Alumni supporter with community access",
    image: "https://your-domain.com/images/graduate.png",
    attributes: [
      { trait_type: "Category", value: "Supporter" },
      { trait_type: "Role", value: "Community" },
      { trait_type: "Access Level", value: "Public" },
      { trait_type: "Voting Power", value: "0.5x" }
    ]
  },
  "Rhodes Scholar": {
    name: "Rhodes Scholar",
    description: "Academic excellence supporter",
    image: "https://your-domain.com/images/rhodes.png",
    attributes: [
      { trait_type: "Category", value: "Supporter" },
      { trait_type: "Role", value: "Community" },
      { trait_type: "Access Level", value: "Public" },
      { trait_type: "Voting Power", value: "0.5x" }
    ]
  },
  "Digital Art": {
    name: "Digital Art",
    description: "Creative community supporter",
    image: "https://your-domain.com/images/digital_art.png",
    attributes: [
      { trait_type: "Category", value: "Supporter" },
      { trait_type: "Role", value: "Community" },
      { trait_type: "Access Level", value: "Public" },
      { trait_type: "Voting Power", value: "0.5x" }
    ]
  },
  
  // POAP tokens
  "Mint & Slurp": {
    name: "Mint & Slurp",
    description: "Attended the Mint & Slurp event",
    image: "https://your-domain.com/images/mint_slurp.png",
    attributes: [
      { trait_type: "Category", value: "POAP" },
      { trait_type: "Role", value: "Event Participant" },
      { trait_type: "Access Level", value: "Event" },
      { trait_type: "Soulbound", value: "True" }
    ]
  },
  "Quad": {
    name: "Quad",
    description: "Participated in Quad event",
    image: "https://your-domain.com/images/quad.png",
    attributes: [
      { trait_type: "Category", value: "POAP" },
      { trait_type: "Role", value: "Event Participant" },
      { trait_type: "Access Level", value: "Event" },
      { trait_type: "Soulbound", value: "True" }
    ]
  },
  "Secret Sauce": {
    name: "Secret Sauce",
    description: "Attended exclusive Secret Sauce event",
    image: "https://your-domain.com/images/secret_sauce.png",
    attributes: [
      { trait_type: "Category", value: "POAP" },
      { trait_type: "Role", value: "Event Participant" },
      { trait_type: "Access Level", value: "Event" },
      { trait_type: "Soulbound", value: "True" }
    ]
  },
  
  // Award tokens
  "Founders Series": {
    name: "Founders Series",
    description: "Founding member recognition",
    image: "https://your-domain.com/images/founders.png",
    attributes: [
      { trait_type: "Category", value: "Award" },
      { trait_type: "Role", value: "Founder" },
      { trait_type: "Access Level", value: "Exclusive" },
      { trait_type: "Soulbound", value: "True" }
    ]
  },
  "Gold Star": {
    name: "Gold Star",
    description: "Excellence recognition award",
    image: "https://your-domain.com/images/gold_star.png",
    attributes: [
      { trait_type: "Category", value: "Award" },
      { trait_type: "Role", value: "Achiever" },
      { trait_type: "Access Level", value: "Exclusive" },
      { trait_type: "Soulbound", value: "True" }
    ]
  },
  "Long Run": {
    name: "Long Run",
    description: "Long-term commitment recognition",
    image: "https://your-domain.com/images/long_run.png",
    attributes: [
      { trait_type: "Category", value: "Award" },
      { trait_type: "Role", value: "Dedicated Member" },
      { trait_type: "Access Level", value: "Exclusive" },
      { trait_type: "Soulbound", value: "True" }
    ]
  }
};

async function generateMetadataFiles() {
  const fs = require('fs');
  const path = require('path');
  
  // Create metadata directory if it doesn't exist
  const metadataDir = path.join(__dirname, '../metadata');
  if (!fs.existsSync(metadataDir)) {
    fs.mkdirSync(metadataDir, { recursive: true });
  }
  
  console.log("Generating metadata files...\n");
  
  // Generate metadata file for each token type
  for (const [tokenType, metadata] of Object.entries(tokenMetadata)) {
    const safeTypeName = toUrlSafe(tokenType);
    const filename = `${safeTypeName}.json`;
    const filepath = path.join(metadataDir, filename);
    
    // Write metadata to file
    fs.writeFileSync(filepath, JSON.stringify(metadata, null, 2));
    
    console.log(`✅ Generated: ${filename}`);
    console.log(`   Token Type: ${tokenType}`);
    console.log(`   Safe Name: ${safeTypeName}`);
    console.log(`   Metadata: ${JSON.stringify(metadata, null, 2)}`);
    console.log('');
  }
  
  console.log(`\nGenerated ${Object.keys(tokenMetadata).length} metadata files in ${metadataDir}`);
  console.log("\nNext steps:");
  console.log("1. Update the image URLs in the metadata files to point to your actual images");
  console.log("2. Upload the metadata directory to IPFS");
  console.log("3. Update the contract's baseURI to the new IPFS CID");
  console.log("4. Deploy the upgraded contract");
}

generateMetadataFiles().catch(console.error);
