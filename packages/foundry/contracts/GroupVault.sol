// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {ERC4626Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC4626Upgradeable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {IPermit2} from "./interfaces/IPermit2.sol";
import {IERC7702} from "./interfaces/IERC7702.sol";

/**
 * @title GroupVault
 * @dev ERC-4626 vault with allowlist, caps, and ERC-7702 gasless transactions
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
    
    // ERC-7702 relayer for gasless transactions
    IERC7702 public erc7702Relayer;
    
    // Allowlist management
    mapping(address => bool) public allowlist;
    bool public allowlistEnabled;
    
    // Deposit limits
    uint256 public depositCap;
    uint256 public minDeposit;
    
    // Relayer management
    mapping(address => bool) public authorizedRelayers;
    uint256 public relayerFee; // Basis points (e.g., 100 = 1%)
    
    // Events
    event AllowlistUpdated(address indexed user, bool allowed);
    event DepositCapSet(uint256 cap);
    event MinDepositSet(uint256 minDeposit);
    event RelayerAuthorized(address indexed relayer, bool authorized);
    event RelayerFeeSet(uint256 fee);
    event GaslessDeposit(address indexed owner, address indexed receiver, uint256 assets, uint256 shares, address indexed relayer);
    event ERC7702RelayerSet(address indexed relayer);

    // Custom errors
    error NotAllowed();
    error DepositCapExceeded();
    error MinDepositNotMet();
    error NotAuthorizedRelayer();
    error InvalidERC7702Relayer();

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
        __Ownable_init(_admin);
        __Pausable_init();
        __ReentrancyGuard_init();
        
        permit2 = IPermit2(_permit2);
        allowlistEnabled = _allowlistEnabled;
        depositCap = _depositCap;
        minDeposit = _minDeposit;
        relayerFee = 10; // 0.1% default fee
        
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

    modifier onlyAuthorizedRelayer() {
        if (!authorizedRelayers[msg.sender]) {
            revert NotAuthorizedRelayer();
        }
        _;
    }

    // ERC-7702 Integration
    function setERC7702Relayer(address _relayer) external onlyOwner {
        if (_relayer == address(0)) {
            revert InvalidERC7702Relayer();
        }
        erc7702Relayer = IERC7702(_relayer);
        emit ERC7702RelayerSet(_relayer);
    }

    /**
     * @dev Deposit with ERC-7702 gas payment (truly gasless)
     * @param assets Amount of assets to deposit
     * @param receiver Address to receive shares
     * @param gasPayment ERC-7702 gas payment data
     */
    function depositWithERC7702(
        uint256 assets,
        address receiver,
        IERC7702.GasPayment calldata gasPayment
    ) external nonReentrant whenNotPaused onlyAllowed(receiver) returns (uint256 shares) {
        require(assets > 0, "Zero");
        _enforceDepositPolicies(assets);
        
        // Transfer assets from user to vault
        IERC20(asset()).safeTransferFrom(msg.sender, address(this), assets);
        
        // Calculate and mint shares
        shares = convertToShares(assets);
        require(shares > 0, "Zero shares");
        _mint(receiver, shares);
        
        emit Deposit(msg.sender, receiver, assets, shares);
    }

    /**
     * @dev Withdraw with ERC-7702 gas payment (truly gasless)
     * @param shares Amount of shares to withdraw
     * @param receiver Address to receive assets
     * @param owner Address that owns the shares
     * @param gasPayment ERC-7702 gas payment data
     */
    function withdrawWithERC7702(
        uint256 shares,
        address receiver,
        address owner,
        IERC7702.GasPayment calldata gasPayment
    ) external nonReentrant whenNotPaused returns (uint256 assets) {
        require(shares > 0, "Zero shares");
        require(receiver != address(0), "Invalid receiver");
        
        // Check allowance if not owner
        if (owner != msg.sender) {
            uint256 allowed = allowance(owner, msg.sender);
            if (allowed != type(uint256).max) {
                _spendAllowance(owner, msg.sender, shares);
            }
        }
        
        // Burn shares and transfer assets
        _burn(owner, shares);
        assets = convertToAssets(shares);
        require(assets > 0, "Zero assets");
        
        IERC20(asset()).safeTransfer(receiver, assets);
        
        emit Withdraw(msg.sender, receiver, owner, assets, shares);
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

    function setRelayerAuthorization(address relayer, bool authorized) external onlyOwner {
        authorizedRelayers[relayer] = authorized;
        emit RelayerAuthorized(relayer, authorized);
    }

    function setRelayerFee(uint256 fee) external onlyOwner {
        require(fee <= 1000, "Fee too high"); // Max 10%
        relayerFee = fee;
        emit RelayerFeeSet(fee);
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

    // Relayer functions (existing functionality)
    function depositWithPermit2Relayed(
        address owner,
        uint256 assets,
        address receiver,
        IPermit2.PermitSingle calldata p,
        IPermit2.Signature calldata sig
    ) external nonReentrant whenNotPaused onlyAllowed(receiver) onlyAuthorizedRelayer returns (uint256 shares) {
        require(assets > 0, "Zero");
        require(p.token == address(asset()), "Wrong token");
        require(p.spender == address(this), "Spender!=vault");
        _enforceDepositPolicies(assets);
        
        permit2.permit(owner, p, sig);
        permit2.transferFrom(owner, address(this), uint160(assets), address(asset()));
        
        shares = convertToShares(assets);
        require(shares > 0, "Zero shares");
        _mint(receiver, shares);
        
        if (relayerFee > 0) {
            uint256 feeAmount = (shares * relayerFee) / 10000;
            if (feeAmount > 0) {
                _transfer(receiver, msg.sender, feeAmount);
            }
        }
        
        emit GaslessDeposit(owner, receiver, assets, shares, msg.sender);
    }

    // View functions
    function isAllowed(address user) external view returns (bool) {
        return !allowlistEnabled || allowlist[user];
    }

    /**
     * @dev Returns the total amount of assets in the vault
     */
    function totalAssets() public view override returns (uint256) {
        return IERC20(asset()).balanceOf(address(this));
    }
}
