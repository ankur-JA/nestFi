# NestFi Local Testing Guide

This guide explains how to run and test NestFi contracts locally before deploying to Sepolia.

## Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) installed
- Node.js 18+ (for frontend)

## Quick Start

### 1. Start Local Blockchain (Anvil)

Open a terminal and start the local node:

```bash
cd packages/foundry

# Start Anvil (Foundry's local node)
anvil
```

This will start a local Ethereum node at `http://localhost:8545` with 10 pre-funded test accounts.

**Default Accounts (keep note of these):**
```
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (Deployer)
Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (Curator)
Account #2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC (Investor1)
Account #3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906 (Investor2)

Private Key #0: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### 2. Deploy Contracts Locally

In a new terminal:

```bash
cd packages/foundry

# Deploy all contracts with mocks
forge script script/DeployLocal.s.sol --rpc-url http://localhost:8545 --broadcast
```

This deploys:
- MockUSDC & MockDAI tokens
- MockPermit2
- MockSwapRouter (simulates Uniswap V3)
- VaultManager (UUPS proxy)
- GroupVault implementation
- VaultFactory
- MockAaveStrategy & MockUniswapStrategy

**Save the deployed addresses!** They will be printed at the end.

### 3. Run Tests

```bash
# Run all tests
forge test -vvv

# Run specific test
forge test --match-test test_EndToEnd_FullFlow -vvv

# Run with gas report
forge test --gas-report
```

### 4. Interact via Cast (CLI)

```bash
# Check USDC balance
cast call <USDC_ADDRESS> "balanceOf(address)" <YOUR_ADDRESS> --rpc-url http://localhost:8545

# Create a vault (as curator)
cast send <FACTORY_ADDRESS> \
  "createVault(address,address,string,string,bool,uint256,uint256,uint8,uint256)" \
  <USDC_ADDRESS> \
  0x70997970C51812dc3A010C7d01b50e0d17dc79C8 \
  "My Test Vault" \
  "MTV" \
  false \
  100000000000 \
  100000000 \
  0 \
  10 \
  --rpc-url http://localhost:8545 \
  --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

# Approve USDC for vault
cast send <USDC_ADDRESS> \
  "approve(address,uint256)" \
  <VAULT_ADDRESS> \
  10000000000 \
  --rpc-url http://localhost:8545 \
  --private-key <INVESTOR_PRIVATE_KEY>

# Deposit into vault
cast send <VAULT_ADDRESS> \
  "deposit(uint256,address)" \
  10000000000 \
  <INVESTOR_ADDRESS> \
  --rpc-url http://localhost:8545 \
  --private-key <INVESTOR_PRIVATE_KEY>
```

---

## Connect Frontend to Local

### 1. Update Environment Variables

Create/update `packages/nextjs/.env.local`:

```env
# Use local network
NEXT_PUBLIC_CHAIN_ID=31337

# Contract addresses (from deployment output)
NEXT_PUBLIC_USDC_ADDRESS=<MOCK_USDC_ADDRESS>
NEXT_PUBLIC_DAI_ADDRESS=<MOCK_DAI_ADDRESS>
NEXT_PUBLIC_VAULT_FACTORY=<FACTORY_ADDRESS>
NEXT_PUBLIC_VAULT_MANAGER=<MANAGER_ADDRESS>
NEXT_PUBLIC_PERMIT2=<PERMIT2_ADDRESS>
```

### 2. Add Local Network to Wagmi

Update `packages/nextjs/scaffold.config.ts`:

```typescript
const scaffoldConfig = {
  targetNetworks: [
    {
      id: 31337,
      name: "Localhost",
      network: "localhost",
      nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
      rpcUrls: {
        default: { http: ["http://127.0.0.1:8545"] },
        public: { http: ["http://127.0.0.1:8545"] },
      },
    },
  ],
  // ... rest of config
};
```

### 3. Import Test Account to MetaMask

1. Open MetaMask
2. Click account icon → Import Account
3. Paste private key: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d` (Curator)
4. Add network: Localhost 8545

### 4. Start Frontend

```bash
cd packages/nextjs
yarn dev
```

---

## Test Scenarios

### Scenario 1: Full Vault Lifecycle

```bash
# 1. Deploy contracts
forge script script/DeployLocal.s.sol --rpc-url http://localhost:8545 --broadcast

# 2. Run end-to-end test
forge test --match-test test_EndToEnd_FullFlow -vvv
```

### Scenario 2: Test Withdrawal Models

```bash
# Test INSTANT model
forge test --match-test test_Withdraw_Instant -vvv

# Test EPOCH model
forge test --match-test test_Withdraw_Epoch -vvv

# Test SCHEDULED model (queue)
forge test --match-test test_RequestWithdraw_Scheduled -vvv
```

### Scenario 3: Test Strategies

```bash
# Test investing
forge test --match-test test_InvestInStrategy -vvv

# Test divesting
forge test --match-test test_DivestFromStrategy -vvv
```

### Scenario 4: Test Swaps

```bash
forge test --match-test test_SwapTokens -vvv
```

---

## Manual Testing Script

