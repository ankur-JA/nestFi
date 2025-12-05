# Local Frontend Setup Guide

This guide will help you connect your Next.js frontend to the locally deployed contracts.

## Step 1: Create `.env.local` File

Create a file called `.env.local` in the `packages/nextjs` directory with the following content:

```env
# Local Development Environment Variables
# These addresses are from the local deployment (anvil)

# Chain Configuration
NEXT_PUBLIC_CHAIN_ID=31337

# Contract Addresses (from DeployLocal.s.sol deployment)
NEXT_PUBLIC_USDC_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_DAI_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
NEXT_PUBLIC_PERMIT2_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
NEXT_PUBLIC_VAULT_FACTORY=0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82
NEXT_PUBLIC_VAULT_MANAGER=0x8A791620dd6260079BF849Dc5567aDC3F2FdC318

# RPC Configuration
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
```

**Note:** The contract addresses above are from your deployment. If you redeploy, update these addresses.

## Step 2: Update `deployedContracts.ts` (Optional but Recommended)

The `packages/nextjs/contracts/deployedContracts.ts` file needs to include the localhost (31337) chain entries. 

You can either:
1. **Manually add** the localhost entries (see below)
2. **Or** use Scaffold-ETH's contract generation script if available

### Manual Addition:

Add this to the `deployedContracts` object in `packages/nextjs/contracts/deployedContracts.ts`:

```typescript
const deployedContracts = {
  11155111: { /* existing sepolia contracts */ },
  31337: {
    VaultFactory: {
      address: "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82",
      abi: [ /* ABI from out/VaultFactory.sol/VaultFactory.json */ ]
    },
    GroupVault: {
      address: "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0", // Implementation address
      abi: [ /* ABI from out/GroupVault.sol/GroupVault.json */ ]
    },
    VaultManager: {
      address: "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318", // Proxy address
      abi: [ /* ABI from out/VaultManager.sol/VaultManager.json */ ]
    },
  },
} as const;
```

**To get the ABIs:**
```bash
cd packages/foundry
cat out/VaultFactory.sol/VaultFactory.json | jq '.abi' > /tmp/vaultfactory-abi.json
cat out/GroupVault.sol/GroupVault.json | jq '.abi' > /tmp/groupvault-abi.json
cat out/VaultManager.sol/VaultManager.json | jq '.abi' > /tmp/vaultmanager-abi.json
```

## Step 3: Import Test Account to MetaMask

1. Open MetaMask
2. Click the account icon (top right) → **Import Account**
3. Paste this private key (Curator account):
   ```
   0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
   ```
4. **Add Localhost Network** to MetaMask:
   - Network Name: `Localhost 8545`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`

## Step 4: Start the Frontend

```bash
cd packages/nextjs
yarn dev
```

The app will be available at `http://localhost:3000`

## Step 5: Test the Integration

1. **Connect Wallet**: Click "Connect Wallet" and select the imported account
2. **Create Vault**: Go to `/curator` and create a new vault
3. **Deposit**: Go to the vault page and deposit some USDC
4. **Manage Vault**: As curator, you can swap tokens, invest in strategies, etc.

## Troubleshooting

### "Contract not found" errors
- Make sure `anvil` is still running
- Verify contract addresses in `.env.local` match your deployment
- Check that `deployedContracts.ts` includes chain ID 31337

### "Insufficient funds" errors
- The test accounts should have 100k USDC and 100k DAI pre-minted
- If not, you can mint more using the MockERC20 contract

### "Network not found" in MetaMask
- Make sure you added the Localhost 8545 network
- Chain ID must be exactly `31337`

### Frontend not connecting to localhost
- Verify `NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545` in `.env.local`
- Restart the Next.js dev server after changing `.env.local`

## Test Accounts

From your deployment, you have these test accounts:

| Account | Address | Private Key | Role |
|---------|---------|-------------|------|
| Deployer | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` | Deployer |
| Curator | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d` | Curator |
| Investor1 | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a` | Investor |
| Investor2 | `0x90F79bf6EB2c4f870365E785982E1f101E93b906` | `0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6` | Investor |

All accounts have **100,000 USDC** and **100,000 DAI** pre-minted.

## Quick Start Commands

```bash
# Terminal 1: Start local blockchain
cd packages/foundry
anvil

# Terminal 2: Deploy contracts
cd packages/foundry
forge script script/DeployLocal.s.sol:DeployLocal --rpc-url http://localhost:8545 --broadcast

# Terminal 3: Start frontend
cd packages/nextjs
yarn dev
```

Then open `http://localhost:3000` in your browser!

