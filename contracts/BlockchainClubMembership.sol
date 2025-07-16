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

/**
 * @title BlockchainClubMembership
 * @notice NFT-based membership system for the Blockchain Club with role integration
 * @dev Implements ERC721 with enumerable extension, supports soulbound tokens and whitelist management
 * @dev Integrates with the Roles contract for access control and automatic role assignment
 * @dev Uses UUPS upgrade pattern and includes comprehensive security features
 * @author Blockchain Club Development Team
 * @custom:security-contact Liam.Murphy@ucdenver.edu
 */
contract BlockchainClubMembership is 
    Initializable, 
    ERC721Upgradeable,
    ERC721EnumerableUpgradeable,
    Ownable2StepUpgradeable,
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable {
    
    /// @notice Reference to the Roles contract for access control
    IRoles public roles;
    
    /// @notice Mapping of token IDs to their token types
    mapping(uint256 => bytes32) public tokenTypes;
    
    /// @notice Mapping of token IDs to their soulbound status
    /// @dev Soulbound tokens cannot be transferred (except mint/burn)
    mapping(uint256 => bool) public soulbound;
    
    /// @notice Hash identifier for member token type
    bytes32 public constant MEMBER_TOKEN_TYPE = keccak256("MEMBER");
    
    /// @notice Hash identifier for officer token type
    bytes32 public constant OFFICER_TOKEN_TYPE = keccak256("OFFICER");
    
    /// @notice Counter for generating unique token IDs
    uint256 private _nextTokenId;
    
    /// @notice Mapping of addresses to their whitelist status
    mapping(address => bool) public whitelist;
    
    /// @notice Structure for whitelist requests
    /// @dev Tracks requests from users wanting to join the whitelist
    struct WhitelistRequest {
        address requester;    /// @dev Address that made the request
        uint256 timestamp;    /// @dev When the request was made
        bool processed;       /// @dev Whether the request has been reviewed
        bool approved;        /// @dev Whether the request was approved
    }
    
    /// @notice Array of all whitelist requests
    WhitelistRequest[] public whitelistRequests;
    
    /// @notice Mapping of addresses to their last request timestamp
    mapping(address => uint256) public lastRequestTime;
    
    /// @notice Cooldown period between whitelist requests (24 hours)
    uint256 public constant REQUEST_COOLDOWN = 24 hours;
    
    /// @notice Structure for tracking member statistics
    /// @dev Provides insights into member activity and role progression
    struct MemberStats {
        uint256 joinDate;     /// @dev Timestamp when member first joined
        uint256 tokenCount;   /// @dev Current number of tokens owned
        bytes32 currentRole;  /// @dev Current highest role in the club
        bool isActive;        /// @dev Whether the member is currently active
    }
    
    /// @notice Mapping of addresses to their member statistics
    mapping(address => MemberStats) public memberStats;
    
    /// @notice Enum for defining who can mint specific token types
    enum MintAccess { OFFICER_ONLY, WHITELIST_ONLY, PUBLIC }
    
    /// @notice Structure for configuring token types
    /// @dev Defines the properties and restrictions for each token type
    struct TokenTypeConfig {
        string name;          /// @dev Human-readable name of the token type
        string category;      /// @dev Category classification
        uint256 startTime;    /// @dev When minting opens for this type
        uint256 endTime;      /// @dev When minting closes for this type
        uint256 maxSupply;    /// @dev Maximum number of tokens that can be minted
        uint256 currentSupply;/// @dev Current number of tokens minted
        bool isActive;        /// @dev Whether minting is currently enabled
        MintAccess mintAccess;/// @dev Who is allowed to mint this token type
    }
    
    /// @notice Mapping of token type IDs to their configurations
    mapping(bytes32 => TokenTypeConfig) public tokenTypeConfigs;
    
    /// @notice Array to store all token type IDs for enumeration
    bytes32[] private _allTokenTypeIds;
    
    /// @notice Base URI for token metadata
    string private _baseTokenURI;
    
    // Events
    
    /// @notice Emitted when a new token is minted
    /// @param to Address that received the token
    /// @param tokenId ID of the newly minted token
    /// @param tokenType Type of token that was minted
    event TokenMinted(address indexed to, uint256 indexed tokenId, bytes32 indexed tokenType);
    
    /// @notice Emitted when a new token type is created
    /// @param typeId Unique identifier for the token type
    /// @param name Human-readable name of the token type
    /// @param category Category classification of the token type
    event TokenTypeCreated(bytes32 indexed typeId, string name, string category);
    
    /// @notice Emitted when whitelist status is updated
    /// @param account Address whose whitelist status changed
    /// @param status New whitelist status (true = whitelisted, false = removed)
    event WhitelistUpdated(address indexed account, bool status);
    
    /// @notice Emitted when member statistics are updated
    /// @param member Address of the member
    /// @param role Current role of the member
    /// @param tokenCount Current number of tokens owned by the member
    event StatsUpdated(address indexed member, bytes32 indexed role, uint256 tokenCount);
    
    /// @notice Emitted when a whitelist request is submitted
    /// @param requester Address that made the request
    /// @param requestId Index of the request in the requests array
    event WhitelistRequested(address indexed requester, uint256 indexed requestId);
    
    /// @notice Emitted when a whitelist request is processed
    /// @param requester Address that made the request
    /// @param requestId Index of the request in the requests array
    /// @param approved Whether the request was approved or denied
    event WhitelistRequestProcessed(address indexed requester, uint256 indexed requestId, bool approved);
    
    /**
     * @notice Modifier to check if caller has a specific role
     * @param role The role to check for
     */
    modifier onlyRole(bytes32 role) {
        require(roles.hasRole(role, msg.sender), "Missing required role");
        _;
    }
    
    /**
     * @notice Initializes the BlockchainClubMembership contract
     * @dev Sets up the ERC721 token, connects to roles contract, and initializes all inherited contracts
     * @dev Can only be called once due to the initializer modifier
     * @param contractName Name of the NFT collection
     * @param contractSymbol Symbol of the NFT collection
     * @param rolesContract Address of the Roles contract for access control
     * @custom:oz-upgrades-unsafe-allow constructor
     */
    function initialize(
        string memory contractName,
        string memory contractSymbol,
        address rolesContract
    ) public initializer {
        __ERC721_init(contractName, contractSymbol);
        __ERC721Enumerable_init();
        __Ownable2Step_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        __Pausable_init();
        require(rolesContract != address(0), "Invalid roles contract");
        roles = IRoles(rolesContract);
    }
    
    /**
     * @notice Allows users to request whitelist access
     * @dev Users can only make one request per cooldown period (24 hours)
     * @dev Already whitelisted users cannot make requests
     * @custom:emits WhitelistRequested
     */
    function requestWhitelist() external whenNotPaused {
        require(!whitelist[msg.sender], "Already whitelisted");
        require(
            block.timestamp >= lastRequestTime[msg.sender] + REQUEST_COOLDOWN,
            "Please wait before requesting again"
        );
        
        uint256 requestId = whitelistRequests.length;
        whitelistRequests.push(WhitelistRequest({
            requester: msg.sender,
            timestamp: block.timestamp,
            processed: false,
            approved: false
        }));
        
        lastRequestTime[msg.sender] = block.timestamp;
        emit WhitelistRequested(msg.sender, requestId);
    }
    
    /**
     * @notice Processes a whitelist request (officers only)
     * @dev Officers can approve or deny pending whitelist requests
     * @dev Approved requests automatically add the user to the whitelist
     * @param requestId Index of the request in the whitelistRequests array
     * @param grantWhitelist Whether to approve (true) or deny (false) the request
     * @custom:emits WhitelistRequestProcessed
     * @custom:emits WhitelistUpdated (if approved)
     */
    function processWhitelistRequest(uint256 requestId, bool grantWhitelist) 
        external 
        onlyRole(roles.OFFICER_ROLE()) 
        nonReentrant 
    {
        require(requestId < whitelistRequests.length, "Invalid request ID");
        WhitelistRequest storage request = whitelistRequests[requestId];
        require(!request.processed, "Request already processed");
        
        request.processed = true;
        request.approved = grantWhitelist;
        if (grantWhitelist) {
            whitelist[request.requester] = true;
            emit WhitelistUpdated(request.requester, true);
        }
        emit WhitelistRequestProcessed(request.requester, requestId, grantWhitelist);
    }
    
    /**
     * @notice Returns all pending whitelist requests
     * @dev Provides a way to enumerate unprocessed requests for officer review
     * @return requestIds Array of request indices
     * @return requesters Array of requester addresses
     * @return timestamps Array of request timestamps
     */
    function getPendingWhitelistRequests() external view returns (
        uint256[] memory requestIds,
        address[] memory requesters,
        uint256[] memory timestamps
    ) {
        uint256 len = whitelistRequests.length;
        uint256 pendingCount = 0;
        for (uint256 i = 0; i < len; i++) {
            if (!whitelistRequests[i].processed) {
                pendingCount++;
            }
        }
        requestIds = new uint256[](pendingCount);
        requesters = new address[](pendingCount);
        timestamps = new uint256[](pendingCount);
        uint256 index = 0;
        for (uint256 i = 0; i < len; i++) {
            if (!whitelistRequests[i].processed) {
                requestIds[index] = i;
                requesters[index] = whitelistRequests[i].requester;
                timestamps[index] = whitelistRequests[i].timestamp;
                index++;
            }
        }
        return (requestIds, requesters, timestamps);
    }
    
    /**
     * @notice Checks if an address has a pending whitelist request
     * @param user Address to check for pending requests
     * @return True if the user has an unprocessed request, false otherwise
     */
    function hasPendingRequest(address user) external view returns (bool) {
        uint256 len = whitelistRequests.length;
        for (uint256 i = 0; i < len; i++) {
            if (whitelistRequests[i].requester == user && !whitelistRequests[i].processed) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @notice Creates a new token type with specified parameters
     * @dev Only officers can create new token types
     * @dev Token types define the characteristics and minting rules for NFTs
     * @param typeId Unique identifier for the token type (typically a hash)
     * @param typeName Human-readable name for the token type
     * @param typeCategory Category classification for organization
     * @param startTime Timestamp when minting begins for this type
     * @param endTime Timestamp when minting ends for this type
     * @param maxSupply Maximum number of tokens that can be minted of this type
     * @param mintAccess Who is allowed to mint this token type
     * @custom:emits TokenTypeCreated
     */
    function createTokenType(
        bytes32 typeId,
        string calldata typeName,
        string calldata typeCategory,
        uint256 startTime,
        uint256 endTime,
        uint256 maxSupply,
        MintAccess mintAccess
    ) external onlyRole(roles.OFFICER_ROLE()) {
        require(tokenTypeConfigs[typeId].maxSupply == 0, "Type already exists");
        tokenTypeConfigs[typeId] = TokenTypeConfig({
            name: typeName,
            category: typeCategory,
            startTime: startTime,
            endTime: endTime,
            maxSupply: maxSupply,
            currentSupply: 0,
            isActive: true,
            mintAccess: mintAccess
        });
        _allTokenTypeIds.push(typeId); // Track the new token type
        emit TokenTypeCreated(typeId, typeName, typeCategory);
    }
    
    /**
     * @notice Deactivates a token type to prevent further minting
     * @dev Only officers can deactivate token types
     * @dev Existing tokens of this type remain unaffected
     * @param typeId Unique identifier of the token type to deactivate
     */
    function deactivateTokenType(bytes32 typeId) external onlyRole(roles.OFFICER_ROLE()) {
        require(tokenTypeConfigs[typeId].isActive, "Token type already inactive");
        tokenTypeConfigs[typeId].isActive = false;
    }
    
    /**
     * @notice Internal helper to check if an address already owns a token of a given type
     * @dev Prevents users from owning multiple tokens of the same type
     * @param account Address to check
     * @param tokenType Token type to check for
     * @return True if the account owns a token of this type, false otherwise
     */
    function _hasTokenOfType(address account, bytes32 tokenType) internal view returns (bool) {
        uint256 balance = balanceOf(account);
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(account, i);
            if (tokenTypes[tokenId] == tokenType) {
                return true;
            }
        }
        return false;
    }

    /**
     * @notice Mints a new token of specified type to an address (officers only)
     * @dev Validates whitelist status, supply limits, timing, and uniqueness constraints
     * @dev Automatically grants MEMBER_ROLE for MEMBER_TOKEN_TYPE if user is whitelisted
     * @param to Address to receive the minted token
     * @param tokenType Type of token to mint
     * @param isSoulboundFlag Whether the token should be soulbound (non-transferable)
     * @custom:emits TokenMinted
     */
    function mint(
        address to,
        bytes32 tokenType,
        bool isSoulboundFlag
    ) external onlyRole(roles.OFFICER_ROLE()) whenNotPaused nonReentrant {
        require(whitelist[to] || roles.hasRole(roles.MEMBER_ROLE(), to), "Address not whitelisted");
        TokenTypeConfig storage config = tokenTypeConfigs[tokenType];
        require(config.isActive, "Token type not active");
        require(config.currentSupply < config.maxSupply, "Max supply reached");
        require(block.timestamp >= config.startTime, "Minting not started for this token type");
        require(block.timestamp <= config.endTime, "Minting has ended for this token type");
        require(!_hasTokenOfType(to, tokenType), "Wallet already owns a token of this type");
        uint256 newTokenId = _nextTokenId++;
        tokenTypes[newTokenId] = tokenType;
        soulbound[newTokenId] = isSoulboundFlag;
        config.currentSupply++;
        // Update member stats
        _updateMemberStats(to);
        // Grant MEMBER_ROLE if minting MEMBER_TOKEN_TYPE and whitelisted
        if (tokenType == MEMBER_TOKEN_TYPE && whitelist[to]) {
            if (!roles.hasRole(roles.MEMBER_ROLE(), to)) {
                roles.grantRole(roles.MEMBER_ROLE(), to);
            }
        }
        _safeMint(to, newTokenId);
        emit TokenMinted(to, newTokenId, tokenType);
    }
    
    /**
     * @notice Public minting function with access control based on token type configuration
     * @dev Access is determined by the token type's mintAccess setting
     * @dev Validates all the same constraints as the officer mint function
     * @param tokenType Type of token to mint
     * @param isSoulboundFlag Whether the token should be soulbound (non-transferable)
     * @custom:emits TokenMinted
     */
    function publicMint(bytes32 tokenType, bool isSoulboundFlag) external whenNotPaused nonReentrant {
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
        require(!_hasTokenOfType(msg.sender, tokenType), "Wallet already owns a token of this type");
        uint256 newTokenId = _nextTokenId++;
        tokenTypes[newTokenId] = tokenType;
        soulbound[newTokenId] = isSoulboundFlag;
        config.currentSupply++;
        // Update member stats
        _updateMemberStats(msg.sender);
        // Grant MEMBER_ROLE if minting MEMBER_TOKEN_TYPE and whitelisted
        if (tokenType == MEMBER_TOKEN_TYPE && whitelist[msg.sender]) {
            if (!roles.hasRole(roles.MEMBER_ROLE(), msg.sender)) {
                roles.grantRole(roles.MEMBER_ROLE(), msg.sender);
            }
        }
        _safeMint(msg.sender, newTokenId);
        emit TokenMinted(msg.sender, newTokenId, tokenType);
    }
    
    /**
     * @notice Allows an officer to burn a token
     * @dev Updates member statistics and deactivates membership if no tokens remain
     * @param tokenId ID of the token to burn
     * @custom:emits StatsUpdated
     */
    function burnToken(uint256 tokenId) external onlyRole(roles.OFFICER_ROLE()) nonReentrant {
        address tokenOwner = ownerOf(tokenId);
        _burn(tokenId);
        // update stats properly
        _updateMemberStats(tokenOwner);
        // if zero token count, explicitly mark inactive
        if (memberStats[tokenOwner].tokenCount == 0) {
            memberStats[tokenOwner].isActive = false;
        }
        emit StatsUpdated(
            tokenOwner,
            memberStats[tokenOwner].currentRole,
            memberStats[tokenOwner].tokenCount
        );
    }
    
    /**
     * @notice Override to enforce soulbound token restrictions
     * @dev Prevents transfer of soulbound tokens (except mint/burn operations)
     * @dev Required by ERC721Enumerable for proper functionality
     * @param from Address sending the token (zero for minting)
     * @param to Address receiving the token (zero for burning)
     * @param tokenId ID of the token being transferred
     * @param batchSize Number of tokens in the batch (always 1 for ERC721)
     */
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
    
    /**
     * @notice Updates whitelist status for an address
     * @dev Only officers can modify whitelist status
     * @param account Address to update whitelist status for
     * @param status New whitelist status (true = add, false = remove)
     * @custom:emits WhitelistUpdated
     */
    function updateWhitelist(address account, bool status) external onlyRole(roles.OFFICER_ROLE()) nonReentrant {
        whitelist[account] = status;
        emit WhitelistUpdated(account, status);
    }
    
    /**
     * @notice Updates whitelist status for multiple addresses in a single transaction
     * @dev More gas-efficient than individual updateWhitelist calls
     * @dev Only officers can modify whitelist status
     * @param accounts Array of addresses to update whitelist status for
     * @param status New whitelist status for all accounts (true = add, false = remove)
     * @custom:emits WhitelistUpdated for each address
     */
    function updateWhitelistBatch(
        address[] calldata accounts, 
        bool status
    ) external onlyRole(roles.OFFICER_ROLE()) nonReentrant {
        for (uint256 i = 0; i < accounts.length; i++) {
            whitelist[accounts[i]] = status;
            emit WhitelistUpdated(accounts[i], status);
        }
    }
    
    /**
     * @notice Internal function to update member statistics
     * @dev Automatically called when tokens are minted/burned to keep stats current
     * @dev Updates join date, token count, current role, and active status
     * @param member Address of the member to update
     * @custom:emits StatsUpdated
     */
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
    
    /**
     * @notice Sets the base URI for token metadata
     * @dev Only admins can update the base URI
     * @dev Used to construct the full metadata URI for each token
     * @param newBaseURI New base URI string
     */
    function setBaseURI(string memory newBaseURI) public onlyRole(roles.ADMIN_ROLE()) nonReentrant {
        _baseTokenURI = newBaseURI;
    }

    /**
     * @notice Returns the base URI for token metadata
     * @dev Internal function used by tokenURI
     * @return The current base URI string
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @notice Returns the metadata URI for a specific token
     * @dev Constructs URI using token type name instead of token ID for better organization
     * @dev Converts token type names to URL-safe format
     * @param tokenId ID of the token to get metadata for
     * @return Full metadata URI string
     */
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
    
    /**
     * @notice Converts a string to URL-safe format
     * @dev Converts to lowercase and replaces special characters with underscores
     * @param str Input string to convert
     * @return URL-safe string
     */
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
    
    /**
     * @notice Returns the total number of members in the club
     * @dev Queries the Roles contract for MEMBER_ROLE count
     * @return Total number of members
     */
    function getMemberCount() external view returns (uint256) {
        return roles.getRoleMemberCount(roles.MEMBER_ROLE());
    }
    
    /**
     * @notice Returns the total number of officers in the club
     * @dev Queries the Roles contract for OFFICER_ROLE count
     * @return Total number of officers
     */
    function getOfficerCount() external view returns (uint256) {
        return roles.getRoleMemberCount(roles.OFFICER_ROLE());
    }
    
    /**
     * @notice Returns all available token type IDs
     * @dev Useful for enumerating all token types that have been created
     * @return Array of all token type IDs
     */
    function getAllTokenTypeIds() external view returns (bytes32[] memory) {
        return _allTokenTypeIds;
    }
    
    /**
     * @notice Pauses the contract, preventing most operations
     * @dev Only the owner can pause the contract
     * @dev Used in emergency situations
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpauses the contract, resuming normal operations
     * @dev Only the owner can unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @notice Authorizes contract upgrades
     * @dev Only the contract owner can authorize upgrades
     * @dev Required by UUPSUpgradeable
     * @param newImplementation Address of the new implementation contract
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {
        // Authorization logic handled by onlyOwner modifier
    }
    
    /**
     * @notice Checks if contract supports a given interface
     * @dev Required override for ERC721Enumerable compatibility
     * @param interfaceId Interface identifier to check
     * @return True if interface is supported, false otherwise
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}