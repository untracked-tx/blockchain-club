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

async function grantAdminRole() {
  const yourAddress = wallet.address;
  console.log(`Granting ADMIN_ROLE to: ${yourAddress}`);
  
  try {
    // Grant ADMIN_ROLE (DEFAULT_ADMIN_ROLE)
    console.log("Granting ADMIN_ROLE...");
    const adminRoleHash = await rolesContract.ADMIN_ROLE();
    const tx = await rolesContract.grantRole(adminRoleHash, yourAddress);
    await tx.wait();
    console.log("✅ ADMIN_ROLE granted");
    
  } catch (error) {
    console.error("Error granting admin role:", error.message);
  }
}

grantAdminRole()
  .then(() => console.log("Admin role granted!"))
  .catch(console.error);
