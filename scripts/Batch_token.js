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
  // Governance - Member tokens (WHITELIST_ONLY = 1)
  { typeName: "Trader", category: "Governance", maxSupply: 10, mintAccess: 1, expiresIn: 365*24*3600, role: "MEMBER" },
  { typeName: "Trader Chill", category: "Governance", maxSupply: 10, mintAccess: 1, expiresIn: 365*24*3600, role: "MEMBER" },
  { typeName: "Let's Get This Party Started", category: "Governance", maxSupply: 10, mintAccess: 1, expiresIn: 365*24*3600, role: "MEMBER" },
  { typeName: "Custom Membership", category: "Governance", maxSupply: 10, mintAccess: 1, expiresIn: 365*24*3600, role: "MEMBER" },

  // Governance - Officer tokens (OFFICER_ONLY = 0)
  { typeName: "President", category: "Governance", maxSupply: 2, mintAccess: 0, expiresIn: 365*24*3600, role: "OFFICER" },
  { typeName: "Vice President", category: "Governance", maxSupply: 2, mintAccess: 0, expiresIn: 365*24*3600, role: "OFFICER" },
  { typeName: "CFO", category: "Governance", maxSupply: 2, mintAccess: 0, expiresIn: 365*24*3600, role: "OFFICER" },
  { typeName: "Treasurer", category: "Governance", maxSupply: 2, mintAccess: 0, expiresIn: 365*24*3600, role: "OFFICER" },
  { typeName: "Major Key Alert", category: "Governance", maxSupply: 2, mintAccess: 0, expiresIn: 365*24*3600, role: "OFFICER" },
  { typeName: "Officer", category: "Governance", maxSupply: 2, mintAccess: 0, expiresIn: 365*24*3600, role: "OFFICER" },

  // Supporter tokens (PUBLIC = 2)
  { typeName: "The Graduate", category: "Supporter", maxSupply: 100000, mintAccess: 2, expiresIn: 10*365*24*3600, role: null },
  { typeName: "Rhodes Scholar", category: "Supporter", maxSupply: 100000, mintAccess: 2, expiresIn: 10*365*24*3600, role: null },
  { typeName: "Digital Art", category: "Supporter", maxSupply: 100000, mintAccess: 2, expiresIn: 10*365*24*3600, role: null },

  // POAPs (OFFICER_ONLY = 0)
  { typeName: "Mint & Slurp", category: "POAP", maxSupply: 1000, mintAccess: 0, expiresIn: 10*365*24*3600, role: null, soulbound: true },
  { typeName: "Quad", category: "POAP", maxSupply: 1000, mintAccess: 0, expiresIn: 10*365*24*3600, role: null, soulbound: true },
  { typeName: "Secret Sauce", category: "POAP", maxSupply: 1000, mintAccess: 0, expiresIn: 10*365*24*3600, role: null, soulbound: true },

  // Awards & Recognition (OFFICER_ONLY = 0)
  { typeName: "Founders Series", category: "Award", maxSupply: 100, mintAccess: 0, expiresIn: 10*365*24*3600, role: null, soulbound: true },
  { typeName: "Gold Star", category: "Award", maxSupply: 100, mintAccess: 0, expiresIn: 10*365*24*3600, role: null, soulbound: true },
  { typeName: "Long Run", category: "Award", maxSupply: 100, mintAccess: 0, expiresIn: 10*365*24*3600, role: null, soulbound: true },

  // Replacement (OFFICER_ONLY = 0)
  { typeName: "The Fool", category: "Replacement", maxSupply: 100, mintAccess: 0, expiresIn: 10*365*24*3600, role: null, soulbound: true }
];

async function batchCreateTokenTypes(contract) {
  for (const t of types) {
    const typeId = keccak256(toUtf8Bytes(t.typeName));
    const now = Math.floor(Date.now() / 1000);
    const startTime = now;
    const endTime = now + t.expiresIn;
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
    console.log(`Created token type: ${t.typeName}`);
  }
}

batchCreateTokenTypes(contract)
  .then(() => console.log("All token types created!"))
  .catch(console.error);
