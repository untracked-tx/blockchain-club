# Full User Flow

This outlines the full lifecycle of a new user interacting with the Blockchain Club platform.

---

## 🧍‍♂️ New User Journey

1. Visit the homepage
2. Connect Web3 wallet
3. Follows onboarding prompt
4. Requests whitelist (if needed)
5. Mints NFT based on their tier (Observer, Member, Officer)
6. NFT appears in Dashboard
7. User views governance proposals
8. User can vote if eligible (via Snapshot or mock UI)
9. Treasury address is public (Gnosis Safe)

---

## 🛠 Officer Flow

1. Logs in with officer wallet
2. Sees pending whitelist requests
3. Approves or promotes members
4. Grants roles via Officer dashboard
5. Monitors treasury or proposal activity

---

## 💡 Technical Behind-the-Scenes

- NFT mint logic checks whitelist if `requireWhitelist = true`
- Officers are granted via `grantRole(OFFICER_ROLE, user)`
- Gnosis Safe is hardcoded or read from `TreasuryRouter`
- Snapshot voting weights are derived from `VotingPowerStrategy`

---

## 🔒 Soulbound

- Officer NFTs are non-transferable (soulbound)
- Observer/Member NFTs may expire if configured

---

## 🚨 Errors to Handle

- User tries to mint without whitelist: fail gracefully
- Wrong network: prompt to switch
- Wallet not connected: show connect modal
