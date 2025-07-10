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

contract TreasuryRouter is 
    Initializable, 
    Ownable2StepUpgradeable, 
    UUPSUpgradeable, 
    ReentrancyGuardUpgradeable {
    
    using AddressUpgradeable for address payable;
    
    // Reference to Roles contract
    IRoles public roles;
    
    // Treasury address
    address payable public treasury;
    
    /// @notice The delay (in seconds) before a transfer can be executed. Hard-coded to 24 hours. To change, upgrade the contract.
    uint256 public constant EXECUTION_DELAY = 24 hours;
    
    // Nonce for transfer ID generation
    uint256 private transferNonce;
    
    // Pending transfer tracking
    struct PendingTransfer {
        uint256 amount;
        uint256 timestamp;
        bool executed;
        address from;
    }
    
    mapping(bytes32 => PendingTransfer) public pendingTransfers;
    bytes32[] private _pendingTransferIds;
    mapping(bytes32 => uint256) private _pendingTransferIdIndex;

    function pendingTransferIds() public view returns (bytes32[] memory) {
        return _pendingTransferIds;
    }

    // Pending ERC20 transfer tracking
    struct PendingERC20Transfer {
        address token;
        address from;
        uint256 amount;
        uint256 timestamp;
        bool executed;
        string metadata;
    }
    mapping(bytes32 => PendingERC20Transfer) public pendingERC20Transfers;

    // Pending NFT transfer tracking
    struct PendingNFTTransfer {
        address token;
        address from;
        uint256 tokenId;
        uint256 timestamp;
        bool executed;
        string metadata;
    }
    mapping(bytes32 => PendingNFTTransfer) public pendingNFTTransfers;

    // Events
    event FundsReceived(address indexed sender, uint256 amount);
    event TransferQueued(bytes32 indexed transferId, uint256 amount, uint256 timestamp);
    event TransferExecuted(bytes32 indexed transferId, uint256 amount, address indexed treasury);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event EmergencyWithdrawal(address indexed to, uint256 amount);
    
    // --- New Events ---
    event ERC20FundsReceived(address indexed token, address indexed sender, uint256 amount, string metadata, bytes32 transferId);
    event ERC20TransferQueued(bytes32 indexed transferId, address indexed token, uint256 amount, uint256 timestamp, string metadata);
    event ERC20TransferExecuted(bytes32 indexed transferId, address indexed token, uint256 amount, address indexed treasury);

    event NFTReceived(address indexed token, address indexed sender, uint256 tokenId, string metadata, bytes32 transferId);
    event NFTTransferQueued(bytes32 indexed transferId, address indexed token, uint256 tokenId, uint256 timestamp, string metadata);
    event NFTTransferExecuted(bytes32 indexed transferId, address indexed token, uint256 tokenId, address indexed treasury);

    event TransferCancelled(bytes32 indexed transferId, address indexed by, string reason);
    event ERC20TransferCancelled(bytes32 indexed transferId, address indexed by, string reason);
    event NFTTransferCancelled(bytes32 indexed transferId, address indexed by, string reason);

    // Modifiers
    modifier onlyRole(bytes32 role) {
        require(roles.hasRole(role, msg.sender), "Missing required role");
       _;
    }
    
    // Initialize
    function initialize(
        address rolesContract,
        address payable initialTreasury
    ) public initializer onlyOwner {
        __Ownable2Step_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        
        require(rolesContract != address(0), "Invalid roles contract");
        require(initialTreasury != address(0), "Invalid treasury address");
        
        roles = IRoles(rolesContract);
        treasury = initialTreasury;
    }
    
    // Receive funds
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

    /// @notice Accept Ether sent directly to the contract and queue it as a pending transfer.
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
    
    // --- ERC20 Deposit ---
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

    // --- NFT Deposit ---
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

    // Execute pending transfer
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
    
    // --- ERC20 Release ---
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

    // --- NFT Release ---
    function executeNFTTransfer(bytes32 transferId) internal nonReentrant {
        PendingNFTTransfer storage transfer = pendingNFTTransfers[transferId];
        require(!transfer.executed, "Already executed");
        require(block.timestamp >= transfer.timestamp + EXECUTION_DELAY, "Delay not elapsed");

        transfer.executed = true;
        IERC721Upgradeable(transfer.token).safeTransferFrom(address(this), treasury, transfer.tokenId);

        emit NFTTransferExecuted(transferId, transfer.token, transfer.tokenId, treasury);
        delete pendingNFTTransfers[transferId];
    }
    
    // Batch transfer execution (safe: does not modify the array being iterated)
    function executeTransferBatch(bytes32[] calldata transferIds) external nonReentrant {
        for (uint i = 0; i < transferIds.length; i++) {
            executeTransfer(transferIds[i]); // O(1) removal inside executeTransfer
        }
    }
    // --- Batch Release ---
    function executeERC20TransferBatch(bytes32[] calldata transferIds) external nonReentrant {
        for (uint i = 0; i < transferIds.length; i++) {
            executeERC20Transfer(transferIds[i]); // O(1) removal inside executeERC20Transfer
        }
    }
    function executeNFTTransferBatch(bytes32[] calldata transferIds) external nonReentrant {
        for (uint i = 0; i < transferIds.length; i++) {
            executeNFTTransfer(transferIds[i]); // O(1) removal inside executeNFTTransfer
        }
    }

    // Update treasury address
    function updateTreasury(address payable newTreasury) external onlyRole(roles.ADMIN_ROLE()) {
        require(newTreasury != address(0), "Invalid treasury address");
        address oldTreasury = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }
    
    // Emergency withdrawal
    function emergencyWithdraw() external onlyRole(roles.ADMIN_ROLE()) nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        address payable admin = payable(msg.sender);
        admin.sendValue(balance);
        
        emit EmergencyWithdrawal(admin, balance);
    }
    
    // --- Refund/Cancellation ---
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
    function cancelERC20Transfer(bytes32 transferId, string calldata reason) external onlyRole(roles.ADMIN_ROLE()) nonReentrant {
        PendingERC20Transfer storage transfer = pendingERC20Transfers[transferId];
        require(transfer.amount > 0 && !transfer.executed, "Not pending");
        transfer.executed = true;
        require(IERC20Upgradeable(transfer.token).transfer(transfer.from, transfer.amount), "ERC20 transfer failed");
        emit ERC20TransferCancelled(transferId, msg.sender, reason);
        delete pendingERC20Transfers[transferId];
    }
    function cancelNFTTransfer(bytes32 transferId, string calldata reason) external onlyRole(roles.ADMIN_ROLE()) nonReentrant {
        PendingNFTTransfer storage transfer = pendingNFTTransfers[transferId];
        require(!transfer.executed, "Not pending");
        transfer.executed = true;
        IERC721Upgradeable(transfer.token).safeTransferFrom(address(this), transfer.from, transfer.tokenId);
        emit NFTTransferCancelled(transferId, msg.sender, reason);
        delete pendingNFTTransfers[transferId];
    }

    // --- Per-Deposit Metadata for ETH ---
    struct PendingTransferWithMeta {
        uint256 amount;
        uint256 timestamp;
        bool executed;
        string metadata;
    }
    mapping(bytes32 => PendingTransferWithMeta) public pendingTransfersWithMeta;

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
    
    // Upgrade authorization
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {
        // Authorization logic handled by onlyOwner modifier
    }
}
