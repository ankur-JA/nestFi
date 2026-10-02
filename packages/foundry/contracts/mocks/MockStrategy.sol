// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IStrategy} from "../interfaces/IStrategy.sol";

/**
 * @dev Local-dev strategy that simply holds the asset.
 *      Supports a `simulateYield` method so curators can test accrual flows.
 */
contract MockStrategy is IStrategy {
    using SafeERC20 for IERC20;

    IERC20 public immutable _asset;
    address public immutable vault;

    constructor(IERC20 asset_, address vault_) {
        _asset = asset_;
        vault = vault_;
    }

    function asset() external view returns (address) {
        return address(_asset);
    }

    function totalAssets() external view returns (uint256) {
        return _asset.balanceOf(address(this));
    }

    function deposit(uint256 assets) external {
        _asset.safeTransferFrom(msg.sender, address(this), assets);
    }

    function withdraw(uint256 assets) external {
        _asset.safeTransfer(msg.sender, assets);
    }

    /// @dev Anyone can mint "yield" into the strategy for testing P&L.
    function simulateYield(uint256 /*amount*/) external pure {
        revert("Use test to mint tokens directly into strategy");
    }
}
