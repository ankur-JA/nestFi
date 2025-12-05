# Quick Start: Run NestFi Locally

## ✅ Step 1: Start Local Blockchain

**Terminal 1:**
```bash
cd packages/foundry
anvil
```
*Keep this running!*

## ✅ Step 2: Deploy Contracts

**Terminal 2:**
```bash
cd packages/foundry
forge script script/DeployLocal.s.sol:DeployLocal --rpc-url http://localhost:8545 --broadcast
```

**Save these addresses from the output:**
- USDC: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- DAI: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`
- VaultFactory: `0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82`
- VaultManager: `0x8A791620dd6260079BF849Dc5567aDC3F2FdC318`

## ✅ Step 3: Configure Frontend

**Create `packages/nextjs/.env.local`:**

```env
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_USDC_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_DAI_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
NEXT_PUBLIC_PERMIT2_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
NEXT_PUBLIC_VAULT_FACTORY=0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82
NEXT_PUBLIC_VAULT_MANAGER=0x8A791620dd6260079BF849Dc5567aDC3F2FdC318
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
```

## ✅ Step 4: Setup MetaMask

1. **Import Test Account:**
   - Open MetaMask → Import Account
   - Paste: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
   - This is the **Curator** account with 100k USDC & 100k DAI

2. **Add Localhost Network:**
   - Network Name: `Localhost 8545`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency: `ETH`

## ✅ Step 5: Start Frontend

**Terminal 3:**
```bash
cd packages/nextjs
yarn dev
```

Open `http://localhost:3000` in your browser!

## 🧪 Test It Out

1. **Connect Wallet** (use the imported Curator account)
2. **Create Vault**: Go to `/curator` → Create New Vault
3. **Deposit**: Go to vault page → Deposit USDC
4. **Manage**: Swap tokens, invest in strategies, etc.

## 📝 Notes

- The `scaffold.config.ts` has been updated to support localhost
- Contract addresses are in `.env.local` (create this file)
- All test accounts have 100k USDC and 100k DAI pre-minted
- If you redeploy, update the addresses in `.env.local`

## 🐛 Troubleshooting

**"Contract not found"**
- Make sure `anvil` is running
- Check addresses in `.env.local` match deployment

**"Network not found"**
- Add Localhost 8545 network in MetaMask (Chain ID: 31337)

**"Insufficient funds"**
- Test accounts should have 100k USDC/DAI
- Check balance: `cast call <USDC_ADDRESS> "balanceOf(address)" <YOUR_ADDRESS> --rpc-url http://localhost:8545`

---

**That's it!** You're now running NestFi locally. 🚀

