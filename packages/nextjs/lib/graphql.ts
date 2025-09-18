// Temporarily disabled GraphQL functionality to fix runtime errors

// GraphQL endpoint - replace with your deployed subgraph URL
const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPH_ENDPOINT || 'https://api.thegraph.com/subgraphs/name/your-username/nestfi-sepolia';

// Mock GraphQL queries for now
export const GET_USER_VAULTS = '';
export const GET_USER_MEMBERSHIPS = '';
export const GET_USER_ALLOWLIST_MEMBERSHIPS = '';
export const GET_VAULT_DETAILS = '';
export const GET_USER_VAULT_MEMBERSHIP = '';
export const GET_ALL_VAULTS = '';

// Mock GraphQL client
export class GraphQLClient {
  private endpoint: string;

  constructor(endpoint?: string) {
    this.endpoint = endpoint || GRAPHQL_ENDPOINT;
  }

  async getUserVaults(userAddress: string): Promise<any> {
    console.log('GraphQL getUserVaults called with:', userAddress);
    return [];
  }

  async getUserMemberships(userAddress: string): Promise<any> {
    console.log('GraphQL getUserMemberships called with:', userAddress);
    return [];
  }

  async getUserAllowlistMemberships(userAddress: string): Promise<any> {
    console.log('GraphQL getUserAllowlistMemberships called with:', userAddress);
    return [];
  }

  async getVaultDetails(vaultAddress: string): Promise<any> {
    console.log('GraphQL getVaultDetails called with:', vaultAddress);
    return null;
  }

  async getUserVaultMembership(vaultAddress: string, userAddress: string): Promise<any> {
    console.log('GraphQL getUserVaultMembership called with:', vaultAddress, userAddress);
    return null;
  }

  async getAllVaults(first: number = 100, skip: number = 0): Promise<any> {
    console.log('GraphQL getAllVaults called with:', first, skip);
    return [];
  }
}

// Export a default instance
export const graphqlClient = new GraphQLClient();