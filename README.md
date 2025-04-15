# Blockchain Club NFT Membership System

This repository contains the MVP implementation of an on-chain membership system for blockchain student organizations. The system uses ERC-721 NFTs to verify active members, collect dues, and lay the foundation for decentralized governance and treasury management.

---

## Live Demo Deployment

- Smart Contract (Polygon Amoy):  
  [View on Polygonscan](https://amoy.polygonscan.com/address/0x46BACBdb2178E5A194DeA97fD0696C1c00FFadBf#code)

- Minted NFT – Token #1:  
  [View tokenId 1 ownership](https://amoy.polygonscan.com/token/0x46BACBdb2178E5A194DeA97fD0696C1c00FFadBf?a=1)

- tokenURI (placeholder):  
  `https://example.com/meta/1.json`  
  (Metadata will be upgraded in future versions — this is currently a placeholder.)

---

## Features (MVP)

- ERC-721 smart contract (gas-optimized)
- Minting script with dues collection (0.01 MATIC)
- Verified testnet deployment (Polygon Amoy)
- Full technical whitepaper
- Deployment and mint scripts via Hardhat
- `.env.example` and repo prepared for collaboration

For full current status, see:  
[PROJECT_STATUS.md](./PROJECT_STATUS.md)

---

## Documentation

- [whitepaper/membership-nft-whitepaper.md](./whitepaper/membership-nft-whitepaper.md)  
  Covers the full system design, roadmap, governance strategy, treasury setup, and security considerations.

- [OPTIONS.md](./OPTIONS.md)  
  Outlines all possible paths forward: chains, token standards, governance tools, and tradeoffs.

---

## How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Create a .env file from the example
cp .env.example .env

# 3. Deploy to testnet (Amoy)
npx hardhat run scripts/deploy.js --network amoy

# 4. Mint an NFT
npx hardhat run scripts/mint.js --network amoy
# 5. Get the NFT's tokenURI
npx hardhat run scripts/get-token-uri.js --network 