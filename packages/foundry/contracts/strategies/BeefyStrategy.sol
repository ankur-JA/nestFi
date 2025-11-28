// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IStrategy} from "../interfaces/IStrategy.sol";
import {IBeefyVault} from "../interfaces/beefy/IBeefyVault.sol";

/**
 * @title BeefyStrategy
 * @dev Strategy adapter to deposit/withdraw assets into Beefy Finance vault
 */
contract BeefyStrategy is IStrategy {
    using SafeERC20 for IERC20;

    IERC20 public immutable _asset;
    IBeefyVault public immutable vault;

    constructor(IERC20 asset_, IBeefyVault vault_) {
        _asset = asset_;
        vault = vault_;
        require(vault.want() == address(asset_), "Asset mismatch");
        _asset.approve(address(vault), type(uint256).max);
    }

    function asset() external view returns (address) {
        return address(_asset);
    }

    function totalAssets() external view returns (uint256) {
        // Calculate assets based on vault shares and price per share
        uint256 shares = vault.balanceOf(address(this));
        if (shares == 0 || vault.totalSupply() == 0) {
            return 0;
        }
        // Price per share = total assets / total shares
        uint256 totalAssetsInVault = vault.balance();
        return (shares * totalAssetsInVault) / vault.totalSupply();
    }

    function deposit(uint256 assets) external {
        _asset.safeTransferFrom(msg.sender, address(this), assets);
        vault.deposit(assets);
    }

    function withdraw(uint256 assets) external {
        // Calculate shares needed to withdraw the requested assets
        uint256 totalAssetsInVault = vault.balance();
        uint256 totalShares = vault.totalSupply();
        
        if (totalAssetsInVault == 0 || totalShares == 0) {
            return;
        }
        
        // Calculate shares needed: shares = (assets * totalShares) / totalAssetsInVault
        uint256 shares = (assets * totalShares) / totalAssetsInVault;
        // Add 1 to handle rounding
        if ((assets * totalShares) % totalAssetsInVault != 0) {
            shares += 1;
        }
        
        // Ensure we don't withdraw more than we have
        uint256 balance = vault.balanceOf(address(this));
        if (shares > balance) {
            shares = balance;
        }
        
        vault.withdraw(shares);
        _asset.safeTransfer(msg.sender, _asset.balanceOf(address(this)));
    }
}

