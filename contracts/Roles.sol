// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract Roles is Initializable, AccessControlUpgradeable, Ownable2StepUpgradeable, UUPSUpgradeable {
    bytes32 public constant OFFICER_ROLE = keccak256("OFFICER_ROLE");
    bytes32 public constant MEMBER_ROLE = keccak256("MEMBER_ROLE");
    bytes32 public constant SUPPORTER_ROLE = keccak256("SUPPORTER_ROLE");

    mapping(address => bool) private whitelist;
    mapping(bytes32 => uint256) public roleVotingPower;
    mapping(bytes32 => bool) public selfGrantableRoles;

    // --- Role Expiration ---
    mapping(address => mapping(bytes32 => uint256)) public roleExpirations;
    event RoleGrantedWithExpiration(bytes32 indexed role, address indexed account, uint256 expiresAt);
    event RoleRevoked(bytes32 indexed role, address indexed account);

    event WhitelistUpdated(address indexed user, bool status);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address admin) public initializer {
        __AccessControl_init();
        __Ownable2Step_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _transferOwnership(admin);

        // Default voting power
        roleVotingPower[OFFICER_ROLE] = 5;
        roleVotingPower[MEMBER_ROLE] = 3;
        roleVotingPower[SUPPORTER_ROLE] = 1;
    }

    /**
     * @notice Grant a role to an account with expiration.
     * @param role The role hash.
     * @param account The address to grant the role to.
     * @param expiresAt The unix timestamp when the role expires.
     */
    function grantRoleWithExpiration(bytes32 role, address account, uint256 expiresAt) external onlyRole(getRoleAdmin(role)) {
        _grantRole(role, account);
        roleExpirations[account][role] = expiresAt;
        emit RoleGrantedWithExpiration(role, account, expiresAt);
    }

    /**
     * @notice Revoke a role from an account.
     * @param role The role hash.
     * @param account The address to revoke the role from.
     */
    function revokeRole(bytes32 role, address account) public override onlyRole(getRoleAdmin(role)) {
        _revokeRole(role, account);
        roleExpirations[account][role] = 0;
        emit RoleRevoked(role, account);
    }

    /**
     * @notice Check if an account has a role and it's not expired.
     * @param role The role hash.
     * @param account The address to check.
     * @return True if the account has the role and it's not expired, false otherwise.
     */
    function hasRole(bytes32 role, address account) public view override returns (bool) {
        if (!super.hasRole(role, account)) return false;
        uint256 expires = roleExpirations[account][role];
        return expires == 0 || block.timestamp < expires;
    }

    /**
     * @dev Checks if a role can be self-granted by an account.
     * @param role The role to check.
     * @param account The address to check.
     * @return True if the role can be self-granted, false otherwise.
     */
    function canSelfGrant(bytes32 role, address account) public view returns (bool) {
        return selfGrantableRoles[role];
    }

    /**
     * @notice Set a role as self-grantable or not.
     * @param role The role hash.
     * @param value True to set the role as self-grantable, false otherwise.
     */
    function setSelfGrantable(bytes32 role, bool value) external onlyRole(DEFAULT_ADMIN_ROLE) {
        selfGrantableRoles[role] = value;
    }

    // --- Whitelist Logic ---

    /**
     * @notice Set the whitelist status for a user.
     * @param user The address to update.
     * @param status True to whitelist, false to remove.
     */
    function setWhitelist(address user, bool status) external onlyRole(OFFICER_ROLE) {
        whitelist[user] = status;
        emit WhitelistUpdated(user, status);
    }

    /**
     * @notice Check if an account is whitelisted.
     * @param account The address to check.
     * @return True if the account is whitelisted, false otherwise.
     */
    function isWhitelisted(address account) public view returns (bool) {
        return whitelist[account];
    }

    // --- Voting Power ---

    /**
     * @notice Get the voting power for a user.
     * @param user The address to check.
     * @return power The voting power for the user.
     */
    function getVotingPower(address user) external view returns (uint256 power) {
        if (hasRole(OFFICER_ROLE, user)) return roleVotingPower[OFFICER_ROLE];
        if (hasRole(MEMBER_ROLE, user)) return roleVotingPower[MEMBER_ROLE];
        if (hasRole(SUPPORTER_ROLE, user)) return roleVotingPower[SUPPORTER_ROLE];
        return 0;
    }

    /**
     * @notice Get the voting power of a role.
     * @param role The role hash.
     * @return The voting power associated with the role.
     */
    function getVotingPower(bytes32 role) public view returns (uint256) {
        return roleVotingPower[role];
    }

    /**
     * @notice Set the voting power for a role.
     * @param role The role hash.
     * @param power The voting power to set.
     */
    function setVotingPower(bytes32 role, uint256 power) external onlyRole(DEFAULT_ADMIN_ROLE) {
        roleVotingPower[role] = power;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
