// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {GroupVault} from "./GroupVault.sol";

contract VaultFactory {
  address public immutable implementation;
  address public immutable permit2;

  event VaultCreated(address indexed vault, address indexed asset, address indexed admin, string name, string symbol);

  constructor(address implementation_, address permit2_) {
    require(implementation_ != address(0) && permit2_ != address(0), "zero");
    implementation = implementation_;
    permit2 = permit2_;
  }

  function createVault(
    IERC20 asset,
    address admin,
    string calldata name,
    string calldata symbol,
    bool allowlistEnabled,
    uint256 depositCap,
    uint256 minDeposit
  ) external returns (address vault) {
    vault = Clones.clone(implementation);
    GroupVault(vault).initialize(asset, admin, name, symbol, allowlistEnabled, depositCap, minDeposit, permit2);
    emit VaultCreated(vault, address(asset), admin, name, symbol);
  }
}
