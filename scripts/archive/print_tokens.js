// Print all existing token IDs and their owners for the deployed contract
// Usage: npx hardhat run scripts/print_tokens.js --network <network>

const { ethers } = require("hardhat");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error("Set CONTRACT_ADDRESS in your environment or .env file");
  }
  const contract = await ethers.getContractAt("BlockchainClubMembership", contractAddress);
  const totalSupply = await contract.totalSupply();
  console.log("Total minted tokens:", totalSupply.toString());
  for (let i = 0; i < totalSupply; i++) {
    try {
      const owner = await contract.ownerOf(i);
      console.log(`Token ${i} exists, owned by ${owner}`);
    } catch (e) {
      console.log(`Token ${i} does not exist`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
