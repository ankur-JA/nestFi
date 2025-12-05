<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-brightgreen" alt="Status" />
  <img src="https://img.shields.io/badge/License-MIT-blue" alt="License" />
  <img src="https://img.shields.io/badge/Solidity-0.8.20-purple" alt="Solidity" />
  <img src="https://img.shields.io/badge/Next.js-14-black" alt="Next.js" />
</p>

<h1 align="center">🪺 NestFi</h1>

<p align="center">
  <strong>Decentralized Asset Management Protocol</strong>
</p>

<p align="center">
  Pool funds into curated DeFi vaults. Curators manage strategies, investors share returns.<br/>
  Fully transparent. Fully on-chain.
</p>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Smart Contracts](#-smart-contracts)
- [Frontend](#-frontend)
- [User Roles](#-user-roles)
- [Tech Stack](#-tech-stack)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Security](#-security)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**NestFi** is a decentralized investment vault protocol built on Ethereum. It enables:

- **Investors** to deposit funds into professionally managed vaults and earn passive yields
- **Curators** to create investment vaults, deploy DeFi strategies, and earn management fees

The protocol uses the **ERC-4626** tokenized vault standard for maximum composability and transparency.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🏦 **ERC-4626 Vaults** | Fully compliant tokenized vault standard |
| ⚡ **Gasless Transactions** | ERC-7702 + Permit2 for seamless UX |
| 🔐 **Non-Custodial** | Users always control their funds |
| 📊 **Multi-Strategy** | Deploy to Aave, Uniswap, Velodrome, and more |
| 🎯 **Allowlist Control** | Curators can restrict vault access |
| 💰 **Flexible Fees** | Customizable management fee structure |
| 🌙 **Dark/Light Theme** | Beautiful, modern UI with theme support |
| 📱 **Responsive Design** | Works on all devices |

---

## 🏗 Architecture

```
╔═════════════════════════════════════════════════════════════════════╗
║                            NestFi                                   ║
╠═════════════════════════════════════════════════════════════════════╣
║                                                                     ║
║    ┌──────────────┐      ┌──────────────┐      ┌──────────────┐   ║
║    │   Frontend   │      │    Smart     │      │  Strategies  │   ║
║    │  (Next.js)   │◄────►│  Contracts   │◄────►│   (DeFi)     │   ║
║    └──────────────┘      └──────────────┘      └──────────────┘   ║
║          │                    │                      │             ║
║          │                    │                      │             ║
║          ▼                    ▼                      ▼             ║
║    ┌──────────────┐      ┌──────────────┐      ┌──────────────┐   ║
║    │  RainbowKit  │      │ VaultFactory │      │    Aave      │   ║
║    │  Wagmi/Viem  │      │  GroupVault  │      │   Uniswap    │   ║
║    │    React     │      │   Permit2    │      │  Velodrome   │   ║
║    └──────────────┘      └──────────────┘      └──────────────┘   ║
║                                                                     ║
╚═════════════════════════════════════════════════════════════════════╝
```

### Data Flow

1. **User connects wallet** via RainbowKit
2. **Frontend reads** vault data from blockchain (Wagmi/Viem)
3. **User signs** deposit/withdraw transactions
4. **Smart contracts** execute operations
5. **Strategies** deploy funds to DeFi protocols

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | 18+ |
| pnpm | Latest |
| Foundry | Latest |
| Git | Latest |

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/nestfi.git
cd nestfi

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp packages/foundry/.env.example packages/foundry/.env
# Edit .env with your private key

# 4. Start local blockchain
cd packages/foundry
anvil

# 5. Deploy contracts (in a new terminal)
cd packages/foundry
pnpm deploy --reset

# 6. Start frontend (in a new terminal)
cd packages/nextjs
pnpm dev

# 7. Open in browser
open http://localhost:3000
```

---

## 📜 Smart Contracts

### Core Contracts

| Contract | Description |
|----------|-------------|
| `VaultFactory.sol` | Factory for creating vault instances |
| `GroupVault.sol` | ERC-4626 compliant investment vault |

### Strategy Contracts

| Contract | Description |
|----------|-------------|
| `AaveStrategy.sol` | Aave V3 lending strategy |
| `UniswapStrategy.sol` | Uniswap V3 liquidity strategy |
| `VelodromeStrategy.sol` | Velodrome DEX strategy |

### Contract Features

- ✅ ERC-4626 compliant
- ✅ Permit2 gasless approvals
- ✅ Reentrancy protection
- ✅ Pausable functionality
- ✅ Access control (allowlists)
- ✅ Deposit caps & minimums

---

## 💻 Frontend

### Project Structure

```
packages/nextjs/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Landing page
│   ├── investor/          # Investor dashboard
│   └── curator/           # Curator dashboard
├── components/            # React components
│   ├── Header.tsx         # Navigation header
│   ├── Footer.tsx         # Site footer
│   ├── NestFiLogo.tsx     # Brand logo
│   └── SettingsDropdown.tsx # Settings panel
├── contexts/              # React contexts
│   └── ThemeContext.tsx   # Theme management
├── hooks/                 # Custom hooks
└── styles/                # Global styles
```

### Key Components

| Component | Purpose |
|-----------|---------|
| `Header` | Navigation with wallet connection |
| `Footer` | Site footer with links |
| `SettingsDropdown` | Theme toggle, language, settings |
| `VaultCard` | Display vault information |

---

## 👥 User Roles

### 🔵 Investor

Investors deposit funds into vaults to earn passive yields.

| Action | Description |
|--------|-------------|
| Browse Vaults | Explore available investment vaults |
| Deposit USDC | Invest any amount into a vault |
| Track Performance | Monitor your investments |
| Withdraw | Exit your position anytime |

### 🟢 Curator

Curators create and manage investment vaults.

| Action | Description |
|--------|-------------|
| Create Vault | Set up a new investment vault |
| Deploy Strategies | Allocate funds to DeFi protocols |
| Manage Access | Control who can invest |
| Earn Fees | Collect management fees |

---

## 🛠 Tech Stack

### Smart Contracts

| Technology | Purpose |
|------------|---------|
| Solidity | Smart contract language |
| Foundry | Development framework |
| OpenZeppelin | Security libraries |

### Frontend

| Technology | Purpose |
|------------|---------|
| Next.js 14 | React framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Framer Motion | Animations |

### Web3

| Technology | Purpose |
|------------|---------|
| Wagmi v2 | React hooks for Ethereum |
| Viem | TypeScript Ethereum library |
| RainbowKit | Wallet connection |

---

## 🔐 Environment Variables

### Foundry (`packages/foundry/.env`)

```env
# Required
PRIVATE_KEY=your_private_key_here

# Network RPC URLs
RPC_URL_SEPOLIA=https://sepolia.infura.io/v3/YOUR_KEY
RPC_URL_OPTIMISM=https://optimism.infura.io/v3/YOUR_KEY

# Etherscan API (for verification)
ETHERSCAN_API_KEY=your_api_key
```

### Frontend (`packages/nextjs/.env.local`)

```env
# Chain configuration
NEXT_PUBLIC_CHAIN_ID=11155111

# Optional: The Graph endpoint
NEXT_PUBLIC_GRAPH_ENDPOINT=

# Optional: Strategy addresses
NEXT_PUBLIC_AAVE_STRATEGY=
```

---

## 🚢 Deployment

### Deploy to Testnet (Sepolia)

```bash
cd packages/foundry

# Set environment variables
export PRIVATE_KEY=your_private_key

# Deploy
forge script script/Deploy.s.sol --rpc-url sepolia --broadcast --verify
```

### Deploy to Production (Optimism)

```bash
cd packages/foundry

# Deploy with production settings
forge script script/Deploy.s.sol --rpc-url optimism --broadcast --verify
```

### Deploy Frontend

```bash
cd packages/nextjs

# Build for production
pnpm build

# Deploy to Vercel
vercel --prod
```

---

## 🔒 Security

### Smart Contract Security

- ✅ OpenZeppelin audited libraries
- ✅ Reentrancy guards on all external calls
- ✅ Access control on admin functions
- ✅ Input validation on all parameters
- ✅ Emergency pause functionality

### Best Practices

- All funds are non-custodial
- No admin keys can drain funds
- Transparent on-chain operations
- Open source code

---

## 🗺 Roadmap

### Phase 1: Foundation ✅
- [x] ERC-4626 vault implementation
- [x] Basic strategies (Aave)
- [x] Frontend dashboard
- [x] Wallet integration

### Phase 2: Enhancement 🚧
- [ ] Additional strategies (Uniswap, Velodrome)
- [ ] Performance analytics
- [ ] Vault reputation system
- [ ] Mobile optimization

### Phase 3: Scale 📋
- [ ] Multi-chain deployment
- [ ] Governance token
- [ ] DAO voting
- [ ] API for integrations

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Write tests for new features
- Follow existing code style
- Update documentation as needed
- Keep commits atomic and descriptive

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support & Links

| Resource | Link |
|----------|------|
| 📖 Documentation | Coming soon |
| 🐛 Report Bug | [Open Issue](https://github.com/your-username/nestfi/issues) |
| 💬 Discord | Coming soon |
| 🐦 Twitter | Coming soon |

---

<p align="center">
  <strong>Made with ❤️ by NestFi Labs</strong>
</p>

<p align="center">
  <sub>Invest together. Grow together.</sub>
</p>
