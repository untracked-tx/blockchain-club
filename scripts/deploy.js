const hre = require("hardhat");

async function main() {
  const baseURI = "https://example.com/meta/";
  const { parseEther } = await import("ethers");

  const tokenPrice = parseEther("0.01");

  const Club = await hre.ethers.getContractFactory("BlockchainClubMembership");
  const contract = await Club.deploy(baseURI); 

  await contract.waitForDeployment(); 

  console.log(`Deployed to Amoy at: ${contract.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
