# Surya Contract Analysis Results

## BlockchainClubMembership.sol

```
 +  BlockchainClubMembership (Initializable, ERC721Upgradeable, ERC721EnumerableUpgradeable, Ownable2StepUpgradeable, UUPSUpgradeable, ReentrancyGuardUpgradeable, PausableUpgradeable)
    - [Pub] initialize #
       - modifiers: initializer
    - [Ext] requestWhitelist #
       - modifiers: whenNotPaused
    - [Ext] processWhitelistRequest #
       - modifiers: onlyRole,nonReentrant
    - [Ext] getPendingWhitelistRequests
    - [Ext] hasPendingRequest
    - [Ext] createTokenType #
       - modifiers: onlyRole
    - [Ext] deactivateTokenType #
       - modifiers: onlyRole
    - [Int] _hasTokenOfType
    - [Ext] mint #
       - modifiers: onlyRole,whenNotPaused,nonReentrant
    - [Ext] publicMint #
       - modifiers: whenNotPaused,nonReentrant      
    - [Ext] burnToken #
       - modifiers: onlyRole,nonReentrant
    - [Int] _beforeTokenTransfer #
       - modifiers: whenNotPaused
    - [Ext] updateWhitelist #
       - modifiers: onlyRole,nonReentrant
    - [Int] _updateMemberStats #
    - [Pub] setBaseURI #
       - modifiers: onlyRole,nonReentrant
    - [Int] _baseURI
    - [Pub] tokenURI
    - [Int] _toUrlSafe
    - [Ext] getMemberCount
    - [Ext] getOfficerCount
    - [Ext] getAllTokenTypeIds
    - [Ext] pause #
       - modifiers: onlyOwner
    - [Ext] unpause #
       - modifiers: onlyOwner
    - [Int] _authorizeUpgrade #
       - modifiers: onlyOwner
    - [Pub] supportsInterface
```

## Roles.sol

```
 +  Roles (Initializable, AccessControlEnumerableUpgradeable, UUPSUpgradeable)
    - [Pub] initialize #
       - modifiers: initializer,onlyRole
    - [Pub] getUserCurrentRole
    - [Pub] getVotingPower
    - [Ext] setVotingPower #
       - modifiers: onlyRole
    - [Ext] setCustomVotingPower #
       - modifiers: onlyRole
    - [Ext] grantRoleBatch #
       - modifiers: onlyRole
    - [Ext] revokeRoleBatch #
       - modifiers: onlyRole
    - [Int] _authorizeUpgrade #
       - modifiers: onlyRole
```

## SimpleTest.sol (Test Contract)

```
 +  SimpleTest 
    - [Pub] setValue #
    - [Pub] getValue
```

## Legend
- `($)` = payable function
- `#` = non-constant function
- `[Pub]` = Public function
- `[Ext]` = External function  
- `[Int]` = Internal function
