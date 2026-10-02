// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {ERC4626Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC4626Upgradeable.sol";
import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {IERC20, IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {IPermit2} from "./interfaces/IPermit2.sol";
import {IStrategy} from "./interfaces/IStrategy.sol";

/**
 * @title GroupVault
 * @dev ERC-4626 vault that invests directly in DeFi strategies.
 *
 *      Design (post-manager refactor):
 *      - This contract holds the underlying asset and shares accounting.
 *      - The curator (owner) registers strategies and invests/divests directly.
 *      - An idle buffer (bps of totalAssets) must be preserved as liquid balance
 *        so investors can withdraw without a divest step.
 *      - If a withdrawal exceeds idle balance, it reverts; the curator must
 *        divest first (keeps strategy slippage/MEV out of the user path).
 */
contract GroupVault is
    Initializable,
    ERC4626Upgradeable,
    OwnableUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable
{
    using SafeERC20 for IERC20;

    // ============ Constants ============
    uint256 public constant BPS_DENOMINATOR = 10_000;
    uint256 public constant MIN_IDLE_BPS = 800;   // 8%
    uint256 public constant MAX_IDLE_BPS = 1_500; // 15%

    // ============ Storage ============
    uint256 public vaultID;

    IPermit2 public permit2;

    // Allowlist
    mapping(address => bool) public allowlist;
    bool public allowlistEnabled;

    // Limits
    uint256 public depositCap;
    uint256 public minDeposit;

    // Idle buffer target (basis points of totalAssets)
    uint256 public idleBufferBps;

    // Strategy registry: name => strategy address
    mapping(string => address) private _strategyByName;
    string[] public strategyNames;
    mapping(string => bool) private _strategyExists;

    // ============ Events ============
    event AllowlistUpdated(address indexed user, bool allowed);
    event DepositCapSet(uint256 cap);
    event MinDepositSet(uint256 minDeposit);
    event IdleBufferSet(uint256 bps);
    event StrategyAdded(string name, address indexed strategy);
    event StrategyRemoved(string name, address indexed strategy);
    event Invested(string name, address indexed strategy, uint256 assets);
    event Divested(string name, address indexed strategy, uint256 assets);

    // ============ Errors ============
    error NotAllowed();
    error DepositCapExceeded();
    error MinDepositNotMet();
    error IdleBufferOutOfRange();
    error StrategyNotFound();
    error StrategyAlreadyRegistered();
    error StrategyAssetMismatch();
    error InsufficientIdle(uint256 requested, uint256 idle);
    error IdleBufferBreached();

    // ============ Modifiers ============
    modifier onlyAllowed(address user) {
        if (allowlistEnabled && !allowlist[user]) revert NotAllowed();
        _;
    }

    // ============ Init ============
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    struct InitParams {
        uint256 id;
        address asset;
        address admin;
        string name;
        string symbol;
        bool allowlistEnabled;
        uint256 depositCap;
        uint256 minDeposit;
        uint256 idleBufferBps;
        address permit2;
    }

    function initialize(InitParams calldata p) external initializer {
        require(p.admin != address(0), "Invalid admin");
        require(p.asset != address(0), "Invalid asset");
        require(p.depositCap > 0, "Cap=0");
        if (p.idleBufferBps < MIN_IDLE_BPS || p.idleBufferBps > MAX_IDLE_BPS) {
            revert IdleBufferOutOfRange();
        }

        __ERC4626_init(IERC20(p.asset));
        __ERC20_init(p.name, p.symbol);
        __Ownable_init(p.admin);
        __Pausable_init();
        __ReentrancyGuard_init();

        vaultID = p.id;
        permit2 = IPermit2(p.permit2);
        allowlistEnabled = p.allowlistEnabled;
        depositCap = p.depositCap;
        minDeposit = p.minDeposit;
        idleBufferBps = p.idleBufferBps;

        if (p.allowlistEnabled) {
            allowlist[p.admin] = true;
        }
    }

    // ============ Admin ============
    function setAllowlist(address user, bool allowed) external onlyOwner {
        allowlist[user] = allowed;
        emit AllowlistUpdated(user, allowed);
    }

    function setAllowlistEnabled(bool enabled) external onlyOwner {
        allowlistEnabled = enabled;
    }

    function setDepositCap(uint256 cap) external onlyOwner {
        require(cap > 0, "Cap=0");
        depositCap = cap;
        emit DepositCapSet(cap);
    }

    function setMinDeposit(uint256 _min) external onlyOwner {
        minDeposit = _min;
        emit MinDepositSet(_min);
    }

    function setIdleBufferBps(uint256 bps) external onlyOwner {
        if (bps < MIN_IDLE_BPS || bps > MAX_IDLE_BPS) revert IdleBufferOutOfRange();
        idleBufferBps = bps;
        emit IdleBufferSet(bps);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // ============ Strategy Registry ============
    function addStrategy(string calldata name, address strategy) external onlyOwner {
        require(strategy != address(0), "Zero strategy");
        require(bytes(name).length > 0, "Empty name");
        if (_strategyExists[name]) revert StrategyAlreadyRegistered();
        if (IStrategy(strategy).asset() != asset()) revert StrategyAssetMismatch();

        _strategyByName[name] = strategy;
        _strategyExists[name] = true;
        strategyNames.push(name);
        emit StrategyAdded(name, strategy);
    }

    function removeStrategy(string calldata name) external onlyOwner {
        if (!_strategyExists[name]) revert StrategyNotFound();
        address strat = _strategyByName[name];
        require(IStrategy(strat).totalAssets() == 0, "Strategy has assets");

        _strategyExists[name] = false;
        delete _strategyByName[name];

        // Remove name from array (swap-and-pop)
        uint256 len = strategyNames.length;
        for (uint256 i = 0; i < len; i++) {
            if (keccak256(bytes(strategyNames[i])) == keccak256(bytes(name))) {
                strategyNames[i] = strategyNames[len - 1];
                strategyNames.pop();
                break;
            }
        }
        emit StrategyRemoved(name, strat);
    }

    function getStrategy(string calldata name) external view returns (address) {
        return _strategyByName[name];
    }

    function getStrategyNames() external view returns (string[] memory) {
        return strategyNames;
    }

    function getStrategyAssets(string calldata name) external view returns (uint256) {
        address strat = _strategyByName[name];
        if (strat == address(0)) return 0;
        return IStrategy(strat).totalAssets();
    }

    // ============ Invest / Divest ============
    /// @dev Curator moves idle assets into a strategy. Must leave idle buffer intact.
    function invest(string calldata name, uint256 assets) external onlyOwner whenNotPaused nonReentrant {
        if (!_strategyExists[name]) revert StrategyNotFound();
        address strat = _strategyByName[name];

        uint256 idleBefore = _idle();
        require(assets > 0 && assets <= idleBefore, "Invalid amount");

        uint256 requiredIdle = (totalAssets() * idleBufferBps) / BPS_DENOMINATOR;
        if (idleBefore - assets < requiredIdle) revert IdleBufferBreached();

        IERC20(asset()).forceApprove(strat, assets);
        IStrategy(strat).deposit(assets);
        IERC20(asset()).forceApprove(strat, 0);

        emit Invested(name, strat, assets);
    }

    /// @dev Pull assets back from a strategy into the vault.
    function divest(string calldata name, uint256 assets) external onlyOwner whenNotPaused nonReentrant {
        if (!_strategyExists[name]) revert StrategyNotFound();
        address strat = _strategyByName[name];
        require(assets > 0, "Zero");

        IStrategy(strat).withdraw(assets);
        emit Divested(name, strat, assets);
    }

    // ============ Deposits ============
    function _enforceDepositPolicies(uint256 assets) internal view {
        if (depositCap > 0 && totalAssets() + assets > depositCap) {
            revert DepositCapExceeded();
        }
        if (minDeposit > 0 && assets < minDeposit) {
            revert MinDepositNotMet();
        }
    }

    function deposit(uint256 assets, address receiver)
        public
        override
        whenNotPaused
        onlyAllowed(receiver)
        returns (uint256 shares)
    {
        _enforceDepositPolicies(assets);
        return super.deposit(assets, receiver);
    }

    function mint(uint256 shares, address receiver)
        public
        override
        whenNotPaused
        onlyAllowed(receiver)
        returns (uint256 assets)
    {
        assets = previewMint(shares);
        _enforceDepositPolicies(assets);
        return super.mint(shares, receiver);
    }

    function depositWithPermit2(
        uint256 assets,
        address receiver,
        IPermit2.PermitSingle calldata p,
        IPermit2.Signature calldata sig
    ) external nonReentrant whenNotPaused onlyAllowed(receiver) returns (uint256 shares) {
        require(assets > 0, "Zero");
        require(address(permit2) != address(0), "No permit2");
        require(p.token == asset(), "Wrong token");
        require(p.spender == address(this), "Spender!=vault");
        _enforceDepositPolicies(assets);

        permit2.permit(msg.sender, p, sig);
        permit2.transferFrom(msg.sender, address(this), uint160(assets), asset());

        shares = previewDeposit(assets);
        require(shares > 0, "Zero shares");
        _mint(receiver, shares);

        emit Deposit(msg.sender, receiver, assets, shares);
    }

    // ============ Withdrawals ============
    /// @dev Withdrawals are served from idle balance only. If idle is insufficient,
    ///      the curator must divest first.
    function withdraw(uint256 assets, address receiver, address owner_)
        public
        override
        whenNotPaused
        returns (uint256 shares)
    {
        uint256 idle = _idle();
        if (assets > idle) revert InsufficientIdle(assets, idle);
        return super.withdraw(assets, receiver, owner_);
    }

    function redeem(uint256 shares, address receiver, address owner_)
        public
        override
        whenNotPaused
        returns (uint256 assets)
    {
        assets = previewRedeem(shares);
        uint256 idle = _idle();
        if (assets > idle) revert InsufficientIdle(assets, idle);
        return super.redeem(shares, receiver, owner_);
    }

    // ============ Views ============
    /// @dev Total assets = idle balance in vault + sum of all strategy balances.
    function totalAssets() public view override returns (uint256 total) {
        total = _idle();
        uint256 len = strategyNames.length;
        for (uint256 i = 0; i < len; i++) {
            address strat = _strategyByName[strategyNames[i]];
            if (strat != address(0)) {
                total += IStrategy(strat).totalAssets();
            }
        }
    }

    function _idle() internal view returns (uint256) {
        return IERC20(asset()).balanceOf(address(this));
    }

    function idleAssets() external view returns (uint256) {
        return _idle();
    }

    function investedAssets() external view returns (uint256 invested) {
        uint256 len = strategyNames.length;
        for (uint256 i = 0; i < len; i++) {
            address strat = _strategyByName[strategyNames[i]];
            if (strat != address(0)) {
                invested += IStrategy(strat).totalAssets();
            }
        }
    }

    function requiredIdleBuffer() external view returns (uint256) {
        return (totalAssets() * idleBufferBps) / BPS_DENOMINATOR;
    }

    function isAllowed(address user) external view returns (bool) {
        return !allowlistEnabled || allowlist[user];
    }

    struct VaultState {
        uint256 totalAssetsAmount;
        uint256 assetsInVault;
        uint256 assetsInStrategies;
        uint256 requiredIdle;
        uint256 idleBps;
        bool isPaused;
        uint256 currentDepositCap;
        uint256 currentMinDeposit;
        bool isAllowlistEnabled;
        uint256 strategyCount;
    }

    function getVaultState() external view returns (VaultState memory s) {
        s.totalAssetsAmount = totalAssets();
        s.assetsInVault = _idle();
        s.assetsInStrategies = s.totalAssetsAmount - s.assetsInVault;
        s.requiredIdle = (s.totalAssetsAmount * idleBufferBps) / BPS_DENOMINATOR;
        s.idleBps = idleBufferBps;
        s.isPaused = paused();
        s.currentDepositCap = depositCap;
        s.currentMinDeposit = minDeposit;
        s.isAllowlistEnabled = allowlistEnabled;
        s.strategyCount = strategyNames.length;
    }
}
