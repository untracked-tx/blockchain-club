const hre = require("hardhat");
const { parseEther } = require("ethers");

async function main() {
  const contractAddress = "0x46BACBdb2178E5A194DeA97fD0696C1c00FFadBf"; // deployed on Amoy
  const [user] = await hre.ethers.getSigners();

  const contract = await hre.ethers.getContractAt("BlockchainClubMembership", contractAddress);

  const tx = await contract.mintMembership({
    value: parseEther("0.01"),
  });

  await tx.wait();

  console.log(`✅ Minted NFT for ${user.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
