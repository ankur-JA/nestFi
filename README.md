# 🪺 NestFi - Decentralized Investment Vaults

A modern, gasless DeFi platform for creating and managing investment vaults with ERC-4626 standard and ERC-7702 gasless transactions.

Made with ❤️ by Gearhead (solo builder)

## ✨ Features

- **🪺 ERC-4626 Vaults**: Standard-compliant investment vaults
- **⚡ Gasless Transactions**: ERC-7702 integration for gasless deposits
- **🔐 Permit2 Support**: Off-chain approvals for seamless UX
- **🎯 Allowlist Management**: Control who can join your vaults
- **📊 Live Dashboard**: On‑chain reads with Wagmi/Viem (no centralized DB)
- **🎨 Modern UI**: Beautiful, responsive interface with animations
- **🔧 Factory Pattern**: Easy vault creation and management
- **🗂️ Firebase‑free**: Pure Web3 data model (no Firebase)
- **📈 Optional Indexing**: The Graph support is available but disabled by default

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Smart         │    │   Gasless       │
│   (Next.js)     │◄──►│   Contracts     │◄──►│   Infrastructure │
│                 │    │                 │    │                 │
│ • Dashboard     │    │ • VaultFactory  │    │ • ERC-7702      │
│ • Vault Creation│    │ • GroupVault    │    │ • Permit2       │
│ • User Mgmt     │    │ • USDC (real)   │    │ • Relayer       │
└─────────────────┘    └─────────────────┘    └─────────────────┘

Optional: The Graph subgraph → consumed via Apollo Client on the client‑side only.

No Firebase. No centralized DB.

---

## 🧠 Data & Indexing

- Default setup reads directly from the blockchain using Wagmi/Viem and simple API routes.
- The Graph is supported for richer lists/analytics, but is off by default to simplify local development.
- To enable The Graph in the frontend, set an endpoint:
  - `packages/nextjs/.env.local`
    ```env
    NEXT_PUBLIC_GRAPH_ENDPOINT=https://api.thegraph.com/subgraphs/name/<owner>/<subgraph>
    ```
  If not provided, the app gracefully falls back to on‑chain reads only.
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Yarn
- Foundry

### Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url](https://github.com/ankur-JA/nestFi.git)
   cd nestfi
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cd packages/foundry
   cp .env.example .env
   # Edit .env with your private key
   ```

4. **Deploy contracts (local Anvil)**
   ```bash
   cd packages/foundry
   yarn deploy --reset
   ```

5. **Start the frontend**
   ```bash
   cd packages/nextjs
   yarn dev
   ```

6. **Visit the application**
   ```
   http://localhost:3000
   ```

## 📋 Smart Contracts

### Core Contracts

- **`VaultFactory`**: Creates and manages vault instances
- **`GroupVault`**: ERC-4626 compliant vault implementation
  (Mocks removed for production)
- **`ERC7702Relayer`**: Gasless transaction relayer

### Key Features

- **ERC-4626 Standard**: Full compliance with vault standard
- **Gasless Deposits**: ERC-7702 + Permit2 integration for gasless transactions
- **Real Strategies**: Pluggable adapters (Aave v3, Compound v3 Comet, Uniswap V3 LP)
- **Allowlist Control**: Restrict vault access to approved addresses
- **Deposit Caps**: Set maximum vault capacity
- **Minimum Deposits**: Enforce minimum investment amounts
- **Pausable**: Emergency pause functionality
- **Reentrancy Protection**: Secure against reentrancy attacks

## 🎯 Usage

### Creating a Vault

1. Navigate to `/createvault`
2. Fill in vault details:
   - **Name**: Vault display name
   - **Symbol**: Vault token symbol
   - **Deposit Cap**: Maximum vault capacity
   - **Min Deposit**: Minimum investment amount
   - **Allowlist**: Enable/disable access control
3. Click "Create Vault"
4. Confirm transaction in wallet

### Managing Vaults

- **Dashboard**: View all your vaults at `/dashboard`
- **Admin Vaults**: Manage vaults you created
- **Member Vaults**: View vaults you've joined
- **Real-time Stats**: Track total assets, shares, and performance

### Gasless Deposits

1. Approve USDC spending (off-chain via Permit2)
2. Sign deposit transaction (off-chain via ERC-7702)
3. Relayer executes transaction (gasless for user)

## 🔧 Development

### Project Structure

```
nestfi/
├── packages/
│   ├── foundry/          # Smart contracts
│   │   ├── contracts/    # Solidity contracts
│   │   ├── script/       # Deployment scripts
│   │   └── test/         # Contract tests
│   └── nextjs/           # Frontend application
│       ├── app/          # Next.js app router
│       ├── components/   # React components
│       ├── hooks/        # Custom hooks
│       └── utils/        # Utility functions
└── lib/                  # Shared dependencies
```

### Key Technologies

- **Smart Contracts**: Solidity, OpenZeppelin, Foundry
- **Frontend**: Next.js App Router, React, TypeScript, Tailwind CSS
- **Web3**: Wagmi v2, Viem, RainbowKit
- **UI/UX**: Framer Motion, Headless UI
- **Gasless**: ERC-7702, Permit2

### Testing

```bash
# Test smart contracts
cd packages/foundry
forge test

# Test frontend
cd packages/nextjs
yarn test
```

## 🌐 Deployment

### Production Deployment

1. **Deploy to Optimism**
   ```bash
   cd packages/foundry
   # Update .env with production private key
   yarn deploy --network optimism
   ```

2. **Update USDC Address**
   - Set real USDC address
   - Update Permit2 address for Optimism

3. **Deploy Frontend**
   ```bash
   cd packages/nextjs
   # Deploy to Vercel or your preferred platform
   ```

### Environment Variables

```env
# Foundry
PRIVATE_KEY=your_private_key
RPC_URL=your_rpc_url

# Frontend (App)
NEXT_PUBLIC_CHAIN_ID=10
NEXT_PUBLIC_RPC_URL=your_optimism_rpc
# Optional (enable Graph indexing)
NEXT_PUBLIC_GRAPH_ENDPOINT=

# Strategy addresses (after adapter deploy)
NEXT_PUBLIC_AAVE_STRATEGY=
NEXT_PUBLIC_COMET_STRATEGY=
NEXT_PUBLIC_UNIV3_STRATEGY=
```

## 🔒 Security

- **Audited Dependencies**: OpenZeppelin contracts
- **Reentrancy Protection**: Secure against reentrancy attacks
- **Access Control**: Role-based permissions
- **Pausable**: Emergency stop functionality
- **Input Validation**: Comprehensive parameter checks

## 📈 Roadmap

- [ ] **Multi-chain Support**: Deploy to multiple networks
- [ ] **Advanced Strategies**: Yield farming integrations
- [ ] **Governance**: DAO governance for vaults
- [ ] **Analytics**: Advanced vault analytics
- [ ] **Mobile App**: React Native mobile application
- [ ] **API**: Public API for third-party integrations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

## 🆘 Support

- **Repository**: https://github.com/ankur-JA/nestFi
- **Issues**: Open a GitHub issue in the repo

---

**Made with ❤️ by Gearhead**
