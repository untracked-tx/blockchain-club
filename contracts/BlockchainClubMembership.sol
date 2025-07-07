// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IRoles.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";

contract BlockchainClubMembership is 
    Initializable, 
    ERC721Upgradeable,
    ERC721EnumerableUpgradeable,
    Ownable2StepUpgradeable,
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable {
    
    // Reference to Roles contract
    IRoles public roles;
    
    // Token types (using bytes32 instead of string)
    mapping(uint256 => bytes32) public tokenTypes;
    mapping(uint256 => bool) public soulbound;
    bytes32 public constant MEMBER_TOKEN_TYPE = keccak256("MEMBER");
    bytes32 public constant OFFICER_TOKEN_TYPE = keccak256("OFFICER");
    
    // Token counter
    uint256 private _nextTokenId;
    
    // Whitelist
    mapping(address => bool) public whitelist;
    
    // Member statistics
    struct MemberStats {
        uint256 joinDate;
        uint256 tokenCount;
        bytes32 currentRole;
        bool isActive;
    }
    
    mapping(address => MemberStats) public memberStats;
    
    // Token type configuration
    enum MintAccess { OFFICER_ONLY, WHITELIST_ONLY, PUBLIC }
    struct TokenTypeConfig {
        string name;
        string category;
        uint256 startTime;
        uint256 endTime;
        uint256 maxSupply;
        uint256 currentSupply;
        bool isActive;
        MintAccess mintAccess;
    }
    
    mapping(bytes32 => TokenTypeConfig) public tokenTypeConfigs;
    
    // Base URI for metadata
    string private _baseTokenURI;
    
    // Events
    event TokenMinted(address indexed to, uint256 indexed tokenId, bytes32 indexed tokenType);
    event TokenTypeCreated(bytes32 indexed typeId, string name, string category);
    event WhitelistUpdated(address indexed account, bool status);
    event StatsUpdated(address indexed member, bytes32 indexed role, uint256 tokenCount);
    
    // Modifiers
    modifier onlyRole(bytes32 role) {
        require(roles.hasRole(role, msg.sender), "Missing required role");
        _;
    }
    
    // Initialize function
    function initialize(
        string memory name,
        string memory symbol,
        address rolesContract
    ) public initializer {
        __ERC721_init(name, symbol);
        __ERC721Enumerable_init();
        __Ownable2Step_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        __Pausable_init();
        
        require(rolesContract != address(0), "Invalid roles contract");
        roles = IRoles(rolesContract);
    }
    
    // Token type management
    function createTokenType(
        bytes32 typeId,
        string calldata name,
        string calldata category,
        uint256 startTime,
        uint256 endTime,
        uint256 maxSupply,
        MintAccess mintAccess
    ) external onlyRole(roles.OFFICER_ROLE()) {
        require(tokenTypeConfigs[typeId].maxSupply == 0, "Type already exists");
        tokenTypeConfigs[typeId] = TokenTypeConfig({
            name: name,
            category: category,
            startTime: startTime,
            endTime: endTime,
            maxSupply: maxSupply,
            currentSupply: 0,
            isActive: true,
            mintAccess: mintAccess
        });
        emit TokenTypeCreated(typeId, name, category);
    }
    
    // Internal helper to check if an address already owns a token of a given type
    function _hasTokenOfType(address owner, bytes32 tokenType) internal view returns (bool) {
        uint256 balance = balanceOf(owner);
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(owner, i);
            if (tokenTypes[tokenId] == tokenType) {
                return true;
            }
        }
        return false;
    }

    // Mint token function
    function mint(
        address to,
        bytes32 tokenType,
        bool isSoulbound
    ) external onlyRole(roles.OFFICER_ROLE()) whenNotPaused nonReentrant {
        require(whitelist[to] || roles.hasRole(roles.MEMBER_ROLE(), to), "Address not whitelisted");
        TokenTypeConfig storage config = tokenTypeConfigs[tokenType];
        require(config.isActive, "Token type not active");
        require(config.currentSupply < config.maxSupply, "Max supply reached");
        require(block.timestamp >= config.startTime, "Minting not started for this token type");
        require(block.timestamp <= config.endTime, "Minting has ended for this token type");
        // Restrict to one member and one officer token per wallet
        if (tokenType == MEMBER_TOKEN_TYPE) {
            require(!_hasTokenOfType(to, MEMBER_TOKEN_TYPE), "Wallet already owns a member token");
        }
        if (tokenType == OFFICER_TOKEN_TYPE) {
            require(!_hasTokenOfType(to, OFFICER_TOKEN_TYPE), "Wallet already owns an officer token");
        }
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        tokenTypes[tokenId] = tokenType;
        soulbound[tokenId] = isSoulbound;
        config.currentSupply++;
        // Update member stats
        _updateMemberStats(to);
        // Grant MEMBER_ROLE if minting MEMBER_TOKEN_TYPE and whitelisted
        if (tokenType == MEMBER_TOKEN_TYPE && whitelist[to]) {
            if (!roles.hasRole(roles.MEMBER_ROLE(), to)) {
                roles.grantRole(roles.MEMBER_ROLE(), to);
            }
        }
        emit TokenMinted(to, tokenId, tokenType);
    }
    
    // Public mint function
    function publicMint(bytes32 tokenType, bool isSoulbound) external whenNotPaused nonReentrant {
        TokenTypeConfig storage config = tokenTypeConfigs[tokenType];
        require(config.isActive, "Token type not active");
        require(config.currentSupply < config.maxSupply, "Max supply reached");
        require(block.timestamp >= config.startTime, "Minting not started for this token type");
        require(block.timestamp <= config.endTime, "Minting has ended for this token type");
        if (config.mintAccess == MintAccess.OFFICER_ONLY) {
            require(roles.hasRole(roles.OFFICER_ROLE(), msg.sender), "Officers only");
        } else if (config.mintAccess == MintAccess.WHITELIST_ONLY) {
            require(whitelist[msg.sender], "Not whitelisted");
        }
        // Restrict to one member and one officer token per wallet
        if (tokenType == MEMBER_TOKEN_TYPE) {
            require(!_hasTokenOfType(msg.sender, MEMBER_TOKEN_TYPE), "Wallet already owns a member token");
        }
        if (tokenType == OFFICER_TOKEN_TYPE) {
            require(!_hasTokenOfType(msg.sender, OFFICER_TOKEN_TYPE), "Wallet already owns an officer token");
        }
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        tokenTypes[tokenId] = tokenType;
        soulbound[tokenId] = isSoulbound;
        config.currentSupply++;
        // Update member stats
        _updateMemberStats(msg.sender);
        // Grant MEMBER_ROLE if minting MEMBER_TOKEN_TYPE and whitelisted
        if (tokenType == MEMBER_TOKEN_TYPE && whitelist[msg.sender]) {
            if (!roles.hasRole(roles.MEMBER_ROLE(), msg.sender)) {
                roles.grantRole(roles.MEMBER_ROLE(), msg.sender);
            }
        }
        emit TokenMinted(msg.sender, tokenId, tokenType);
    }
    
    /// @notice Allows an officer to burn a token.
    function burnToken(uint256 tokenId) external onlyRole(roles.OFFICER_ROLE()) {
        address owner = ownerOf(tokenId);
        _burn(tokenId);
        // update stats properly
        _updateMemberStats(owner);
        // if zero token count, explicitly mark inactive
        if (memberStats[owner].tokenCount == 0) {
            memberStats[owner].isActive = false;
        }
        emit StatsUpdated(
            owner,
            memberStats[owner].currentRole,
            memberStats[owner].tokenCount
        );
    }
    
    // Override _beforeTokenTransfer to enforce soulbound tokens
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721Upgradeable, ERC721EnumerableUpgradeable) whenNotPaused {
        // Allow minting and burning
        if (from != address(0) && to != address(0)) {
            require(!soulbound[tokenId], "Token is soulbound");
        }
        
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    // Whitelist management
    function updateWhitelist(address account, bool status) external onlyRole(roles.OFFICER_ROLE()) {
        whitelist[account] = status;
        emit WhitelistUpdated(account, status);
    }
    
    // Internal function to update member stats
    function _updateMemberStats(address member) internal {
        MemberStats storage stats = memberStats[member];
        
        if (stats.joinDate == 0) {
            stats.joinDate = block.timestamp;
        }
        
        stats.tokenCount = balanceOf(member);
        stats.isActive = true;
        
        bytes32 currentRole;
        if (roles.hasRole(roles.OFFICER_ROLE(), member)) {
            currentRole = roles.OFFICER_ROLE();
        } else if (roles.hasRole(roles.MEMBER_ROLE(), member)) {
            currentRole = roles.MEMBER_ROLE();
        } else {
            currentRole = bytes32(0);
        }
        
        stats.currentRole = currentRole;
        
        emit StatsUpdated(member, currentRole, stats.tokenCount);
    }
    
    // Base URI management
    function setBaseURI(string memory newBaseURI) public onlyRole(roles.ADMIN_ROLE()) {
        _baseTokenURI = newBaseURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    // Override tokenURI to use token type names instead of tokenIds
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireMinted(tokenId);
        
        string memory baseURI = _baseURI();
        if (bytes(baseURI).length == 0) {
            return "";
        }
        
        // Get the token type for this tokenId
        bytes32 tokenType = tokenTypes[tokenId];
        if (tokenType == bytes32(0)) {
            return string(abi.encodePacked(baseURI, "unknown.json"));
        }
        
        // Get the token type name from config
        string memory typeName = tokenTypeConfigs[tokenType].name;
        if (bytes(typeName).length == 0) {
            return string(abi.encodePacked(baseURI, "unknown.json"));
        }
        
        // Convert type name to URL-safe format
        string memory safeTypeName = _toUrlSafe(typeName);
        
        return string(abi.encodePacked(baseURI, safeTypeName, ".json"));
    }
    
    // Helper function to convert string to URL-safe format
    function _toUrlSafe(string memory str) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        bytes memory result = new bytes(strBytes.length);
        
        for (uint256 i = 0; i < strBytes.length; i++) {
            bytes1 char = strBytes[i];
            
            // Convert to lowercase and replace spaces/special chars with underscore
            if (char >= 0x41 && char <= 0x5A) { // A-Z
                result[i] = bytes1(uint8(char) + 32); // Convert to lowercase
            } else if (char >= 0x61 && char <= 0x7A) { // a-z
                result[i] = char;
            } else if (char >= 0x30 && char <= 0x39) { // 0-9
                result[i] = char;
            } else {
                result[i] = 0x5F; // underscore
            }
        }
        
        return string(result);
    }
    
    // Query functions
    function getMemberCount() external view returns (uint256) {
        return roles.getRoleMemberCount(roles.MEMBER_ROLE());
    }
    
    function getOfficerCount() external view returns (uint256) {
        return roles.getRoleMemberCount(roles.OFFICER_ROLE());
    }
    
    // Ownership, pause and upgrade controls
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {
        // Authorization logic handled by onlyOwner modifier
    }
    
    // Required overrides
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    // Storage gap for future upgrades
    uint256[39] private __gap;
}
