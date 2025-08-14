import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// The Graph endpoint for indexing blockchain data
const GRAPH_ENDPOINT = process.env.NEXT_PUBLIC_GRAPH_ENDPOINT;

// Determine if endpoint looks valid (avoid placeholder/defaults)
const isGraphEndpointValid = !!GRAPH_ENDPOINT && /^https?:\/\//.test(GRAPH_ENDPOINT) && !GRAPH_ENDPOINT.includes('your-subgraph');

let graphClient: ApolloClient<any> | null = null;

if (typeof window !== 'undefined' && isGraphEndpointValid) {
  const httpLink = createHttpLink({
    uri: GRAPH_ENDPOINT as string,
    fetchOptions: { mode: 'cors' },
  });

  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
      },
    };
  });

  graphClient = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        errorPolicy: 'all',
      },
      query: {
        errorPolicy: 'all',
      },
    },
  });
} else if (typeof window !== 'undefined') {
  console.warn('GraphQL disabled: set NEXT_PUBLIC_GRAPH_ENDPOINT to a valid The Graph subgraph URL.');
}

export { graphClient };
export const isGraphEnabled = !!graphClient;

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