Here's a complete bash script for manual testing:

```bash
#!/bin/bash

# Set variables from deployment
USDC="<USDC_ADDRESS>"
DAI="<DAI_ADDRESS>"
FACTORY="<FACTORY_ADDRESS>"
MANAGER="<MANAGER_ADDRESS>"
AAVE_STRATEGY="<AAVE_STRATEGY_ADDRESS>"

# Private keys
CURATOR_PK="0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
INVESTOR_PK="0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"

CURATOR="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
INVESTOR="0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"

RPC="http://localhost:8545"

echo "=== Creating Vault ==="
VAULT=$(cast send $FACTORY \
  "createVault(address,address,string,string,bool,uint256,uint256,uint8,uint256)" \
  $USDC $CURATOR "Test Vault" "TV" false 100000000000 100000000 0 10 \
  --rpc-url $RPC --private-key $CURATOR_PK --json | jq -r '.logs[0].address')
echo "Vault created: $VAULT"

echo ""
echo "=== Investor Approving USDC ==="
cast send $USDC "approve(address,uint256)" $VAULT 50000000000 \
  --rpc-url $RPC --private-key $INVESTOR_PK

echo ""
echo "=== Investor Depositing 10,000 USDC ==="
cast send $VAULT "deposit(uint256,address)" 10000000000 $INVESTOR \
  --rpc-url $RPC --private-key $INVESTOR_PK

echo ""
echo "=== Check Balances ==="
echo "Vault total assets:"
cast call $VAULT "totalAssets()" --rpc-url $RPC
echo "Investor shares:"
cast call $VAULT "balanceOf(address)" $INVESTOR --rpc-url $RPC

echo ""
echo "=== Curator Adding Strategy ==="
cast send $VAULT "addStrategy(string,address)" "aave" $AAVE_STRATEGY \
  --rpc-url $RPC --private-key $CURATOR_PK

echo ""
echo "=== Curator Approving Manager ==="
cast send $VAULT "approveManagerMax(address)" $USDC \
  --rpc-url $RPC --private-key $CURATOR_PK

echo ""
echo "=== Curator Investing 5,000 USDC in Aave ==="
cast send $VAULT "invest(string,uint256)" "aave" 5000000000 \
  --rpc-url $RPC --private-key $CURATOR_PK

echo ""
echo "=== Final State ==="
echo "Vault idle assets:"
cast call $VAULT "idleAssets()" --rpc-url $RPC
echo "Vault invested assets:"
cast call $VAULT "investedAssets()" --rpc-url $RPC
echo "Strategy total assets:"
cast call $AAVE_STRATEGY "totalAssets()" --rpc-url $RPC

echo ""
echo "=== Done! ==="
```

---

## Deploy to Sepolia

Once local testing passes:

### 1. Set Environment Variables

```bash
export PRIVATE_KEY=<your_deployer_private_key>
export ALCHEMY_API_KEY=<your_alchemy_key>
export ETHERSCAN_API_KEY=<your_etherscan_key>

# Sepolia addresses
export USDC=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
export PERMIT2=0x000000000022D473030F116dDEE9F6B43aC78BA3
export SWAP_ROUTER=0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E
export AAVE_V3_POOL=0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951
```

### 2. Deploy

```bash
forge script script/DeployNestFi.s.sol \
  --rpc-url sepolia \
  --broadcast \
  --verify
```

### 3. Verify Contracts

```bash
forge verify-contract <CONTRACT_ADDRESS> <CONTRACT_NAME> \
  --chain sepolia \
  --etherscan-api-key $ETHERSCAN_API_KEY
```

---

## Troubleshooting

### "Execution reverted"
- Check you have enough ETH for gas
- Verify contract addresses are correct
- Check function parameters

### "Insufficient allowance"
- Make sure you approved tokens before depositing/investing

### "Not authorized"
- Make sure you're using the correct account (curator vs investor)

### "Epoch not ended"
- For EPOCH vaults, wait for epoch to end or use `vm.warp()` in tests

### Tests failing
```bash
# Run with maximum verbosity
forge test -vvvv

# Run single test
forge test --match-test test_CreateVault_Instant -vvvv
```

---

## File Structure

```
packages/foundry/
├── contracts/
│   ├── GroupVault.sol          # Main vault
│   ├── VaultFactory.sol        # Factory
│   ├── VaultManager.sol        # Strategy manager
│   ├── interfaces/             # Interfaces
│   ├── strategies/             # Strategy implementations
│   └── mocks/                  # Mock contracts for testing
│       ├── MockERC20.sol       # MockUSDC, MockDAI
│       ├── MockPermit2.sol     # Mock Permit2
│       ├── MockSwapRouter.sol  # Mock Uniswap
│       └── MockStrategy.sol    # Mock yield strategy
├── script/
│   ├── DeployLocal.s.sol       # Local deployment
│   └── DeployNestFi.s.sol      # Production deployment
├── test/
│   └── NestFi.t.sol            # Test suite
├── ARCHITECTURE.md             # Architecture docs
└── LOCAL_TESTING.md            # This file
```
