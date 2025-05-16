// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IRoles.sol";
import "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/// @title VotingPowerStrategy
/// @notice Externalized voting power calculator that reads from Roles
contract VotingPowerStrategy is Initializable, Ownable2StepUpgradeable, UUPSUpgradeable {
    IRoles public rolesContract;

    event RolesContractSet(address indexed newRoles);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _roles) public initializer {
        __Ownable2Step_init();
        __UUPSUpgradeable_init();
        rolesContract = IRoles(_roles);
        emit RolesContractSet(_roles);
    }

    function setRolesContract(address _roles) external onlyOwner {
        rolesContract = IRoles(_roles);
        emit RolesContractSet(_roles);
    }

    /// @notice Gets total voting power for an address based on Roles.sol
    function getVotingPower(address user) external view returns (uint256) {
        return rolesContract.getVotingPower(user);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
