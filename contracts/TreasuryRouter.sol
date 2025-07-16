// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IRoles.sol";
import "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";

/**
 * @title TreasuryRouter
 * @notice Manages delayed transfers of ETH, ERC20 tokens, and NFTs to the club treasury
 * @dev Implements time-delayed execution for security, supports multiple asset types
 * @dev All transfers are queued with a 24-hour delay before execution
 * @dev Uses UUPS upgrade pattern and includes comprehensive security features
 * @author Blockchain Club Development Team
 * @custom:security-contact Liam.Murphy@ucdenver.edu
 */
contract TreasuryRouter is 
    Initializable, 
    Ownable2StepUpgradeable, 
    UUPSUpgradeable, 
    ReentrancyGuardUpgradeable {
    
    using AddressUpgradeable for address payable;
    
    /// @notice Reference to the Roles contract for access control
    IRoles public roles;
    
    /// @notice The treasury address where funds are ultimately sent
    address payable public treasury;
    
    /// @notice The delay (in seconds) before a transfer can be executed. Hard-coded to 24 hours.
    /// @dev To change this value, a contract upgrade is required
    uint256 public constant EXECUTION_DELAY = 24 hours;
    
    /// @notice Nonce for generating unique transfer IDs
    uint256 private transferNonce;
    
    /// @notice Structure for pending ETH transfers
    /// @dev Tracks basic information about queued ETH transfers
    struct PendingTransfer {
        uint256 amount;       /// @dev Amount of ETH to transfer
        uint256 timestamp;    /// @dev When the transfer was queued
        bool executed;        /// @dev Whether the transfer has been executed
        address from;         /// @dev Address that initiated the transfer
    }
    
    /// @notice Mapping of transfer IDs to pending ETH transfers
    mapping(bytes32 => PendingTransfer) public pendingTransfers;
    
    /// @notice Array of all pending transfer IDs for enumeration
    bytes32[] private _pendingTransferIds;
    
    /// @notice Mapping of transfer IDs to their index in _pendingTransferIds
    mapping(bytes32 => uint256) private _pendingTransferIdIndex;

    /**
     * @notice Returns all pending transfer IDs
     * @return Array of pending transfer IDs
     */
    function pendingTransferIds() public view returns (bytes32[] memory) {
        return _pendingTransferIds;
    }

    /// @notice Structure for pending ERC20 token transfers
    /// @dev Includes metadata for better tracking and categorization
    struct PendingERC20Transfer {
        address token;        /// @dev ERC20 token contract address
        address from;         /// @dev Address that initiated the transfer
        uint256 amount;       /// @dev Amount of tokens to transfer
        uint256 timestamp;    /// @dev When the transfer was queued
        bool executed;        /// @dev Whether the transfer has been executed
        string metadata;      /// @dev Additional information about the transfer
    }
    
    /// @notice Mapping of transfer IDs to pending ERC20 transfers
    mapping(bytes32 => PendingERC20Transfer) public pendingERC20Transfers;

    /// @notice Structure for pending NFT transfers
    /// @dev Supports any ERC721-compliant NFT
    struct PendingNFTTransfer {
        address token;        /// @dev NFT contract address
        address from;         /// @dev Address that initiated the transfer
        uint256 tokenId;      /// @dev Specific token ID to transfer
        uint256 timestamp;    /// @dev When the transfer was queued
        bool executed;        /// @dev Whether the transfer has been executed
        string metadata;      /// @dev Additional information about the NFT
    }
    
    /// @notice Mapping of transfer IDs to pending NFT transfers
    mapping(bytes32 => PendingNFTTransfer) public pendingNFTTransfers;

    // Events
    
    /// @notice Emitted when ETH is received by the contract
    /// @param sender Address that sent the ETH
    /// @param amount Amount of ETH received
    event FundsReceived(address indexed sender, uint256 amount);
    
    /// @notice Emitted when an ETH transfer is queued
    /// @param transferId Unique identifier for the transfer
    /// @param amount Amount of ETH queued
    /// @param timestamp When the transfer was queued
    event TransferQueued(bytes32 indexed transferId, uint256 amount, uint256 timestamp);
    
    /// @notice Emitted when an ETH transfer is executed
    /// @param transferId Unique identifier for the transfer
    /// @param amount Amount of ETH transferred
    /// @param treasury Address that received the ETH
    event TransferExecuted(bytes32 indexed transferId, uint256 amount, address indexed treasury);
    
    /// @notice Emitted when the treasury address is updated
    /// @param oldTreasury Previous treasury address
    /// @param newTreasury New treasury address
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    
    /// @notice Emitted when an emergency withdrawal is performed
    /// @param to Address that received the emergency withdrawal
    /// @param amount Amount withdrawn
    event EmergencyWithdrawal(address indexed to, uint256 amount);
    
    // ERC20 Events
    
    /// @notice Emitted when ERC20 tokens are received
    /// @param token Token contract address
    /// @param sender Address that sent the tokens
    /// @param amount Amount of tokens received
    /// @param metadata Additional information about the deposit
    /// @param transferId Unique identifier for the transfer
    event ERC20FundsReceived(address indexed token, address indexed sender, uint256 amount, string metadata, bytes32 transferId);
    
    /// @notice Emitted when an ERC20 transfer is queued
    /// @param transferId Unique identifier for the transfer
    /// @param token Token contract address
    /// @param amount Amount of tokens queued
    /// @param timestamp When the transfer was queued
    /// @param metadata Additional information about the transfer
    event ERC20TransferQueued(bytes32 indexed transferId, address indexed token, uint256 amount, uint256 timestamp, string metadata);
    
    /// @notice Emitted when an ERC20 transfer is executed
    /// @param transferId Unique identifier for the transfer
    /// @param token Token contract address
    /// @param amount Amount of tokens transferred
    /// @param treasury Address that received the tokens
    event ERC20TransferExecuted(bytes32 indexed transferId, address indexed token, uint256 amount, address indexed treasury);

    // NFT Events
    
    /// @notice Emitted when an NFT is received
    /// @param token NFT contract address
    /// @param sender Address that sent the NFT
    /// @param tokenId ID of the NFT received
    /// @param metadata Additional information about the NFT
    /// @param transferId Unique identifier for the transfer
    event NFTReceived(address indexed token, address indexed sender, uint256 tokenId, string metadata, bytes32 transferId);
    
    /// @notice Emitted when an NFT transfer is queued
    /// @param transferId Unique identifier for the transfer
    /// @param token NFT contract address
    /// @param tokenId ID of the NFT queued
    /// @param timestamp When the transfer was queued
    /// @param metadata Additional information about the NFT
    event NFTTransferQueued(bytes32 indexed transferId, address indexed token, uint256 tokenId, uint256 timestamp, string metadata);
    
    /// @notice Emitted when an NFT transfer is executed
    /// @param transferId Unique identifier for the transfer
    /// @param token NFT contract address
    /// @param tokenId ID of the NFT transferred
    /// @param treasury Address that received the NFT
    event NFTTransferExecuted(bytes32 indexed transferId, address indexed token, uint256 tokenId, address indexed treasury);

    // Cancellation Events
    
    /// @notice Emitted when an ETH transfer is cancelled
    /// @param transferId Unique identifier for the transfer
    /// @param by Address that cancelled the transfer
    /// @param reason Reason for cancellation
    event TransferCancelled(bytes32 indexed transferId, address indexed by, string reason);
    
    /// @notice Emitted when an ERC20 transfer is cancelled
    /// @param transferId Unique identifier for the transfer
    /// @param by Address that cancelled the transfer
    /// @param reason Reason for cancellation
    event ERC20TransferCancelled(bytes32 indexed transferId, address indexed by, string reason);
    
    /// @notice Emitted when an NFT transfer is cancelled
    /// @param transferId Unique identifier for the transfer
    /// @param by Address that cancelled the transfer
    /// @param reason Reason for cancellation
    event NFTTransferCancelled(bytes32 indexed transferId, address indexed by, string reason);

    /**
     * @notice Modifier to check if caller has a specific role
     * @param role The role to check for
     */
    modifier onlyRole(bytes32 role) {
        require(roles.hasRole(role, msg.sender), "Missing required role");
       _;
    }
    
    /**
     * @notice Initializes the TreasuryRouter contract
     * @dev Sets up the roles contract reference and initial treasury address
     * @dev Can only be called once due to the initializer modifier
     * @param rolesContract Address of the Roles contract for access control
     * @param initialTreasury Address where funds will ultimately be sent
     * @custom:oz-upgrades-unsafe-allow constructor
     */
    function initialize(
        address rolesContract,
        address payable initialTreasury
    ) public initializer {
        __Ownable2Step_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        
        require(rolesContract != address(0), "Invalid roles contract");
        require(initialTreasury != address(0), "Invalid treasury address");
        
        roles = IRoles(rolesContract);
        treasury = initialTreasury;
    }
    
    /**
     * @notice Deposits ETH and queues it for delayed transfer to treasury
     * @dev Creates a unique transfer ID and queues the transfer with current timestamp
     * @dev Anyone can call this function to contribute ETH to the treasury
     * @custom:emits FundsReceived
     * @custom:emits TransferQueued
     */
    function receiveFunds() external payable nonReentrant {
        require(msg.value > 0, "No ETH sent");
        bytes32 transferId = keccak256(abi.encodePacked(
            block.timestamp,
            msg.value,
            msg.sender,
            transferNonce
        ));
        transferNonce++;
        pendingTransfers[transferId] = PendingTransfer({
            amount: msg.value,
            timestamp: block.timestamp,
            executed: false,
            from: msg.sender
        });
        _pendingTransferIdIndex[transferId] = _pendingTransferIds.length;
        _pendingTransferIds.push(transferId);
        emit FundsReceived(msg.sender, msg.value);
        emit TransferQueued(transferId, msg.value, block.timestamp);
    }

    /**
     * @notice Accepts Ether sent directly to the contract and queues it as a pending transfer
     * @dev Automatically processes direct ETH transfers to the contract
     * @custom:emits FundsReceived
     * @custom:emits TransferQueued
     */
    receive() external payable {
        require(msg.value > 0, "No ETH sent");
        bytes32 transferId = keccak256(abi.encodePacked(
            block.timestamp,
            msg.value,
            msg.sender,
            transferNonce
        ));
        transferNonce++;
        pendingTransfers[transferId] = PendingTransfer({
            amount: msg.value,
            timestamp: block.timestamp,
            executed: false,
            from: msg.sender
        });
        _pendingTransferIdIndex[transferId] = _pendingTransferIds.length;
        _pendingTransferIds.push(transferId);
        emit FundsReceived(msg.sender, msg.value);
        emit TransferQueued(transferId, msg.value, block.timestamp);
    }
    
    /**
     * @notice Deposits ERC20 tokens and queues them for delayed transfer to treasury
     * @dev Requires prior approval of tokens to this contract
     * @dev Anyone can call this function to contribute ERC20 tokens to the treasury
     * @param token Address of the ERC20 token contract
     * @param amount Amount of tokens to deposit
     * @param metadata Additional information about the deposit (e.g., purpose, source)
     * @custom:emits ERC20FundsReceived
     * @custom:emits ERC20TransferQueued
     */
    function depositERC20(address token, uint256 amount, string calldata metadata) external nonReentrant {
        require(amount > 0, "No tokens sent");
        require(token != address(0), "Invalid token");
        require(IERC20Upgradeable(token).transferFrom(msg.sender, address(this), amount), "ERC20 transferFrom failed");

        bytes32 transferId = keccak256(abi.encodePacked(
            block.timestamp, token, msg.sender, amount, transferNonce
        ));
        transferNonce++;

        pendingERC20Transfers[transferId] = PendingERC20Transfer({
            token: token,
            from: msg.sender,
            amount: amount,
            timestamp: block.timestamp,
            executed: false,
            metadata: metadata
        });

        emit ERC20FundsReceived(token, msg.sender, amount, metadata, transferId);
        emit ERC20TransferQueued(transferId, token, amount, block.timestamp, metadata);
    }

    /**
     * @notice Deposits an NFT and queues it for delayed transfer to treasury
     * @dev Requires prior approval of the NFT to this contract
     * @dev Anyone can call this function to contribute NFTs to the treasury
     * @param token Address of the NFT contract
     * @param tokenId ID of the specific NFT to deposit
     * @param metadata Additional information about the NFT (e.g., description, provenance)
     * @custom:emits NFTReceived
     * @custom:emits NFTTransferQueued
     */
    function depositNFT(address token, uint256 tokenId, string calldata metadata) external nonReentrant {
        require(token != address(0), "Invalid NFT contract");
        IERC721Upgradeable(token).safeTransferFrom(msg.sender, address(this), tokenId);

        bytes32 transferId = keccak256(abi.encodePacked(
            block.timestamp, token, msg.sender, tokenId, transferNonce
        ));
        transferNonce++;

        pendingNFTTransfers[transferId] = PendingNFTTransfer({
            token: token,
            from: msg.sender,
            tokenId: tokenId,
            timestamp: block.timestamp,
            executed: false,
            metadata: metadata
        });

        emit NFTReceived(token, msg.sender, tokenId, metadata, transferId);
        emit NFTTransferQueued(transferId, token, tokenId, block.timestamp, metadata);
    }

    /**
     * @notice Executes a pending ETH transfer after the delay period
     * @dev Internal function that handles the actual transfer execution
     * @dev Includes gas-efficient removal from pending transfers array
     * @param transferId Unique identifier of the transfer to execute
     * @custom:emits TransferExecuted
     */
    function executeTransfer(bytes32 transferId) internal nonReentrant {
        PendingTransfer storage transfer = pendingTransfers[transferId];
        require(transfer.amount > 0, "Transfer does not exist");
        require(!transfer.executed, "Transfer already executed");
        require(block.timestamp >= transfer.timestamp + EXECUTION_DELAY, "Delay not elapsed");
        transfer.executed = true;
        treasury.sendValue(transfer.amount);
        emit TransferExecuted(transferId, transfer.amount, treasury);
        delete pendingTransfers[transferId];
        // O(1) removal from _pendingTransferIds
        uint256 idx = _pendingTransferIdIndex[transferId];
        uint256 lastIdx = _pendingTransferIds.length - 1;
        if (idx != lastIdx) {
            bytes32 lastId = _pendingTransferIds[lastIdx];
            _pendingTransferIds[idx] = lastId;
            _pendingTransferIdIndex[lastId] = idx;
        }
        _pendingTransferIds.pop();
        delete _pendingTransferIdIndex[transferId];
    }
    
    /**
     * @notice Executes a pending ERC20 transfer after the delay period
     * @dev Internal function that handles ERC20 token transfer execution
     * @param transferId Unique identifier of the transfer to execute
     * @custom:emits ERC20TransferExecuted
     */
    function executeERC20Transfer(bytes32 transferId) internal nonReentrant {
        PendingERC20Transfer storage transfer = pendingERC20Transfers[transferId];
        require(transfer.amount > 0, "Transfer does not exist");
        require(!transfer.executed, "Already executed");
        require(block.timestamp >= transfer.timestamp + EXECUTION_DELAY, "Delay not elapsed");

        transfer.executed = true;
        require(IERC20Upgradeable(transfer.token).transfer(treasury, transfer.amount), "ERC20 transfer failed");

        emit ERC20TransferExecuted(transferId, transfer.token, transfer.amount, treasury);
        delete pendingERC20Transfers[transferId];
    }

    /**
     * @notice Executes a pending NFT transfer after the delay period
     * @dev Internal function that handles NFT transfer execution
     * @param transferId Unique identifier of the transfer to execute
     * @custom:emits NFTTransferExecuted
     */
    function executeNFTTransfer(bytes32 transferId) internal nonReentrant {
        PendingNFTTransfer storage transfer = pendingNFTTransfers[transferId];
        require(!transfer.executed, "Already executed");
        require(block.timestamp >= transfer.timestamp + EXECUTION_DELAY, "Delay not elapsed");

        transfer.executed = true;
        IERC721Upgradeable(transfer.token).safeTransferFrom(address(this), treasury, transfer.tokenId);

        emit NFTTransferExecuted(transferId, transfer.token, transfer.tokenId, treasury);
        delete pendingNFTTransfers[transferId];
    }
    
    /**
     * @notice Executes multiple pending ETH transfers in a single transaction
     * @dev More gas-efficient than individual execution calls
     * @dev Safe to use as it doesn't modify the array being iterated
     * @param transferIds Array of transfer IDs to execute
     */
    function executeTransferBatch(bytes32[] calldata transferIds) external nonReentrant {
        for (uint i = 0; i < transferIds.length; i++) {
            executeTransfer(transferIds[i]); // O(1) removal inside executeTransfer
        }
    }
    
    /**
     * @notice Executes multiple pending ERC20 transfers in a single transaction
     * @dev More gas-efficient than individual execution calls
     * @param transferIds Array of ERC20 transfer IDs to execute
     */
    function executeERC20TransferBatch(bytes32[] calldata transferIds) external nonReentrant {
        for (uint i = 0; i < transferIds.length; i++) {
            executeERC20Transfer(transferIds[i]); // O(1) removal inside executeERC20Transfer
        }
    }
    
    /**
     * @notice Executes multiple pending NFT transfers in a single transaction
     * @dev More gas-efficient than individual execution calls
     * @param transferIds Array of NFT transfer IDs to execute
     */
    function executeNFTTransferBatch(bytes32[] calldata transferIds) external nonReentrant {
        for (uint i = 0; i < transferIds.length; i++) {
            executeNFTTransfer(transferIds[i]); // O(1) removal inside executeNFTTransfer
        }
    }

    /**
     * @notice Updates the treasury address where funds are sent
     * @dev Only admins can call this function
     * @param newTreasury New treasury address
     * @custom:emits TreasuryUpdated
     */
    function updateTreasury(address payable newTreasury) external onlyRole(roles.ADMIN_ROLE()) {
        require(newTreasury != address(0), "Invalid treasury address");
        address oldTreasury = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }
    
    /**
     * @notice Emergency function to withdraw all ETH from the contract
     * @dev Only admins can call this function
     * @dev Should only be used in emergency situations
     * @custom:emits EmergencyWithdrawal
     */
    function emergencyWithdraw() external onlyRole(roles.ADMIN_ROLE()) nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        address payable admin = payable(msg.sender);
        admin.sendValue(balance);
        
        emit EmergencyWithdrawal(admin, balance);
    }
    
    /**
     * @notice Cancels a pending ETH transfer and potentially refunds to sender
     * @dev Only admins can call this function
     * @dev Currently reverts as sender tracking needs to be improved
     * @param transferId Unique identifier of the transfer to cancel
     * @custom:emits TransferCancelled
     */
    function cancelTransfer(bytes32 transferId, string calldata /* reason */) external onlyRole(roles.ADMIN_ROLE()) nonReentrant {
        PendingTransfer storage transfer = pendingTransfers[transferId];
        require(transfer.amount > 0 && !transfer.executed, "Not pending");
        transfer.executed = true;
        // Fix: refund to the original sender (not possible with current struct, so add sender to PendingTransfer)
        // For now, revert to prevent unsafe refund
        revert("Refund recipient address not tracked. Add sender to PendingTransfer struct.");
        // emit TransferCancelled(transferId, msg.sender, reason);
        // delete pendingTransfers[transferId];
    }
    
    /**
     * @notice Cancels a pending ERC20 transfer and refunds tokens to sender
     * @dev Only admins can call this function
     * @param transferId Unique identifier of the transfer to cancel
     * @param reason Reason for cancellation
     * @custom:emits ERC20TransferCancelled
     */
    function cancelERC20Transfer(bytes32 transferId, string calldata reason) external onlyRole(roles.ADMIN_ROLE()) nonReentrant {
        PendingERC20Transfer storage transfer = pendingERC20Transfers[transferId];
        require(transfer.amount > 0 && !transfer.executed, "Not pending");
        transfer.executed = true;
        require(IERC20Upgradeable(transfer.token).transfer(transfer.from, transfer.amount), "ERC20 transfer failed");
        emit ERC20TransferCancelled(transferId, msg.sender, reason);
        delete pendingERC20Transfers[transferId];
    }
    
    /**
     * @notice Cancels a pending NFT transfer and returns NFT to sender
     * @dev Only admins can call this function
     * @param transferId Unique identifier of the transfer to cancel
     * @param reason Reason for cancellation
     * @custom:emits NFTTransferCancelled
     */
    function cancelNFTTransfer(bytes32 transferId, string calldata reason) external onlyRole(roles.ADMIN_ROLE()) nonReentrant {
        PendingNFTTransfer storage transfer = pendingNFTTransfers[transferId];
        require(!transfer.executed, "Not pending");
        transfer.executed = true;
        IERC721Upgradeable(transfer.token).safeTransferFrom(address(this), transfer.from, transfer.tokenId);
        emit NFTTransferCancelled(transferId, msg.sender, reason);
        delete pendingNFTTransfers[transferId];
    }

    /// @notice Structure for pending ETH transfers with metadata
    /// @dev Alternative to PendingTransfer that includes metadata field
    struct PendingTransferWithMeta {
        uint256 amount;       /// @dev Amount of ETH to transfer
        uint256 timestamp;    /// @dev When the transfer was queued
        bool executed;        /// @dev Whether the transfer has been executed
        string metadata;      /// @dev Additional information about the transfer
    }
    
    /// @notice Mapping of transfer IDs to pending ETH transfers with metadata
    mapping(bytes32 => PendingTransferWithMeta) public pendingTransfersWithMeta;

    /**
     * @notice Deposits ETH with metadata and queues it for delayed transfer to treasury
     * @dev Alternative to receiveFunds() that includes metadata
     * @param metadata Additional information about the deposit
     * @custom:emits FundsReceived
     * @custom:emits TransferQueued
     */
    function receiveFundsWithMeta(string calldata metadata) external payable nonReentrant {
        require(msg.value > 0, "No ETH sent");
        bytes32 transferId = keccak256(abi.encodePacked(
            block.timestamp,
            msg.value,
            msg.sender,
            transferNonce
        ));
        transferNonce++;
        pendingTransfersWithMeta[transferId] = PendingTransferWithMeta({
            amount: msg.value,
            timestamp: block.timestamp,
            executed: false,
            metadata: metadata
        });
        emit FundsReceived(msg.sender, msg.value);
        emit TransferQueued(transferId, msg.value, block.timestamp);
    }

    // --- Analytics: Add more events as needed for dashboard integration ---
    // ...existing code...
    
    /**
     * @notice Authorizes contract upgrades
     * @dev Only the contract owner can authorize upgrades
     * @dev Required by UUPSUpgradeable
     * @param newImplementation Address of the new implementation contract
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {
        // Authorization logic handled by onlyOwner modifier
    }
}
