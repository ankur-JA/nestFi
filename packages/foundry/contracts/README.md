# NestFi Smart Contracts

## Quick Reference

### Contracts Overview

| Contract | Purpose | Upgradeable |
|----------|---------|-------------|
| `VaultFactory` | Deploys vault clones | No |
| `GroupVault` | ERC-4626 vault, holds funds | No (clones) |
| `VaultManager` | Strategy/swap/withdrawal logic | Yes (UUPS) |
| `*Strategy` | Protocol integrations | No |

### Architecture

```
                    ┌─────────────────┐
                    │  VaultFactory   │
                    └────────┬────────┘
                             │ creates
                             ▼
┌─────────────────────────────────────────────────────┐
│                    GroupVault                        │
│  • Holds user funds (USDC, DAI, etc.)               │
│  • ERC-4626 share accounting                        │
│  • Delegates strategy logic to manager              │
└───────────────────────┬─────────────────────────────┘
                        │ delegates to
                        ▼
┌─────────────────────────────────────────────────────┐
│              VaultManager (Upgradeable)              │
│  • Token swaps (Uniswap V3)                         │
│  • Strategy management                              │
│  • Withdrawal models                                │
└───────────────────────┬─────────────────────────────┘
                        │ invests in
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
   ┌─────────┐    ┌──────────┐    ┌───────────┐
   │  Aave   │    │ Uniswap  │    │ Velodrome │
   │Strategy │    │ Strategy │    │ Strategy  │
   └─────────┘    └──────────┘    └───────────┘
```

### Withdrawal Models

| # | Model | How It Works |
|---|-------|--------------|
| 0 | **INSTANT** | 8-15% idle buffer, withdraw anytime |
| 1 | **SCHEDULED** | Queue-based, curator processes |
| 2 | **EPOCH** | Locked, withdraw after 7/30 days |
| 3 | **CURATOR_MANAGED** | Curator triggers all withdrawals |

### Key Files

```
contracts/
├── GroupVault.sol          # Main vault contract
├── VaultFactory.sol        # Factory for deploying vaults
├── VaultManager.sol        # Upgradeable strategy manager
├── interfaces/
│   ├── IVaultManager.sol   # Manager interface
│   ├── IStrategy.sol       # Strategy interface
│   ├── IPermit2.sol        # Permit2 interface
│   └── uniswap/
│       ├── ISwapRouter.sol
│       └── INonfungiblePositionManager.sol
└── strategies/
    ├── AaveV3Strategy.sol
    ├── UniswapV3Strategy.sol
    ├── VelodromeStrategy.sol
    └── BeefyStrategy.sol
```

### Deployment Order

```bash
# 1. Deploy VaultManager (proxy)
forge script script/DeployManager.s.sol --broadcast

# 2. Deploy GroupVault implementation
forge script script/DeployVault.s.sol --broadcast

# 3. Deploy VaultFactory
forge script script/DeployFactory.s.sol --broadcast
```

### Create a Vault

```solidity
vaultFactory.createVault(
    USDC_ADDRESS,           // asset
    msg.sender,             // admin (curator)
    "Stable Yield Fund",    // name
    "NVUSDC",              // symbol
    false,                  // allowlistEnabled
    50000e6,               // depositCap (50k USDC)
    50e6,                  // minDeposit (50 USDC)
    0,                     // withdrawModel (INSTANT)
    10                     // withdrawConfig (10% buffer)
);
```

### Curator Operations

```solidity
// Add strategy
vault.addStrategy("aave", aaveStrategyAddress);

// Invest 10k USDC into Aave
vault.invest("aave", 10000e6);

// Swap 5k USDC to DAI
vault.swapTokens(USDC, DAI, 5000e6, 4900e18, 3000);

// Divest from strategy
vault.divest("aave", 5000e6);
```

### Investor Operations

```solidity
// Deposit
usdc.approve(vault, 1000e6);
vault.deposit(1000e6, msg.sender);

// Withdraw (if allowed by model)
vault.withdraw(500e6, msg.sender, msg.sender);

// Request withdrawal (for queue models)
vault.requestWithdraw(shares);
```

### Upgrade VaultManager

```solidity
// Deploy new implementation
VaultManagerV2 newImpl = new VaultManagerV2();

// Upgrade (owner only)
vaultManager.upgradeToAndCall(address(newImpl), "");
```

---

For detailed architecture documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md).

