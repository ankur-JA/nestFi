# NestFi Smart Contract Architecture

## Overview

NestFi is a decentralized vault protocol that allows curators to create and manage investment vaults where investors can deposit assets. The protocol features:

- **ERC-4626 Compliant Vaults** - Standard vault interface for deposits/withdrawals
- **Multiple Withdrawal Models** - Instant, Scheduled, Epoch-based, or Curator-managed
- **Multi-Strategy Investing** - Deploy funds to Aave, Uniswap LP, Velodrome, Beefy
- **Token Swaps** - Built-in Uniswap V3 integration for token conversions
- **Upgradeable Logic** - VaultManager can be upgraded without affecting user funds

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           NESTFI PROTOCOL                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                         ┌─────────────────────┐                             │
│                         │    VaultFactory     │                             │
│                         │                     │                             │
│                         │ • Creates vaults    │                             │
│                         │ • Tracks ownership  │                             │
│                         │ • Minimal proxies   │                             │
│                         └──────────┬──────────┘                             │
│                                    │                                         │
│                    Creates clones  │  Configures                            │
│                         ┌──────────┴──────────┐                             │
│                         │                     │                             │
│                         ▼                     ▼                             │
│  ┌──────────────────────────┐     ┌─────────────────────────────────┐      │
│  │      GroupVault          │     │        VaultManager             │      │
│  │      (Clones)            │     │     (UUPS Upgradeable)          │      │
│  │                          │     │                                 │      │
│  │ • ERC-4626 standard      │◄───►│ • Strategy management           │      │
│  │ • Deposit/withdraw       │     │ • Token swaps                   │      │
│  │ • Share accounting       │     │ • Withdrawal models             │      │
│  │ • Holds user funds       │     │ • Can be upgraded               │      │
│  │ • Allowlist control      │     │ • Shared by all vaults          │      │
│  └──────────────────────────┘     └──────────────┬──────────────────┘      │
│                                                   │                         │
│                          ┌────────────────────────┼────────────────────┐    │
│                          │                        │                    │    │
│                          ▼                        ▼                    ▼    │
│               ┌─────────────────┐     ┌─────────────────┐    ┌────────────┐│
│               │  AaveV3Strategy │     │UniswapV3Strategy│    │  Velodrome ││
│               │                 │     │                 │    │  Strategy  ││
│               │ • Lending       │     │ • LP provision  │    │            ││
│               │ • Interest      │     │ • Fee earning   │    │ • LP/Gauge ││
│               └─────────────────┘     └─────────────────┘    └────────────┘│
│                                                                             │
│                          ┌─────────────────────────────┐                   │
│                          │       External DeFi         │                   │
│                          │                             │                   │
│                          │ • Aave V3 Pool              │                   │
│                          │ • Uniswap V3 Router/NFPM    │                   │
│                          │ • Velodrome Router/Gauge    │                   │
│                          │ • Beefy Vaults              │                   │
│                          └─────────────────────────────┘                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Contract Details

### 1. VaultFactory.sol

**Purpose**: Factory contract for deploying new GroupVault instances using minimal proxy pattern (EIP-1167 clones).

**Key Functions**:

| Function | Description |
|----------|-------------|
| `createVault(...)` | Creates a new vault clone and configures withdrawal model |
| `getVaultsByUser(user)` | Returns all vaults created by a user |
| `isVaultAdmin(vault, user)` | Checks if user is the vault curator |
| `getAllVaults()` | Returns all deployed vaults |

**State Variables**:
```solidity
GroupVault public immutable implementation;  // Template for clones
IPermit2 public immutable permit2;           // Permit2 for gasless approvals
IVaultManager public vaultManager;           // Shared manager contract
mapping(address => address[]) public userVaults;  // User -> their vaults
```

**Events**:
```solidity
event VaultCreated(
    address indexed vault,
    address indexed owner,
    address indexed asset,
    string name,
    string symbol,
    bool allowlistEnabled,
    uint256 depositCap,
    uint256 minDeposit,
    uint8 withdrawModel,
    uint256 withdrawConfig
);
```

---

### 2. GroupVault.sol

**Purpose**: ERC-4626 compliant vault that holds user deposits and delegates investment/withdrawal logic to VaultManager.

**Key Features**:
- Minimal proxy (clone) deployed by factory
- Holds all user funds (USDC + any swapped tokens)
- Delegates strategy operations to VaultManager
- Supports Permit2 for gasless deposits

**Key Functions**:

| Function | Description |
|----------|-------------|
| `deposit(assets, receiver)` | Deposit assets, receive shares |
| `withdraw(assets, receiver, owner)` | Withdraw assets (subject to model) |
| `redeem(shares, receiver, owner)` | Redeem shares for assets |
| `requestWithdraw(shares)` | Queue withdrawal (for queue models) |
| `invest(strategyName, assets)` | Invest via manager |
| `divest(strategyName, assets)` | Withdraw from strategy |
| `swapTokens(...)` | Swap tokens via manager |

