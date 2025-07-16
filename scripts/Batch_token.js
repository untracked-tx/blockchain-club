const ethers = require("ethers");
const { keccak256, toUtf8Bytes } = require("ethers");
require("dotenv").config();
const fs = require("fs");

// --- LOAD DEPLOYMENT INFO ---
const deployment = require("../deployments/deployment.json");
const CONTRACT_ADDRESS = deployment.BlockchainClubMembership.address;
const abi = deployment.BlockchainClubMembership.abi;

// --- AMOY PROVIDER & WALLET ---
const AMOY_RPC = "https://rpc-amoy.polygon.technology";
const provider = new ethers.JsonRpcProvider(AMOY_RPC);
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) throw new Error("Set PRIVATE_KEY in your .env file");
const wallet = new ethers.Wallet(privateKey, provider);

const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

const types = [
  // Governance - Officer tokens (OFFICER_ONLY = 0, soulbound)
  { typeName: "CFO", category: "Governance", maxSupply: 2, mintAccess: 0, expiresIn: 31536000, role: "OFFICER", soulbound: true },
  { typeName: "Major Key Alert", category: "Governance", maxSupply: 2, mintAccess: 0, expiresIn: 31536000, role: "OFFICER", soulbound: true },
  { typeName: "Officer", category: "Governance", maxSupply: 2, mintAccess: 0, expiresIn: 31536000, role: "OFFICER", soulbound: true },
  { typeName: "President", category: "Governance", maxSupply: 2, mintAccess: 0, expiresIn: 31536000, role: "OFFICER", soulbound: true },
  { typeName: "Treasurer", category: "Governance", maxSupply: 2, mintAccess: 0, expiresIn: 31536000, role: "OFFICER", soulbound: true },
  { typeName: "Vice President", category: "Governance", maxSupply: 2, mintAccess: 0, expiresIn: 31536000, role: "OFFICER", soulbound: true },

  // Governance - Member tokens (WHITELIST_ONLY = 1, soulbound)
  { typeName: "Custom Membership", category: "Governance", maxSupply: 10, mintAccess: 1, expiresIn: 31536000, role: "MEMBER", soulbound: true },
  { typeName: "Let's Get This Party Started", category: "Governance", maxSupply: 10, mintAccess: 1, expiresIn: 31536000, role: "MEMBER", soulbound: true },
  { typeName: "Trader", category: "Governance", maxSupply: 10, mintAccess: 1, expiresIn: 31536000, role: "MEMBER", soulbound: true },
  { typeName: "Trader Chill", category: "Governance", maxSupply: 10, mintAccess: 1, expiresIn: 31536000, role: "MEMBER", soulbound: true },

  // Supporter tokens (PUBLIC = 2, transferable)
  { typeName: "Digital Art", category: "Supporter", maxSupply: 100000, mintAccess: 2, expiresIn: 315360000, role: null },
  { typeName: "Rhodes Scholar", category: "Supporter", maxSupply: 100000, mintAccess: 2, expiresIn: 315360000, role: null },
  { typeName: "The Graduate", category: "Supporter", maxSupply: 100000, mintAccess: 2, expiresIn: 315360000, role: null },

  // POAPs (OFFICER_ONLY = 0, soulbound)
  { typeName: "Mint & Slurp", category: "POAP", maxSupply: 1000, mintAccess: 0, expiresIn: 315360000, role: null, soulbound: true },
  { typeName: "Quad", category: "POAP", maxSupply: 1000, mintAccess: 0, expiresIn: 315360000, role: null, soulbound: true },
  { typeName: "Secret Sauce", category: "POAP", maxSupply: 1000, mintAccess: 0, expiresIn: 315360000, role: null, soulbound: true },

  // Awards & Recognition (OFFICER_ONLY = 0, soulbound)  
  { typeName: "Founders Series", category: "Award", maxSupply: 100, mintAccess: 0, expiresIn: 315360000, role: null, soulbound: true },
  { typeName: "Gold Star", category: "Award", maxSupply: 100, mintAccess: 0, expiresIn: 315360000, role: null, soulbound: true },
  { typeName: "Long Run", category: "Award", maxSupply: 100, mintAccess: 0, expiresIn: 315360000, role: null, soulbound: true },
  { typeName: "Historical Glitch", category: "Award", maxSupply: 100, mintAccess: 0, expiresIn: 315360000, role: null, soulbound: true },

  // Replacement (OFFICER_ONLY = 0, soulbound)
  { typeName: "The Fool", category: "Replacement", maxSupply: 100, mintAccess: 0, expiresIn: 315360000, role: null, soulbound: true }
];

async function batchCreateTokenTypes(contract) {
  for (const t of types) {
    const typeId = keccak256(toUtf8Bytes(t.typeName));
    
    try {
      // Check if token type already exists
      const existingConfig = await contract.tokenTypeConfigs(typeId);
      if (existingConfig.maxSupply > 0) {
        console.log(`⏭️  Token type "${t.typeName}" already exists, skipping...`);
        continue;
      }
    } catch (error) {
      // Token type doesn't exist, which is fine - we'll create it
    }
    
    const now = Math.floor(Date.now() / 1000);
    const startTime = now;
    const endTime = now + t.expiresIn;
    
    try {
      const tx = await contract.createTokenType(
        typeId,
        t.typeName,
        t.category,
        startTime,
        endTime,
        t.maxSupply,
        t.mintAccess // 0: OFFICER_ONLY, 1: WHITELIST_ONLY, 2: PUBLIC
      );
      await tx.wait();
      console.log(`✅ Created token type: ${t.typeName}`);
    } catch (error) {
      if (error.message.includes("Type already exists")) {
        console.log(`⏭️  Token type "${t.typeName}" already exists, skipping...`);
      } else {
        console.error(`❌ Error creating token type "${t.typeName}":`, error.message);
      }
    }
  }
}

batchCreateTokenTypes(contract)
  .then(() => console.log("All token types created!"))
  .catch(console.error);
