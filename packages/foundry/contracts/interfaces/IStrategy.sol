// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface IStrategy {
    function asset() external view returns (address);
    function totalAssets() external view returns (uint256);
    function deposit(uint256 assets) external;
    function withdraw(uint256 assets) external;
}


