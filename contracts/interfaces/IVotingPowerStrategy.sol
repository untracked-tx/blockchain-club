// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IVotingPowerStrategy {
    function getVotingPower(address user) external view returns (uint256);
}
