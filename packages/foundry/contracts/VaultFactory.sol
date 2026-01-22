// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {GroupVault} from "./GroupVault.sol";
import {IPermit2} from "./interfaces/IPermit2.sol";
import {IVaultManager} from "./interfaces/IVaultManager.sol";
import {CuratorStaking} from "./CruatorStaking.sol";

/**
 * @title VaultFactory
 * @dev Factory contract for creating GroupVault instances
 * 
 * Architecture:
 * - Creates minimal proxy clones of GroupVault implementation
 * - Configures vault with VaultManager for strategy logic
 * - VaultManager can be upgraded independently
 */
contract VaultFactory {
    GroupVault public immutable implementation;
    CuratorStaking public immutable curatorstaking;
    IPermit2 public immutable permit2;
    IVaultManager public vaultManager;

    // state variable 
    uint public nextVaultId;
    
    
    // Track vault ownership
    mapping(address => address) public vaultOwner;
    mapping(address => address[]) public userVaults;
    mapping(address => uint256) public vaultById;

    // Owner of this contract
    address public owner;
    
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
        uint256 stakeAmount
    );
    

    event VaultManagerSet(address indexed manager);

    constructor(GroupVault _implementation, address _permit2, address _vaultManager, address _curatorStaking) {
        implementation = _implementation;
        permit2 = IPermit2(_permit2);
        vaultManager = IVaultManager(_vaultManager);
        curatorstaking = CuratorStaking(_curatorStaking);
        owner = msg.sender;
    }



    // ============ MODIFIERS ============
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }


    /**
     * @dev Set the vault manager (for upgrades)
     */
    function setVaultManager(address _manager) external onlyOwner {
        require(_manager != address(0), "Not authorized");
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
     */
    function createVault(
        string calldata name,
        string calldata symbol,
        bool allowlistEnabled,
        uint256 depositCap,
        uint256 minDeposit,
    ) external returns (address vault) {
        require(address(vaultManager) != address(0), "Manager not set");
        require(depositCap > 0, "Deposit cap must be greater than 0");
        require(minDeposit > 0, "Min Deposit must be greater than 0");
        
        
        // Clone the implementation
        vault = Clones.clone(address(implementation));

        // Stake USDC before initializing the vault
        uint256 memory stakeAmount = (depositCap * 2) / 100;
        if(stakeAmount > 0) {}
        curatorstaking.stake(stakeAmount);

        uint256 id = ++nextVaultId;

        // Initialize the vault with manager
        GroupVault(vault).initialize(
            id,
            msg.sender,
            name,
            symbol,
            allowlistEnabled,
            depositCap,
            minDeposit,
            address(permit2),
            address(vaultManager)
        );
        
        // Configure withdrawal model in manager (pass admin as curator)
        vaultManager.configureVault(vault, msg.sender, stakeAmount);
                    
        // Track ownership
        vaultOwner[vault] = msg.sender;
        userVaults[msg.sender].push(vault);
        vaultById[vault] = id;
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
            stakeAmount
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
