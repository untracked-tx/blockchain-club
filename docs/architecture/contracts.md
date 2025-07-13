# Technical Specification

This document describes the contract architecture and internal logic for the Blockchain Club membership system. It is intended for developers, auditors, and contributors seeking a clear overview of how the smart contracts operate.

---

## Overview

The system uses modular, upgradeable smart contracts to handle:

- NFT-based role assignment (membership tokens)
- Role management (Admin / Officer / Member)
- Escrowed treasury functions (ETH, ERC20, NFT)

All contracts follow the UUPS proxy upgrade standard and enforce granular access control through `AccessControlEnumerable`.

---

## Contracts

### 1. `BlockchainClubMembership.sol`

The NFT-based membership system for the Blockchain Club with role integration and comprehensive whitelist management.

**Key Features:**
- ERC721Enumerable + upgradeable
- Supports multiple token “types” via hash-based identifiers
- Time-limited minting windows per token type
- Soulbound (non-transferable) logic for officer tokens
- Token metadata (base URI, editions) configurable by Admin
- Hooks into `Roles.sol` to assign permissions on mint

**Key Functions:**
- `mint(to, tokenType, isSoulbound)` – Officer-only mint
- `publicMint(tokenType, isSoulbound)` – Public minting with access controls
- `requestWhitelist()` – Users can request whitelist access
- `processWhitelistRequest(requestId, approve)` – Officers process requests
- `createTokenType(...)` – Officers create new token types
- `burnToken(tokenId)` – Officers can burn tokens
- `setBaseURI()` – Admins update metadata base path
- `initialize(name, symbol, rolesAddr)` – Sets initial state

**Access Control:**
- Only Admins can set base URI and authorize upgrades
- Officers can mint tokens, create token types, and manage whitelist
- Token type configurations control public minting access
- NonReentrant protection on all state-changing functions

---

### 2. `Roles.sol`

Centralized role management contract using OpenZeppelin’s `AccessControlEnumerable`.

**Roles Defined:**
- `ADMIN_ROLE` – Full privileges (can upgrade contracts, set voting power)
- `OFFICER_ROLE` – Operational access (mint tokens, manage whitelist, process requests)
- `MEMBER_ROLE` – Base membership tier

**Voting Power Distribution:**
- Officer tier: 5x voting weight multiplier (configurable)
- Member tier: 1x base voting weight (configurable) 
- Individual voting power overrides supported per address

**Core Functions:**
- `grantRole(role, account)` / `revokeRole(role, account)` – Role assignment operations
- `grantRoleBatch(role, accounts)` / `revokeRoleBatch(role, accounts)` – Batch role operations
- `hasRole(role, account)` – Role verification queries
- `getVotingPower(account)` – Effective voting weight calculation
- `getUserCurrentRole(account)` – Highest role identification
- `setVotingPower(role, power)` – Admin-controlled role-based voting configuration
- `setCustomVotingPower(account, power)` – Admin-controlled individual voting overrides

---

### 3. `TreasuryRouter.sol`

Time-delayed multi-asset management protocol supporting ETH, ERC20, and ERC721 transfers with comprehensive security mechanisms.

**Protocol Architecture:**
- 24-hour temporal security lock on all asset transfers
- Multi-asset support: ETH, ERC20 tokens, and ERC721 NFTs
- Separated deposit and execution phases for security validation
- Comprehensive metadata tracking for audit trails
- Emergency administrative controls for protocol security
- Batch execution optimization for gas efficiency

**Core Functions:**
- `receiveFunds()` / `receiveFundsWithMeta(metadata)` – ETH deposit operations
- `depositERC20(token, amount, metadata)` – ERC20 token deposit protocol
- `depositNFT(token, tokenId, metadata)` – NFT deposit and custody
- `executeTransferBatch(transferIds)` – Batch ETH transfer execution
- `executeERC20TransferBatch(transferIds)` – Batch token transfer execution
- `executeNFTTransferBatch(transferIds)` – Batch NFT transfer execution
- `cancelERC20Transfer(transferId, reason)` / `cancelNFTTransfer(transferId, reason)` – Administrative cancellation
- `updateTreasury(newTreasury)` – Treasury address reconfiguration
- `emergencyWithdraw()` – Emergency protocol controls
- `setTreasury(address)` – Treasury recipient configuration (Gnosis Safe recommended)

**Escrow Execution Flow:**
1. Officer initiates asset deposit with metadata
2. Transfer queued with temporal lock and comprehensive tracking
3. 24-hour security window enforced before execution eligibility
4. Administrative cancellation authority prior to execution

---

## Protocol Interaction Architecture

```
[User] --(mint request)--> [Membership Contract]
  ↓                              ↓
[Role Assignment]         [NFT Issuance]
  ↓                              ↓
[Roles.sol]              [Token Metadata]

[Officer/Admin] --(deposit)--> [TreasuryRouter]
                                    ↓
                          [24h Temporal Lock]
                                    ↓
                         [Gnosis Safe Execution]
```

---

## Upgradeability & Administrative Controls

- UUPS upgradeability pattern implementation across all contracts
- `ADMIN_ROLE` maintains exclusive upgrade authorization
- Production upgrades require multisig or Gnosis Safe execution

---

## Deployment Protocol

- Proxy initialization via `initialize()` functions (UUPS pattern compliance)
- Deployment sequence requirements:
  1. `Roles.sol` – Base access control deployment
  2. `BlockchainClubMembership.sol` – NFT system with roles integration
  3. `TreasuryRouter.sol` – Asset management with membership verification

---

## Protocol Considerations

- Temporal constraints utilize `block.timestamp`; edge case scenarios require monitoring
- Off-chain whitelist synchronization requires state consistency with smart contract storage
- ERC721 tokens implement soulbound functionality when flagged during minting (transfer restrictions)

---

## Implementation Status

This specification documents the production version deployed on Polygon Amoy testnet. Mainnet deployment scheduled following comprehensive frontend integration and external security audit completion.

**Protocol Resources:**
* Website: https://untrackedtx.xyz
* Repository: https://github.com/untracked-tx/blockchain-club
* Technical Contact: Liam.Murphy@ucdenver.edu

