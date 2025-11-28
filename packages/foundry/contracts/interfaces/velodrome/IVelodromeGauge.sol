// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
 * @title IVelodromeGauge
 * @dev Interface for Velodrome Finance gauge contracts (for staking LP tokens)
 */
interface IVelodromeGauge {
    function deposit(uint256 amount, address to) external;
    function withdraw(uint256 amount) external;
    function balanceOf(address account) external view returns (uint256);
    function totalSupply() external view returns (uint256);
}

