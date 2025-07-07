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

// List of token types to check
const tokenTypes = [
  "Trader", "Initiation", "Trader Chill", "Let's Get This Party Started", "Custom Membership",
  "President", "Vice President", "CFO", "Treasurer", "Major Key Alert", "Officer",
  "The Graduate", "Rhodes Scholar", "Digital Art",
  "Mint & Slurp", "Quad", "Secret Sauce",
  "Founders Series", "Gold Star", "Long Run"
];

async function checkTokenTypes() {
  console.log("Checking token types in contract...\n");
  
  for (const tokenType of tokenTypes) {
    try {
      const tokenTypeBytes32 = ethers.keccak256(ethers.toUtf8Bytes(tokenType));
      const config = await contract.tokenTypeConfigs(tokenTypeBytes32);
      
      console.log(`✅ ${tokenType}:`);
      console.log(`   Name: ${config.name}`);
      console.log(`   Category: ${config.category}`);
      console.log(`   Max Supply: ${config.maxSupply}`);
      console.log(`   Current Supply: ${config.currentSupply}`);
      console.log(`   Is Active: ${config.isActive}`);
      console.log(`   Mint Access: ${config.mintAccess} (0=OFFICER, 1=WHITELIST, 2=PUBLIC)`);
      console.log(`   Start Time: ${new Date(Number(config.startTime) * 1000).toLocaleString()}`);
      console.log(`   End Time: ${new Date(Number(config.endTime) * 1000).toLocaleString()}`);
      console.log('');
    } catch (error) {
      console.log(`❌ ${tokenType}: NOT FOUND`);
    }
  }
}

checkTokenTypes().catch(console.error);
