require("dotenv").config();
const hre = require("hardhat");

async function main() {
  const proxyAddress = process.env.PROXY_ADDRESS;
  const implementationAddress = process.env.IMPLEMENTATION_ADDRESS;

  if (!proxyAddress || !implementationAddress) {
    throw new Error("PROXY_ADDRESS and IMPLEMENTATION_ADDRESS must be set in .env");
  }

  console.log("🔍 Checking network availability...");
  try {
    const network = await hre.ethers.provider.getNetwork();
    console.log(`✅ Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
  } catch (error) {
    console.error("🚨 Failed to connect to the network:", error);
    return;
  }

  console.log("🔍 Verifying implementation contract...");
  try {
    await hre.run("verify:verify", {
      address: implementationAddress,
      constructorArguments: [],
    });
    console.log("✅ Implementation contract verified successfully!");
  } catch (error) {
    console.error("🚨 Verification failed for implementation contract:", error);
    if (error.response) {
      console.error("🔍 Raw API Response:", error.response.data);
    } else {
      console.error("🔍 No API response received. Check network or API server status.");
    }
  }

  console.log("🔍 Verifying proxy contract...");
  try {
    await hre.run("verify:verify", {
      address: proxyAddress,
      constructorArguments: [],
    });
    console.log("✅ Proxy contract verified successfully!");
  } catch (error) {
    console.error("🚨 Verification failed for proxy contract:", error);
    if (error.response) {
      console.error("🔍 Raw API Response:", error.response.data);
    } else {
      console.error("🔍 No API response received. Check network or API server status.");
    }
  }
}

main().catch((error) => {
  console.error("🚨 Script failed:", error);
  process.exitCode = 1;
});