**State Variables**:
```solidity
IVaultManager public vaultManager;           // Manager reference
IPermit2 public permit2;                     // Permit2 contract
mapping(address => bool) public allowlist;   // Allowed depositors
bool public allowlistEnabled;                // Allowlist toggle
uint256 public depositCap;                   // Max total deposits
uint256 public minDeposit;                   // Min deposit amount
address[] public tokenList;                  // Supported tokens
```

**Inheritance**:
```
Initializable
    └── ERC4626Upgradeable (deposits/withdrawals/shares)
            └── OwnableUpgradeable (curator access)
                    └── PausableUpgradeable (emergency stop)
                            └── ReentrancyGuardUpgradeable (security)
```

---

### 3. VaultManager.sol

**Purpose**: Upgradeable (UUPS) contract that handles all investment strategy logic, token swaps, and withdrawal model enforcement.

**Key Features**:
- **UUPS Upgradeable** - Can be upgraded to add features/fix bugs
- **Shared by all vaults** - Single deployment serves multiple vaults
- **Strategy management** - Add/remove/invest/divest
- **Swap integration** - Uniswap V3 router
- **Withdrawal models** - 4 different liquidity models

**Withdrawal Models**:

| Model | ID | Description | Config |
|-------|-----|-------------|--------|
| INSTANT | 0 | 8-15% idle buffer, instant withdrawals | Buffer % |
| SCHEDULED | 1 | Queue-based, processed on rebalance | None |
| EPOCH | 2 | Locked, withdraw after epoch ends | Epoch length |
| CURATOR_MANAGED | 3 | Curator manually processes | None |

**Key Functions**:

| Function | Description |
|----------|-------------|
| `configureVault(vault, model, config)` | Set withdrawal model |
| `addStrategy(vault, name, address)` | Register a strategy |
| `invest(vault, strategy, assets)` | Deploy assets to strategy |
| `divest(vault, strategy, assets)` | Withdraw from strategy |
| `swapTokens(vault, ...)` | Execute token swap |
| `canWithdraw(vault, user, assets)` | Check withdrawal eligibility |
| `requestWithdraw(vault, user, shares)` | Queue withdrawal |
| `processWithdrawQueue(vault, max)` | Process pending withdrawals |
| `advanceEpoch(vault)` | Move to next epoch |

**State Variables**:
```solidity
ISwapRouter public swapRouter;                              // Uniswap V3
uint24 public defaultSwapFee;                               // Default fee tier
mapping(address => VaultConfig) public vaultConfigs;        // Per-vault config
mapping(address => mapping(string => address)) strategies;  // vault => name => strategy
mapping(address => WithdrawRequest[]) withdrawQueues;       // Withdrawal queues
mapping(address => address) public vaultCurators;           // vault => curator
```

---

### 4. Strategy Contracts

All strategies implement `IStrategy`:

```solidity
interface IStrategy {
    function asset() external view returns (address);
    function totalAssets() external view returns (uint256);
    function deposit(uint256 assets) external;
    function withdraw(uint256 assets) external;
}
```

#### AaveV3Strategy.sol
Deposits assets into Aave V3 lending pool to earn interest.

```
GroupVault ──► VaultManager ──► AaveV3Strategy ──► Aave V3 Pool
                                     │
                                     └──► Receives aTokens
```

#### UniswapV3Strategy.sol
Provides concentrated liquidity to Uniswap V3 pools.

```
GroupVault ──► VaultManager ──► UniswapV3Strategy ──► Uniswap V3
                                     │                    │
                                     │              ┌─────┴─────┐
                                     │              │ NFT       │
                                     └──────────────│ Position  │
                                                    └───────────┘
```

#### VelodromeStrategy.sol
Provides liquidity to Velodrome and stakes in gauges for rewards.

#### BeefyStrategy.sol
Deposits LP tokens into Beefy vaults for auto-compounding.

---

## Flow Diagrams

### Vault Creation Flow

```
┌─────────┐     ┌──────────────┐     ┌───────────────┐     ┌──────────────┐
│ Curator │────►│ VaultFactory │────►│  GroupVault   │────►│ VaultManager │
│         │     │              │     │   (clone)     │     │              │
│ calls   │     │ createVault  │     │ initialize()  │     │ configureVault│
│ create  │     │              │     │               │     │              │
└─────────┘     └──────────────┘     └───────────────┘     └──────────────┘
                       │                                           │
                       │         Stores vault config               │
                       └───────────────────────────────────────────┘
```

