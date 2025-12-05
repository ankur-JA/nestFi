// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
 * @title IVaultManager
 * @dev Interface for the upgradeable VaultManager that handles:
 * - Token swaps
 * - Strategy management (invest/divest)
 * - Withdrawal model logic
 */
interface IVaultManager {
    // ============ ENUMS ============
    
    enum WithdrawModel {
        INSTANT,           // Model 1: 8-15% idle buffer for instant withdrawals
        SCHEDULED,         // Model 2: Queue-based, processed during rebalances
        EPOCH,             // Model 3: Withdraw only after epoch (7 or 30 days)
        CURATOR_MANAGED    // Model 4: Manual unwind by curator
    }

    // ============ STRUCTS ============
    
    struct WithdrawRequest {
        address user;
        uint256 shares;
        uint256 requestTime;
        bool processed;
    }

    struct VaultConfig {
        WithdrawModel withdrawModel;
        uint256 idleBufferPercent;    // For INSTANT model (8-15%)
        uint256 epochLength;           // For EPOCH model (7 or 30 days in seconds)
        uint256 currentEpochStart;
        uint256 epochNumber;
    }

    struct StrategyInfo {
        address strategyAddress;
        bool isActive;
        uint256 allocatedAssets;
    }

    // ============ EVENTS ============
    
    event StrategyAdded(address indexed vault, string indexed name, address indexed strategy);
    event StrategyRemoved(address indexed vault, string indexed name);
    event Invested(address indexed vault, address indexed strategy, uint256 assets);
    event Divested(address indexed vault, address indexed strategy, uint256 assets);
    event TokenSwapped(address indexed vault, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut);
    event WithdrawRequested(address indexed vault, address indexed user, uint256 shares, uint256 requestId);
    event WithdrawProcessed(address indexed vault, address indexed user, uint256 shares, uint256 assets);
    event EpochAdvanced(address indexed vault, uint256 newEpochNumber, uint256 timestamp);
    event VaultConfigured(address indexed vault, uint8 withdrawModel, uint256 config);

    // ============ VAULT CONFIGURATION ============
    
    function configureVault(
        address vault,
        address curator,
        uint8 withdrawModel,
        uint256 withdrawConfig
    ) external;
    
    function getVaultConfig(address vault) external view returns (VaultConfig memory);

    // ============ STRATEGY MANAGEMENT ============
    
    function addStrategy(address vault, string memory name, address strategy) external;
    function removeStrategy(address vault, string memory name) external;
    function getStrategy(address vault, string memory name) external view returns (address);
    function getStrategyNames(address vault) external view returns (string[] memory);
    
    // ============ INVESTMENT FUNCTIONS ============
    
    function invest(address vault, string memory strategyName, uint256 assets) external;
    function divest(address vault, string memory strategyName, uint256 assets) external;
    function getStrategyAssets(address vault, string memory strategyName) external view returns (uint256);
    function getTotalInvestedAssets(address vault) external view returns (uint256);
    
    // ============ SWAP FUNCTIONS ============
    
    function swapTokens(
        address vault,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMin,
        uint24 fee
    ) external returns (uint256 amountOut);
    
    function setSwapRouter(address router) external;
    function setDefaultSwapFee(uint24 fee) external;

    // ============ WITHDRAWAL MODEL FUNCTIONS ============
    
    function canWithdraw(address vault, address user, uint256 assets) external view returns (bool allowed, string memory reason);
    function requestWithdraw(address vault, address user, uint256 shares) external returns (uint256 requestId);
    function cancelWithdrawRequest(address vault, address user, uint256 requestId) external;
    function processWithdrawQueue(address vault, uint256 maxToProcess) external;
    function processAllWithdrawals(address vault) external;
    function advanceEpoch(address vault) external;
    
    // ============ VIEW FUNCTIONS ============
    
    function getWithdrawQueueLength(address vault) external view returns (uint256);
    function getPendingWithdraws(address vault, address user) external view returns (uint256 totalShares, uint256 count);
    function getIdleBuffer(address vault) external view returns (uint256);
    function getEpochEndTime(address vault) external view returns (uint256);
    function canWithdrawNow(address vault) external view returns (bool);
    function getWithdrawModelName(address vault) external view returns (string memory);
}

