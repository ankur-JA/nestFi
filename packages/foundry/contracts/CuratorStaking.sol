SPDX-License-Identifier: MIT

pragma solidity ^0.8.23;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";


contract CuratorStaking {
    using SafeERC20 for IERC20;

    // ============ STATE VARIABLES ============
    IERC20 public immutable usdc;

    mapping (address => uint256) public stakedAmounts;

    // ============ CONSTRUCTOR ============
    constructor (address _usdc) {
        usdc = IERC20(_usdc);
    }

    // ============ FUNCTIONS ============
    function stake(uint256 amount) public {
        usdc.safeTransferFrom(msg.sender, address(this), amount);
        stakedAmounts[msg.sender] += amount;
    }

    function unstake(uint256 amount) public {
        require(stakedAmounts[msg.sender] >= amount, "Not enough staked");
        stakedAmounts[msg.sender] -= amount;
        usdc.safeTransfer(msg.sender, amount);
    }
}