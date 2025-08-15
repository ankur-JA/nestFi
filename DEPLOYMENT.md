# 🚀 Production Deployment Guide

This guide will help you deploy NestFi to Optimism mainnet for production use.

## 📋 Prerequisites

- Optimism RPC endpoint
- Private key with sufficient ETH for deployment
- USDC contract address on Optimism
- Permit2 contract address on Optimism

## 🔧 Environment Setup

### 1. Update Environment Variables

```bash
cd packages/foundry
cp .env.example .env
```

Edit `.env`:
```env
# Optimism Mainnet
PRIVATE_KEY=your_private_key_here
RPC_URL=https://mainnet.optimism.io
ETHERSCAN_API_KEY=your_etherscan_api_key

# Contract Addresses (Optimism Mainnet)
USDC_ADDRESS=0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85
PERMIT2_ADDRESS=0x000000000022D473030F116dDEE9F6B43aC78BA3
```

### 2. Provide Production Addresses (no mocks)

Add these to `packages/foundry/.env`:

```env
# Core
USDC=0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85
PERMIT2=0x000000000022D473030F116dDEE9F6B43aC78BA3

# Optional strategies
AAVE_V3_POOL=0x...  # Optimism Aave v3 IPool address
COMET_USDC=0x...    # Optimism Comet USDC market
```

## 🏗️ Smart Contract Deployment

### 1. Deploy to Optimism

```bash
cd packages/foundry

# Deploy contracts
yarn deploy --network optimism

# Verify contracts on Etherscan
yarn verify --network optimism
```

### 2. Update Frontend Configuration

Update `packages/nextjs/contracts/deployedContracts.ts` with the new addresses.

### 3. Update Environment Variables

```bash
cd packages/nextjs
cp .env.example .env
```

Edit `.env`:
```env
NEXT_PUBLIC_CHAIN_ID=10
NEXT_PUBLIC_RPC_URL=https://mainnet.optimism.io
NEXT_PUBLIC_ETHERSCAN_API_KEY=your_etherscan_api_key
```

## 🌐 Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   cd packages/nextjs
   vercel
   ```

2. **Set Environment Variables**
   - Go to Vercel Dashboard
   - Add environment variables
   - Redeploy

### Option 2: Netlify

1. **Build and Deploy**
   ```bash
   cd packages/nextjs
   yarn build
   # Upload dist folder to Netlify
   ```

### Option 3: Self-hosted

1. **Build Application**
   ```bash
   cd packages/nextjs
   yarn build
   yarn start
   ```

## 🔍 Post-Deployment Checklist

- [ ] Contracts deployed successfully
- [ ] Contracts verified on Etherscan
- [ ] Frontend deployed and accessible
- [ ] Wallet connection working
- [ ] Vault creation functional
- [ ] Dashboard displaying correctly
- [ ] Gasless transactions working
- [ ] Error handling implemented
- [ ] Analytics tracking enabled

## 🛡️ Security Considerations

### Smart Contracts
- [ ] Audit completed
- [ ] Access controls verified
- [ ] Emergency pause functionality tested
- [ ] Reentrancy protection confirmed

### Frontend
- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] API rate limiting implemented
- [ ] Input validation enforced

## 📊 Monitoring

### Smart Contracts
- Monitor contract events
- Track gas usage
- Monitor for suspicious transactions

### Frontend
- Set up error tracking (Sentry)
- Monitor user analytics
- Track performance metrics

## 🔄 Updates and Maintenance

### Smart Contract Updates
1. Deploy new implementation
2. Update factory contract
3. Migrate existing vaults (if needed)

### Frontend Updates
1. Deploy new version
2. Test thoroughly
3. Monitor for issues

## 🆘 Troubleshooting

### Common Issues

1. **Contract Deployment Fails**
   - Check gas limits
   - Verify private key
   - Ensure sufficient ETH

2. **Frontend Not Loading**
   - Check RPC endpoint
   - Verify contract addresses
   - Check browser console

3. **Transactions Failing**
   - Check gas prices
   - Verify user has sufficient tokens
   - Check contract permissions

## 📞 Support

For deployment issues:
- Check logs for error messages
- Verify all environment variables
- Test on testnet first
- Contact the development team

---

**Happy Deploying! 🚀**
