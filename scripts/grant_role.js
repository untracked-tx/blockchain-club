require('dotenv').config(); // Ensure .env file is loaded

const { ethers, BigNumber, utils } = require("ethers"); // Explicitly import utils
const { JsonRpcProvider } = require("@ethersproject/providers");
const crypto = require("crypto");

console.log("[DEBUG] Loaded PRIVATE_KEY:", process.env.PRIVATE_KEY ? "Exists" : "Not Found");

async function main() {
  const provider = new JsonRpcProvider(process.env.AMOY_RPC_URL); // Use RPC URL from .env

  // Verify provider connectivity
  provider.getNetwork()
    .then(network => console.log("[DEBUG] Connected to network:", network))
    .catch(error => console.error("[ERROR] Failed to connect to network:", error));

  const privateKey = process.env.PRIVATE_KEY; // Use environment variable for private key
  if (!privateKey) {
    throw new Error("PRIVATE_KEY environment variable is not set.");
  }

  // Move wallet initialization back to its original scope
  console.log("[DEBUG] Private Key Length:", privateKey.length);
  console.log("[DEBUG] Private Key (masked):", privateKey.slice(0, 5) + "..." + privateKey.slice(-5));

  const wallet = new ethers.Wallet(privateKey, provider);
  console.log("[DEBUG] Wallet Address:", wallet.address);

  const contractAddress = process.env.CONTRACT_ADDRESS; // Use contract address from .env
  if (!contractAddress) {
    throw new Error("CONTRACT_ADDRESS environment variable is not set.");
  }
  console.log("[DEBUG] Input to ethers.utils.id:", "OFFICER_ROLE");
  // Generate role hash manually using crypto
  const role = "0x" + crypto.createHash("sha256").update("OFFICER_ROLE").digest("hex");
  console.log("[DEBUG] Generated role hash using crypto:", role);

  const account = "0xDA30c053156E690176574dAEe79CEB94e3C8F0cC"; // Replace with the address to grant the role

  const abi = [
    "function grantRole(bytes32 role, address account) public"
  ]; // Minimal ABI for grantRole

  const contract = new ethers.Contract(contractAddress, abi, wallet);

  console.log(`Granting role ${role} to ${account}...`);
  console.log("[DEBUG] Transaction parameters:", { role, account });

  // Explicitly format transaction parameters
  const tx = await contract.grantRole(role, account, {
    gasLimit: ethers.BigNumber.from("100000"), // Ensure gasLimit is a valid BigNumberish value
  });

  console.log("[DEBUG] Transaction sent:", tx.hash); // Log the transaction hash
  await tx.wait(); // Wait for the transaction to be mined

  console.log(`Successfully granted role ${role} to ${account}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
