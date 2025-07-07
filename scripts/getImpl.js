import { upgrades } from "hardhat";
import fs from "fs";

async function main() {
  // Read proxy addresses from deployments/deployment.json
  const deployment = JSON.parse(fs.readFileSync("deployments/deployment.json", "utf-8"));
  for (const [name, { address }] of Object.entries(deployment)) {
    try {
      const impl = await upgrades.erc1967.getImplementationAddress(address);
      console.log(`${name} proxy: ${address}`);
      console.log(`${name} implementation address: ${impl}\n`);
    } catch (err) {
      console.error(`Failed to get implementation for ${name} (${address}):`, err.message);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
