// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IStrategy} from "../interfaces/IStrategy.sol";

/**
 * @title MockStrategy
 * @dev Mock strategy for local testing
 * Simulates a yield-generating strategy with configurable APY
 */
contract MockStrategy is IStrategy {
    using SafeERC20 for IERC20;

    IERC20 public immutable _asset;
    string public name;
    
    uint256 public depositedAssets;
    uint256 public mockYield;
    
    // APY in basis points (100 = 1%)
    uint256 public apyBps;

    event Deposited(address indexed from, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);
    event YieldAdded(uint256 amount);

    constructor(IERC20 asset_, string memory name_, uint256 apyBps_) {
        _asset = asset_;
        name = name_;
        apyBps = apyBps_;
    }

    function asset() external view override returns (address) {
        return address(_asset);
    }

    function totalAssets() external view override returns (uint256) {
        return depositedAssets + mockYield;
    }

    function deposit(uint256 assets) external override {
        require(assets > 0, "Zero deposit");
        _asset.safeTransferFrom(msg.sender, address(this), assets);
        depositedAssets += assets;
        emit Deposited(msg.sender, assets);
    }

    function withdraw(uint256 assets) external override {
        require(assets > 0, "Zero withdraw");
        require(assets <= depositedAssets + mockYield, "Insufficient assets");
        
        // Withdraw from yield first, then principal
        if (assets <= mockYield) {
            mockYield -= assets;
        } else {
            uint256 fromPrincipal = assets - mockYield;
            mockYield = 0;
            depositedAssets -= fromPrincipal;
        }
        
        _asset.safeTransfer(msg.sender, assets);
        emit Withdrawn(msg.sender, assets);
    }

    /**
     * @dev Simulate yield generation (for testing)
     */
    function simulateYield() external {
        // Add yield based on APY (simplified - per call, not time-based)
        uint256 yield = (depositedAssets * apyBps) / 10000;
        mockYield += yield;
        emit YieldAdded(yield);
    }

    /**
     * @dev Add mock yield directly (for testing)
     */
    function addMockYield(uint256 amount) external {
        // Mint tokens to cover yield
        (bool success,) = address(_asset).call(
            abi.encodeWithSignature("mint(address,uint256)", address(this), amount)
        );
        if (success) {
            mockYield += amount;
            emit YieldAdded(amount);
        }
    }

    /**
     * @dev Set APY (for testing)
     */
    function setApy(uint256 newApyBps) external {
        apyBps = newApyBps;
    }
}
