// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @dev STORAGE LAYOUT: When upgrading, always append new variables at the end of the contract.
 * Never remove or reorder state variables. Document all changes for future upgrades.
 *
 * Upgrade history:
 * - v1: Initial implementation
 * - v2: AccessControlUpgradeable, Ownable2StepUpgradeable, refund logic, operator filter placeholder
 */
contract BlockchainClubMembership is Initializable, ERC721Upgradeable, ERC721EnumerableUpgradeable, Ownable2StepUpgradeable, AccessControlUpgradeable, UUPSUpgradeable, ReentrancyGuardUpgradeable, PausableUpgradeable {
    // --- STORAGE LAYOUT ---
    uint256 public tokenPrice;
    uint256 public nextTokenId;
    string public baseTokenURI;
    mapping(address => bool) public whitelist;
    mapping(uint256 => string) public roles; // Role string (Observer, Member, Supporter, Officer, Alumni, Collector, Recovery, etc.)
    mapping(address => mapping(string => bool)) public hasMintedRole; // Track if address has minted a given role
    mapping(uint256 => bool) public soulbound;
    mapping(uint256 => bool) public invalidTokens;
    address public opsWallet;
    address public scholarshipWallet;
    mapping(string => bool) public editionWhitelist;
    mapping(uint256 => uint256) public tokenExpiry;
    uint256 public constant SUPPORTER_PRICE = 0.02 ether;
    mapping(uint256 => address) public mintedBy;
    mapping(uint256 => bool) public isRecoveryToken;
    mapping(uint256 => uint256) public replacesToken;
    mapping(string => uint256) public roleVotingPower;
    // --- END STORAGE LAYOUT ---

    // --- ACCESS CONTROL ROLES ---
    bytes32 public constant OFFICER_ROLE = keccak256("OFFICER_ROLE");
    // --- END ACCESS CONTROL ROLES ---

    event MembershipMinted(address indexed to, uint256 indexed tokenId);
    event RoleChanged(uint256 indexed tokenId, string newRole);
    event OfficerAction(address indexed officer, uint256 indexed tokenId, string action);
    event TokenBurned(address indexed owner, uint256 indexed tokenId);
    event TokenInvalidated(uint256 indexed tokenId);
    event TokenReissued(uint256 indexed oldTokenId, uint256 indexed newTokenId, address indexed newOwner);
    event Withdrawn(address recipient, uint256 amount);
    
    function initialize(string memory baseURI, address _opsWallet, address _scholarshipWallet) public initializer {
        __ERC721_init("BlockchainClubMembership", "BCM");
        __ERC721Enumerable_init();
        __Ownable2Step_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        __Pausable_init();
        require(_opsWallet != address(0), "Invalid ops wallet");
        require(_scholarshipWallet != address(0), "Invalid scholarship wallet");
        baseTokenURI = baseURI;
        opsWallet = _opsWallet;
        scholarshipWallet = _scholarshipWallet;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OFFICER_ROLE, msg.sender);
        tokenPrice = 0.01 ether;
        nextTokenId = 1;
        // Set voting weights
        roleVotingPower["Officer"] = 3;
        roleVotingPower["Member"] = 1;
        roleVotingPower["Supporter"] = 0;
        roleVotingPower["Observer"] = 0;
        roleVotingPower["Alumni"] = 0; // Explicitly non-voting
        roleVotingPower["Collector"] = 0; // Explicitly non-voting
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    modifier onlyOfficerOrOwner() {
        require(hasRole(OFFICER_ROLE, msg.sender) || owner() == msg.sender, "Not officer or owner");
        _;
    }

    /**
     * @notice Adds or removes an address from the whitelist.
     * @dev Only callable by an officer or the owner.
     * @param user The address to update.
     * @param status The whitelist status to set (true for whitelisted, false otherwise).
     */
    function setWhitelist(address user, bool status) external onlyOfficerOrOwner {
        whitelist[user] = status;
    }

    /**
     * @notice Adds or removes multiple addresses from the whitelist.
     * @dev Only callable by an officer or the owner.
     * @param users The array of addresses to update.
     * @param status The whitelist status to set (true for whitelisted, false otherwise).
     */
    function setBatchWhitelist(address[] calldata users, bool status) external onlyOfficerOrOwner {
        for (uint256 i = 0; i < users.length; i++) {
            whitelist[users[i]] = status;
        }
    }

    /**
     * @notice Mint a token of a given role (Observer, Member, Supporter, Alumni, Collector, etc.).
     * @dev If price is zero, mint is free. If requireWhitelist is true, only whitelisted addresses can mint. Each address can mint only one of each role.
     * @param role The role string to mint.
     * @param price The required price (in wei) for minting this role.
     */
    function mintToken(bytes32 role, uint256 price) external payable nonReentrant whenNotPaused {
        if (role == keccak256("Observer") || role == keccak256("Supporter")) {
            require(msg.value >= price, "Insufficient payment");
        } else if (role == keccak256("Member")) {
            require(whitelist[msg.sender], "Not whitelisted");
            require(msg.value >= price, "Insufficient payment");
        } else if (role == keccak256("Officer")) {
            require(hasRole(OFFICER_ROLE, msg.sender), "Not authorized for officer role");
            require(msg.value >= price, "Insufficient payment");
        } else {
            revert("Invalid role");
        }

        require(!hasMintedRole[msg.sender][string(abi.encodePacked(role))], "You have already minted this role");

        uint256 tokenId = nextTokenId;
        _safeMint(msg.sender, tokenId);
        roles[tokenId] = string(abi.encodePacked(role));
        hasMintedRole[msg.sender][string(abi.encodePacked(role))] = true;
        mintedBy[tokenId] = msg.sender;
        nextTokenId++;

        emit MembershipMinted(msg.sender, tokenId);

        // Refund excess ETH
        if (msg.value > price) {
            (bool refundSuccess, ) = msg.sender.call{value: msg.value - price}("");
            require(refundSuccess, "Refund failed");
        }
    }

    /**
     * @notice Mint a "Recovery" token for a new owner, replacing an invalidated token.
     * @dev Only callable by an officer or the owner. Each address can mint only one Recovery role.
     * @param newOwner The address to receive the new token.
     * @param replacedTokenId The ID of the invalidated token being replaced.
     * @param role The role to assign to the new token.
     */
    function mintRecoveryToken(address newOwner, uint256 replacedTokenId, string calldata role) external onlyOfficerOrOwner whenNotPaused {
        require(invalidTokens[replacedTokenId], "Old token must be invalidated");
        require(newOwner != address(0), "Invalid new owner");
        string memory recoveryRole = "Recovery";
        require(!hasMintedRole[newOwner][recoveryRole], "Already minted recovery token for this role");

        uint256 newTokenId = nextTokenId++;
        _safeMint(newOwner, newTokenId);
        roles[newTokenId] = role;
        hasMintedRole[newOwner][recoveryRole] = true;
        mintedBy[newTokenId] = msg.sender;
        isRecoveryToken[newTokenId] = true;
        replacesToken[newTokenId] = replacedTokenId;

        emit TokenReissued(replacedTokenId, newTokenId, newOwner);
    }

    /**
     * @notice Returns the metadata URI for a given token ID.
     * @param tokenId The token ID to query.
     * @return The metadata URI for the token.
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        string memory role = roles[tokenId];
        if (bytes(role).length > 0) {
            return string(abi.encodePacked(baseTokenURI, role, "/", Strings.toString(tokenId), ".json"));
        }
        return string(abi.encodePacked(baseTokenURI, Strings.toString(tokenId), ".json"));
    }

    /**
     * @notice Sets the soulbound status for a token.
     * @dev Only callable by the owner.
     * @param tokenId The token ID to update.
     * @param _status The soulbound status to set (true for soulbound, false otherwise).
     */
    function setSoulbound(uint256 tokenId, bool _status) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        soulbound[tokenId] = _status;
    }

    /**
     * @notice Sets the price for minting tokens.
     * @dev Only callable by the owner.
     * @param _newPrice The new token price in wei.
     */
    function setTokenPrice(uint256 _newPrice) external onlyOwner {
        tokenPrice = _newPrice;
    }

    // --- WITHDRAW FUNCTION WITH MULTISIG SUPPORT NOTE ---
    /**
     * @notice Withdraws the contract's balance to the owner's address or a multisig treasury (e.g., Gnosis Safe).
     * @dev Only callable by the owner. For best practice, set the owner to a multisig wallet.
     */
    function withdraw() external onlyOwner {
        uint256 amount = address(this).balance;
        address payable treasury = payable(owner()); // Set owner to Gnosis Safe for multisig treasury
        treasury.transfer(amount);
        emit Withdrawn(treasury, amount);
    }

    /**
     * @notice Set the role for a token.
     * @dev Only callable by the owner or officer.
     * @param tokenId The token ID to update.
     * @param role The new role to assign.
     */
    function setRole(uint256 tokenId, string calldata role) external {
        require(_exists(tokenId), "Token does not exist");
        require(owner() == msg.sender || hasRole(OFFICER_ROLE, msg.sender), "Not authorized");
        roles[tokenId] = role;
        emit RoleChanged(tokenId, role);
    }

    /**
     * @notice Gets the voting weight for a token based on its role.
     * @dev Uses the roleVotingPower mapping to determine voting power by role.
     * @param tokenId The token ID to query.
     * @return The voting weight (e.g., 3 for Officers, 1 for Members, 0 for POAP/Alumni/Collector).
     */
    function getVotingWeight(uint256 tokenId) public view returns (uint256) {
        require(_exists(tokenId), "Token does not exist");
        return roleVotingPower[roles[tokenId]];
    }

    /**
     * @notice Set the operations wallet address.
     * @dev Only callable by the owner.
     * @param _opsWallet The new operations wallet address.
     */
    function setOpsWallet(address _opsWallet) external onlyOwner {
        require(_opsWallet != address(0), "Invalid address");
        opsWallet = _opsWallet;
    }

    /**
     * @notice Set the scholarship wallet address.
     * @dev Only callable by the owner.
     * @param _scholarshipWallet The new scholarship wallet address.
     */
    function setScholarshipWallet(address _scholarshipWallet) external onlyOwner {
        require(_scholarshipWallet != address(0), "Invalid address");
        scholarshipWallet = _scholarshipWallet;
    }

    /**
     * @notice Burn a token you own (if not soulbound).
     * @param tokenId The token ID to burn.
     */
    function burn(uint256 tokenId) external whenNotPaused {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "You are not the owner of this token");
        require(!soulbound[tokenId], "Soulbound tokens cannot be burned");

        _burn(tokenId);
        emit TokenBurned(msg.sender, tokenId);
    }

    /**
     * @notice Invalidate a token (mark as invalid).
     * @dev Only callable by the owner.
     * @param tokenId The token ID to invalidate.
     */
    function invalidateToken(uint256 tokenId) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        invalidTokens[tokenId] = true;
        emit TokenInvalidated(tokenId);
    }

    /**
     * @notice Reissue a token to a new owner, copying role/edition from an invalidated token.
     * @dev Only callable by the owner or an officer.
     * @param oldTokenId The invalidated token ID.
     * @param newOwner The address to receive the new token.
     */
    function reissueToken(uint256 oldTokenId, address newOwner) external onlyOfficerOrOwner {
        require(invalidTokens[oldTokenId], "Token is not invalidated");
        require(newOwner != address(0), "Invalid new owner address");

        uint256 newTokenId = nextTokenId;
        _safeMint(newOwner, newTokenId);
        roles[newTokenId] = roles[oldTokenId];
        nextTokenId++;

        emit TokenReissued(oldTokenId, newTokenId, newOwner);
    }

    /**
     * @notice Control which editions can be minted as officer editions.
     * @dev This is an important governance mechanism that prevents officers from creating arbitrary edition names.
     *      Only whitelisted edition names can be used in mintOfficerEdition.
     * @param edition The edition string to control (e.g., "SpecialOfficer", "BoardMember").
     * @param status True to allow this edition to be minted, false to disallow it.
     */
    function setEditionWhitelist(string calldata edition, bool status) external onlyOwner {
        editionWhitelist[edition] = status;
    }

    /**
     * @notice Mint a special officer edition token with specific capabilities.
     * @dev This function allows officers to create specialized membership tokens with different
     *      designations (editions) while maintaining their "Officer" role. This enables different
     *      types of officer positions (e.g., "Treasurer", "President") without changing role permissions.
     *      For governance purposes, only editions that have been whitelisted by the owner can be minted.
     * @param edition The edition string to mint (must be whitelisted first using setEditionWhitelist).
     */
    function mintOfficerEdition(string calldata edition) external whenNotPaused {
        require(editionWhitelist[edition], "Edition is not whitelisted");
        require(hasRole(OFFICER_ROLE, msg.sender), "Only officers can mint this edition");
        require(!hasMintedRole[msg.sender][edition], "You have already minted this edition");

        uint256 tokenId = nextTokenId;
        _safeMint(msg.sender, tokenId);
        roles[tokenId] = "Officer";
        hasMintedRole[msg.sender][edition] = true;
        mintedBy[tokenId] = msg.sender;
        nextTokenId++;

        emit MembershipMinted(msg.sender, tokenId);
    }

    /**
     * @notice Set the expiry timestamp for a token.
     * @dev Only callable by the owner.
     * @param tokenId The token ID to update.
     * @param expiryTimestamp The expiry timestamp to set.
     */
    function setTokenExpiry(uint256 tokenId, uint256 expiryTimestamp) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        tokenExpiry[tokenId] = expiryTimestamp;
    }

    /**
     * @notice Check if a token is active (not expired).
     * @param tokenId The token ID to check.
     * @return True if active, false if expired.
     */
    function isTokenActive(uint256 tokenId) public view returns (bool) {
        require(_exists(tokenId), "Token does not exist");
        uint256 expiry = tokenExpiry[tokenId];
        return expiry == 0 || block.timestamp < expiry;
    }

    /// @notice Returns true if the token is expired.
    /// @param tokenId The token ID to check.
    /// @return True if expired, false otherwise.
    function _isExpired(uint256 tokenId) internal view returns (bool) {
        uint256 expiry = tokenExpiry[tokenId];
        return expiry != 0 && block.timestamp > expiry;
    }

    /// @notice Restricts function to only active (not expired) tokens and only the token owner.
    /// @param tokenId The token ID to check.
    modifier onlyActiveToken(uint256 tokenId) {
        require(!_isExpired(tokenId), "Token is expired");
        require(ownerOf(tokenId) == msg.sender, "You are not the owner of this token");
        _;
    }

    /**
     * @notice Transfer a token if it is active (not expired).
     * @param to The address to transfer to.
     * @param tokenId The token ID to transfer.
     */
    function transferWithExpiryCheck(address to, uint256 tokenId) external onlyActiveToken(tokenId) whenNotPaused {
        _transfer(msg.sender, to, tokenId);
    }

    /**
     * @notice Sets the base token URI for all metadata.
     * @dev Only callable by the owner.
     * @param newBaseURI The new base URI to set.
     */
    function setBaseTokenURI(string calldata newBaseURI) external onlyOwner {
        baseTokenURI = newBaseURI;
    }

    // Set the new baseTokenURI to the provided IPFS URI
    // This should be called after deployment or upgrade
    // Example: setBaseTokenURI("ipfs://bafybeid4iszj4bzuy4s2tqxcck77oplakns6vrxbmyd3smfatxq6jjzjdm/");

    /**
     * @notice Pause contract functions (only owner or officer).
     */
    function pause() public onlyOfficerOrOwner {
        _pause();
    }

    /**
     * @notice Unpause contract functions (only owner or officer).
     */
    function unpause() public onlyOfficerOrOwner {
        _unpause();
    }

    /**
     * @notice Grants a role to an account.
     * @dev Only callable by an admin.
     * @param role The role to grant.
     * @param account The account to grant the role to.
     */
    function grantRole(bytes32 role, address account) public override onlyRole(getRoleAdmin(role)) {
        _grantRole(role, account);
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize) internal override(ERC721Upgradeable, ERC721EnumerableUpgradeable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);

        // Prevent transfers if the token is soulbound
        if (soulbound[tokenId] && from != address(0)) {
            emit OfficerAction(msg.sender, tokenId, "Soulbound transfer attempt blocked");
            revert("Transfers are restricted for soulbound tokens");
        }
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721Upgradeable, ERC721EnumerableUpgradeable, AccessControlUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @notice Returns standardized metadata for Snapshot indexing.
     * @param tokenId The token ID to query.
     * @return votingPower The voting power of the token.
     * @return role The role associated with the token.
     */
    function getSnapshotMetadata(uint256 tokenId) external view returns (uint256 votingPower, string memory role) {
        require(_exists(tokenId), "Token does not exist");
        votingPower = getVotingWeight(tokenId);
        role = roles[tokenId];
    }

    function transferFrom(address from, address to, uint256 tokenId) public override(ERC721Upgradeable, IERC721Upgradeable) whenNotPaused {
        super.transferFrom(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) public override(ERC721Upgradeable, IERC721Upgradeable) whenNotPaused {
        super.safeTransferFrom(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public override(ERC721Upgradeable, IERC721Upgradeable) whenNotPaused {
        super.safeTransferFrom(from, to, tokenId, data);
    }

    // --- GAS OPTIMIZATION NOTE ---
    // Editions mapping removed. All logic now uses roles. Alumni/Collector/POAP tokens are supported as non-voting roles. Use roleVotingPower for voting logic.
}
