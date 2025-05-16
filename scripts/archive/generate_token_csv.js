// Usage: node scripts/generate_token_csv.js <startId> <endId>
// Example: node scripts/generate_token_csv.js 1 21

const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const CONTRACT_ADDRESS = "0xa78381ec4c989EA94DfDf56E83BDF3257209803C";
const constantsPath = path.join(__dirname, "../frontend/lib/constants.ts");
const abiRaw = fs.readFileSync(constantsPath, "utf8");
const abiMatch = abiRaw.match(/export const CONTRACT_ABI = (\[.*\]);/s);
if (!abiMatch) throw new Error("Could not parse ABI from constants.ts");
const CONTRACT_ABI = JSON.parse(abiMatch[1]);

const AMOY_RPC = process.env.AMOY_RPC_URL; // Use RPC URL from .env

async function main() {
  const startId = parseInt(process.argv[2] || "1", 10);
  const endId = parseInt(process.argv[3] || "21", 10);

  const provider = new ethers.JsonRpcProvider(AMOY_RPC);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

  const rows = [["tokenID", "tokenURI"]];
  for (let tokenId = startId; tokenId <= endId; tokenId++) {
    try {
      const tokenUri = await contract.tokenURI(tokenId);
      rows.push([tokenId, tokenUri]);
      console.log(`Fetched tokenURI for tokenId ${tokenId}: ${tokenUri}`);
    } catch (err) {
      rows.push([tokenId, "ERROR"]);
      console.error(`Error fetching tokenURI for tokenId ${tokenId}:`, err.message);
    }
  }

  const csv = rows.map(row => row.join(",")).join("\n");
  const outPath = path.join(__dirname, "../Metadata/tokens_upload.csv");
  fs.writeFileSync(outPath, csv);
  console.log(`\nCSV written to ${outPath}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});