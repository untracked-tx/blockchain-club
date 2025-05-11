require("dotenv").config();
require("fs");

const hre = require("hardhat");
const { upgrades } = require("hardhat"); // ✅ ADDED
const { parseEther } = require("ethers");

async function main() {
  const baseURI = process.env.BASE_URI || "ipfs://...";
  const opsWallet = process.env.OPS_WALLET;
  const scholarshipWallet = process.env.SCHOLARSHIP_WALLET;
  if (!opsWallet || !scholarshipWallet) {
    throw new Error("OPS_WALLET and SCHOLARSHIP_WALLET must be set in .env");
  }

  // Validate BASE_URI
  if (!baseURI) {
    throw new Error("BASE_URI must be set in .env");
  }

  const network = hre.network.name;
  console.log(`🔍 Deploying to network: ${network}`);

  const Club = await hre.ethers.getContractFactory("BlockchainClubMembership");
  const proxy = await upgrades.deployProxy(Club, [baseURI, opsWallet, scholarshipWallet], {
    initializer: "initialize",
    kind: "uups"
  });

  const [deployer] = await hre.ethers.getSigners();
  const proxyAddress = await proxy.getAddress();
  const implAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);

  // Estimate gas for deployment
  const gasEstimate = await proxy.deployTransaction.wait();
  console.log(`⛽ Gas Used: ${gasEstimate.gasUsed.toString()}`);

  console.log(`✅ Proxy deployed at: ${proxyAddress}`);
  console.log(`🧠 Implementation deployed at: ${implAddress}`);
  console.log(`👤 Deployer: ${deployer.address}`);
  console.log(`🔗 Base URI: ${baseURI}`);
  console.log(`💸 Token Price: ${parseEther("0.01").toString()} wei`);

  // Save deployment details to a file
  const deploymentDetails = {
    network,
    proxyAddress,
    implAddress,
    deployer: deployer.address,
    baseURI,
    gasUsed: gasEstimate.gasUsed.toString(),
  };

  require("fs").writeFileSync(
    "DEPLOYMENT_SUMMARY.md",
    `# Deployment Summary\n\n` +
      `**Network**: ${network}\n` +
      `**Proxy Address**: ${proxyAddress}\n` +
      `**Implementation Address**: ${implAddress}\n` +
      `**Deployer**: ${deployer.address}\n` +
      `**Base URI**: ${baseURI}\n` +
      `**Gas Used**: ${gasEstimate.gasUsed.toString()}\n`
  );

  console.log("📄 Deployment details saved to DEPLOYMENT_SUMMARY.md");
}

main().catch((error) => {
  console.error("🚨 Deployment failed:", error);
  process.exitCode = 1;
});
