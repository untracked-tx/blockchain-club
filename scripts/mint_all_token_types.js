const ethers = require("ethers");
const { keccak256, toUtf8Bytes } = require("ethers");
require("dotenv").config();
const deployment = require("../deployments/deployment.json");
const CONTRACT_ADDRESS = deployment.BlockchainClubMembership.address;
const abi = deployment.BlockchainClubMembership.abi;

const AMOY_RPC = "https://polygon-amoy.g.alchemy.com/v2/BKOaUhVk2Adt-aEqV-3AaKd4nmnfdaGa";
const provider = new ethers.JsonRpcProvider(AMOY_RPC);
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) throw new Error("Set PRIVATE_KEY in your .env file");
const wallet = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

const types = [
  { typeName: "CFO", mintAccess: 0 },
  { typeName: "Major Key Alert", mintAccess: 0 },
  { typeName: "Officer", mintAccess: 0 },
  { typeName: "President", mintAccess: 0 },
  { typeName: "Treasurer", mintAccess: 0 },
  { typeName: "Vice President", mintAccess: 0 },
  { typeName: "Custom Membership", mintAccess: 1 },
  { typeName: "Let's Get This Party Started", mintAccess: 1 },
  { typeName: "Trader", mintAccess: 1 },
  { typeName: "Trader Chill", mintAccess: 1 },
  { typeName: "Digital Art", mintAccess: 2 },
  { typeName: "Rhodes Scholar", mintAccess: 2 },
  { typeName: "The Graduate", mintAccess: 2 },
  { typeName: "Mint & Slurp", mintAccess: 0, soulbound: true },
  { typeName: "Quad", mintAccess: 0, soulbound: true },
  { typeName: "Secret Sauce", mintAccess: 0, soulbound: true },
  { typeName: "Founders Series", mintAccess: 0, soulbound: true },
  { typeName: "Gold Star", mintAccess: 0, soulbound: true },
  { typeName: "Long Run", mintAccess: 0, soulbound: true },
  { typeName: "The Fool", mintAccess: 0, soulbound: true }
];

async function mintAll() {
  for (const t of types) {
    const typeId = keccak256(toUtf8Bytes(t.typeName));
    const isSoulbound = !!t.soulbound;
    try {
      if (t.mintAccess === 0) {
        // Officer only, use officer mint
        const tx = await contract.mint(wallet.address, typeId, isSoulbound);
        await tx.wait();
        console.log(`✅ Minted officer token: ${t.typeName}`);
      } else {
        // Use public mint
        const tx = await contract.publicMint(typeId, isSoulbound);
        await tx.wait();
        console.log(`✅ Minted public/whitelist token: ${t.typeName}`);
      }
    } catch (e) {
      // Print detailed error info for frontend/backend debugging
      if (e.error && e.error.message) {
        console.error(`❌ Error minting ${t.typeName}:`, e.error.message);
      } else if (e.reason) {
        console.error(`❌ Error minting ${t.typeName}:`, e.reason);
      } else if (e.message) {
        console.error(`❌ Error minting ${t.typeName}:`, e.message);
      } else {
        console.error(`❌ Error minting ${t.typeName}:`, e);
      }
    }
  }
}

mintAll().then(() => console.log("All tokens minted!"));
