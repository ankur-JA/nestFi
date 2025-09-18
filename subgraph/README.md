# NestFi Subgraph

This subgraph indexes NestFi vault protocol data for fast querying via GraphQL.

## Features

- **Vault Indexing**: Tracks all vaults created by the VaultFactory
- **Member Tracking**: Monitors vault members and their balances
- **Transaction History**: Records all deposits, withdrawals, and allowlist updates
- **Real-time Updates**: Automatically syncs with blockchain events

## Setup

### 1. Install Dependencies

```bash
cd subgraph
npm install
```

### 2. Configure Environment

Create a `.env` file with your deployment key:

```bash
DEPLOY_KEY=your_graph_deployment_key_here
```

### 3. Deploy to The Graph

```bash
./deploy.sh
```

Or manually:

```bash
npm run codegen
npm run build
npm run deploy
```

## GraphQL Schema

### Vault Entity

```graphql
type Vault {
  id: ID!                    # vault address
  address: Bytes!
  owner: Bytes!
  asset: Bytes!
  name: String!
  symbol: String!
  allowlistEnabled: Boolean!
  depositCap: BigInt!
  minDeposit: BigInt!
  totalAssets: BigInt!
  totalSupply: BigInt!
  isPaused: Boolean!
  strategy: Bytes
  createdAt: BigInt!
  updatedAt: BigInt!
  members: [VaultMember!]!
  deposits: [Deposit!]!
  withdrawals: [Withdrawal!]!
}
```

### VaultMember Entity

```graphql
type VaultMember {
  id: ID!                    # vaultAddress-userAddress
  vault: Vault!
  user: Bytes!
  balance: BigInt!
  shares: BigInt!
  isAllowed: Boolean!
  joinedAt: BigInt!
  lastUpdated: BigInt!
}
```

## Example Queries

### Get All User Vaults

```graphql
query GetUserVaults($userAddress: Bytes!) {
  vaults(where: { owner: $userAddress }) {
    id
    name
    symbol
    totalAssets
    totalSupply
    isPaused
  }
}
```

### Get User Memberships

```graphql
query GetUserMemberships($userAddress: Bytes!) {
  vaultMembers(where: { user: $userAddress, shares_gt: "0" }) {
    vault {
      id
      name
      symbol
      totalAssets
    }
    shares
    isAllowed
  }
}
```

### Get Vault Details with Members

```graphql
query GetVaultDetails($vaultAddress: Bytes!) {
  vault(id: $vaultAddress) {
    id
    name
    symbol
    totalAssets
    totalSupply
    members(first: 10, orderBy: shares, orderDirection: desc) {
      user
      shares
      isAllowed
    }
  }
}
```

## Performance Benefits

### Before (RPC Calls)
- ❌ Multiple sequential API calls
- ❌ 30+ second loading times
- ❌ Rate limiting issues
- ❌ Expensive blockchain queries

### After (GraphQL)
- ✅ Single GraphQL query
- ✅ Sub-second response times
- ✅ No rate limits
- ✅ Pre-indexed data
- ✅ Complex filtering and sorting
- ✅ Historical data queries

## Frontend Integration

The frontend now uses the GraphQL-based hook:

```typescript
import { useVaultFactoryGraph } from '~/hooks/useVaultFactoryGraph';

// Fast vault loading
const { userVaults, loading, error } = useVaultFactoryGraph();
```

## Monitoring

After deployment, monitor your subgraph at:
- **The Graph Studio**: https://thegraph.com/studio/
- **Subgraph URL**: https://api.thegraph.com/subgraphs/name/nestfi-sepolia

## Troubleshooting

### Common Issues

1. **Deployment Failed**: Check your DEPLOY_KEY and network connection
2. **No Data**: Ensure the subgraph is synced to the latest block
3. **Slow Queries**: Check the GraphQL query complexity

### Sync Status

Check sync status in The Graph Studio or via API:

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "{ _meta { hasIndexingErrors block { number } } }"}' \
  https://api.thegraph.com/subgraphs/name/nestfi-sepolia
```
