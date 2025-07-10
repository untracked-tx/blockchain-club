// verify-uups-proxies.cjs
// CommonJS version for compatibility with Hardhat and Node.js
const { execSync } = require('child_process');
const hre = require('hardhat');
const deployment = require('./deployments/deployment.json');

const NETWORK = 'amoy'; // Change if needed
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const INIT_DATA = '0x'; // Use '0x' if already initialized
const PROXY_CONTRACT_PATH = '@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol:ERC1967Proxy';

async function main() {
  for (const [name, { address: proxyAddress }] of Object.entries(deployment)) {
    try {
      // Get implementation address using Hardhat upgrades plugin
      const implAddress = await hre.upgrades.erc1967.getImplementationAddress(proxyAddress);
      console.log(`\n${name}:`);
      console.log(`  Proxy: ${proxyAddress}`);
      console.log(`  Implementation: ${implAddress}`);
      // Run the verify command for the proxy as ERC1967Proxy with --contract flag
      const cmd = `npx hardhat verify --network ${NETWORK} --contract ${PROXY_CONTRACT_PATH} ${proxyAddress} ${implAddress} ${ZERO_ADDRESS} ${INIT_DATA}`;
      console.log(`  Verifying proxy with: ${cmd}`);
      const output = execSync(cmd, { stdio: 'pipe' }).toString();
      console.log(output);
    } catch (err) {
      console.error(`Verification failed for ${name}:`, err.stdout ? err.stdout.toString() : err.message);
    }
  }
}

main();
