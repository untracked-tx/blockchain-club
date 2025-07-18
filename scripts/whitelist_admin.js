const ethers = require("ethers");
require("dotenv").config();
const artifact = require("../artifacts/contracts/BlockchainClubMembership.sol/BlockchainClubMembership.json");

const AMOY_RPC = "https://polygon-amoy.g.alchemy.com/v2/BKOaUhVk2Adt-aEqV-3AaKd4nmnfdaGa";
const provider = new ethers.JsonRpcProvider(AMOY_RPC);
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) throw new Error("Set PRIVATE_KEY in your .env file");
const wallet = new ethers.Wallet(privateKey, provider);

const CONTRACT_ADDRESS = require("../deployments/deployment.json").BlockchainClubMembership.address;
const abi = artifact.abi;
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

async function whitelistAdmin() {
  const adminAddress = wallet.address;
  console.log(`Adding ${adminAddress} to whitelist...`);
  
  try {
    const tx = await contract.updateWhitelist(adminAddress, true);
    await tx.wait();
    console.log("✅ Admin address added to whitelist");
    
    // Verify whitelist status
    const isWhitelisted = await contract.whitelist(adminAddress);
    console.log(`Verification: Admin is whitelisted: ${isWhitelisted}`);
  } catch (error) {
    console.error("Error updating whitelist:", error.message);
  }
}

whitelistAdmin()
  .then(() => console.log("Done!"))
  .catch(console.error);
