// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
 * @title IBeefyVault
 * @dev Interface for Beefy Finance vault contracts
 */
interface IBeefyVault {
    function deposit(uint256 amount) external;
    function withdraw(uint256 shares) external;
    function balanceOf(address account) external view returns (uint256);
    function totalSupply() external view returns (uint256);
    function want() external view returns (address);
    function balance() external view returns (uint256);
}

