require("dotenv").config();
const fs = require("fs");
const hre = require("hardhat");
const argv = require('minimist')(process.argv.slice(2));
const network = argv.network || 'amoy';

// Load deployment addresses and proxies/implementations
const deployment = require("../deployments/deployment.json");
const ozManifest = require("../.openzeppelin/unknown-80002.json");

// Add debug logs to trace proxy-to-implementation mappings
function getImplAddressForProxy(proxyAddress) {
  console.log(`🔍 Looking for implementation of proxy: ${proxyAddress}`);
  const proxyInfo = ozManifest.proxies.find((p) => p.address.toLowerCase() === proxyAddress.toLowerCase());
  if (!proxyInfo) {
    console.error(`🚨 Proxy ${proxyAddress} not found in manifest.`);
    return null;
  }
  console.log(`✅ Found proxy info:`, proxyInfo);
  for (const [key, impl] of Object.entries(ozManifest.impls)) {
    if (impl.txHash === proxyInfo.txHash) {
      console.log(`✅ Found implementation for proxy ${proxyAddress}: ${impl.address}`);
      return impl.address;
    }
  }
  console.error(`🚨 No matching implementation found for proxy ${proxyAddress}.`);
  return null;
}

async function verifyImplementation(implAddress) {
  if (!implAddress) {
    console.error("No implementation address provided, skipping.");
    return;
  }
  console.log(`🔍 Verifying implementation contract at ${implAddress}...`);
  try {
    await hre.run("verify:verify", {
      address: implAddress,
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
}

async function main() {
  // List of proxies and their corresponding implementation addresses
  const proxiesWithImpls = [
    { proxy: "0x8ec72B7061dc368ffD889fa39c6B3b1480A523CC", impl: "0x10bcbc2b5ed5dad76a7d636080b8e2dcb3711553" },
    { proxy: "0x753E062aeEAB644Ce22942815f5367106a750F4d", impl: "0x7ed5c12b697552925ed1e7802ff296a9447bfa0f" },
    { proxy: "0x426d3599e38733B6D50fE0cE0755A83BA0FbAE5E", impl: "0xcdb70e9fb2b8d44d80ff1c2523882acd9e3ca8e7" },
    { proxy: "0x430EDAEb952444ee3937a39c96210EEa30C97Ee1", impl: "0x10d7391830a1cbc6f8df070043eead43d3a52f36" },
  ];

  for (const { proxy, impl } of proxiesWithImpls) {
    console.log(`🔍 Verifying implementation for proxy: ${proxy}`);
    await verifyImplementation(impl);
  }
}

main().catch((error) => {
  console.error("🚨 Script failed:", error);
  process.exitCode = 1;
});