### Deposit Flow

```
┌──────────┐     ┌────────────┐     ┌───────────────┐
│ Investor │────►│ GroupVault │────►│  ERC4626      │
│          │     │            │     │  Accounting   │
│ deposit  │     │ deposit()  │     │               │
│ USDC     │     │            │     │ mint shares   │
└──────────┘     └────────────┘     └───────────────┘
                       │
                       │ Checks:
                       │ • Allowlist
                       │ • Deposit cap
                       │ • Min deposit
                       │ • Not paused
```

### Investment Flow

```
┌─────────┐     ┌────────────┐     ┌──────────────┐     ┌──────────┐
│ Curator │────►│ GroupVault │────►│ VaultManager │────►│ Strategy │
│         │     │            │     │              │     │          │
│ invest  │     │ invest()   │     │ invest()     │     │ deposit()│
│         │     │            │     │              │     │          │
└─────────┘     └────────────┘     └──────────────┘     └──────────┘
                       │                   │                  │
                       │ USDC              │ USDC             │ aTokens/
                       └───────────────────┴──────────────────┘ LP tokens
```

### Swap Flow

```
┌─────────┐     ┌────────────┐     ┌──────────────┐     ┌───────────┐
│ Curator │────►│ GroupVault │────►│ VaultManager │────►│ Uniswap   │
│         │     │            │     │              │     │ V3 Router │
│ swap    │     │ swapTokens │     │ swapTokens   │     │           │
│ USDC    │     │            │     │              │     │           │
│ to DAI  │     │            │     │              │     │           │
└─────────┘     └────────────┘     └──────────────┘     └───────────┘
                       │                                      │
                       │            DAI sent to vault         │
                       ◄──────────────────────────────────────┘
```

### Withdrawal Flow (by model)

#### Model 1: INSTANT
```
┌──────────┐     ┌────────────┐     ┌──────────────┐
│ Investor │────►│ GroupVault │────►│ VaultManager │
│          │     │            │     │              │
│ withdraw │     │ withdraw() │     │ canWithdraw? │──► YES ──► Process
│          │     │            │     │              │
└──────────┘     └────────────┘     │ Check buffer │──► NO ──► Revert
                                    └──────────────┘
```

#### Model 2: SCHEDULED
```
┌──────────┐     ┌────────────┐     ┌──────────────┐
│ Investor │────►│ GroupVault │────►│ VaultManager │
│          │     │            │     │              │
│ request  │     │ request    │     │ Add to queue │
│ withdraw │     │ Withdraw() │     │              │
└──────────┘     └────────────┘     └──────────────┘
                                           │
                                           │ Later...
                                           ▼
                 ┌─────────┐     ┌──────────────────┐
                 │ Curator │────►│ processWithdraw  │
                 │         │     │ Queue()          │
                 └─────────┘     └──────────────────┘
```

#### Model 3: EPOCH
```
┌──────────┐     ┌────────────┐     ┌──────────────┐
│ Investor │────►│ GroupVault │────►│ VaultManager │
│          │     │            │     │              │
│ withdraw │     │ withdraw() │     │ Epoch ended? │──► YES ──► Process
│          │     │            │     │              │
└──────────┘     └────────────┘     │              │──► NO ──► Revert
                                    └──────────────┘
```

#### Model 4: CURATOR_MANAGED
```
┌──────────┐     ┌────────────┐     ┌──────────────┐
│ Investor │────►│ GroupVault │────►│ VaultManager │
│          │     │            │     │              │
│ request  │     │ request    │     │ Add to queue │
│ withdraw │     │ Withdraw() │     │              │
└──────────┘     └────────────┘     └──────────────┘
                                           │
                                           │ When curator decides...
                                           ▼
                 ┌─────────┐     ┌──────────────────┐
                 │ Curator │────►│ processAll       │
                 │         │     │ Withdrawals()    │
                 └─────────┘     └──────────────────┘
```

---

## Access Control

### Roles

| Role | Contract | Permissions |
|------|----------|-------------|
| **Vault Owner** | GroupVault | Pause, allowlist, invest, divest, swap |
| **Vault Curator** | VaultManager | Same as owner, manage strategies |
| **Manager Owner** | VaultManager | Upgrade contract, set swap router |
| **Investor** | GroupVault | Deposit, withdraw (subject to model) |

### Permission Matrix

| Action | Owner | Curator | Investor | Manager |
|--------|-------|---------|----------|---------|
| Deposit | ✅ | ✅ | ✅ | ❌ |
| Withdraw | ✅ | ✅ | ✅* | ❌ |
| Invest | ✅ | ✅ | ❌ | ❌ |
| Divest | ✅ | ✅ | ❌ | ❌ |
| Swap | ✅ | ✅ | ❌ | ❌ |
| Add Strategy | ✅ | ✅ | ❌ | ❌ |
| Pause | ✅ | ❌ | ❌ | ❌ |
| Set Allowlist | ✅ | ❌ | ❌ | ❌ |
| Upgrade Manager | ❌ | ❌ | ❌ | ✅ |

