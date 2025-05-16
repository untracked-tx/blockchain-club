# Deployment Overview

This project uses UUPS upgradeable smart contracts deployed via Hardhat + OpenZeppelin upgrades plugin.

---

## 🧩 Contracts Deployed

- `BlockchainClubMembership.sol`: Main ERC721 NFT + logic
- `Roles.sol`: AccessControl, role hashes, and modifiers
- `TreasuryRouter.sol`: Sends ETH to a Gnosis Safe
- `VotingPowerStrategy.sol`: Snapshot-compatible voting logic

---

## 📦 How Deployment Works

### 1. Deploy with UUPS Proxy

```ts
const Contract = await ethers.getContractFactory("Roles");
const proxy = await upgrades.deployProxy(Contract, [admin], {
  initializer: "initialize",
  kind: "uups",
});
await proxy.deployed();
```

### Pre-Deployment Testing

Before deploying contracts, it is crucial to run comprehensive tests to ensure their functionality and security. For this project, pre-deployment testing was already completed for the contracts, so this step was skipped during the deployment process.

To perform pre-deployment testing:

1. Run unit tests using Hardhat:
   ```bash
   npx hardhat test
   ```
2. Verify contract behavior with simulation scripts (e.g., `simulate_mint.js`).

---

## ⚡️ Ethers v6 & Hardhat v3+ Deployment Notes

### Proxy vs Non-Proxy Contract Addresses
- **Proxy contracts (deployed via upgrades):** Use `.target` to get the deployed address after `waitForDeployment()`. Example:
  ```ts
  await proxy.waitForDeployment();
  const proxyAddress = proxy.target;
  ```
- **Non-proxy contracts:** Use `.address` after `waitForDeployment()`. Example:
  ```ts
  await contract.waitForDeployment();
  const contractAddress = contract.address;
  ```

### Ownership and Initializer
- When deploying a UUPS proxy, always pass the intended owner (usually the deployer or a multisig) as the initializer argument:
  ```ts
  const proxy = await upgrades.deployProxy(Contract, [deployer.address], { initializer: "initialize", kind: "uups" });
  ```
- If you need to transfer ownership after deployment (e.g., to a Gnosis Safe or dev wallet), call:
  ```ts
  await proxy.transferOwnership(newOwnerAddress);
  ```

### Example: Full Deployment Flow
```ts
const Roles = await ethers.getContractFactory("Roles");
const roles = await upgrades.deployProxy(Roles, [deployer.address], { initializer: "initialize", kind: "uups" });
await roles.waitForDeployment();
const rolesAddress = roles.target; // Use .target for proxy

const VotingPowerStrategy = await ethers.getContractFactory("VotingPowerStrategy");
const votingStrategy = await upgrades.deployProxy(VotingPowerStrategy, [rolesAddress], { initializer: "initialize", kind: "uups" });
await votingStrategy.waitForDeployment();
const votingStrategyAddress = votingStrategy.target; // Use .target for proxy

// For non-proxy:
const contract = await Contract.deploy(...);
await contract.waitForDeployment();
const contractAddress = contract.address;
```

### Best Practices
- Always use `.target` for proxy contracts and `.address` for non-proxy contracts.
- Pass the correct owner to the initializer, and transfer ownership if needed.
- After deployment, update your frontend config with the new addresses and ABIs.
- If you see `undefined` or `null` for a contract address, check that you are using the correct property and that deployment completed successfully.

---

### 2. Output Deployment

Use `scripts/exportFrontendConfig.ts`:

- Scans `deployments/amoy/*.json`
- Pulls addresses and ABIs
- Writes to `frontend/lib/deployment.json`

### Export Frontend Configuration

The `exportFrontendConfig.ts` script dynamically generates a `frontendConfig.json` file containing contract addresses and ABIs for frontend integration. This ensures that the frontend always uses the latest deployment data.

#### Steps:
1. Run the script:
   ```bash
   npx ts-node scripts/exportFrontendConfig.ts
   ```
2. The script scans the `deployments/amoy` directory for deployment files.
3. It writes the output to `scripts/frontendConfig.json`.

#### Example Output:
```
Starting exportFrontendConfig script...
🔍 Scanning deployments directory: C:\Users\lmur2\blockchain-club\deployments\amoy
📝 Writing output to: C:\Users\lmur2\blockchain-club\scripts\frontendConfig.json
✅ Exported contract data to C:\Users\lmur2\blockchain-club\scripts\frontendConfig.json
```

#### Error Handling:
- If the `deployments/amoy` directory is missing, the script logs an error and exits gracefully.

### 3. Frontend Loads Dynamically

Frontend contracts are loaded like this:

```ts
import deployment from "@/lib/deployment.json";
const contract = new ethers.Contract(deployment.Roles.address, deployment.Roles.abi, signer);
```

---

### Backend Testing and Execution

The backend includes several scripts for testing and executing key functionalities such as minting tokens, changing roles, and more. These scripts are located in the `scripts/` directory.

#### Common Scripts

1. **Mint a Token**
   - Script: `scripts/mint.js`
   - Description: Mints a new token for a specified role.
   - Usage:
     ```bash
     npx ts-node scripts/mint.js
     ```

2. **Change a Role**
   - Script: `scripts/update_role.js`
   - Description: Updates the role of a specific token.
   - Usage:
     ```bash
     npx ts-node scripts/update_role.js
     ```

3. **Whitelist an Address**
   - Script: `scripts/whitelist.js`
   - Description: Adds an address to the whitelist for minting.
   - Usage:
     ```bash
     npx ts-node scripts/whitelist.js
     ```

