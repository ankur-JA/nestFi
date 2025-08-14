// Graph functionality disabled in production build to avoid dependency bloat.

// The Graph endpoint for indexing blockchain data
const GRAPH_ENDPOINT = process.env.NEXT_PUBLIC_GRAPH_ENDPOINT;

// Determine if endpoint looks valid (avoid placeholder/defaults)
export const graphClient = null as any;
export const isGraphEnabled = false;

// GraphQL queries for vault data
export const VAULT_QUERIES = {
  GET_USER_VAULTS: `
    query GetUserVaults($userAddress: String!) {
      vaults(where: { owner: $userAddress }) {
        id
        address
        name
        symbol
        asset
        totalAssets
        totalShares
        owner
        createdAt
        depositCap
        minDeposit
        allowlistEnabled
      }
    }
  `,
  
  GET_VAULT_DETAILS: `
    query GetVaultDetails($vaultAddress: String!) {
      vault(id: $vaultAddress) {
        id
        address
        name
        symbol
        asset
        totalAssets
        totalShares
        owner
        createdAt
        depositCap
        minDeposit
        allowlistEnabled
        deposits {
          id
          user
          amount
          shares
          timestamp
        }
        withdrawals {
          id
          user
          amount
          shares
          timestamp
        }
      }
    }
  `,
  
  GET_VAULT_TRANSACTIONS: `
    query GetVaultTransactions($vaultAddress: String!, $first: Int!, $skip: Int!) {
      deposits(
        where: { vault: $vaultAddress }
        first: $first
        skip: $skip
        orderBy: timestamp
        orderDirection: desc
      ) {
        id
        user
        amount
        shares
        timestamp
      }
      withdrawals(
        where: { vault: $vaultAddress }
        first: $first
        skip: $skip
        orderBy: timestamp
        orderDirection: desc
      ) {
        id
        user
        amount
        shares
        timestamp
      }
    }
  `
};