*Subject to withdrawal model rules

---

## Upgradeability

### VaultManager (UUPS Pattern)

The VaultManager uses OpenZeppelin's UUPS (Universal Upgradeable Proxy Standard) pattern:

```solidity
// Current implementation
contract VaultManager is 
    Initializable, 
    OwnableUpgradeable, 
    UUPSUpgradeable,  // <-- Enables upgrades
    ReentrancyGuardUpgradeable
{
    function _authorizeUpgrade(address newImplementation) 
        internal override onlyOwner {}
    
    function version() external pure returns (string memory) {
        return "1.0.0";
    }
}
```

**To Upgrade**:
```solidity
// 1. Deploy new implementation
VaultManagerV2 newImpl = new VaultManagerV2();

// 2. Upgrade (owner only)
vaultManager.upgradeToAndCall(address(newImpl), "");
```

**What Can Be Upgraded**:
- Add new DEX integrations (Curve, Balancer)
- Add new strategy types
- Modify withdrawal logic
- Add new withdrawal models
- Fix bugs
- Optimize gas

**What Cannot Be Changed**:
- User funds (held in GroupVault, not manager)
- Vault share accounting
- Per-vault withdrawal model (immutable)

---

## Security Considerations

### Reentrancy Protection
All state-changing functions use `nonReentrant` modifier.

### Access Control
- Vault operations restricted to owner
- Manager upgrade restricted to owner
- Withdrawal model immutable after deployment

### Fund Safety
- User funds held in GroupVault, not VaultManager
- Manager can only operate with vault approval
- Strategies require explicit approval

### Pausability
- Vaults can be paused in emergencies
- Paused vaults reject deposits and most operations

---

## Deployment

### Order of Deployment

```bash
1. Deploy VaultManager implementation
2. Deploy VaultManager proxy (ERC1967Proxy)
3. Initialize VaultManager(owner)
4. Deploy GroupVault implementation
5. Deploy VaultFactory(implementation, permit2, manager)
6. Set swap router on VaultManager
```

### Required Addresses

| Contract | Purpose |
|----------|---------|
| Permit2 | Gasless approvals |
| Uniswap V3 Router | Token swaps |
| USDC | Primary asset |
| DAI | Pair token |
| Aave V3 Pool | Lending strategy |

---

## Gas Optimization

- **Minimal Proxy Pattern**: Each vault is a lightweight clone (~45 bytes)
- **Shared Manager**: One manager serves all vaults
- **Batch Operations**: Process multiple withdrawals at once
- **Lazy Token Tracking**: Tokens added only when swapped

---

## Events Summary

| Contract | Event | Description |
|----------|-------|-------------|
| VaultFactory | VaultCreated | New vault deployed |
| GroupVault | Deposit | User deposited |
| GroupVault | Withdraw | User withdrew |
| GroupVault | AllowlistUpdated | Allowlist changed |
| VaultManager | StrategyAdded | Strategy registered |
| VaultManager | Invested | Assets deployed |
| VaultManager | Divested | Assets withdrawn |
| VaultManager | TokenSwapped | Swap executed |
| VaultManager | WithdrawRequested | Withdrawal queued |
| VaultManager | WithdrawProcessed | Withdrawal completed |
| VaultManager | EpochAdvanced | New epoch started |

---

## Integration Guide

### For Frontend Developers

```typescript
// Create vault
const tx = await vaultFactory.createVault(
  USDC_ADDRESS,           // asset
  curatorAddress,         // admin
  "My Vault",             // name
  "NVUSDC",              // symbol
  true,                   // allowlistEnabled
  parseUnits("50000", 6), // depositCap
  parseUnits("50", 6),    // minDeposit
  0,                      // withdrawModel (INSTANT)
  10                      // withdrawConfig (10% buffer)
);

// Deposit to vault
await usdc.approve(vaultAddress, amount);
await vault.deposit(amount, receiverAddress);

// Check withdrawal eligibility
const [canWithdraw, reason] = await vaultManager.canWithdraw(
  vaultAddress, 
  userAddress, 
  amount
);

// Get vault state
const state = await vault.getVaultState();
const withdrawConfig = await vault.getWithdrawModelConfig();
```

---

## Future Improvements

- [ ] Multi-asset vaults
- [ ] Performance fees
- [ ] Governance integration
- [ ] Cross-chain strategies
- [ ] Automated rebalancing
- [ ] Risk scoring

