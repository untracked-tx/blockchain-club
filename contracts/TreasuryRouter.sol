// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

contract TreasuryRouter is Initializable, Ownable2StepUpgradeable, UUPSUpgradeable, ReentrancyGuardUpgradeable {
    address public treasury;

    event TreasuryUpdated(address indexed newTreasury);
    event FundsReceived(address indexed sender, uint256 amount);
    event Refunded(address indexed user, uint256 amount);

    mapping(address => uint256) public refundable;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _treasury) public initializer {
        __Ownable2Step_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();

        treasury = _treasury;
    }

    function updateTreasury(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Invalid address");
        treasury = _newTreasury;
        emit TreasuryUpdated(_newTreasury);
    }

    // Called by mint function
    function receiveFunds() external payable nonReentrant {
        require(msg.value > 0, "No ETH sent");
        emit FundsReceived(msg.sender, msg.value);
        payable(treasury).transfer(msg.value);
    }

    // Set refund amount for a user (e.g., if mint fails off-chain)
    function setRefund(address user, uint256 amount) external onlyOwner {
        refundable[user] = amount;
    }

    function claimRefund() external nonReentrant {
        uint256 amount = refundable[msg.sender];
        require(amount > 0, "No refund available");
        refundable[msg.sender] = 0;
        emit Refunded(msg.sender, amount);
        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "Refund transfer failed");
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    receive() external payable {
        emit FundsReceived(msg.sender, msg.value);
        payable(treasury).transfer(msg.value);
    }
}
