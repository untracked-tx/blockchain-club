require("dotenv").config();
const hre = require("hardhat");
const { upgrades } = require("hardhat");
const fs = require("fs");

async function main() {
  // Clean cache and artifacts
  console.log("🧹 Cleaning cache and artifacts...");
  await hre.run("clean");

  // Compile contracts
  console.log("🔨 Compiling contracts...");
  await hre.run("compile");

  const baseURI = process.env.BASE_URI || "ipfs://...";
  const opsWallet = process.env.OPS_WALLET;
  const scholarshipWallet = process.env.SCHOLARSHIP_WALLET;

  if (!opsWallet || !scholarshipWallet) {
    throw new Error("OPS_WALLET and SCHOLARSHIP_WALLET must be set in .env");
  }

  const network = hre.network.name;
  console.log(`🔍 Deploying to network: ${network}`);

  const Club = await hre.ethers.getContractFactory("BlockchainClubMembership");
  const proxy = await upgrades.deployProxy(Club, [baseURI, opsWallet, scholarshipWallet], {
    initializer: "initialize",
    kind: "uups",
  });

  // Wait for deployment confirmation
  await proxy.waitForDeployment();

  const proxyAddress = await proxy.getAddress();
  const implAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);

  console.log("🔗 Raw proxy address:", proxyAddress);
  console.log("✅ Proxy deployed at:", proxyAddress);
  console.log("🧠 Implementation deployed at:", implAddress);

  // Save deployment details to a file
  const deploymentDetails = {
    network,
    proxyAddress,
    implAddress,
    baseURI,
  };

  fs.writeFileSync(
    "DEPLOYMENT_SUMMARY.md",
    `# Deployment Summary\n\n` +
      `**Network**: ${network}\n` +
      `**Proxy Address**: ${proxyAddress}\n` +
      `**Implementation Address**: ${implAddress}\n` +
      `**Base URI**: ${baseURI}\n`
  );

  console.log("📄 Deployment details saved to DEPLOYMENT_SUMMARY.md");
}

main().catch((error) => {
  console.error("🚨 Deployment failed:", error);
  process.exitCode = 1;
});
