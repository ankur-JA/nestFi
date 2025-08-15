// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IStrategy} from "../interfaces/IStrategy.sol";
import {IPool} from "../interfaces/aave/IPool.sol";

/**
 * @title AaveV3Strategy
 * @dev Minimal adapter to deposit/withdraw a single asset into Aave V3 Pool
 */
contract AaveV3Strategy is IStrategy {
    using SafeERC20 for IERC20;

    IERC20 public immutable _asset;
    IPool public immutable pool;

    constructor(IERC20 asset_, IPool pool_) {
        _asset = asset_;
        pool = pool_;
        _asset.approve(address(pool), type(uint256).max);
    }

    function asset() external view returns (address) { return address(_asset); }

    function totalAssets() external view returns (uint256) {
        // For simplicity, just return this contract's balance;
        // A production version would query aToken balance via DataProvider
        return _asset.balanceOf(address(this));
    }

    function deposit(uint256 assets) external {
        _asset.safeTransferFrom(msg.sender, address(this), assets);
        pool.supply(address(_asset), assets, address(this), 0);
    }

    function withdraw(uint256 assets) external {
        // Withdraw to caller (expected to be the vault)
        pool.withdraw(address(_asset), assets, msg.sender);
    }
}


