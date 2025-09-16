// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {GroupVault} from "./GroupVault.sol";
import {IPermit2} from "./interfaces/IPermit2.sol";

/**
 * @title VaultFactory
 * @dev Factory contract for creating GroupVault instances
 */
contract VaultFactory {
    GroupVault public immutable implementation;
    IPermit2 public immutable permit2;
    
    // Track vault ownership
    mapping(address => address) public vaultOwner;
    mapping(address => address[]) public userVaults;
    
    // Events
    event VaultCreated(
        address indexed vault,
        address indexed owner,
        address indexed asset,
        string name,
        string symbol,
        bool allowlistEnabled,
        uint256 depositCap,
        uint256 minDeposit
    );
    
    event VaultJoined(
        address indexed vault,
        address indexed user,
        uint256 shares
    );

    constructor(GroupVault _implementation, address _permit2) {
        implementation = _implementation;
        permit2 = IPermit2(_permit2);
    }

    /**
     * @dev Create a new vault
     */
    function createVault(
        address asset,
        address admin,
        string memory name,
        string memory symbol,
        bool allowlistEnabled,
        uint256 depositCap,
        uint256 minDeposit
    ) external returns (address vault) {
        // Clone the implementation
        vault = Clones.clone(address(implementation));
        
        // Initialize the vault
        GroupVault(vault).initialize(
            IERC20(asset),
            admin,
            name,
            symbol,
            allowlistEnabled,
            depositCap,
            minDeposit,
            address(permit2)
        );
        
        // Track ownership
        vaultOwner[vault] = msg.sender;
        userVaults[msg.sender].push(vault);
        
        // Admin is already added to allowlist during initialization if enabled
        
        emit VaultCreated(
            vault,
            msg.sender,
            asset,
            name,
            symbol,
            allowlistEnabled,
            depositCap,
            minDeposit
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
}
