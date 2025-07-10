# Smart Contract Changelog

This document summarizes all code changes made to the core contracts during the July 2025 security review and upgrade process. Use this as a reference for syncing with the frontend and for future audits.

---

## BlockchainClubMembership.sol

- **Removed stray '@' character**
  - Fixed Solidity syntax error that could prevent compilation.
- **Added `nonReentrant` modifier** to sensitive functions:
  - `mint`, `publicMint`, `burnToken`, `updateWhitelist`, `setBaseURI`
  - Reason: Prevent reentrancy attacks on state-changing functions.
- **Renamed parameter in `_hasTokenOfType`**
  - Changed from `owner` to `account` to avoid variable shadowing and improve clarity.
- **(No logic changes to minting or role assignment, but security and naming improved.)**

---

## Roles.sol

- **Added `Initializable` parent**
  - Ensures upgradeable contract pattern is followed (no constructor logic, uses `initialize`).
- **No changes to role logic or voting power.**

---

## TreasuryRouter.sol

- **Added `nonReentrant` modifier** to internal transfer functions:
  - `executeTransfer`, `executeERC20Transfer`, `executeNFTTransfer`
  - Reason: Prevent reentrancy attacks during fund/NFT release.
- **No changes to escrow logic or admin controls.**

---

## General Notes

- All contracts now follow best practices for upgradeable patterns (UUPS, Initializable, protected initializers).
- All public state-changing functions that could be sensitive to reentrancy now use `nonReentrant`.
- Variable naming improved for clarity and to avoid shadowing.
- No changes were made to the core business logic, only to security and maintainability.

---

**For frontend developers:**
- No changes to contract ABIs or function signatures, except for improved parameter naming (internal only).
- All minting, role assignment, and treasury flows remain as described in the technical spec.

---

_Last updated: July 10, 2025_
