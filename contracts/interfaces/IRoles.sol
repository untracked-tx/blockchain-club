// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IRoles
 * @notice Interface for the Roles contract that manages access control and voting power
 * @dev This interface defines the external functions for role management and voting power distribution
 */
interface IRoles {
    // Events
    event VotingPowerSet(bytes32 indexed role, uint256 votingPower);
    event CustomVotingPowerSet(address indexed account, uint256 votingPower);

    // Role constants
    function ADMIN_ROLE() external pure returns (bytes32);
    function OFFICER_ROLE() external pure returns (bytes32);
    function MEMBER_ROLE() external pure returns (bytes32);

    // Role management functions
    function hasRole(bytes32 role, address account) external view returns (bool);
    function getRoleMemberCount(bytes32 role) external view returns (uint256);
    function getRoleMember(bytes32 role, uint256 index) external view returns (address);
    function grantRole(bytes32 role, address account) external;
    function revokeRole(bytes32 role, address account) external;
    function renounceRole(bytes32 role, address account) external;

    // Batch operations
    function grantRoleBatch(bytes32 role, address[] calldata accounts) external;
    function revokeRoleBatch(bytes32 role, address[] calldata accounts) external;

    // Voting power functions
    function roleVotingPower(bytes32 role) external view returns (uint256);
    function customVotingPower(address account) external view returns (uint256);
    function getVotingPower(address account) external view returns (uint256);
    function getUserCurrentRole(address account) external view returns (bytes32);

    // Admin functions
    function setVotingPower(bytes32 role, uint256 power) external;
    function setCustomVotingPower(address account, uint256 power) external;
    function initialize(address admin) external;
}