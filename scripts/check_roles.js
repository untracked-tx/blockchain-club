const ethers = require("ethers");
require("dotenv").config();

// --- LOAD DEPLOYMENT INFO ---
const deployment = require("../deployments/deployment.json");
const ROLES_ADDRESS = deployment.Roles.address;

// --- AMOY PROVIDER & WALLET ---
const AMOY_RPC = "https://rpc-amoy.polygon.technology";
const provider = new ethers.JsonRpcProvider(AMOY_RPC);
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) throw new Error("Set PRIVATE_KEY in your .env file");
const wallet = new ethers.Wallet(privateKey, provider);

// Get contract instances
const rolesArtifact = require("../artifacts/contracts/Roles.sol/Roles.json");
const rolesContract = new ethers.Contract(ROLES_ADDRESS, rolesArtifact.abi, wallet);

async function checkRoles() {
  const yourAddress = wallet.address;
  console.log(`Checking roles for: ${yourAddress}`);
  console.log("=".repeat(50));
  
  try {
    // Get role hashes
    const adminRoleHash = await rolesContract.ADMIN_ROLE();
    const officerRoleHash = await rolesContract.OFFICER_ROLE();
    const memberRoleHash = await rolesContract.MEMBER_ROLE();
    
    console.log(`Admin Role Hash: ${adminRoleHash}`);
    console.log(`Officer Role Hash: ${officerRoleHash}`);
    console.log(`Member Role Hash: ${memberRoleHash}`);
    console.log("=".repeat(50));
    
    // Check each role
    const hasAdminRole = await rolesContract.hasRole(adminRoleHash, yourAddress);
    const hasOfficerRole = await rolesContract.hasRole(officerRoleHash, yourAddress);
    const hasMemberRole = await rolesContract.hasRole(memberRoleHash, yourAddress);
    
    console.log(`Has ADMIN_ROLE: ${hasAdminRole ? "✅ YES" : "❌ NO"}`);
    console.log(`Has OFFICER_ROLE: ${hasOfficerRole ? "✅ YES" : "❌ NO"}`);
    console.log(`Has MEMBER_ROLE: ${hasMemberRole ? "✅ YES" : "❌ NO"}`);
    console.log("=".repeat(50));
    
    // Check voting power
    const votingPower = await rolesContract.getVotingPower(yourAddress);
    const customVotingPower = await rolesContract.customVotingPower(yourAddress);
    
    console.log(`Voting Power: ${votingPower}`);
    console.log(`Custom Voting Power: ${customVotingPower}`);
    
  } catch (error) {
    console.error("Error checking roles:", error.message);
  }
}

checkRoles()
  .then(() => console.log("Role check complete!"))
  .catch(console.error);
