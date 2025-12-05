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
import {IVaultManager} from "./interfaces/IVaultManager.sol";

/**
 * @title GroupVault
 * @dev Minimal ERC-4626 vault that delegates strategy and withdrawal logic to VaultManager
 * 
 * Architecture:
 * - GroupVault: Handles deposits, withdrawals, share accounting (ERC4626)
 * - VaultManager: Handles strategies, swaps, withdrawal models (upgradeable)
 * 
 * This separation allows:
 * - VaultManager to be upgraded without affecting vault funds
 * - New strategies to be added via manager upgrades
 * - Withdrawal model improvements over time
 * - Shared manager across multiple vaults
 */
contract GroupVault is 
    Initializable,
    ERC4626Upgradeable, 
    OwnableUpgradeable,
    PausableUpgradeable, 
    ReentrancyGuardUpgradeable 
{
    using SafeERC20 for IERC20;

    // ============ STORAGE ============
    
    // External contracts
    IPermit2 public permit2;
    IVaultManager public vaultManager;
    
    // Allowlist management
    mapping(address => bool) public allowlist;
    bool public allowlistEnabled;
    
    // Deposit limits
    uint256 public depositCap;
    uint256 public minDeposit;
    
    // Track additional tokens held by vault (from swaps)
    mapping(address => bool) public supportedTokens;
    address[] public tokenList;

    // ============ EVENTS ============
    
    event AllowlistUpdated(address indexed user, bool allowed);
    event DepositCapSet(uint256 cap);
    event MinDepositSet(uint256 minDeposit);
    event VaultManagerSet(address indexed manager);
    event TokenAdded(address indexed token);

    // ============ ERRORS ============
    
    error NotAllowed();
    error DepositCapExceeded();
    error MinDepositNotMet();
    error ManagerNotSet();
    error WithdrawNotAllowed(string reason);

    // ============ MODIFIERS ============
    
    modifier onlyAllowed(address user) {
        if (allowlistEnabled && !allowlist[user]) {
            revert NotAllowed();
        }
        _;
    }
    
    modifier onlyManager() {
        require(msg.sender == address(vaultManager), "Only manager");
        _;
    }

    // ============ INITIALIZER ============
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initialize the vault
     * @param _asset The underlying asset (e.g., USDC)
     * @param _admin The curator/admin address
     * @param _name Vault name
     * @param _symbol Vault share token symbol
     * @param _allowlistEnabled Whether allowlist is enabled
     * @param _depositCap Maximum total deposits
     * @param _minDeposit Minimum deposit amount
     * @param _permit2 Permit2 contract address
     * @param _vaultManager VaultManager contract address
     */
    function initialize(
        IERC20 _asset,
        address _admin,
        string memory _name,
        string memory _symbol,
        bool _allowlistEnabled,
        uint256 _depositCap,
        uint256 _minDeposit,
        address _permit2,
        address _vaultManager
    ) public initializer {
        require(address(_asset) != address(0), "Invalid asset");
        require(_admin != address(0), "Invalid admin");
        require(_permit2 != address(0), "Invalid permit2");
        require(_vaultManager != address(0), "Invalid manager");
        
        __ERC4626_init(_asset);
        __ERC20_init(_name, _symbol);
        __Ownable_init(_admin);
        __Pausable_init();
        __ReentrancyGuard_init();
        
        permit2 = IPermit2(_permit2);
        vaultManager = IVaultManager(_vaultManager);
        allowlistEnabled = _allowlistEnabled;
        depositCap = _depositCap;
        minDeposit = _minDeposit;
        
        // Add admin to allowlist if enabled
        if (_allowlistEnabled) {
            allowlist[_admin] = true;
        }
        
        // Add primary asset to supported tokens
        supportedTokens[address(_asset)] = true;
        tokenList.push(address(_asset));
    }

    // ============ VAULT MANAGER FUNCTIONS ============
    
    /**
     * @dev Set the vault manager (can only be done by owner)
     * This allows upgrading to a new manager if needed
     */
    function setVaultManager(address _manager) external onlyOwner {
        require(_manager != address(0), "Invalid manager");
        vaultManager = IVaultManager(_manager);
        emit VaultManagerSet(_manager);
    }

    /**
     * @dev Approve manager to spend vault tokens for swaps/investments
     */
    function approveManager(address token, uint256 amount) external onlyOwner {
        IERC20(token).approve(address(vaultManager), amount);
    }

    /**
     * @dev Approve manager to spend all vault tokens (max approval)
     */
    function approveManagerMax(address token) external onlyOwner {
        IERC20(token).approve(address(vaultManager), type(uint256).max);
    }

    // ============ CURATOR FUNCTIONS (delegated to manager) ============
    
    /**
     * @dev Add a strategy via manager
     */
    function addStrategy(string memory name, address strategy) external onlyOwner {
        if (address(vaultManager) == address(0)) revert ManagerNotSet();
        vaultManager.addStrategy(address(this), name, strategy);
    }
    
    /**
     * @dev Remove a strategy via manager
     */
    function removeStrategy(string memory name) external onlyOwner {
        if (address(vaultManager) == address(0)) revert ManagerNotSet();
        vaultManager.removeStrategy(address(this), name);
    }
    
    /**
     * @dev Invest vault assets into a strategy
     */
    function invest(string memory strategyName, uint256 assets) external onlyOwner whenNotPaused {
        if (address(vaultManager) == address(0)) revert ManagerNotSet();
        vaultManager.invest(address(this), strategyName, assets);
    }
    
    /**
     * @dev Divest assets from a strategy
     */
    function divest(string memory strategyName, uint256 assets) external onlyOwner whenNotPaused {
        if (address(vaultManager) == address(0)) revert ManagerNotSet();
        vaultManager.divest(address(this), strategyName, assets);
    }
    
    /**
     * @dev Swap tokens via manager
     */
    function swapTokens(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMin,
        uint24 fee
    ) external onlyOwner whenNotPaused returns (uint256 amountOut) {
        if (address(vaultManager) == address(0)) revert ManagerNotSet();
        amountOut = vaultManager.swapTokens(address(this), tokenIn, tokenOut, amountIn, amountOutMin, fee);
        
        // Track new token
        if (!supportedTokens[tokenOut]) {
            supportedTokens[tokenOut] = true;
            tokenList.push(tokenOut);
            emit TokenAdded(tokenOut);
        }
    }
    
    /**
     * @dev Process withdrawal queue (for SCHEDULED model)
     */
    function processWithdrawQueue(uint256 maxToProcess) external onlyOwner whenNotPaused {
        if (address(vaultManager) == address(0)) revert ManagerNotSet();
        vaultManager.processWithdrawQueue(address(this), maxToProcess);
    }
    
    /**
     * @dev Process all withdrawals (for CURATOR_MANAGED model)
     */
    function processAllWithdrawals() external onlyOwner whenNotPaused {
        if (address(vaultManager) == address(0)) revert ManagerNotSet();
        vaultManager.processAllWithdrawals(address(this));
    }
    
    /**
     * @dev Advance epoch (for EPOCH model)
     */
    function advanceEpoch() external onlyOwner {
        if (address(vaultManager) == address(0)) revert ManagerNotSet();
        vaultManager.advanceEpoch(address(this));
    }

    // ============ ADMIN FUNCTIONS ============
    
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
    
    /**
     * @dev Add a supported token
     */
    function addSupportedToken(address token) external onlyOwner {
        if (!supportedTokens[token]) {
            supportedTokens[token] = true;
            tokenList.push(token);
            emit TokenAdded(token);
        }
    }

    // ============ DEPOSIT FUNCTIONS ============
    
    function _enforceDepositPolicies(uint256 assets) internal view {
        if (depositCap > 0 && totalAssets() + assets > depositCap) {
            revert DepositCapExceeded();
        }
        if (minDeposit > 0 && assets < minDeposit) {
            revert MinDepositNotMet();
        }
    }

    function deposit(uint256 assets, address receiver) 
        public virtual override whenNotPaused onlyAllowed(receiver) returns (uint256 shares) 
    {
        _enforceDepositPolicies(assets);
        return super.deposit(assets, receiver);
    }

    function mint(uint256 shares, address receiver) 
        public virtual override whenNotPaused onlyAllowed(receiver) returns (uint256 assets) 
    {
        assets = convertToAssets(shares);
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

    // ============ WITHDRAWAL FUNCTIONS ============
    
    /**
     * @dev Override withdraw to check with manager for withdrawal model rules
     */
    function withdraw(uint256 assets, address receiver, address owner) 
        public virtual override whenNotPaused returns (uint256 shares) 
    {
        if (address(vaultManager) != address(0)) {
            (bool allowed, string memory reason) = vaultManager.canWithdraw(address(this), owner, assets);
            if (!allowed) {
                revert WithdrawNotAllowed(reason);
            }
        }
        return super.withdraw(assets, receiver, owner);
    }

    /**
     * @dev Override redeem to check with manager for withdrawal model rules
     */
    function redeem(uint256 shares, address receiver, address owner) 
        public virtual override whenNotPaused returns (uint256 assets) 
    {
        assets = convertToAssets(shares);
        if (address(vaultManager) != address(0)) {
            (bool allowed, string memory reason) = vaultManager.canWithdraw(address(this), owner, assets);
            if (!allowed) {
                revert WithdrawNotAllowed(reason);
            }
        }
        return super.redeem(shares, receiver, owner);
    }
    
    /**
     * @dev Request a withdrawal (for SCHEDULED and CURATOR_MANAGED models)
     */
    function requestWithdraw(uint256 shares) external whenNotPaused returns (uint256 requestId) {
        if (address(vaultManager) == address(0)) revert ManagerNotSet();
        require(shares > 0, "Zero shares");
        require(balanceOf(msg.sender) >= shares, "Insufficient shares");
        
        // Lock shares by transferring to vault
        _transfer(msg.sender, address(this), shares);
        
        // Register with manager
        requestId = vaultManager.requestWithdraw(address(this), msg.sender, shares);
    }
    
    /**
     * @dev Cancel a withdrawal request
     */
    function cancelWithdrawRequest(uint256 requestId) external {
        if (address(vaultManager) == address(0)) revert ManagerNotSet();
        
        // Get pending shares before cancellation
        (uint256 pendingShares,) = vaultManager.getPendingWithdraws(address(this), msg.sender);
        
        // Cancel in manager
        vaultManager.cancelWithdrawRequest(address(this), msg.sender, requestId);
        
        // Return shares to user (simplified - in production would track exact amounts)
        if (pendingShares > 0) {
            _transfer(address(this), msg.sender, pendingShares);
        }
    }

    // ============ VIEW FUNCTIONS ============
    
    function isAllowed(address user) external view returns (bool) {
        return !allowlistEnabled || allowlist[user];
    }

    /**
     * @dev Returns total assets including those invested via manager
     */
    function totalAssets() public view override returns (uint256) {
        uint256 inVault = IERC20(asset()).balanceOf(address(this));
        
        if (address(vaultManager) != address(0)) {
            inVault += vaultManager.getTotalInvestedAssets(address(this));
        }
        
        return inVault;
    }
    
    /**
     * @dev Get idle assets in vault (not invested)
     */
    function idleAssets() public view returns (uint256) {
        return IERC20(asset()).balanceOf(address(this));
    }
    
    /**
     * @dev Get invested assets via manager
     */
    function investedAssets() public view returns (uint256) {
        if (address(vaultManager) == address(0)) return 0;
        return vaultManager.getTotalInvestedAssets(address(this));
    }

    /**
     * @dev Get all token balances held by the vault
     */
    function getVaultTokenBalances() external view returns (
        address[] memory tokens,
        uint256[] memory balances
    ) {
        uint256 count = tokenList.length;
        tokens = new address[](count);
        balances = new uint256[](count);
        
        for (uint256 i = 0; i < count; i++) {
            tokens[i] = tokenList[i];
            balances[i] = IERC20(tokenList[i]).balanceOf(address(this));
        }
    }

    /**
     * @dev Get a specific token balance
     */
    function getTokenBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }

    /**
     * @dev Get all supported tokens
     */
    function getSupportedTokens() external view returns (address[] memory) {
        return tokenList;
    }
    
    /**
     * @dev Get strategy names from manager
     */
    function getStrategyNames() external view returns (string[] memory) {
        if (address(vaultManager) == address(0)) return new string[](0);
        return vaultManager.getStrategyNames(address(this));
    }
    
    /**
     * @dev Get strategy address by name
     */
    function getStrategy(string memory name) external view returns (address) {
        if (address(vaultManager) == address(0)) return address(0);
        return vaultManager.getStrategy(address(this), name);
    }
    
    /**
     * @dev Get assets invested in a strategy
     */
    function getStrategyAssets(string memory name) external view returns (uint256) {
        if (address(vaultManager) == address(0)) return 0;
        return vaultManager.getStrategyAssets(address(this), name);
    }

    /**
     * @dev Get comprehensive vault state
     */
    function getVaultState() external view returns (
        uint256 totalAssetsAmount,
        uint256 assetsInVault,
        uint256 assetsInStrategies,
        bool isPaused,
        uint256 currentDepositCap,
        uint256 currentMinDeposit,
        bool isAllowlistEnabled,
        address manager
    ) {
        totalAssetsAmount = totalAssets();
        assetsInVault = idleAssets();
        assetsInStrategies = investedAssets();
        isPaused = paused();
        currentDepositCap = depositCap;
        currentMinDeposit = minDeposit;
        isAllowlistEnabled = allowlistEnabled;
        manager = address(vaultManager);
    }
    
    /**
     * @dev Get withdrawal model info from manager
     */
    function getWithdrawModelConfig() external view returns (
        uint8 model,
        uint256 bufferPercent,
        uint256 epochLengthSeconds,
        uint256 epochEndTime,
        uint256 currentEpoch,
        uint256 queueLength,
        uint256 totalPending,
        bool withdrawsAllowedNow
    ) {
        if (address(vaultManager) == address(0)) {
            return (0, 0, 0, 0, 0, 0, 0, true);
        }
        
        IVaultManager.VaultConfig memory config = vaultManager.getVaultConfig(address(this));
        
        model = uint8(config.withdrawModel);
        bufferPercent = config.idleBufferPercent;
        epochLengthSeconds = config.epochLength;
        epochEndTime = vaultManager.getEpochEndTime(address(this));
        currentEpoch = config.epochNumber;
        queueLength = vaultManager.getWithdrawQueueLength(address(this));
        totalPending = 0; // Would need to track this
        withdrawsAllowedNow = vaultManager.canWithdrawNow(address(this));
    }
    
    /**
     * @dev Get withdrawal model name
     */
    function getWithdrawModelName() external view returns (string memory) {
        if (address(vaultManager) == address(0)) return "Direct";
        return vaultManager.getWithdrawModelName(address(this));
    }
    
    /**
     * @dev Check if withdrawals are currently allowed
     */
    function canWithdrawNow() external view returns (bool) {
        if (address(vaultManager) == address(0)) return true;
        return vaultManager.canWithdrawNow(address(this));
    }
    
    /**
     * @dev Get pending withdraws for a user
     */
    function getPendingWithdraws(address user) external view returns (uint256 totalShares, uint256 count) {
        if (address(vaultManager) == address(0)) return (0, 0);
        return vaultManager.getPendingWithdraws(address(this), user);
    }
}
