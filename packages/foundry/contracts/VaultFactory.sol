// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {GroupVault} from "./GroupVault.sol";
import {IPermit2} from "./interfaces/IPermit2.sol";
import {IVaultManager} from "./interfaces/IVaultManager.sol";

/**
 * @title VaultFactory
 * @dev Factory contract for creating GroupVault instances
 * 
 * Architecture:
 * - Creates minimal proxy clones of GroupVault implementation
 * - Configures vault with VaultManager for strategy/withdrawal logic
 * - VaultManager can be upgraded independently
 * 
 * Withdrawal Models (configured via VaultManager):
 * 0 = INSTANT: 8-15% idle buffer for instant withdrawals
 * 1 = SCHEDULED: Queue-based, processed during rebalances
 * 2 = EPOCH: Withdraw only after epoch (7 or 30 days)
 * 3 = CURATOR_MANAGED: Manual unwind by curator
 */
contract VaultFactory {
    GroupVault public immutable implementation;
    IPermit2 public immutable permit2;
    IVaultManager public vaultManager;
    
    // Track vault ownership
    mapping(address => address) public vaultOwner;
    mapping(address => address[]) public userVaults;
    
    // Track all vaults
    address[] public allVaults;
    
    // Events
    event VaultCreated(
        address indexed vault,
        address indexed owner,
        address indexed asset,
        string name,
        string symbol,
        bool allowlistEnabled,
        uint256 depositCap,
        uint256 minDeposit,
        uint8 withdrawModel,
        uint256 withdrawConfig
    );
    
    event VaultManagerSet(address indexed manager);

    constructor(GroupVault _implementation, address _permit2, address _vaultManager) {
        implementation = _implementation;
        permit2 = IPermit2(_permit2);
        vaultManager = IVaultManager(_vaultManager);
    }
    
    /**
     * @dev Set the vault manager (for upgrades)
     */
    function setVaultManager(address _manager) external {
        require(msg.sender == address(this) || vaultManager == IVaultManager(address(0)), "Not authorized");
        vaultManager = IVaultManager(_manager);
        emit VaultManagerSet(_manager);
    }

    /**
     * @dev Create a new vault with withdrawal model
     * @param asset The underlying asset (e.g., USDC)
     * @param admin The curator/admin address
     * @param name Vault name
     * @param symbol Vault share token symbol
     * @param allowlistEnabled Whether allowlist is enabled
     * @param depositCap Maximum total deposits
     * @param minDeposit Minimum deposit amount
     * @param withdrawModel Withdrawal liquidity model (0-3)
     * @param withdrawConfig Configuration for the withdrawal model:
     *        - INSTANT (0): idle buffer percent (8-15)
     *        - SCHEDULED (1): 0 (not used)
     *        - EPOCH (2): epoch length in seconds (604800 for 7 days, 2592000 for 30 days)
     *        - CURATOR_MANAGED (3): 0 (not used)
     */
    function createVault(
        address asset,
        address admin,
        string memory name,
        string memory symbol,
        bool allowlistEnabled,
        uint256 depositCap,
        uint256 minDeposit,
        uint8 withdrawModel,
        uint256 withdrawConfig
    ) external returns (address vault) {
        require(withdrawModel <= 3, "Invalid withdraw model");
        require(address(vaultManager) != address(0), "Manager not set");
        
        // Clone the implementation
        vault = Clones.clone(address(implementation));
        
        // Initialize the vault with manager
        GroupVault(vault).initialize(
            IERC20(asset),
            admin,
            name,
            symbol,
            allowlistEnabled,
            depositCap,
            minDeposit,
            address(permit2),
            address(vaultManager)
        );
        
        // Configure withdrawal model in manager (pass admin as curator)
        vaultManager.configureVault(vault, admin, withdrawModel, withdrawConfig);
        
        // Track ownership
        vaultOwner[vault] = msg.sender;
        userVaults[msg.sender].push(vault);
        allVaults.push(vault);
        
        emit VaultCreated(
            vault,
            msg.sender,
            asset,
            name,
            symbol,
            allowlistEnabled,
            depositCap,
            minDeposit,
            withdrawModel,
            withdrawConfig
        );
    }

    /**
     * @dev Get all vaults created by a user
     */
    function getVaultsByUser(address user) external view returns (address[] memory) {
        return userVaults[user];
    }

    /**
     * @dev Check if user is admin of a vault
     */
    function isVaultAdmin(address vault, address user) external view returns (bool) {
        return vaultOwner[vault] == user;
    }

    /**
     * @dev Get vault owner
     */
    function getVaultOwner(address vault) external view returns (address) {
        return vaultOwner[vault];
    }

    /**
     * @dev Get total vaults created by user
     */
    function getUserVaultCount(address user) external view returns (uint256) {
        return userVaults[user].length;
    }
    
    /**
     * @dev Get all vaults
     */
    function getAllVaults() external view returns (address[] memory) {
        return allVaults;
    }
    
    /**
     * @dev Get total vault count
     */
    function getTotalVaultCount() external view returns (uint256) {
        return allVaults.length;
    }
}
