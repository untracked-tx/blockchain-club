const ethers = require("ethers");
require("dotenv").config();

// --- LOAD DEPLOYMENT INFO ---
const deployment = require("../deployments/deployment.json");
const MEMBERSHIP_ADDRESS = deployment.BlockchainClubMembership.address;

// --- AMOY PROVIDER & WALLET ---
const AMOY_RPC = "https://rpc-amoy.polygon.technology";
const provider = new ethers.JsonRpcProvider(AMOY_RPC);
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) throw new Error("Set PRIVATE_KEY in your .env file");
const wallet = new ethers.Wallet(privateKey, provider);

// Get contract instance
const membershipArtifact = require("../artifacts/contracts/BlockchainClubMembership.sol/BlockchainClubMembership.json");
const membershipContract = new ethers.Contract(MEMBERSHIP_ADDRESS, membershipArtifact.abi, wallet);

async function addToWhitelist() {
  const yourAddress = wallet.address;
  console.log(`Adding to whitelist: ${yourAddress}`);
  
  try {
    // Check if already whitelisted
    const isWhitelisted = await membershipContract.whitelist(yourAddress);
    if (isWhitelisted) {
      console.log("✅ Already whitelisted!");
      return;
    }

    // Add to whitelist
    console.log("Adding to whitelist...");
    const tx = await membershipContract.updateWhitelist(yourAddress, true);
    await tx.wait();
    console.log("✅ Successfully added to whitelist!");
    
    // Verify
    const newStatus = await membershipContract.whitelist(yourAddress);
    console.log(`Whitelist status: ${newStatus}`);
    
  } catch (error) {
    console.error("Error adding to whitelist:", error.message);
  }
}

addToWhitelist()
  .then(() => console.log("Whitelist operation completed!"))
  .catch(console.error);
