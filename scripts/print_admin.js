// Print the DEFAULT_ADMIN_ROLE address for the deployed contract
// Usage: npx hardhat run scripts/print_admin.js --network <network>

const { ethers } = require("hardhat");

// OpenZeppelin's DEFAULT_ADMIN_ROLE hash
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error("Set CONTRACT_ADDRESS in your environment or .env file");
  }
  const contract = await ethers.getContractAt("BlockchainClubMembership", contractAddress);
  // If AccessControlEnumerable is used, you can enumerate admins. Otherwise, check a few known addresses.
  try {
    // Try to get the first admin (if enumerable)
    if (contract.getRoleMember) {
      const admin = await contract.getRoleMember(DEFAULT_ADMIN_ROLE, 0);
      console.log("DEFAULT_ADMIN_ROLE (enumerable):", admin);
    } else {
      // Fallback: check owner()
      const owner = await contract.owner();
      console.log("Contract owner:", owner);
      // Fallback: print deployer (if known)
      console.log("If you deployed with Hardhat, the deployer is the first signer used.");
    }
  } catch (e) {
    // Fallback: just print owner
    const owner = await contract.owner();
    console.log("Contract owner:", owner);
    console.log("If you deployed with Hardhat, the deployer is the first signer used.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
