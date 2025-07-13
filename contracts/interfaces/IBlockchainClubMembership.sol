// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IBlockchainClubMembership
 * @notice Interface for the Blockchain Club Membership NFT contract
 * @dev This interface defines all external functions for managing membership tokens, whitelist, and member statistics
 */
interface IBlockchainClubMembership {
    // Enums
    enum MintAccess { OFFICER_ONLY, WHITELIST_ONLY, PUBLIC }

    // Structs
    struct MemberStats {
        uint256 joinDate;
        uint256 tokenCount;
        bytes32 currentRole;
        bool isActive;
    }

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

    struct WhitelistRequest {
        address requester;
        uint256 timestamp;
        bool processed;
        bool approved;
    }

    // Events
    event TokenMinted(address indexed to, uint256 indexed tokenId, bytes32 indexed tokenType);
    event TokenTypeCreated(bytes32 indexed typeId, string name, string category);
    event WhitelistUpdated(address indexed account, bool status);
    event StatsUpdated(address indexed member, bytes32 indexed role, uint256 tokenCount);
    event WhitelistRequested(address indexed requester, uint256 indexed requestId);
    event WhitelistRequestProcessed(address indexed requester, uint256 indexed requestId, bool approved);

    // Constants
    function MEMBER_TOKEN_TYPE() external pure returns (bytes32);
    function OFFICER_TOKEN_TYPE() external pure returns (bytes32);
    function REQUEST_COOLDOWN() external pure returns (uint256);

    // View Functions
    function roles() external view returns (address);
    function whitelist(address account) external view returns (bool);
    function memberStats(address member) external view returns (MemberStats memory);
    function tokenTypeConfigs(bytes32 typeId) external view returns (TokenTypeConfig memory);
    function tokenTypes(uint256 tokenId) external view returns (bytes32);
    function soulbound(uint256 tokenId) external view returns (bool);
    function whitelistRequests(uint256 index) external view returns (WhitelistRequest memory);
    function lastRequestTime(address account) external view returns (uint256);
    function getMemberCount() external view returns (uint256);
    function getOfficerCount() external view returns (uint256);
    function getAllTokenTypeIds() external view returns (bytes32[] memory);

    // Whitelist request functions
    function requestWhitelist() external;
    function processWhitelistRequest(uint256 requestId, bool grantWhitelist) external;
    function getPendingWhitelistRequests() external view returns (
        uint256[] memory requestIds,
        address[] memory requesters,
        uint256[] memory timestamps
    );
    function hasPendingRequest(address user) external view returns (bool);

    // State-Changing Functions
    function initialize(
        string memory name,
        string memory symbol,
        address rolesContract
    ) external;
    function createTokenType(
        bytes32 typeId,
        string calldata typeName,
        string calldata typeCategory,
        uint256 startTime,
        uint256 endTime,
        uint256 maxSupply,
        MintAccess mintAccess
    ) external;
    function deactivateTokenType(bytes32 typeId) external;
    function mint(address to, bytes32 tokenType, bool isSoulbound) external;
    function publicMint(bytes32 tokenType, bool isSoulbound) external;
    function burnToken(uint256 tokenId) external;
    function updateWhitelist(address account, bool status) external;
    function setBaseURI(string memory newBaseURI) external;
    function pause() external;
    function unpause() external;
}