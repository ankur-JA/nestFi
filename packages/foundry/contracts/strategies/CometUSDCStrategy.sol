// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IStrategy} from "../interfaces/IStrategy.sol";
import {IComet} from "../interfaces/compound/IComet.sol";

/**
 * @title CometUSDCStrategy
 * @dev Adapter for Compound v3 Comet USDC market on Optimism
 */
contract CometUSDCStrategy is IStrategy {
    using SafeERC20 for IERC20;

    IERC20 public immutable _asset;
    IComet public immutable comet;

    constructor(IERC20 asset_, IComet comet_) {
        _asset = asset_;
        comet = comet_;
        _asset.approve(address(comet), type(uint256).max);
    }

    function asset() external view returns (address) { return address(_asset); }

    function totalAssets() external view returns (uint256) {
        // Comet maintains internal accounting; for simplicity this returns this contract's balanceOf in Comet terms.
        return comet.balanceOf(address(this));
    }

    function deposit(uint256 assets) external {
        _asset.safeTransferFrom(msg.sender, address(this), assets);
        comet.supply(address(_asset), assets);
    }

    function withdraw(uint256 assets) external {
        comet.withdraw(address(_asset), assets);
        IERC20(_asset).safeTransfer(msg.sender, assets);
    }
}


