// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {ERC4626Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC4626Upgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

import {IPermit2} from "./interfaces/IPermit2.sol";

/// @title GroupVault (clonable ERC-4626 vault)
/// @notice One-asset vault with allowlist + caps + gasless deposits via Permit2.
contract GroupVault is
  Initializable,
  ERC4626Upgradeable,
  OwnableUpgradeable,
  PausableUpgradeable,
  ReentrancyGuardUpgradeable
{
  using SafeERC20 for IERC20;

  IPermit2 public permit2;
  bool public allowlistEnabled;
  mapping(address => bool) public isAllowed;
  uint256 public depositCap;   
  uint256 public minDeposit;   

  event AllowlistSet(address indexed user, bool allowed);
  event AllowlistEnabled(bool enabled);
  event DepositCapSet(uint256 cap);
  event MinDepositSet(uint256 minDeposit);

  /// @dev initializer used by EIP-1167 clones
  function initialize(
    IERC20 asset_,
    address admin_,
    string memory name_,
    string memory symbol_,
    bool allowlistEnabled_,
    uint256 depositCap_,
    uint256 minDeposit_,
    address permit2_
  ) external initializer {
    __ERC20_init(name_, symbol_);
    __ERC4626_init(asset_);
    __Ownable_init(admin_);
    __Pausable_init();
    __ReentrancyGuard_init();

    permit2 = IPermit2(permit2_);
    allowlistEnabled = allowlistEnabled_;
    if (allowlistEnabled_) { isAllowed[admin_] = true; emit AllowlistSet(admin_, true); }
    depositCap = depositCap_;
    minDeposit = minDeposit_;
  }

  // ---------- Admin ----------
  function setAllowlist(address user, bool allowed) external onlyOwner {
    isAllowed[user] = allowed; emit AllowlistSet(user, allowed);
  }
  function setAllowlistEnabled(bool enabled) external onlyOwner {
    allowlistEnabled = enabled; emit AllowlistEnabled(enabled);
  }
  function setDepositCap(uint256 cap) external onlyOwner { depositCap = cap; emit DepositCapSet(cap); }
  function setMinDeposit(uint256 m) external onlyOwner { minDeposit = m; emit MinDepositSet(m); }
  function pause() external onlyOwner { _pause(); }  function unpause() external onlyOwner { _unpause(); }

  // ---------- Policy helpers ----------
  modifier onlyAllowed(address receiver) {
    if (allowlistEnabled) require(isAllowed[receiver], "Not allowlisted");
    _;
  }
  function _enforceDepositPolicies(uint256 assets) internal view {
    if (minDeposit > 0) require(assets >= minDeposit, "Below min");
    if (depositCap > 0) require(totalAssets() + assets <= depositCap, "Cap");
  }

  // ---------- Gasless deposit via Permit2 ----------
  /// @notice owner signs off-chain; relayer pays gas to submit.
  function depositWithPermit2(
    address owner,
    uint256 assets,
    address receiver,
    IPermit2.PermitSingle calldata p,
    IPermit2.Signature calldata sig
  ) external nonReentrant whenNotPaused onlyAllowed(receiver) returns (uint256 shares) {
    require(assets > 0, "Zero");
    require(p.token == address(asset()), "Wrong token");
    require(p.spender == address(this), "Spender!=vault");
    _enforceDepositPolicies(assets);

    // 1) consume permit
    permit2.permit(owner, p, sig);

    // 2) pull tokens into the vault
    permit2.transferFrom(owner, address(this), uint160(assets), address(asset()));

    // 3) mint shares (ERC-4626 math)
    shares = convertToShares(assets);
    require(shares > 0, "Zero shares");
    _mint(receiver, shares);
  }

  // If you add external adapters later, add their balances here.
  function totalAssets() public view override returns (uint256) {
    return IERC20(asset()).balanceOf(address(this));
  }
}
