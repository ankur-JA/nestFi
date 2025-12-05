// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockERC20
 * @dev Mock ERC20 token for local testing
 */
contract MockERC20 is ERC20 {
    uint8 private _decimals;

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_
    ) ERC20(name, symbol) {
        _decimals = decimals_;
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        _burn(from, amount);
    }
}

/**
 * @title MockUSDC
 * @dev Mock USDC with 6 decimals
 */
contract MockUSDC is MockERC20 {
    constructor() MockERC20("USD Coin", "USDC", 6) {}
}

/**
 * @title MockDAI
 * @dev Mock DAI with 18 decimals
 */
contract MockDAI is MockERC20 {
    constructor() MockERC20("Dai Stablecoin", "DAI", 18) {}
}
