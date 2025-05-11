const hre = require("hardhat");

async function main() {
  const contractAddress = "0x060bFA4C3cB0D26454E0F93f78eb2edfF60E9A89"; // Replace with your contract address
  const walletAddress = "0xDA30c053156E690176574dAEe79CEB94e3C8F0cC"; // Replace with the address to whitelist

  const [deployer] = await hre.ethers.getSigners();
  console.log("Using deployer address:", deployer.address);

  const contract = await hre.ethers.getContractAt("BlockchainClubMembership", contractAddress);

  console.log("Calling setWhitelist...");
  const tx = await contract.setWhitelist(walletAddress, true);
  await tx.wait();

  console.log(`Successfully added ${walletAddress} to the whitelist.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});