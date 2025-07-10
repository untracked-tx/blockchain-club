// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract Roles is 
    Initializable,
    AccessControlEnumerableUpgradeable, 
    UUPSUpgradeable {
    
    // Role constants
    bytes32 public constant ADMIN_ROLE = DEFAULT_ADMIN_ROLE;
    bytes32 public constant OFFICER_ROLE = keccak256("OFFICER_ROLE");
    bytes32 public constant MEMBER_ROLE = keccak256("MEMBER_ROLE");
    
    // Voting power for each role
    mapping(bytes32 => uint256) public roleVotingPower;
    
    // Add custom voting power overrides
    mapping(address => uint256) public customVotingPower;
    
    // Events
    event VotingPowerSet(bytes32 indexed role, uint256 votingPower);
    event CustomVotingPowerSet(address indexed account, uint256 votingPower);

    // Initialization
    function initialize(address admin) public initializer onlyRole(ADMIN_ROLE) {
        __AccessControlEnumerable_init();
        __UUPSUpgradeable_init();
        
        // Set up initial roles
        _grantRole(ADMIN_ROLE, admin);
        
        // Set up voting power
        roleVotingPower[OFFICER_ROLE] = 5;
        roleVotingPower[MEMBER_ROLE] = 1;
    }
    
    // Get user's current highest role
    function getUserCurrentRole(address account) public view returns (bytes32) {
        if (hasRole(OFFICER_ROLE, account)) {
            return OFFICER_ROLE;
        } else if (hasRole(MEMBER_ROLE, account)) {
            return MEMBER_ROLE;
        } else {
            return bytes32(0);
        }
    }
    
    // Get voting power for a user based on their role
    function getVotingPower(address account) public view returns (uint256) {
        // Check custom override first
        if (customVotingPower[account] > 0) {
            return customVotingPower[account];
        }
        
        // Fall back to role-based power
        bytes32 role = getUserCurrentRole(account);
        return roleVotingPower[role];
    }
    
    // Set voting power for a role
    function setVotingPower(bytes32 role, uint256 power) external onlyRole(ADMIN_ROLE) {
        roleVotingPower[role] = power;
        emit VotingPowerSet(role, power);
    }
    
    function setCustomVotingPower(address account, uint256 power) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        customVotingPower[account] = power;
        emit CustomVotingPowerSet(account, power);
    }
    
    // Batch operations
    function grantRoleBatch(
        bytes32 role, 
        address[] calldata accounts
    ) external onlyRole(getRoleAdmin(role)) {
        for (uint256 i = 0; i < accounts.length; i++) {
            _grantRole(role, accounts[i]);
        }
    }
    
    function revokeRoleBatch(
        bytes32 role,
        address[] calldata accounts
    ) external onlyRole(getRoleAdmin(role)) {
        for (uint256 i = 0; i < accounts.length; i++) {
            _revokeRole(role, accounts[i]);
        }
    }
    
    // Upgrade authorization
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(ADMIN_ROLE) {
        // Authorization logic handled by onlyRole modifier
    }
}
