// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ITreasuryRouter {
    // Structs
    struct PendingTransfer {
        uint256 amount;
        uint256 timestamp;
        bool executed;
    }

    // Events
    event FundsReceived(address indexed sender, uint256 amount);
    event TransferQueued(bytes32 indexed transferId, uint256 amount, uint256 timestamp);
    event TransferExecuted(bytes32 indexed transferId, uint256 amount, address indexed treasury);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event EmergencyWithdrawal(address indexed to, uint256 amount); // Add missing event

    // View Functions
    function roles() external view returns (address);
    function treasury() external view returns (address payable);
    function EXECUTION_DELAY() external pure returns (uint256);
    function pendingTransfers(bytes32 transferId) external view returns (PendingTransfer memory);

    // State-Changing Functions
    function initialize(address rolesContract, address payable initialTreasury) external;
    function receiveFunds() external payable;
    function executeTransferBatch(bytes32[] calldata transferIds) external;
    function updateTreasury(address payable newTreasury) external; // Changed from setTreasury
    function emergencyWithdraw() external;

    // UUPS required
    function upgradeTo(address newImplementation) external;
    function upgradeToAndCall(address newImplementation, bytes calldata data) external payable;
}