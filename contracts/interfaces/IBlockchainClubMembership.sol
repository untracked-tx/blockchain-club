// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IBlockchainClubMembership {
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
    }

    // Events
    event TokenMinted(address indexed to, uint256 indexed tokenId, bytes32 indexed tokenType);
    event TokenTypeCreated(bytes32 indexed typeId, string name, string category);
    event WhitelistUpdated(address indexed account, bool status);
    event StatsUpdated(address indexed member, bytes32 indexed role, uint256 tokenCount);

    // View Functions
    function whitelist(address account) external view returns (bool);
    function memberStats(address member) external view returns (MemberStats memory);
    function tokenTypeConfigs(bytes32 typeId) external view returns (TokenTypeConfig memory);
    function getMemberCount() external view returns (uint256);
    function getOfficerCount() external view returns (uint256);
    function tokenTypes(uint256 tokenId) external view returns (bytes32);
    function soulbound(uint256 tokenId) external view returns (bool);

    // State-Changing Functions
    function initialize(
        string memory name,
        string memory symbol,  // Add missing symbol parameter
        address rolesContract
    ) external;
    function createTokenType(
        bytes32 typeId,
        string calldata name,
        string calldata category,
        uint256 startTime,
        uint256 endTime,
        uint256 maxSupply
    ) external;
    function mint(address to, bytes32 tokenType, bool isSoulbound) external;
    function updateWhitelist(address account, bool status) external;
    function pause() external;
    function unpause() external;
}