// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IStrategy} from "../interfaces/IStrategy.sol";
import {INonfungiblePositionManager} from "../interfaces/uniswap/INonfungiblePositionManager.sol";

/**
 * @title UniswapV3LPStrategy
 * @dev Minimal LP strategy using a single position; vault provides token0 (asset) and expects token1 pre-funded
 */
contract UniswapV3LPStrategy is IStrategy {
    using SafeERC20 for IERC20;

    IERC20 public immutable _asset;
    IERC20 public immutable token1;
    INonfungiblePositionManager public immutable nfpm;
    uint24 public immutable fee;
    int24 public immutable tickLower;
    int24 public immutable tickUpper;

    uint256 public tokenId;

    constructor(
        IERC20 asset_,
        IERC20 token1_,
        INonfungiblePositionManager nfpm_,
        uint24 fee_,
        int24 tickLower_,
        int24 tickUpper_
    ) {
        _asset = asset_;
        token1 = token1_;
        nfpm = nfpm_;
        fee = fee_;
        tickLower = tickLower_;
        tickUpper = tickUpper_;
        _asset.approve(address(nfpm), type(uint256).max);
        token1.approve(address(nfpm), type(uint256).max);
    }

    function asset() external view returns (address) { return address(_asset); }

    function totalAssets() external view returns (uint256) {
        // Approximate by returning idle asset balance; full valuation requires on-chain pricing
        return _asset.balanceOf(address(this));
    }

    function deposit(uint256 amount0) external {
        // Expect caller (vault) transferred amount0 and enough token1 beforehand when minting
        if (tokenId == 0) {
            (, , uint256 a0, uint256 a1) = nfpm.mint(
                INonfungiblePositionManager.MintParams({
                    token0: address(_asset),
                    token1: address(token1),
                    fee: fee,
                    tickLower: tickLower,
                    tickUpper: tickUpper,
                    amount0Desired: amount0,
                    amount1Desired: token1.balanceOf(address(this)),
                    amount0Min: 0,
                    amount1Min: 0,
                    recipient: address(this),
                    deadline: block.timestamp
                })
            );
            require(a0 > 0 || a1 > 0, "no liquidity");
        } else {
            nfpm.increaseLiquidity(tokenId, amount0, token1.balanceOf(address(this)), 0, 0, block.timestamp);
        }
    }

    function withdraw(uint256 /*assets*/) external {
        require(tokenId != 0, "no position");
        // For simplicity, just collect fees to caller (vault); liquidity management out of scope
        nfpm.collect(msg.sender, tokenId, type(uint128).max, type(uint128).max);
    }
}


