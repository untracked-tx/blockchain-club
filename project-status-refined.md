# Project Status – Blockchain Club NFT Membership System

This document outlines the current status of the blockchain-based NFT membership system for our student club. It serves as a snapshot of what's live, what's in development, and where we can go next as a team.

---

## MVP Features – Already Implemented

| Feature                         | Status | Notes |
|----------------------------------|--------|-------|
| Smart contract written           | Done | ERC-721 implementation |
| Testnet deployment               | Done | Deployed to Polygon Amoy testnet |
| Contract verification            | Done | Verified on Amoy Polygonscan |
| Minting script operational       | Done | Supports dues collection + NFT issue |
| Hardhat config + scripts         | Done | Deployment and mint scripts included |
| Whitepaper draft written         | Done | Full architecture, governance, treasury plans |
| `.env.example` for local setup   | Done | Prepped for contributor onboarding |

> Deployed Contract:  
> [`0x46BACBdb2178E5A194DeA97fD0696C1c00FFadBf`](https://amoy.polygonscan.com/address/0x46BACBdb2178E5A194DeA97fD0696C1c00FFadBf#code)
token minted
[Token Owner – tokenId 1](https://amoy.polygonscan.com/token/0x46BACBdb2178E5A194DeA97fD0696C1c00FFadBf?a=1)

---

## Future Features – Planned or In Progress

| Feature                          | Status      | Notes |
|----------------------------------|-------------|-------|
| On-chain member metadata         | Planned     | Track name, role, join date per token |
| Role-based permissions           | Planned     | Use `AccessControl` for officers/admins |
| Snapshot voting integration      | Planned     | Off-chain, gasless governance via ERC-721 ownership |
| Gnosis Safe treasury             | Planned     | Multisig wallet for dues & spending proposals |
| Soulbound token option           | Optional    | Prevent NFT transfers (if desired) |
| Metadata hosted on IPFS          | Optional    | Move from placeholder URI to real JSON assets |
| Front-end mint page              | Exploring   | Possible React or Thirdweb UI for easier minting |

---

## Development Strategy

- **Keep costs low** - MVP uses gas-efficient ERC-721 (no `Enumerable`)
- **Deploy to scalable chains** - Polygon Mainnet likely candidate for v1 rollout
- **Build modularly** - Each feature (e.g., voting, treasury) can be layered in step-by-step
- **Make it educational** - Members get real-world experience with smart contracts, governance, and DAO tooling

---

## Current Ask for Team

We're at a decision point. The infrastructure works. Now we decide:

- Do we want metadata tied to member identity?
- Should NFTs be soulbound or transferable?
- What chain do we want to launch on?
- Who wants to help expand this into a full DAO framework?

Open for ideas, feedback, and contributions.
