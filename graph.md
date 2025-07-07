graph TD
  Owner[Owner (multisig)]
  Admin[Admin (DEFAULT_ADMIN_ROLE)]
  Officer[Officer (OFFICER_ROLE)]
  Member[Member (MEMBER_ROLE)]

  Owner -->|upgrades, pause| BlockchainClubMembership
  Owner -->|upgrades| TreasuryRouter
  Owner -->|grants admin| Admin

  Admin -->|grants roles| Officer
  Admin -->|grants roles| Member
  Admin -->|config| TreasuryRouter

  Officer -->|whitelist / mint| Member
  Member -->|holds NFT| Membership

  Admin -->|emergency withdraw| TreasuryRouter

