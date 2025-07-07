// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IRoles.sol";
import "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";

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
    }
    
    mapping(bytes32 => PendingTransfer) public pendingTransfers;
    
    // Events
    event FundsReceived(address indexed sender, uint256 amount);
    event TransferQueued(bytes32 indexed transferId, uint256 amount, uint256 timestamp);
    event TransferExecuted(bytes32 indexed transferId, uint256 amount, address indexed treasury);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event EmergencyWithdrawal(address indexed to, uint256 amount);
    
    // Modifiers
    modifier onlyRole(bytes32 role) {
        require(roles.hasRole(role, msg.sender), "Missing required role");
       _;
    }
    
    // Initialize
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
            executed: false
        });

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
            executed: false
        });
        emit FundsReceived(msg.sender, msg.value);
        emit TransferQueued(transferId, msg.value, block.timestamp);
    }
    
    // Execute pending transfer
    function executeTransfer(bytes32 transferId) internal {
        PendingTransfer storage transfer = pendingTransfers[transferId];
        require(transfer.amount > 0, "Transfer does not exist");
        require(!transfer.executed, "Transfer already executed");
        require(block.timestamp >= transfer.timestamp + EXECUTION_DELAY, "Delay not elapsed");
        
        transfer.executed = true;
        
        // Use safe transfer pattern
        treasury.sendValue(transfer.amount);

        // Emit event before deleting the transfer
        emit TransferExecuted(transferId, transfer.amount, treasury);

        // Clean up storage
        delete pendingTransfers[transferId];
    }
    
    // Batch transfer execution
    function executeTransferBatch(bytes32[] calldata transferIds) external nonReentrant {
        for(uint i = 0; i < transferIds.length; i++) {
            executeTransfer(transferIds[i]);
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
    
    // Upgrade authorization
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {
        // Authorization logic handled by onlyOwner modifier
    }
    
    // Storage gap for future upgrades
    uint256[48] private __gap;
}
