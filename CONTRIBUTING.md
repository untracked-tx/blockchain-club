# Contributing to Blockchain Club

We welcome students, developers, and crypto-curious contributors.

---

## 🛠 How to Contribute

1. Fork this repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Commit and push: `git commit -m "Add feature"` → `git push origin branch`
5. Open a Pull Request

---

## 📦 Setup

```bash
npm install
npx hardhat compile
npm run dev
```

---

## 🧠 Where to Start

- Check `issues/` for open requests
- Improve docs (see `README.md`)
- Write or improve research in `/research`

---

## 🧪 Testing

Run unit tests:

```bash
npx hardhat test
```

Use `scripts/deployAll.ts` + `exportFrontendConfig.ts` to simulate deployment.

### Pre-Deployment Testing

Contributors should ensure that all contracts are thoroughly tested before deployment. Follow these steps:

1. Run unit tests:
   ```bash
   npx hardhat test
   ```
2. Use simulation scripts to validate contract behavior (e.g., `simulate_mint.js`).
3. If making changes to existing contracts, document the tests performed and their results in your pull request.

### Export Frontend Configuration

To ensure the frontend uses the latest contract data, contributors should run the `exportFrontendConfig.ts` script after deploying contracts.

#### Steps:
1. Run the script:
   ```bash
   npx ts-node scripts/exportFrontendConfig.ts
   ```
2. Verify the output in `scripts/frontendConfig.json`.
3. Commit the updated `frontendConfig.json` file if necessary.

#### Troubleshooting:
- If the script fails, check that the `deployments/amoy` directory exists and contains valid deployment files.

### Backend Testing and Execution

Contributors can use the following scripts to test and execute backend functionalities:

1. **Mint a Token**
   - Run the minting script:
     ```bash
     npx ts-node scripts/mint.js
     ```
   - Ensure the wallet address and role are correctly configured in the script or passed as arguments.

2. **Change a Role**
   - Update a token's role:
     ```bash
     npx ts-node scripts/update_role.js
     ```
   - Verify the token ID and new role before execution.

3. **Whitelist an Address**
   - Add an address to the whitelist:
     ```bash
     npx ts-node scripts/whitelist.js
     ```
   - Confirm the address is eligible for whitelisting.

4. **Simulate Minting**
   - Test the minting process:
     ```bash
     npx ts-node scripts/simulate_mint.js
     ```
   - Use this script to validate contract interactions without affecting the blockchain.

### Frontend Testing and Execution

Contributors should follow these steps to test the frontend:

#### 1. Wallet Connect
- Open the application in your browser (e.g., `http://localhost:3000`).
- Use the "Connect Wallet" button to connect your wallet.
- Ensure the wallet address is displayed and the connection is successful.

#### 2. Minting
- Go to the minting page.
- Select a token to mint and confirm the transaction in your wallet.
- Verify the transaction on-chain and check the minted token in your wallet or on Polygonscan.

#### 3. Officer Role Checks
- Log in with a wallet that has officer privileges.
- Test officer-specific actions like managing roles and whitelisting.
- Confirm these actions work as expected.

#### 4. Treasury Logic
- Test treasury-related features, such as sending ETH to the Gnosis Safe.
- Verify that funds are routed correctly to the treasury address.

#### Tips
- Always test in a development environment before deploying changes.
- Document any changes to scripts or their usage in your pull request.

---

## 📬 Join the Club

Want to be listed on "Meet the Club"? Add yourself to the `/team.ts` file and submit a PR.
