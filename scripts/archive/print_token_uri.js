// Print the tokenURI for a given tokenId from the deployed contract on Polygon Amoy
// Usage: node scripts/print_token_uri.js <tokenId>

const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const CONTRACT_ADDRESS = "0xa78381ec4c989EA94DfDf56E83BDF3257209803C";
// Read ABI from TypeScript file as JSON
const constantsPath = path.join(__dirname, "../frontend/lib/constants.ts");
const abiRaw = fs.readFileSync(constantsPath, "utf8");
const abiMatch = abiRaw.match(/export const CONTRACT_ABI = (\[.*\]);/s);
if (!abiMatch) throw new Error("Could not parse ABI from constants.ts");
const CONTRACT_ABI = JSON.parse(abiMatch[1]);

// Polygon Amoy RPC endpoint (public)
const AMOY_RPC = process.env.AMOY_RPC_URL; // Use RPC URL from .env

async function main() {
  const tokenId = process.argv[2] || 2;
  const provider = new ethers.JsonRpcProvider(AMOY_RPC);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  const tokenUri = await contract.tokenURI(tokenId);
  console.log(`tokenURI for tokenId ${tokenId}: ${tokenUri}`);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
