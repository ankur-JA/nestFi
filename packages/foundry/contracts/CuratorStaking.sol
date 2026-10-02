// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title CuratorStaking
 * @dev Holds USDC collateral posted by curators. Required before creating a vault.
 *      The VaultFactory can pull stake on a curator's behalf via `stakeFor` once the
 *      curator has approved this contract.
 */
contract CuratorStaking {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdc;
    address public factory;
    address public immutable deployer;

    mapping(address => uint256) public stakedAmounts;

    event Staked(address indexed curator, uint256 amount);
    event Unstaked(address indexed curator, uint256 amount);
    event FactorySet(address indexed factory);

    error NotFactory();
    error NotDeployer();
    error FactoryAlreadySet();
    error InsufficientStake();

    constructor(address _usdc) {
        require(_usdc != address(0), "Invalid usdc");
        usdc = IERC20(_usdc);
        deployer = msg.sender;
    }

    /// @dev One-time wiring: set the authorized factory after it's deployed.
    function setFactory(address _factory) external {
        if (msg.sender != deployer) revert NotDeployer();
        if (factory != address(0)) revert FactoryAlreadySet();
        require(_factory != address(0), "Zero factory");
        factory = _factory;
        emit FactorySet(_factory);
    }

    /// @dev Curator stakes directly.
    function stake(uint256 amount) external {
        _stake(msg.sender, amount);
    }

    /// @dev Factory stakes on behalf of curator. Curator must have approved this contract.
    function stakeFor(address curator, uint256 amount) external {
        if (msg.sender != factory) revert NotFactory();
        _stake(curator, amount);
    }

    function _stake(address curator, uint256 amount) internal {
        require(amount > 0, "Zero stake");
        usdc.safeTransferFrom(curator, address(this), amount);
        stakedAmounts[curator] += amount;
        emit Staked(curator, amount);
    }

    function unstake(uint256 amount) external {
        if (stakedAmounts[msg.sender] < amount) revert InsufficientStake();
        stakedAmounts[msg.sender] -= amount;
        usdc.safeTransfer(msg.sender, amount);
        emit Unstaked(msg.sender, amount);
    }

    function stakeOf(address curator) external view returns (uint256) {
        return stakedAmounts[curator];
    }
}
