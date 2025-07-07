const { execSync } = require('child_process');
const deployment = require('./deployments/deployment.json');

// Set your network name here (must match your hardhat config)
const NETWORK = 'amoy';

// If you have constructor arguments, add them here by contract name
const constructorArgs = {
  // Example:
  // BlockchainClubMembership: ["TokenName", "SYM", "0x...rolesContractAddress"]
};

async function main() {
  for (const [name, { address }] of Object.entries(deployment)) {
    let args = constructorArgs[name] || [];
    let argsString = args.map(a => `"${a}"`).join(' ');
    let cmd = `npx hardhat verify --network ${NETWORK} ${address} ${argsString}`;
    console.log(`\nVerifying ${name} (proxy at ${address})...`);
    try {
      const output = execSync(cmd, { stdio: 'pipe' }).toString();
      console.log(output);
    } catch (err) {
      console.error(`Verification failed for ${name}:`, err.stdout ? err.stdout.toString() : err.message);
    }
  }
}

main();