4. **Simulate Minting**
   - Script: `scripts/simulate_mint.js`
   - Description: Simulates the minting process for testing purposes.
   - Usage:
     ```bash
     npx ts-node scripts/simulate_mint.js
     ```

#### Notes
- Ensure that the `.env` file is properly configured with the required environment variables before running these scripts.
- Use `npx hardhat console` for interactive testing and debugging.

---

### Frontend Testing and Execution

To test the frontend end-to-end, follow these steps:

#### 1. Wallet Connect
- Open the frontend application in your browser (e.g., `http://localhost:3000`).
- Use the "Connect Wallet" button to connect your wallet.
- Verify that the wallet address is displayed and the connection is successful.

#### 2. Minting
- Navigate to the minting page.
- Select a token to mint and confirm the transaction in your wallet.
- Verify that the transaction is submitted and confirmed on-chain.
- Check the minted token in your wallet or on Polygonscan.

#### 3. Officer Role Checks
- Log in with a wallet that has an officer role.
- Verify that officer-specific actions (e.g., managing roles, whitelisting) are accessible.
- Attempt these actions and confirm they work as expected.

#### 4. Treasury Logic
- Test any treasury-related functionality (e.g., sending ETH to the Gnosis Safe).
- Verify that the funds are correctly routed to the treasury address.

---

### 4. Full Deployment Process

#### Deploying Full Contracts
To deploy full contracts without proxies, use the following pattern:

```ts
const Contract = await ethers.getContractFactory("ContractName");
const contract = await Contract.deploy(arg1, arg2, ...);
await contract.deployed();
console.log("Contract deployed to:", contract.address);
```

#### Deploying Proxies
For upgradeable contracts, deploy using the UUPS proxy pattern:

```ts
const Contract = await ethers.getContractFactory("ContractName");
const proxy = await upgrades.deployProxy(Contract, [initializerArgs], {
  initializer: "initialize",
  kind: "uups",
});
await proxy.deployed();
console.log("Proxy deployed to:", proxy.target);
```

#### Exporting Frontend Configurations
After deployment, ensure the frontend has the latest contract addresses and ABIs by running:

```bash
npx ts-node scripts/exportFrontendConfig.ts
```

This will generate a `frontendConfig.json` file in the `scripts` directory, which the frontend uses to interact with the contracts.

---

### 5. Deployment Checklist

1. **Pre-Deployment**:
   - Run all tests: `npx hardhat test`
   - Verify contract behavior with simulation scripts.

2. **Deployment**:
   - Deploy contracts using the appropriate method (full or proxy).
   - Verify deployments using Hardhat's `deployments` plugin.

3. **Post-Deployment**:
   - Export frontend configurations.
   - Test frontend integration with the deployed contracts.

4. **Documentation**:
   - Update this file with any changes to the deployment process.

---

## OpenZeppelin Manifest for Amoy (Polygon Testnet)

> **Note:** The OpenZeppelin upgrades plugin saves deployment data for each network in a manifest file under `.openzeppelin/`. For Polygon Amoy, the manifest is named `unknown-80002.json` (not `amoy.json`). This is because OpenZeppelin uses the network's chain ID (80002) for testnets it does not recognize by name. 

- **Why this matters:**
  - The manifest tracks proxy and implementation addresses for upgradeable contracts.
  - Automated verification scripts (like `scripts/verify-contract.js`) rely on this file to find and verify all deployed proxies and their implementations.
  - If you use the wrong manifest filename, verification will fail or miss contracts.

### How to Verify Contracts

- The verification script reads from `.openzeppelin/unknown-80002.json` to find all proxies and implementations.
- Always ensure you are referencing the correct manifest for the network you deployed to.
- If you deploy to a different network, check the manifest filename in `.openzeppelin/` (it may be named after the chain ID).

**Example:**
```js
const manifestPath = path.join(__dirname, '../.openzeppelin/unknown-80002.json');
```

- This ensures all proxies and implementations are found and verified on Polygonscan.
- If you see errors about missing proxies or implementations, double-check the manifest filename and its contents.

---

## Proxy vs Implementation Contract Verification (Polygon Amoy)

When using UUPS upgradeable contracts, there are always two important addresses for each contract:

- **Proxy address:** This is the address users and dApps interact with. It stays the same even when you upgrade the contract logic.
- **Implementation address:** This is the address of the actual contract logic. When you upgrade, this address changes, but the proxy stays the same.

### Why do we verify both?
- **Proxy verification** allows users and explorers to see the ABI and interact with the contract at the main address.
- **Implementation verification** is required so that Polygonscan (and other explorers) can show the source code for the logic contract, which is critical for transparency and trust.

### How does the verification script work?
- The script reads the proxy addresses from your deployment output (e.g., `frontend/lib/deployment.json`).
- It then looks up the implementation addresses in the OpenZeppelin manifest (`.openzeppelin/unknown-80002.json` for Amoy). This manifest is generated by the upgrades plugin and maps each proxy to its implementation.
- The script verifies both the proxy and the implementation for each contract.

### Best Practices
- Always verify both the proxy and the implementation after deployment.
- Always use the correct manifest file for your network (for Amoy, it's `unknown-80002.json`).
- If you see `undefined` or errors about missing addresses, check that your deployment and manifest files are up to date and correct.

---

## 🧠 Tips

- Use `npx hardhat verify` to verify implementation on Polygonscan
- Use `npx hardhat console` to test interactions
- Regenerate `deployment.json` any time you redeploy

---

## 🔁 Useful Scripts

```bash
npm run deploy           # deploy contracts
npm run export:frontend  # write ABI/addresses to frontend
npm run build            # build frontend
```
