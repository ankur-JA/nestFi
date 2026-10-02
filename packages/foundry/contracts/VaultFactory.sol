// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {GroupVault} from "./GroupVault.sol";
import {CuratorStaking} from "./CuratorStaking.sol";

/**
 * @title VaultFactory
 * @dev Clones GroupVault for curators. Requires curator to have approved
 *      CuratorStaking for the required stake amount (2% of deposit cap).
 *
 *      Flow:
 *        1) Curator approves CuratorStaking to spend `depositCap * 2 / 100` USDC
 *        2) Curator calls VaultFactory.createVault(...)
 *        3) Factory pulls stake via CuratorStaking.stakeFor
 *        4) Factory clones GroupVault and initializes it with curator as admin
 */
contract VaultFactory {
    GroupVault public immutable implementation;
    CuratorStaking public immutable curatorStaking;
    address public immutable asset;   // underlying token (e.g. USDC)
    address public immutable permit2;

    uint256 public constant STAKE_BPS = 200; // 2% of depositCap
    uint256 public constant BPS_DENOMINATOR = 10_000;

    uint256 public nextVaultId;

    address public owner;

    address[] public allVaults;
    mapping(address => address) public vaultOwner;        // vault => curator
    mapping(address => address[]) public userVaults;      // curator => vaults[]
    mapping(address => uint256) public vaultId;           // vault => id
    mapping(address => uint256) public curatorStakeFor;   // vault => stakeAmount

    event VaultCreated(
        address indexed vault,
        address indexed curator,
        address indexed asset,
        string name,
        string symbol,
        uint256 depositCap,
        uint256 minDeposit,
        uint256 idleBufferBps,
        bool allowlistEnabled,
        uint256 stakeAmount,
        uint256 vaultId
    );

    error NotOwner();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor(
        GroupVault _implementation,
        CuratorStaking _curatorStaking,
        address _asset,
        address _permit2
    ) {
        require(address(_implementation) != address(0), "Impl=0");
        require(address(_curatorStaking) != address(0), "Staking=0");
        require(_asset != address(0), "Asset=0");
        implementation = _implementation;
        curatorStaking = _curatorStaking;
        asset = _asset;
        permit2 = _permit2;
        owner = msg.sender;
    }

    function createVault(
        string calldata name,
        string calldata symbol,
        bool allowlistEnabled,
        uint256 depositCap,
        uint256 minDeposit,
        uint256 idleBufferBps
    ) external returns (address vault) {
        require(depositCap > 0, "Cap=0");

        // Pull curator stake first (curator must have approved CuratorStaking).
        uint256 stakeAmount = (depositCap * STAKE_BPS) / BPS_DENOMINATOR;
        if (stakeAmount > 0) {
            curatorStaking.stakeFor(msg.sender, stakeAmount);
        }

        // Clone implementation and initialize.
        vault = Clones.clone(address(implementation));
        uint256 id = ++nextVaultId;

        GroupVault(vault).initialize(
            GroupVault.InitParams({
                id: id,
                asset: asset,
                admin: msg.sender,
                name: name,
                symbol: symbol,
                allowlistEnabled: allowlistEnabled,
                depositCap: depositCap,
                minDeposit: minDeposit,
                idleBufferBps: idleBufferBps,
                permit2: permit2
            })
        );

        // Track
        vaultOwner[vault] = msg.sender;
        userVaults[msg.sender].push(vault);
        vaultId[vault] = id;
        curatorStakeFor[vault] = stakeAmount;
        allVaults.push(vault);

        emit VaultCreated(
            vault,
            msg.sender,
            asset,
            name,
            symbol,
            depositCap,
            minDeposit,
            idleBufferBps,
            allowlistEnabled,
            stakeAmount,
            id
        );
    }

    // ============ Views ============
    function getAllVaults() external view returns (address[] memory) {
        return allVaults;
    }

    function getVaultsByUser(address user) external view returns (address[] memory) {
        return userVaults[user];
    }

    function isVaultAdmin(address vault, address user) external view returns (bool) {
        return vaultOwner[vault] == user;
    }

    function getVaultOwner(address vault) external view returns (address) {
        return vaultOwner[vault];
    }

    function getUserVaultCount(address user) external view returns (uint256) {
        return userVaults[user].length;
    }

    function getTotalVaultCount() external view returns (uint256) {
        return allVaults.length;
    }

    function computeStakeAmount(uint256 depositCap) external pure returns (uint256) {
        return (depositCap * STAKE_BPS) / BPS_DENOMINATOR;
    }
}
