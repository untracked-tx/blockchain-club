## Sūrya's Description Report

### Files Description Table


|  File Name  |  SHA-1 Hash  |
|-------------|--------------|
| ./contracts/BlockchainClubMembership.sol | 5f7eb184172cda9ae5caf50acd70d1ba1c1906e8 |
| ./contracts/Roles.sol | c52dff2fb00599cb0c6c0011e2766363bbcfbe77 |
| ./contracts/SimpleTest.sol | 98276fb89ad2f84ec013ac84653d69b2b909ea92 |
| ./contracts/TreasuryRouter.sol | a32e3832a6ae30be3bf930ff3c7b185865023b34 |


### Contracts Description Table


|  Contract  |         Type        |       Bases      |                  |                 |
|:----------:|:-------------------:|:----------------:|:----------------:|:---------------:|
|     └      |  **Function Name**  |  **Visibility**  |  **Mutability**  |  **Modifiers**  |
||||||
| **BlockchainClubMembership** | Implementation | Initializable, ERC721Upgradeable, ERC721EnumerableUpgradeable, Ownable2StepUpgradeable, UUPSUpgradeable, ReentrancyGuardUpgradeable, PausableUpgradeable |||
| └ | initialize | Public ❗️ | 🛑  | initializer |
| └ | requestWhitelist | External ❗️ | 🛑  | whenNotPaused |
| └ | processWhitelistRequest | External ❗️ | 🛑  | onlyRole nonReentrant |
| └ | getPendingWhitelistRequests | External ❗️ |   |NO❗️ |
| └ | hasPendingRequest | External ❗️ |   |NO❗️ |
| └ | createTokenType | External ❗️ | 🛑  | onlyRole |
| └ | deactivateTokenType | External ❗️ | 🛑  | onlyRole |
| └ | _hasTokenOfType | Internal 🔒 |   | |
| └ | mint | External ❗️ | 🛑  | onlyRole whenNotPaused nonReentrant |
| └ | publicMint | External ❗️ | 🛑  | whenNotPaused nonReentrant |
| └ | burnToken | External ❗️ | 🛑  | onlyRole nonReentrant |
| └ | _beforeTokenTransfer | Internal 🔒 | 🛑  | whenNotPaused |
| └ | updateWhitelist | External ❗️ | 🛑  | onlyRole nonReentrant |
| └ | _updateMemberStats | Internal 🔒 | 🛑  | |
| └ | setBaseURI | Public ❗️ | 🛑  | onlyRole nonReentrant |
| └ | _baseURI | Internal 🔒 |   | |
| └ | tokenURI | Public ❗️ |   |NO❗️ |
| └ | _toUrlSafe | Internal 🔒 |   | |
| └ | getMemberCount | External ❗️ |   |NO❗️ |
| └ | getOfficerCount | External ❗️ |   |NO❗️ |
| └ | getAllTokenTypeIds | External ❗️ |   |NO❗️ |
| └ | pause | External ❗️ | 🛑  | onlyOwner |
| └ | unpause | External ❗️ | 🛑  | onlyOwner |
| └ | _authorizeUpgrade | Internal 🔒 | 🛑  | onlyOwner |
| └ | supportsInterface | Public ❗️ |   |NO❗️ |
||||||
| **Roles** | Implementation | Initializable, AccessControlEnumerableUpgradeable, UUPSUpgradeable |||
| └ | initialize | Public ❗️ | 🛑  | initializer onlyRole |
| └ | getUserCurrentRole | Public ❗️ |   |NO❗️ |
| └ | getVotingPower | Public ❗️ |   |NO❗️ |
| └ | setVotingPower | External ❗️ | 🛑  | onlyRole |
| └ | setCustomVotingPower | External ❗️ | 🛑  | onlyRole |
| └ | grantRoleBatch | External ❗️ | 🛑  | onlyRole |
| └ | revokeRoleBatch | External ❗️ | 🛑  | onlyRole |
| └ | _authorizeUpgrade | Internal 🔒 | 🛑  | onlyRole |
||||||
| **SimpleTest** | Implementation |  |||
| └ | setValue | Public ❗️ | 🛑  |NO❗️ |
| └ | getValue | Public ❗️ |   |NO❗️ |
||||||
| **TreasuryRouter** | Implementation | Initializable, Ownable2StepUpgradeable, UUPSUpgradeable, ReentrancyGuardUpgradeable |||
| └ | pendingTransferIds | Public ❗️ |   |NO❗️ |
| └ | initialize | Public ❗️ | 🛑  | initializer onlyOwner |
| └ | receiveFunds | External ❗️ |  💵 | nonReentrant |
| └ | <Receive Ether> | External ❗️ |  💵 |NO❗️ |
| └ | depositERC20 | External ❗️ | 🛑  | nonReentrant |
| └ | depositNFT | External ❗️ | 🛑  | nonReentrant |
| └ | executeTransfer | Internal 🔒 | 🛑  | nonReentrant |
| └ | executeERC20Transfer | Internal 🔒 | 🛑  | nonReentrant |
| └ | executeNFTTransfer | Internal 🔒 | 🛑  | nonReentrant |
| └ | executeTransferBatch | External ❗️ | 🛑  | nonReentrant |
| └ | executeERC20TransferBatch | External ❗️ | 🛑  | nonReentrant |
| └ | executeNFTTransferBatch | External ❗️ | 🛑  | nonReentrant |
| └ | updateTreasury | External ❗️ | 🛑  | onlyRole |
| └ | emergencyWithdraw | External ❗️ | 🛑  | onlyRole nonReentrant |
| └ | cancelTransfer | External ❗️ | 🛑  | onlyRole nonReentrant |
| └ | cancelERC20Transfer | External ❗️ | 🛑  | onlyRole nonReentrant |
| └ | cancelNFTTransfer | External ❗️ | 🛑  | onlyRole nonReentrant |
| └ | receiveFundsWithMeta | External ❗️ |  💵 | nonReentrant |
| └ | _authorizeUpgrade | Internal 🔒 | 🛑  | onlyOwner |


### Legend

|  Symbol  |  Meaning  |
|:--------:|-----------|
|    🛑    | Function can modify state |
|    💵    | Function is payable |
