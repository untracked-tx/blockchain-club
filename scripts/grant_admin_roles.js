const ethers = require("ethers");
require("dotenv").config();

// --- LOAD DEPLOYMENT INFO ---
const deployment = require("../deployments/deployment.json");
const ROLES_ADDRESS = deployment.Roles.address;
const MEMBERSHIP_ADDRESS = deployment.BlockchainClubMembership.address;

// --- AMOY PROVIDER & WALLET ---
const AMOY_RPC = "https://polygon-amoy.g.alchemy.com/v2/BKOaUhVk2Adt-aEqV-3AaKd4nmnfdaGa";
const provider = new ethers.JsonRpcProvider(AMOY_RPC);
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) throw new Error("Set PRIVATE_KEY in your .env file");
const wallet = new ethers.Wallet(privateKey, provider);

// Get contract instances
const rolesArtifact = require("../artifacts/contracts/Roles.sol/Roles.json");
const rolesContract = new ethers.Contract(ROLES_ADDRESS, rolesArtifact.abi, wallet);

async function grantAdminRoles() {
  const yourAddress = wallet.address;
  console.log(`Granting roles to: ${yourAddress}`);
  
  try {
    // Grant ADMIN_ROLE (DEFAULT_ADMIN_ROLE)
    console.log("Granting ADMIN_ROLE...");
    const adminRoleHash = await rolesContract.ADMIN_ROLE();
    const tx1 = await rolesContract.grantRole(adminRoleHash, yourAddress);
    await tx1.wait();
    console.log("✅ ADMIN_ROLE granted");
    
    // Grant OFFICER_ROLE
    console.log("Granting OFFICER_ROLE...");
    const officerRoleHash = await rolesContract.OFFICER_ROLE();
    const tx2 = await rolesContract.grantRole(officerRoleHash, yourAddress);
    await tx2.wait();
    console.log("✅ OFFICER_ROLE granted");
    
    // Grant MEMBER_ROLE (just in case)
    console.log("Granting MEMBER_ROLE...");
    const memberRoleHash = await rolesContract.MEMBER_ROLE();
    const tx3 = await rolesContract.grantRole(memberRoleHash, yourAddress);
    await tx3.wait();
    console.log("✅ MEMBER_ROLE granted");
    
  } catch (error) {
    console.error("Error granting roles:", error.message);
  }
}

grantAdminRoles()
  .then(() => console.log("All roles granted!"))
  .catch(console.error);
