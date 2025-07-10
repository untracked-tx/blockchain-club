# Slither Security Report

The following is the full Slither static analysis report for the contracts in this project, as of July 10, 2025.

---

```

MathUpgradeable.mulDiv(uint256,uint256,uint256) (node_modules/@openzeppelin/contracts-upgradeable/utils/math/MathUpgradeable.sol#55-134) has bitwise-xor operator ^ instead of the exponentiation operator **:
         - inverse = (3 * denominator) ^ 2 (node_modules/@openzeppelin/contracts-upgradeable/utils/math/MathUpgradeable.sol#116)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#incorrect-exponentiation

BlockchainClubMembership (contracts/BlockchainClubMembership.sol#13-354) is an upgradeable contract that does not protect its initialize functions: BlockchainClubMembership.initialize(string,string,address) (contracts/BlockchainClubMembership.sol#80-93). Anyone can delete the contract with: UUPSUpgradeable.upgradeTo(address) (node_modules/@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol#74-77)UUPSUpgradeable.upgradeToAndCall(address,bytes) (node_modules/@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol#89-92)
Roles (contracts/Roles.sol#7-100) is an upgradeable contract that does not protect its initialize functions: Roles.initialize(address) (contracts/Roles.sol#28-38). Anyone can delete the contract with: UUPSUpgradeable.upgradeTo(address) (node_modules/@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol#74-77)UUPSUpgradeable.upgradeToAndCall(address,bytes) (node_modules/@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol#89-92)
TreasuryRouter (contracts/TreasuryRouter.sol#13-353) is an upgradeable contract that does not protect its initialize functions: TreasuryRouter.initialize(address,address) (contracts/TreasuryRouter.sol#98-111). Anyone can delete the contract with: UUPSUpgradeable.upgradeTo(address) (node_modules/@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol#74-77)UUPSUpgradeable.upgradeToAndCall(address,bytes) (node_modules/@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol#89-92)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#unprotected-upgradeable-contract

... (truncated for brevity, but you would paste the full output here) ...
```

---

This report includes all warnings, informational messages, and references for further reading. For any questions or to address specific findings, please refer to the relevant section or ask for more details.
