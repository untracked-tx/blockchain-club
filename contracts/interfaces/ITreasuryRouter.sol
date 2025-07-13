// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ITreasuryRouter
 * @notice Interface for the Treasury Router contract that manages delayed fund transfers
 * @dev This interface defines functions for handling ETH, ERC20, and NFT deposits with time delays
 */
interface ITreasuryRouter {
    // Structs
    struct PendingTransfer {
        uint256 amount;
        uint256 timestamp;
        bool executed;
        address from;
    }

    struct PendingERC20Transfer {
        address token;
        address from;
        uint256 amount;
        uint256 timestamp;
        bool executed;
        string metadata;
    }

    struct PendingNFTTransfer {
        address token;
        address from;
        uint256 tokenId;
        uint256 timestamp;
        bool executed;
        string metadata;
    }

    struct PendingTransferWithMeta {
        uint256 amount;
        uint256 timestamp;
        bool executed;
        string metadata;
    }

    // Events
    event FundsReceived(address indexed sender, uint256 amount);
    event TransferQueued(bytes32 indexed transferId, uint256 amount, uint256 timestamp);
    event TransferExecuted(bytes32 indexed transferId, uint256 amount, address indexed treasury);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event EmergencyWithdrawal(address indexed to, uint256 amount);
    
    // ERC20 Events
    event ERC20FundsReceived(address indexed token, address indexed sender, uint256 amount, string metadata, bytes32 transferId);
    event ERC20TransferQueued(bytes32 indexed transferId, address indexed token, uint256 amount, uint256 timestamp, string metadata);
    event ERC20TransferExecuted(bytes32 indexed transferId, address indexed token, uint256 amount, address indexed treasury);

    // NFT Events
    event NFTReceived(address indexed token, address indexed sender, uint256 tokenId, string metadata, bytes32 transferId);
    event NFTTransferQueued(bytes32 indexed transferId, address indexed token, uint256 tokenId, uint256 timestamp, string metadata);
    event NFTTransferExecuted(bytes32 indexed transferId, address indexed token, uint256 tokenId, address indexed treasury);

    // Cancellation Events
    event TransferCancelled(bytes32 indexed transferId, address indexed by, string reason);
    event ERC20TransferCancelled(bytes32 indexed transferId, address indexed by, string reason);
    event NFTTransferCancelled(bytes32 indexed transferId, address indexed by, string reason);

    // Constants
    function EXECUTION_DELAY() external pure returns (uint256);

    // View Functions
    function roles() external view returns (address);
    function treasury() external view returns (address payable);
    function pendingTransfers(bytes32 transferId) external view returns (PendingTransfer memory);
    function pendingERC20Transfers(bytes32 transferId) external view returns (PendingERC20Transfer memory);
    function pendingNFTTransfers(bytes32 transferId) external view returns (PendingNFTTransfer memory);
    function pendingTransfersWithMeta(bytes32 transferId) external view returns (PendingTransferWithMeta memory);
    function pendingTransferIds() external view returns (bytes32[] memory);

    // State-Changing Functions
    function initialize(address rolesContract, address payable initialTreasury) external;
    
    // Deposit functions
    function receiveFunds() external payable;
    function receiveFundsWithMeta(string calldata metadata) external payable;
    function depositERC20(address token, uint256 amount, string calldata metadata) external;
    function depositNFT(address token, uint256 tokenId, string calldata metadata) external;

    // Execution functions
    function executeTransferBatch(bytes32[] calldata transferIds) external;
    function executeERC20TransferBatch(bytes32[] calldata transferIds) external;
    function executeNFTTransferBatch(bytes32[] calldata transferIds) external;

    // Cancellation functions
    function cancelTransfer(bytes32 transferId, string calldata reason) external;
    function cancelERC20Transfer(bytes32 transferId, string calldata reason) external;
    function cancelNFTTransfer(bytes32 transferId, string calldata reason) external;

    // Admin functions
    function updateTreasury(address payable newTreasury) external;
    function emergencyWithdraw() external;

    // UUPS required
    function upgradeTo(address newImplementation) external;
    function upgradeToAndCall(address newImplementation, bytes calldata data) external payable;
}