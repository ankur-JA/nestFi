// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {ERC4626Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC4626Upgradeable.sol"; // 2
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol"; // 1
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol"; // 3
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol"; // 4
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol"; // 5
import {IPermit2} from "./interfaces/IPermit2.sol"; 
import {IStrategy} from "./interfaces/IStrategy.sol";

/**
 * @title GroupVault
 * @dev ERC-4626 vault with allowlist and caps
*/
contract GroupVault is 
    Initializable,
    ERC4626Upgradeable, 
    OwnableUpgradeable,
    PausableUpgradeable, 
    ReentrancyGuardUpgradeable 
{
    using SafeERC20 for IERC20;

    // Permit2 for off-chain approvals
    IPermit2 public permit2;
    
    // Allowlist management
    mapping(address => bool) public allowlist;
    bool public allowlistEnabled;
    
    // Deposit limits
    uint256 public depositCap;
    uint256 public minDeposit;
    
    // Strategy
    IStrategy public strategy; // optional external strategy that holds vault assets
    
    // Events
    event AllowlistUpdated(address indexed user, bool allowed);
    event DepositCapSet(uint256 cap);
    event MinDepositSet(uint256 minDeposit);
    event StrategySet(address indexed strategy);
    event Invested(address indexed strategy, uint256 assets);
    event Divested(address indexed strategy, uint256 assets);
    event Harvested(address indexed strategy, uint256 yieldAssets);

    // Custom errors
    error NotAllowed();
    error DepositCapExceeded();
    error MinDepositNotMet();

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        IERC20 _asset,
        address _admin,
        string memory _name,
        string memory _symbol,
        bool _allowlistEnabled,
        uint256 _depositCap,
        uint256 _minDeposit,
        address _permit2
    ) public initializer {
        require(address(_asset) != address(0), "Invalid asset");
        require(_admin != address(0), "Invalid admin");
        require(_permit2 != address(0), "Invalid permit2");
        
        __ERC4626_init(_asset);
        __ERC20_init(_name, _symbol);
        __Ownable_init(_admin);
        __Pausable_init();
        __ReentrancyGuard_init();
        
        permit2 = IPermit2(_permit2);
        allowlistEnabled = _allowlistEnabled;
        depositCap = _depositCap;
        minDeposit = _minDeposit;
        
        // Add admin to allowlist if enabled
        if (_allowlistEnabled) {
            allowlist[_admin] = true;
        }
    }

    // Modifiers
    modifier onlyAllowed(address user) {
        if (allowlistEnabled && !allowlist[user]) {
            revert NotAllowed();
        }
        _;
    }

    /**
     * @dev Set an optional strategy address to deploy assets into
     */
    function setStrategy(address _strategy) external onlyOwner {
        strategy = IStrategy(_strategy);
        require(strategy.asset() == address(asset()), "Mismatched asset");
        emit StrategySet(_strategy);
    }

    /**
     * @dev Invest assets from the vault into the strategy (simple transfer)
     */
    function invest(uint256 assets) external onlyOwner whenNotPaused {
        require(address(strategy) != address(0), "No strategy");
        require(assets > 0, "Zero");
        IERC20(asset()).approve(address(strategy), assets);
        strategy.deposit(assets);
        emit Invested(address(strategy), assets);
    }

    /**
     * @dev Divest assets from the strategy back to the vault
     * Strategy must implement a function to transfer assets back to the caller/vault. For mock strategy, it is a pull via transfer.
     */
    function divest(uint256 assets) external onlyOwner whenNotPaused {
        require(address(strategy) != address(0), "No strategy");
        require(assets > 0, "Zero");
        strategy.withdraw(assets);
        emit Divested(address(strategy), assets);
    }

    /**
     * @dev Harvest strategy yield (mock event)
     */
    function harvest(uint256 yieldAssets) external onlyOwner whenNotPaused {
        // In a real strategy, this would call the strategy's harvest and transfer proceeds
        emit Harvested(address(strategy), yieldAssets);
    }

    // Admin functions
    function setAllowlist(address user, bool allowed) external onlyOwner {
        allowlist[user] = allowed;
        emit AllowlistUpdated(user, allowed);
    }

    function setDepositCap(uint256 cap) external onlyOwner {
        depositCap = cap;
        emit DepositCapSet(cap);
    }

    function setMinDeposit(uint256 min) external onlyOwner {
        minDeposit = min;
        emit MinDepositSet(min);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // Internal functions
    function _enforceDepositPolicies(uint256 assets) internal view {
        if (depositCap > 0 && totalAssets() + assets > depositCap) {
            revert DepositCapExceeded();
        }
        if (minDeposit > 0 && assets < minDeposit) {
            revert MinDepositNotMet();
        }
    }

    // Override deposit function to add policies
    function deposit(uint256 assets, address receiver) public virtual override whenNotPaused onlyAllowed(receiver) returns (uint256 shares) {
        _enforceDepositPolicies(assets);
        return super.deposit(assets, receiver);
    }

    // Override mint function to add policies
    function mint(uint256 shares, address receiver) public virtual override whenNotPaused onlyAllowed(receiver) returns (uint256 assets) {
        assets = convertToAssets(shares);
        _enforceDepositPolicies(assets);
        return super.mint(shares, receiver);
    }

    // Permit2 integration (existing functionality)
    function depositWithPermit2(
        uint256 assets,
        address receiver,
        IPermit2.PermitSingle calldata p,
        IPermit2.Signature calldata sig
    ) external nonReentrant whenNotPaused onlyAllowed(receiver) returns (uint256 shares) {
        require(assets > 0, "Zero");
        require(p.token == address(asset()), "Wrong token");
        require(p.spender == address(this), "Spender!=vault");
        _enforceDepositPolicies(assets);
        
        permit2.permit(msg.sender, p, sig);
        permit2.transferFrom(msg.sender, address(this), uint160(assets), address(asset()));
        
        shares = convertToShares(assets);
        require(shares > 0, "Zero shares");
        _mint(receiver, shares);
        
        emit Deposit(msg.sender, receiver, assets, shares);
    }

    // View functions
    function isAllowed(address user) external view returns (bool) {
        return !allowlistEnabled || allowlist[user];
    }

    /**
     * @dev Returns the total amount of assets in the vault
     */
    function totalAssets() public view override returns (uint256) {
        uint256 inVault = IERC20(asset()).balanceOf(address(this));
        uint256 inStrategy = address(strategy) == address(0) ? 0 : strategy.totalAssets();
        return inVault + inStrategy;
    }
}
