// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IRoles {
    function hasRole(bytes32 role, address account) external view returns (bool);
    function isWhitelisted(address account) external view returns (bool);
    function getVotingPower(address account) external view returns (uint256);
    function grantRole(bytes32 role, address account) external;
    function canSelfGrant(bytes32 role, address account) external view returns (bool);
}
