const hre = require("hardhat");
const { parseEther } = require("ethers");
require("dotenv").config();

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) throw new Error("CONTRACT_ADDRESS must be set in .env");
  const [user] = await hre.ethers.getSigners();

  const contract = await hre.ethers.getContractAt("BlockchainClubMembership", contractAddress);

  const tx = await contract.mintVotingMembership({
    value: parseEther(process.env.MINT_PRICE || "0.01"),
  });

  await tx.wait();

  console.log(`Minted NFT for ${user.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
