// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ISwapRouter} from "../interfaces/uniswap/ISwapRouter.sol";

/**
 * @title MockSwapRouter
 * @dev Mock Uniswap V3 SwapRouter for local testing
 * Simulates swaps with a fixed 1:1 rate (adjusted for decimals)
 */
contract MockSwapRouter is ISwapRouter {
    using SafeERC20 for IERC20;

    // Price mappings: tokenIn => tokenOut => price (in basis points, 10000 = 1:1)
    mapping(address => mapping(address => uint256)) public prices;
    
    // Decimal mappings
    mapping(address => uint8) public decimals;

    event MockSwap(
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );

    /**
     * @dev Set price for a token pair
     * @param tokenIn Input token
     * @param tokenOut Output token
     * @param price Price in basis points (10000 = 1:1)
     */
    function setPrice(address tokenIn, address tokenOut, uint256 price) external {
        prices[tokenIn][tokenOut] = price;
    }

    /**
     * @dev Set decimals for a token
     */
    function setDecimals(address token, uint8 dec) external {
        decimals[token] = dec;
    }

    function exactInputSingle(ExactInputSingleParams calldata params)
        external
        payable
        override
        returns (uint256 amountOut)
    {
        // Transfer input tokens from sender
        IERC20(params.tokenIn).safeTransferFrom(msg.sender, address(this), params.amountIn);

        // Calculate output amount
        uint256 price = prices[params.tokenIn][params.tokenOut];
        if (price == 0) {
            price = 10000; // Default 1:1
        }

        // Adjust for decimals
        uint8 decIn = decimals[params.tokenIn];
        uint8 decOut = decimals[params.tokenOut];
        if (decIn == 0) decIn = 18;
        if (decOut == 0) decOut = 18;

        if (decOut >= decIn) {
            amountOut = (params.amountIn * price * (10 ** (decOut - decIn))) / 10000;
        } else {
            amountOut = (params.amountIn * price) / (10 ** (decIn - decOut)) / 10000;
        }

        require(amountOut >= params.amountOutMinimum, "Too little received");

        // Mint output tokens to recipient (mock behavior)
        // In real testing, you'd need to have tokens in the router
        // For simplicity, we'll try to transfer what we have or mint if it's a mock token
        
        // Try to transfer existing balance first
        uint256 balance = IERC20(params.tokenOut).balanceOf(address(this));
        if (balance >= amountOut) {
            IERC20(params.tokenOut).safeTransfer(params.recipient, amountOut);
        } else {
            // Try to mint (only works with MockERC20)
            (bool success,) = params.tokenOut.call(
                abi.encodeWithSignature("mint(address,uint256)", params.recipient, amountOut)
            );
            require(success, "Mock: cannot provide output tokens");
        }

        emit MockSwap(params.tokenIn, params.tokenOut, params.amountIn, amountOut);
    }

    function exactInput(ExactInputParams calldata params)
        external
        payable
        override
        returns (uint256 amountOut)
    {
        // Simplified - not implementing multi-hop for mock
        revert("Mock: multi-hop not supported");
    }

    function exactOutputSingle(ExactOutputSingleParams calldata params)
        external
        payable
        override
        returns (uint256 amountIn)
    {
        // Simplified implementation
        revert("Mock: exactOutputSingle not supported");
    }

    function exactOutput(ExactOutputParams calldata params)
        external
        payable
        override
        returns (uint256 amountIn)
    {
        revert("Mock: exactOutput not supported");
    }

    /**
     * @dev Fund the router with tokens for swaps
     */
    function fund(address token, uint256 amount) external {
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
    }
}
