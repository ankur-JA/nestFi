// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IStrategy} from "../interfaces/IStrategy.sol";
import {ISwapRouter} from "../interfaces/uniswap/ISwapRouter.sol";
import {INonfungiblePositionManager} from "../interfaces/uniswap/INonfungiblePositionManager.sol";

/**
 * @title UniswapV3Strategy
 * @dev Strategy adapter for Uniswap V3 liquidity provision
 * 
 * Flow from diagram:
 * 1. Accept USDC deposits
 * 2. Swap half to DAI
 * 3. Provide liquidity to USDC-DAI pool
 * 4. Manage LP position NFTs
 */
contract UniswapV3Strategy is IStrategy {
    using SafeERC20 for IERC20;

    // Core tokens
    IERC20 public immutable _asset;      // Primary asset (USDC)
    IERC20 public immutable pairToken;   // Pair token (DAI)
    
    // Uniswap V3 contracts
    ISwapRouter public immutable swapRouter;
    INonfungiblePositionManager public immutable positionManager;
    
    // Pool configuration
    uint24 public immutable poolFee;     // Fee tier (e.g., 500 = 0.05%, 3000 = 0.3%, 10000 = 1%)
    int24 public immutable tickLower;    // Lower tick for LP range
    int24 public immutable tickUpper;    // Upper tick for LP range
    
    // Position tracking
    uint256 public positionTokenId;      // NFT token ID of the LP position
    uint128 public currentLiquidity;     // Current liquidity in the position
    
    // Deposited assets tracking
    uint256 public totalDeposited;
    
    // Owner
    address public immutable vault;
    
    // Events
    event PositionCreated(uint256 indexed tokenId, uint128 liquidity, uint256 amount0, uint256 amount1);
    event LiquidityIncreased(uint256 indexed tokenId, uint128 liquidity, uint256 amount0, uint256 amount1);
    event LiquidityDecreased(uint256 indexed tokenId, uint128 liquidity, uint256 amount0, uint256 amount1);
    event FeesCollected(uint256 indexed tokenId, uint256 amount0, uint256 amount1);
    event Swapped(address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut);

    constructor(
        IERC20 asset_,           // USDC
        IERC20 pairToken_,       // DAI
        ISwapRouter swapRouter_,
        INonfungiblePositionManager positionManager_,
        uint24 poolFee_,
        int24 tickLower_,
        int24 tickUpper_
    ) {
        _asset = asset_;
        pairToken = pairToken_;
        swapRouter = swapRouter_;
        positionManager = positionManager_;
        poolFee = poolFee_;
        tickLower = tickLower_;
        tickUpper = tickUpper_;
        vault = msg.sender;
        
        // Approve tokens for Uniswap contracts
        _asset.approve(address(swapRouter_), type(uint256).max);
        _asset.approve(address(positionManager_), type(uint256).max);
        pairToken_.approve(address(swapRouter_), type(uint256).max);
        pairToken_.approve(address(positionManager_), type(uint256).max);
    }
    
    modifier onlyVault() {
        require(msg.sender == vault, "Only vault");
        _;
    }

    function asset() external view returns (address) {
        return address(_asset);
    }

    /**
     * @dev Returns total assets in terms of the primary asset (USDC)
     * This includes both tokens in the LP position, converted to USDC equivalent
     */
    function totalAssets() external view returns (uint256) {
        if (positionTokenId == 0) {
            return _asset.balanceOf(address(this)) + totalDeposited;
        }
        
        // Get position info
        (,,,,,,, uint128 liquidity,,,,) = positionManager.positions(positionTokenId);
        
        if (liquidity == 0) {
            return _asset.balanceOf(address(this));
        }
        
        // Return tracked deposited amount plus any idle balance
        // In production, would calculate actual position value
        return totalDeposited + _asset.balanceOf(address(this));
    }

    /**
     * @dev Deposit assets into the strategy
     * 1. Accept USDC
     * 2. Swap half to DAI
     * 3. Add liquidity to Uniswap V3 position
     */
    function deposit(uint256 assets) external onlyVault {
        require(assets > 0, "Zero amount");
        
        // Transfer USDC from vault
        _asset.safeTransferFrom(msg.sender, address(this), assets);
        
        // Swap half to DAI
        uint256 halfAssets = assets / 2;
        uint256 pairAmount = _swapExactInput(address(_asset), address(pairToken), halfAssets);
        
        // Remaining USDC after swap
        uint256 assetAmount = assets - halfAssets;
        
        // Add liquidity
        if (positionTokenId == 0) {
            _createPosition(assetAmount, pairAmount);
        } else {
            _increaseLiquidity(assetAmount, pairAmount);
        }
        
        totalDeposited += assets;
    }

    /**
     * @dev Withdraw assets from the strategy
     * 1. Remove liquidity
     * 2. Swap DAI back to USDC
     * 3. Return USDC to vault
     */
    function withdraw(uint256 assets) external onlyVault {
        require(assets > 0, "Zero amount");
        require(positionTokenId != 0, "No position");
        
        // Calculate proportion to withdraw
        uint256 proportion = (assets * 1e18) / totalDeposited;
        if (proportion > 1e18) proportion = 1e18;
        
        uint128 liquidityToRemove = uint128((uint256(currentLiquidity) * proportion) / 1e18);
        
        // Decrease liquidity
        (uint256 amount0, uint256 amount1) = _decreaseLiquidity(liquidityToRemove);
        
        // Collect tokens
        _collectFees();
        
        // Determine which token is asset and which is pair
        (address token0, address token1) = _getToken0Token1();
        
        uint256 assetBalance;
        uint256 pairBalance;
        
        if (token0 == address(_asset)) {
            assetBalance = amount0;
            pairBalance = amount1;
        } else {
            assetBalance = amount1;
            pairBalance = amount0;
        }
        
        // Swap DAI back to USDC
        if (pairBalance > 0) {
            uint256 swappedAssets = _swapExactInput(address(pairToken), address(_asset), pairBalance);
            assetBalance += swappedAssets;
        }
        
        // Transfer USDC to vault
        uint256 toTransfer = assetBalance > assets ? assets : assetBalance;
        _asset.safeTransfer(msg.sender, toTransfer);
        
        // Update tracking
        totalDeposited = totalDeposited > assets ? totalDeposited - assets : 0;
    }

    /**
     * @dev Swap tokens using Uniswap V3
     */
    function _swapExactInput(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) internal returns (uint256 amountOut) {
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            fee: poolFee,
            recipient: address(this),
            deadline: block.timestamp,
            amountIn: amountIn,
            amountOutMinimum: 0, // In production, use price oracle for slippage protection
            sqrtPriceLimitX96: 0
        });
        
        amountOut = swapRouter.exactInputSingle(params);
        
        emit Swapped(tokenIn, tokenOut, amountIn, amountOut);
    }

    /**
     * @dev Create a new LP position
     */
    function _createPosition(uint256 amount0Desired, uint256 amount1Desired) internal {
        (address token0, address token1) = _getToken0Token1();
        
        // Order amounts based on token order
        (uint256 amt0, uint256 amt1) = token0 == address(_asset) 
            ? (amount0Desired, amount1Desired) 
            : (amount1Desired, amount0Desired);
        
        INonfungiblePositionManager.MintParams memory params = INonfungiblePositionManager.MintParams({
            token0: token0,
            token1: token1,
            fee: poolFee,
            tickLower: tickLower,
            tickUpper: tickUpper,
            amount0Desired: amt0,
            amount1Desired: amt1,
            amount0Min: 0, // In production, calculate min amounts
            amount1Min: 0,
            recipient: address(this),
            deadline: block.timestamp
        });
        
        (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1) = positionManager.mint(params);
        
        positionTokenId = tokenId;
        currentLiquidity = liquidity;
        
        emit PositionCreated(tokenId, liquidity, amount0, amount1);
    }

    /**
     * @dev Increase liquidity in existing position
     */
    function _increaseLiquidity(uint256 amount0Desired, uint256 amount1Desired) internal {
        (address token0,) = _getToken0Token1();
        
        // Order amounts based on token order
        (uint256 amt0, uint256 amt1) = token0 == address(_asset) 
            ? (amount0Desired, amount1Desired) 
            : (amount1Desired, amount0Desired);
        
        INonfungiblePositionManager.IncreaseLiquidityParams memory params = INonfungiblePositionManager.IncreaseLiquidityParams({
            tokenId: positionTokenId,
            amount0Desired: amt0,
            amount1Desired: amt1,
            amount0Min: 0,
            amount1Min: 0,
            deadline: block.timestamp
        });
        
        (uint128 liquidity, uint256 amount0, uint256 amount1) = positionManager.increaseLiquidity(params);
        
        currentLiquidity += liquidity;
        
        emit LiquidityIncreased(positionTokenId, liquidity, amount0, amount1);
    }

    /**
     * @dev Decrease liquidity from position
     */
    function _decreaseLiquidity(uint128 liquidity) internal returns (uint256 amount0, uint256 amount1) {
        INonfungiblePositionManager.DecreaseLiquidityParams memory params = INonfungiblePositionManager.DecreaseLiquidityParams({
            tokenId: positionTokenId,
            liquidity: liquidity,
            amount0Min: 0,
            amount1Min: 0,
            deadline: block.timestamp
        });
        
        (amount0, amount1) = positionManager.decreaseLiquidity(params);
        
        currentLiquidity -= liquidity;
        
        emit LiquidityDecreased(positionTokenId, liquidity, amount0, amount1);
    }

    /**
     * @dev Collect trading fees from position
     */
    function _collectFees() internal returns (uint256 amount0, uint256 amount1) {
        INonfungiblePositionManager.CollectParams memory params = INonfungiblePositionManager.CollectParams({
            tokenId: positionTokenId,
            recipient: address(this),
            amount0Max: type(uint128).max,
            amount1Max: type(uint128).max
        });
        
        (amount0, amount1) = positionManager.collect(params);
        
        emit FeesCollected(positionTokenId, amount0, amount1);
    }

    /**
     * @dev Get ordered token addresses (token0 < token1)
     */
    function _getToken0Token1() internal view returns (address token0, address token1) {
        if (address(_asset) < address(pairToken)) {
            token0 = address(_asset);
            token1 = address(pairToken);
        } else {
            token0 = address(pairToken);
            token1 = address(_asset);
        }
    }

    /**
     * @dev Collect and compound fees (admin function)
     */
    function collectAndReinvest() external onlyVault {
        require(positionTokenId != 0, "No position");
        
        (uint256 amount0, uint256 amount1) = _collectFees();
        
        if (amount0 > 0 || amount1 > 0) {
            (address token0,) = _getToken0Token1();
            
            uint256 assetAmount;
            uint256 pairAmount;
            
            if (token0 == address(_asset)) {
                assetAmount = amount0;
                pairAmount = amount1;
            } else {
                assetAmount = amount1;
                pairAmount = amount0;
            }
            
            if (assetAmount > 0 && pairAmount > 0) {
                _increaseLiquidity(assetAmount, pairAmount);
            }
        }
    }

    /**
     * @dev Emergency withdraw all liquidity
     */
    function emergencyWithdraw() external onlyVault {
        if (positionTokenId != 0 && currentLiquidity > 0) {
            _decreaseLiquidity(currentLiquidity);
            _collectFees();
            
            // Transfer all tokens to vault
            uint256 assetBal = _asset.balanceOf(address(this));
            uint256 pairBal = pairToken.balanceOf(address(this));
            
            if (assetBal > 0) {
                _asset.safeTransfer(vault, assetBal);
            }
            if (pairBal > 0) {
                pairToken.safeTransfer(vault, pairBal);
            }
        }
        
        totalDeposited = 0;
    }

    /**
     * @dev View function to get current position details
     */
    function getPositionInfo() external view returns (
        uint256 tokenId,
        uint128 liquidity,
        int24 lower,
        int24 upper
    ) {
        return (positionTokenId, currentLiquidity, tickLower, tickUpper);
    }
}

