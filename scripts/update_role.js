const hre = require("hardhat");
require("dotenv").config();
let roleHashFn;
let ethersVersion;
try {
  // Try ethers v6
  const { ethers } = require("ethers");
  ethersVersion = ethers.version;
  roleHashFn = (role) => ethers.id(role);
} catch (e) {
  // Fallback to ethers v5
  const { utils } = require("ethers");
  ethersVersion = require("ethers/package.json").version;
  roleHashFn = (role) => utils.id(role);
}

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const tokenId = process.env.TOKEN_ID;
  const newRole = process.env.NEW_ROLE;

  if (!contractAddress || !tokenId || !newRole) {
    throw new Error("CONTRACT_ADDRESS, TOKEN_ID, and NEW_ROLE must be set in .env");
  }

  // Hash the role string to bytes32 using keccak256
  const roleHash = roleHashFn(newRole);

  console.log("[DEBUG] Ethers version:", ethersVersion);
  console.log("[DEBUG] CONTRACT_ADDRESS:", contractAddress);
  console.log("[DEBUG] TOKEN_ID:", tokenId);
  console.log("[DEBUG] NEW_ROLE:", newRole);
  console.log("[DEBUG] roleHash:", roleHash);

  const [admin] = await hre.ethers.getSigners();
  const contract = await hre.ethers.getContractAt("BlockchainClubMembership", contractAddress);

  console.log(`[DEBUG] Using signer: ${admin.address}`);
  console.log(`[DEBUG] Contract: ${contractAddress}`);
  console.log(`[DEBUG] Setting role: ${newRole} (${roleHash}) to tokenId ${tokenId}`);

  const tx = await contract.setRole(tokenId, roleHash);
  await tx.wait();

  console.log(`✅ Updated role for tokenId ${tokenId} to ${newRole} (hash: ${roleHash})`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
