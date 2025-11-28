// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IStrategy} from "../interfaces/IStrategy.sol";
import {IVelodromeGauge} from "../interfaces/velodrome/IVelodromeGauge.sol";
import {IERC4626} from "@openzeppelin/contracts/interfaces/IERC4626.sol";

/**
 * @title VelodromeStrategy
 * @dev Strategy adapter to deposit/withdraw assets into Velodrome Finance gauge
 * This strategy works with Velodrome LP token vaults (ERC4626) that are staked in gauges
 * The asset should be the underlying token, and lpVault should be an ERC4626 vault that accepts it
 */
contract VelodromeStrategy is IStrategy {
    using SafeERC20 for IERC20;

    IERC20 public immutable _asset;
    IERC4626 public immutable lpVault; // Velodrome LP token vault (ERC4626)
    IVelodromeGauge public immutable gauge;

    constructor(IERC20 asset_, IERC4626 lpVault_, IVelodromeGauge gauge_) {
        _asset = asset_;
        lpVault = lpVault_;
        gauge = gauge_;
        require(lpVault.asset() == address(asset_), "Asset mismatch");
        
        // Approve asset for LP vault
        _asset.approve(address(lpVault), type(uint256).max);
        // Approve LP vault shares for gauge
        IERC20(address(lpVault)).approve(address(gauge), type(uint256).max);
    }

    function asset() external view returns (address) {
        return address(_asset);
    }

    function totalAssets() external view returns (uint256) {
        // Get LP tokens staked in gauge
        uint256 stakedShares = gauge.balanceOf(address(this));
        if (stakedShares == 0) {
            return 0;
        }
        // Convert LP vault shares back to underlying assets
        return lpVault.convertToAssets(stakedShares);
    }

    function deposit(uint256 assets) external {
        _asset.safeTransferFrom(msg.sender, address(this), assets);
        // Deposit into LP vault to get shares
        uint256 shares = lpVault.deposit(assets, address(this));
        // Stake LP vault shares in gauge
        gauge.deposit(shares, address(this));
    }

    function withdraw(uint256 assets) external {
        // Calculate shares needed from LP vault
        uint256 sharesNeeded = lpVault.previewWithdraw(assets);
        // Ensure we don't withdraw more than we have staked
        uint256 stakedShares = gauge.balanceOf(address(this));
        if (sharesNeeded > stakedShares) {
            sharesNeeded = stakedShares;
        }
        
        // Unstake from gauge
        gauge.withdraw(sharesNeeded);
        // Withdraw from LP vault to this contract first
        lpVault.redeem(sharesNeeded, address(this), address(this));
        // Transfer assets to caller
        _asset.safeTransfer(msg.sender, _asset.balanceOf(address(this)));
    }
}

