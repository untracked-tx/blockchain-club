const ethers = require("ethers");
require("dotenv").config();

// --- LOAD DEPLOYMENT INFO ---
const deployment = require("../deployments/deployment.json");
const ROLES_ADDRESS = deployment.Roles.address;
const MEMBERSHIP_ADDRESS = deployment.BlockchainClubMembership.address;

// --- AMOY PROVIDER & WALLET ---
const AMOY_RPC = "https://rpc-amoy.polygon.technology";
const provider = new ethers.JsonRpcProvider(AMOY_RPC);
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) throw new Error("Set PRIVATE_KEY in your .env file");
const wallet = new ethers.Wallet(privateKey, provider);

// Get contract instances
const rolesArtifact = require("../artifacts/contracts/Roles.sol/Roles.json");
const membershipArtifact = require("../artifacts/contracts/BlockchainClubMembership.sol/BlockchainClubMembership.json");

const rolesContract = new ethers.Contract(ROLES_ADDRESS, rolesArtifact.abi, provider);
const membershipContract = new ethers.Contract(MEMBERSHIP_ADDRESS, membershipArtifact.abi, provider);

async function checkWalletStatus() {
  const yourAddress = wallet.address;
  console.log(`Checking roles for: ${yourAddress}\n`);
  
  try {
    // Check roles
    const adminRoleHash = await rolesContract.DEFAULT_ADMIN_ROLE();
    const officerRoleHash = await rolesContract.OFFICER_ROLE();
    const memberRoleHash = await rolesContract.MEMBER_ROLE();
    
    const isAdmin = await rolesContract.hasRole(adminRoleHash, yourAddress);
    const isOfficer = await rolesContract.hasRole(officerRoleHash, yourAddress);
    const isMember = await rolesContract.hasRole(memberRoleHash, yourAddress);
    
    console.log("=== ROLES STATUS ===");
    console.log(`Admin Role: ${isAdmin ? '✅' : '❌'}`);
    console.log(`Officer Role: ${isOfficer ? '✅' : '❌'}`);
    console.log(`Member Role: ${isMember ? '✅' : '❌'}`);
    
    // Check whitelist status
    const isWhitelisted = await membershipContract.whitelist(yourAddress);
    console.log(`\n=== WHITELIST STATUS ===`);
    console.log(`Whitelisted: ${isWhitelisted ? '✅' : '❌'}`);
    
    // Check member stats
    const memberStats = await membershipContract.memberStats(yourAddress);
    console.log(`\n=== MEMBER STATS ===`);
    console.log(`Join Date: ${memberStats.joinDate > 0 ? new Date(Number(memberStats.joinDate) * 1000).toLocaleString() : 'Not joined'}`);
    console.log(`Token Count: ${memberStats.tokenCount.toString()}`);
    console.log(`Is Active: ${memberStats.isActive}`);
    
    // Check token balance
    const tokenBalance = await membershipContract.balanceOf(yourAddress);
    console.log(`Total Tokens Owned: ${tokenBalance.toString()}`);
    
  } catch (error) {
    console.error("Error checking wallet status:", error.message);
  }
}

checkWalletStatus()
  .then(() => console.log("\nStatus check completed!"))
  .catch(console.error);
