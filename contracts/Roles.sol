// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title Roles
 * @notice Manages access control and voting power for the Blockchain Club
 * @dev Implements a role-based access control system with configurable voting power
 * @dev Uses OpenZeppelin's AccessControlEnumerableUpgradeable for role management
 * @dev Supports UUPS upgrade pattern for contract upgrades
 * @author Blockchain Club Development Team
 * @custom:security-contact Liam.Murphy@ucdenver.edu
 */
contract Roles is 
    Initializable,
    AccessControlEnumerableUpgradeable, 
    UUPSUpgradeable {
    
    /// @notice Default admin role identifier (inherited from AccessControl)
    bytes32 public constant ADMIN_ROLE = DEFAULT_ADMIN_ROLE;
    
    /// @notice Officer role identifier - has elevated privileges in the club
    bytes32 public constant OFFICER_ROLE = keccak256("OFFICER_ROLE");
    
    /// @notice Member role identifier - basic membership in the club
    bytes32 public constant MEMBER_ROLE = keccak256("MEMBER_ROLE");
    
    /// @notice Mapping of role to its default voting power
    /// @dev Used to assign voting power based on user's highest role
    mapping(bytes32 => uint256) public roleVotingPower;
    
    /// @notice Mapping of individual addresses to custom voting power overrides
    /// @dev When set, this takes precedence over role-based voting power
    mapping(address => uint256) public customVotingPower;
    
    /// @notice Emitted when voting power is set for a role
    /// @param role The role identifier
    /// @param votingPower The new voting power value
    event VotingPowerSet(bytes32 indexed role, uint256 votingPower);
    
    /// @notice Emitted when custom voting power is set for an account
    /// @param account The account address
    /// @param votingPower The new custom voting power value
    event CustomVotingPowerSet(address indexed account, uint256 votingPower);

    /**
     * @notice Initializes the Roles contract with an admin
     * @dev Sets up the role hierarchy and initial voting power values
     * @dev Can only be called once due to the initializer modifier
     * @param admin Address to be granted the admin role
     * @custom:oz-upgrades-unsafe-allow constructor
     */
    function initialize(address admin) public initializer {
        __AccessControlEnumerable_init();
        __UUPSUpgradeable_init();
        
        // Set up initial roles
        _grantRole(ADMIN_ROLE, admin);
        
        // Set up voting power
        roleVotingPower[OFFICER_ROLE] = 5;
        roleVotingPower[MEMBER_ROLE] = 1;
    }
    
    /**
     * @notice Gets the highest role held by an account
     * @dev Checks roles in order of priority: OFFICER > MEMBER
     * @param account The address to check
     * @return The highest role held by the account, or bytes32(0) if no roles
     */
    function getUserCurrentRole(address account) public view returns (bytes32) {
        if (hasRole(OFFICER_ROLE, account)) {
            return OFFICER_ROLE;
        } else if (hasRole(MEMBER_ROLE, account)) {
            return MEMBER_ROLE;
        } else {
            return bytes32(0);
        }
    }
    
    /**
     * @notice Gets the voting power for an account
     * @dev Checks custom voting power first, then falls back to role-based power
     * @param account The address to check voting power for
     * @return The voting power of the account
     */
    function getVotingPower(address account) public view returns (uint256) {
        // Check custom override first
        if (customVotingPower[account] > 0) {
            return customVotingPower[account];
        }
        
        // Fall back to role-based power
        bytes32 role = getUserCurrentRole(account);
        return roleVotingPower[role];
    }
    
    /**
     * @notice Sets the voting power for a specific role
     * @dev Only admins can call this function
     * @param role The role identifier to set voting power for
     * @param power The new voting power value
     * @custom:emits VotingPowerSet
     */
    function setVotingPower(bytes32 role, uint256 power) external onlyRole(ADMIN_ROLE) {
        roleVotingPower[role] = power;
        emit VotingPowerSet(role, power);
    }
    
    /**
     * @notice Sets custom voting power for a specific account
     * @dev Only admins can call this function
     * @dev Custom voting power overrides role-based voting power
     * @param account The account to set custom voting power for
     * @param power The new custom voting power value (0 to remove override)
     * @custom:emits CustomVotingPowerSet
     */
    function setCustomVotingPower(address account, uint256 power) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        customVotingPower[account] = power;
        emit CustomVotingPowerSet(account, power);
    }
    
    /**
     * @notice Grants a role to multiple accounts in a single transaction
     * @dev More gas-efficient than individual grantRole calls
     * @dev Only role admins can call this function
     * @param role The role to grant
     * @param accounts Array of accounts to grant the role to
     */
    function grantRoleBatch(
        bytes32 role, 
        address[] calldata accounts
    ) external onlyRole(getRoleAdmin(role)) {
        for (uint256 i = 0; i < accounts.length; i++) {
            _grantRole(role, accounts[i]);
        }
    }
    
    /**
     * @notice Revokes a role from multiple accounts in a single transaction
     * @dev More gas-efficient than individual revokeRole calls
     * @dev Only role admins can call this function
     * @param role The role to revoke
     * @param accounts Array of accounts to revoke the role from
     */
    function revokeRoleBatch(
        bytes32 role,
        address[] calldata accounts
    ) external onlyRole(getRoleAdmin(role)) {
        for (uint256 i = 0; i < accounts.length; i++) {
            _revokeRole(role, accounts[i]);
        }
    }
    
    /**
     * @notice Authorizes contract upgrades
     * @dev Only admins can authorize upgrades
     * @dev Required by UUPSUpgradeable
     * @param newImplementation Address of the new implementation contract
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(ADMIN_ROLE) {
        // Authorization logic handled by onlyRole modifier
    }
}
