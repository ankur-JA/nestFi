// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC4626} from "@openzeppelin/contracts/interfaces/IERC4626.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IVaultManager} from "./interfaces/IVaultManager.sol";
import {IStrategy} from "./interfaces/IStrategy.sol";
import {ISwapRouter} from "./interfaces/uniswap/ISwapRouter.sol";

/**
 * @title VaultManager
 * @dev Upgradeable manager contract for GroupVaults that handles:
 * - Token swaps via Uniswap V3
 * - Strategy management (invest/divest to Aave, Uniswap LP, Velodrome, Beefy, etc.)
 * - Withdrawal model logic (Instant, Scheduled, Epoch, Curator Managed)
 * 
 * This contract can be upgraded to:
 * - Add new strategy integrations
 * - Modify withdrawal logic
 * - Add new swap routers
 * - Fix bugs without affecting user funds
 * 
 * Architecture:
 * - GroupVault holds the assets and handles share accounting
 * - VaultManager handles all strategy and withdrawal logic
 * - VaultManager is UUPS upgradeable
 */
contract VaultManager is 
    Initializable, 
    OwnableUpgradeable, 
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable,
    IVaultManager 
{
    using SafeERC20 for IERC20;

    // ============ STORAGE ============
    
    // Swap configuration
    ISwapRouter public swapRouter;
    uint24 public defaultSwapFee;
    
    // Per-vault configuration
    mapping(address => VaultConfig) public vaultConfigs;
    
    // Per-vault strategies: vault => (strategyName => strategyAddress)
    mapping(address => mapping(string => address)) public vaultStrategies;
    mapping(address => string[]) public vaultStrategyNames;
    
    // Per-vault withdrawal queues
    mapping(address => WithdrawRequest[]) public withdrawQueues;
    mapping(address => mapping(address => uint256)) public pendingWithdrawShares;
    mapping(address => uint256) public totalPendingShares;
    
    // Vault authorization
    mapping(address => bool) public authorizedVaults;
    mapping(address => address) public vaultCurators; // vault => curator
    
    // Supported tokens per vault
    mapping(address => mapping(address => bool)) public vaultSupportedTokens;
    mapping(address => address[]) public vaultTokenList;

    // ============ ERRORS ============
    
    error NotAuthorized();
    error VaultNotConfigured();
    error StrategyNotFound();
    error InvalidWithdrawModel();
    error WithdrawNotAllowed();
    error EpochNotEnded();
    error InsufficientIdleBuffer();
    error InvalidConfig();
    error SwapRouterNotSet();

    // ============ MODIFIERS ============
    
    modifier onlyVault(address vault) {
        if (msg.sender != vault && msg.sender != vaultCurators[vault] && msg.sender != owner()) {
            revert NotAuthorized();
        }
        _;
    }
    
    modifier onlyCurator(address vault) {
        // Allow: curator, owner, or the vault itself (since vault delegates calls for its owner)
        if (msg.sender != vaultCurators[vault] && msg.sender != vault && msg.sender != owner()) {
            revert NotAuthorized();
        }
        _;
    }
    
    modifier vaultConfigured(address vault) {
        if (!authorizedVaults[vault]) {
            revert VaultNotConfigured();
        }
        _;
    }

    // ============ INITIALIZER ============
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    function initialize(address _owner) public initializer {
        __Ownable_init(_owner);
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        
        // Default swap fee: 0.3%
        defaultSwapFee = 3000;
    }

    // ============ UUPS UPGRADE ============
    
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
    
    /**
     * @dev Get the current implementation version
     */
    function version() external pure returns (string memory) {
        return "1.0.0";
    }

    // ============ VAULT CONFIGURATION ============
    
    /**
     * @dev Configure a new vault with withdrawal model
     * @param vault The vault address
     * @param curator The curator/admin address for this vault
     * @param withdrawModel 0=INSTANT, 1=SCHEDULED, 2=EPOCH, 3=CURATOR_MANAGED
     * @param withdrawConfig Config value (buffer % for INSTANT, epoch length for EPOCH)
     */
    function configureVault(
        address vault,
        address curator,
        uint8 withdrawModel,
        uint256 withdrawConfig
    ) external override {
        require(withdrawModel <= 3, "Invalid model");
        require(curator != address(0), "Invalid curator");
        
        VaultConfig storage config = vaultConfigs[vault];
        config.withdrawModel = WithdrawModel(withdrawModel);
        
        if (withdrawModel == 0) {
            // INSTANT: buffer percent 8-15%
            require(withdrawConfig >= 8 && withdrawConfig <= 15, "Buffer must be 8-15%");
            config.idleBufferPercent = withdrawConfig;
        } else if (withdrawModel == 2) {
            // EPOCH: 7 days (604800) or 30 days (2592000)
            require(withdrawConfig == 604800 || withdrawConfig == 2592000, "Epoch must be 7 or 30 days");
            config.epochLength = withdrawConfig;
            config.currentEpochStart = block.timestamp;
            config.epochNumber = 1;
        }
        
        authorizedVaults[vault] = true;
        vaultCurators[vault] = curator;
        
        emit VaultConfigured(vault, withdrawModel, withdrawConfig);
    }
    
    /**
     * @dev Get vault configuration
     */
    function getVaultConfig(address vault) external view override returns (VaultConfig memory) {
        return vaultConfigs[vault];
    }
    
    /**
     * @dev Update vault curator
     */
    function setVaultCurator(address vault, address curator) external onlyCurator(vault) {
        vaultCurators[vault] = curator;
    }

    // ============ SWAP CONFIGURATION ============
    
    /**
     * @dev Set the swap router (Uniswap V3)
     */
    function setSwapRouter(address router) external override onlyOwner {
        swapRouter = ISwapRouter(router);
    }
    
    /**
     * @dev Set default swap fee tier
     */
    function setDefaultSwapFee(uint24 fee) external override onlyOwner {
        defaultSwapFee = fee;
    }

    // ============ STRATEGY MANAGEMENT ============
    
    /**
     * @dev Add a named strategy to a vault
     */
    function addStrategy(
        address vault, 
        string memory name, 
        address strategy
    ) external override onlyCurator(vault) vaultConfigured(vault) {
        require(strategy != address(0), "Invalid strategy");
        
        // Add to names array if new
        if (vaultStrategies[vault][name] == address(0)) {
            vaultStrategyNames[vault].push(name);
        }
        
        vaultStrategies[vault][name] = strategy;
        emit StrategyAdded(vault, name, strategy);
    }
    
    /**
     * @dev Remove a strategy from a vault
     */
    function removeStrategy(
        address vault, 
        string memory name
    ) external override onlyCurator(vault) {
        require(vaultStrategies[vault][name] != address(0), "Strategy not found");
        vaultStrategies[vault][name] = address(0);
        emit StrategyRemoved(vault, name);
    }
    
    /**
     * @dev Get strategy address by name
     */
    function getStrategy(address vault, string memory name) external view override returns (address) {
        return vaultStrategies[vault][name];
    }
    
    /**
     * @dev Get all strategy names for a vault
     */
    function getStrategyNames(address vault) external view override returns (string[] memory) {
        return vaultStrategyNames[vault];
    }

    // ============ INVESTMENT FUNCTIONS ============
    
    /**
     * @dev Invest vault assets into a strategy
     * @param vault The vault address
     * @param strategyName The strategy to invest in
     * @param assets Amount to invest
     */
    function invest(
        address vault, 
        string memory strategyName, 
        uint256 assets
    ) external override onlyCurator(vault) vaultConfigured(vault) nonReentrant {
        address strategyAddr = vaultStrategies[vault][strategyName];
        if (strategyAddr == address(0)) revert StrategyNotFound();
        require(assets > 0, "Zero amount");
        
        // Get the vault's asset
        address vaultAsset = IStrategy(strategyAddr).asset();
        
        // Transfer from vault to this contract, then to strategy
        IERC20(vaultAsset).safeTransferFrom(vault, address(this), assets);
        IERC20(vaultAsset).approve(strategyAddr, assets);
        IStrategy(strategyAddr).deposit(assets);
        
        emit Invested(vault, strategyAddr, assets);
    }
    
    /**
     * @dev Divest assets from a strategy back to the vault
     */
    function divest(
        address vault, 
        string memory strategyName, 
        uint256 assets
    ) external override onlyCurator(vault) vaultConfigured(vault) nonReentrant {
        address strategyAddr = vaultStrategies[vault][strategyName];
        if (strategyAddr == address(0)) revert StrategyNotFound();
        require(assets > 0, "Zero amount");
        
        // Withdraw from strategy
        IStrategy(strategyAddr).withdraw(assets);
        
        // Transfer back to vault
        address vaultAsset = IStrategy(strategyAddr).asset();
        uint256 balance = IERC20(vaultAsset).balanceOf(address(this));
        IERC20(vaultAsset).safeTransfer(vault, balance);
        
        emit Divested(vault, strategyAddr, assets);
    }
    
    /**
     * @dev Get assets invested in a strategy
     */
    function getStrategyAssets(
        address vault, 
        string memory strategyName
    ) external view override returns (uint256) {
        address strategyAddr = vaultStrategies[vault][strategyName];
        if (strategyAddr == address(0)) return 0;
        return IStrategy(strategyAddr).totalAssets();
    }
    
    /**
     * @dev Get total assets invested across all strategies for a vault
     */
    function getTotalInvestedAssets(address vault) external view override returns (uint256 total) {
        string[] memory names = vaultStrategyNames[vault];
        for (uint256 i = 0; i < names.length; i++) {
            address strategyAddr = vaultStrategies[vault][names[i]];
            if (strategyAddr != address(0)) {
                total += IStrategy(strategyAddr).totalAssets();
            }
        }
    }

    // ============ SWAP FUNCTIONS ============
    
    /**
     * @dev Swap tokens for a vault using Uniswap V3
     */
    function swapTokens(
        address vault,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMin,
        uint24 fee
    ) external override onlyCurator(vault) vaultConfigured(vault) nonReentrant returns (uint256 amountOut) {
        if (address(swapRouter) == address(0)) revert SwapRouterNotSet();
        require(amountIn > 0, "Zero amount");
        
        uint24 poolFee = fee > 0 ? fee : defaultSwapFee;
        
        // Transfer tokens from vault to this contract
        IERC20(tokenIn).safeTransferFrom(vault, address(this), amountIn);
        
        // Approve router
        IERC20(tokenIn).approve(address(swapRouter), amountIn);
        
        // Execute swap
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            fee: poolFee,
            recipient: vault, // Send directly to vault
            deadline: block.timestamp,
            amountIn: amountIn,
            amountOutMinimum: amountOutMin,
            sqrtPriceLimitX96: 0
        });
        
        amountOut = swapRouter.exactInputSingle(params);
        
        // Track new token
        if (!vaultSupportedTokens[vault][tokenOut]) {
            vaultSupportedTokens[vault][tokenOut] = true;
            vaultTokenList[vault].push(tokenOut);
        }
        
        emit TokenSwapped(vault, tokenIn, tokenOut, amountIn, amountOut);
    }

    // ============ WITHDRAWAL MODEL FUNCTIONS ============
    
    /**
     * @dev Check if a withdrawal is allowed for a vault
     */
    function canWithdraw(
        address vault, 
        address user, 
        uint256 assets
    ) external view override vaultConfigured(vault) returns (bool allowed, string memory reason) {
        VaultConfig memory config = vaultConfigs[vault];
        
        if (config.withdrawModel == WithdrawModel.INSTANT) {
            uint256 idleAssets = _getVaultIdleAssets(vault);
            if (assets <= idleAssets) {
                return (true, "");
            }
            return (false, "Insufficient idle buffer");
            
        } else if (config.withdrawModel == WithdrawModel.SCHEDULED || 
                   config.withdrawModel == WithdrawModel.CURATOR_MANAGED) {
            return (false, "Must use withdrawal queue");
            
        } else if (config.withdrawModel == WithdrawModel.EPOCH) {
            if (block.timestamp >= config.currentEpochStart + config.epochLength) {
                return (true, "");
            }
            return (false, "Epoch not ended");
        }
        
        return (false, "Unknown model");
    }
    
    /**
     * @dev Request a withdrawal (for SCHEDULED and CURATOR_MANAGED models)
     */
    function requestWithdraw(
        address vault, 
        address user, 
        uint256 shares
    ) external override onlyVault(vault) vaultConfigured(vault) returns (uint256 requestId) {
        VaultConfig memory config = vaultConfigs[vault];
        require(
            config.withdrawModel == WithdrawModel.SCHEDULED || 
            config.withdrawModel == WithdrawModel.CURATOR_MANAGED,
            "Not a queue model"
        );
        require(shares > 0, "Zero shares");
        
        requestId = withdrawQueues[vault].length;
        withdrawQueues[vault].push(WithdrawRequest({
            user: user,
            shares: shares,
            requestTime: block.timestamp,
            processed: false
        }));
        
        pendingWithdrawShares[vault][user] += shares;
        totalPendingShares[vault] += shares;
        
        emit WithdrawRequested(vault, user, shares, requestId);
    }
    
    /**
     * @dev Cancel a withdrawal request
     */
    function cancelWithdrawRequest(
        address vault, 
        address user, 
        uint256 requestId
    ) external override onlyVault(vault) {
        require(requestId < withdrawQueues[vault].length, "Invalid request");
        WithdrawRequest storage request = withdrawQueues[vault][requestId];
        require(request.user == user, "Not your request");
        require(!request.processed, "Already processed");
        
        pendingWithdrawShares[vault][user] -= request.shares;
        totalPendingShares[vault] -= request.shares;
        request.processed = true;
    }
    
    /**
     * @dev Process withdrawal queue (for SCHEDULED model)
     */
    function processWithdrawQueue(
        address vault, 
        uint256 maxToProcess
    ) external override onlyCurator(vault) vaultConfigured(vault) nonReentrant {
        VaultConfig memory config = vaultConfigs[vault];
        require(config.withdrawModel == WithdrawModel.SCHEDULED, "Not scheduled model");
        
        uint256 idleAssets = _getVaultIdleAssets(vault);
        uint256 processed = 0;
        
        WithdrawRequest[] storage queue = withdrawQueues[vault];
        
        for (uint256 i = 0; i < queue.length && processed < maxToProcess; i++) {
            WithdrawRequest storage request = queue[i];
            if (request.processed) continue;
            
            // Calculate assets for shares (simplified - vault should provide this)
            uint256 assets = request.shares; // 1:1 for simplicity, vault handles actual conversion
            if (assets > idleAssets) break;
            
            pendingWithdrawShares[vault][request.user] -= request.shares;
            totalPendingShares[vault] -= request.shares;
            idleAssets -= assets;
            
            request.processed = true;
            processed++;
            
            emit WithdrawProcessed(vault, request.user, request.shares, assets);
        }
    }
    
    /**
     * @dev Process all pending withdrawals (for CURATOR_MANAGED model)
     */
    function processAllWithdrawals(
        address vault
    ) external override onlyCurator(vault) vaultConfigured(vault) nonReentrant {
        VaultConfig memory config = vaultConfigs[vault];
        require(config.withdrawModel == WithdrawModel.CURATOR_MANAGED, "Not curator managed");
        
        WithdrawRequest[] storage queue = withdrawQueues[vault];
        
        for (uint256 i = 0; i < queue.length; i++) {
            WithdrawRequest storage request = queue[i];
            if (request.processed) continue;
            
            uint256 assets = request.shares;
            
            pendingWithdrawShares[vault][request.user] -= request.shares;
            totalPendingShares[vault] -= request.shares;
            
            request.processed = true;
            
            emit WithdrawProcessed(vault, request.user, request.shares, assets);
        }
    }
    
    /**
     * @dev Advance to next epoch (for EPOCH model)
     */
    function advanceEpoch(
        address vault
    ) external override onlyCurator(vault) vaultConfigured(vault) {
        VaultConfig storage config = vaultConfigs[vault];
        require(config.withdrawModel == WithdrawModel.EPOCH, "Not epoch model");
        require(block.timestamp >= config.currentEpochStart + config.epochLength, "Epoch not ended");
        
        config.epochNumber++;
        config.currentEpochStart = block.timestamp;
        
        emit EpochAdvanced(vault, config.epochNumber, block.timestamp);
    }

    // ============ VIEW FUNCTIONS ============
    
    function getWithdrawQueueLength(address vault) external view override returns (uint256) {
        return withdrawQueues[vault].length;
    }
    
    function getPendingWithdraws(
        address vault, 
        address user
    ) external view override returns (uint256 totalShares, uint256 count) {
        totalShares = pendingWithdrawShares[vault][user];
        WithdrawRequest[] storage queue = withdrawQueues[vault];
        for (uint256 i = 0; i < queue.length; i++) {
            if (queue[i].user == user && !queue[i].processed) {
                count++;
            }
        }
    }
    
    function getIdleBuffer(address vault) external view override returns (uint256) {
        VaultConfig memory config = vaultConfigs[vault];
        if (config.withdrawModel != WithdrawModel.INSTANT) return 0;
        // This would need total assets from vault - simplified here
        return config.idleBufferPercent;
    }
    
    function getEpochEndTime(address vault) external view override returns (uint256) {
        VaultConfig memory config = vaultConfigs[vault];
        if (config.withdrawModel != WithdrawModel.EPOCH) return 0;
        return config.currentEpochStart + config.epochLength;
    }
    
    function canWithdrawNow(address vault) external view override returns (bool) {
        VaultConfig memory config = vaultConfigs[vault];
        
        if (config.withdrawModel == WithdrawModel.INSTANT) {
            return _getVaultIdleAssets(vault) > 0;
        } else if (config.withdrawModel == WithdrawModel.EPOCH) {
            return block.timestamp >= config.currentEpochStart + config.epochLength;
        }
        return false;
    }
    
    function getWithdrawModelName(address vault) external view override returns (string memory) {
        VaultConfig memory config = vaultConfigs[vault];
        if (config.withdrawModel == WithdrawModel.INSTANT) return "Instant";
        if (config.withdrawModel == WithdrawModel.SCHEDULED) return "Scheduled";
        if (config.withdrawModel == WithdrawModel.EPOCH) return "Epoch";
        if (config.withdrawModel == WithdrawModel.CURATOR_MANAGED) return "Curator Managed";
        return "Unknown";
    }
    
    /**
     * @dev Get vault's supported tokens
     */
    function getVaultTokens(address vault) external view returns (address[] memory) {
        return vaultTokenList[vault];
    }

    // ============ INTERNAL FUNCTIONS ============
    
    function _getVaultIdleAssets(address vault) internal view returns (uint256) {
        // Get the vault's asset address (ERC4626 standard)
        try IERC4626(vault).asset() returns (address assetAddr) {
            return IERC20(assetAddr).balanceOf(vault);
        } catch {
            return 0;
        }
    }
}

