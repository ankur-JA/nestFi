import { graphClient, VAULT_QUERIES } from './graphql';
import { IPFSService, Web3StorageService, VaultMetadata } from './ipfs';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';

// Enhanced vault data interface
export interface VaultData {
  id: string;
  address: string;
  name: string;
  symbol: string;
  asset: string;
  totalAssets: string;
  totalShares: string;
  owner: string;
  createdAt: string;
  depositCap: string;
  minDeposit: string;
  allowlistEnabled: boolean;
  metadata?: VaultMetadata;
  userBalance?: string;
  userShares?: string;
  isAdmin: boolean;
  apy?: string;
  tvl?: string;
  transactions?: Transaction[];
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw';
  user: string;
  amount: string;
  shares: string;
  timestamp: string;
  txHash: string;
}

// DeFi Data Service Class
export class DeFiDataService {
  // Get user vaults with metadata
  static async getUserVaults(userAddress: string): Promise<VaultData[]> {
    try {
      // Check if GraphQL client is available
      if (!graphClient) {
        console.warn('GraphQL client not available, returning empty vaults');
        return [];
      }

      const { data } = await graphClient.query({
        query: gql(VAULT_QUERIES.GET_USER_VAULTS),
        variables: { userAddress },
      });

      const vaults = data.vaults || [];
      const enhancedVaults: VaultData[] = [];

      for (const vault of vaults) {
        try {
          // Try to fetch metadata from IPFS if available
          let metadata: VaultMetadata | undefined;
          if (vault.metadataUri) {
            try {
              metadata = await Web3StorageService.getVaultMetadata(vault.metadataUri);
            } catch (error) {
              console.warn('Failed to fetch metadata for vault:', vault.address);
            }
          }

          enhancedVaults.push({
            ...vault,
            metadata,
            isAdmin: vault.owner.toLowerCase() === userAddress.toLowerCase(),
          });
        } catch (error) {
          console.error('Error processing vault:', vault.address, error);
        }
      }

      return enhancedVaults;
    } catch (error) {
      console.error('Error fetching user vaults:', error);
      // Return empty array instead of throwing for better UX
      return [];
    }
  }

  // Get vault details with full data
  static async getVaultDetails(vaultAddress: string, userAddress?: string): Promise<VaultData> {
    try {
      // Check if GraphQL client is available
      if (!graphClient) {
        throw new Error('GraphQL client not available');
      }

      const { data } = await graphClient.query({
        query: gql(VAULT_QUERIES.GET_VAULT_DETAILS),
        variables: { vaultAddress },
      });

      const vault = data.vault;
      if (!vault) {
        throw new Error('Vault not found');
      }

      // Fetch metadata if available
      let metadata: VaultMetadata | undefined;
      if (vault.metadataUri) {
        try {
          metadata = await Web3StorageService.getVaultMetadata(vault.metadataUri);
        } catch (error) {
          console.warn('Failed to fetch metadata for vault:', vaultAddress);
        }
      }

      // Calculate user-specific data
      let userBalance = '0';
      let userShares = '0';
      
      if (userAddress) {
        // This would typically come from the blockchain
        // For now, we'll use mock data
        userBalance = '100000'; // 0.1 USDC
        userShares = '100000000000000000'; // 0.1 shares
      }

      return {
        ...vault,
        metadata,
        userBalance,
        userShares,
        isAdmin: userAddress ? vault.owner.toLowerCase() === userAddress.toLowerCase() : false,
        apy: '12.5', // This would come from yield calculations
        tvl: vault.totalAssets, // Total Value Locked
      };
    } catch (error) {
      console.error('Error fetching vault details:', error);
      throw new Error('Failed to fetch vault details');
    }
  }

  // Get vault transactions
  static async getVaultTransactions(vaultAddress: string, first: number = 10, skip: number = 0): Promise<Transaction[]> {
    try {
      // Check if GraphQL client is available
      if (!graphClient) {
        console.warn('GraphQL client not available, returning empty transactions');
        return [];
      }

      const { data } = await graphClient.query({
        query: gql(VAULT_QUERIES.GET_VAULT_TRANSACTIONS),
        variables: { vaultAddress, first, skip },
      });

      const transactions: Transaction[] = [];

      // Process deposits
      if (data.deposits) {
        data.deposits.forEach((deposit: any) => {
          transactions.push({
            id: deposit.id,
            type: 'deposit',
            user: deposit.user,
            amount: deposit.amount,
            shares: deposit.shares,
            timestamp: deposit.timestamp,
            txHash: deposit.txHash || '',
          });
        });
      }

      // Process withdrawals
      if (data.withdrawals) {
        data.withdrawals.forEach((withdrawal: any) => {
          transactions.push({
            id: withdrawal.id,
            type: 'withdraw',
            user: withdrawal.user,
            amount: withdrawal.amount,
            shares: withdrawal.shares,
            timestamp: withdrawal.timestamp,
            txHash: withdrawal.txHash || '',
          });
        });
      }

      // Sort by timestamp
      return transactions.sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp));
    } catch (error) {
      console.error('Error fetching vault transactions:', error);
      // Return empty array instead of throwing for better UX
      return [];
    }
  }

  // Upload vault metadata
  static async uploadVaultMetadata(metadata: VaultMetadata): Promise<string> {
    try {
      return await Web3StorageService.uploadVaultMetadata(metadata);
    } catch (error) {
      console.error('Error uploading vault metadata:', error);
      throw new Error('Failed to upload vault metadata');
    }
  }

  // Get vault analytics
  static async getVaultAnalytics(vaultAddress: string): Promise<any> {
    try {
      // This would integrate with analytics services like Dune Analytics API
      // For now, return mock data
      return {
        tvl: '1000000', // $1M TVL
        apy: '12.5',
        volume24h: '50000',
        uniqueUsers: 150,
        totalDeposits: 250,
        totalWithdrawals: 100,
      };
    } catch (error) {
      console.error('Error fetching vault analytics:', error);
      throw new Error('Failed to fetch vault analytics');
    }
  }
}

// React hooks for DeFi data
export const useUserVaults = (userAddress: string) => {
  // Only use GraphQL if client is available
  if (!graphClient) {
    return {
      data: { vaults: [] },
      loading: false,
      error: null,
    };
  }

  return useQuery(gql(VAULT_QUERIES.GET_USER_VAULTS), {
    variables: { userAddress },
    skip: !userAddress,
    pollInterval: 30000, // Poll every 30 seconds
  });
};

export const useVaultDetails = (vaultAddress: string) => {
  // Only use GraphQL if client is available
  if (!graphClient) {
    return {
      data: { vault: null },
      loading: false,
      error: null,
    };
  }

  return useQuery(gql(VAULT_QUERIES.GET_VAULT_DETAILS), {
    variables: { vaultAddress },
    skip: !vaultAddress,
    pollInterval: 15000, // Poll every 15 seconds
  });
};

export const useVaultTransactions = (vaultAddress: string, first: number = 10, skip: number = 0) => {
  // Only use GraphQL if client is available
  if (!graphClient) {
    return {
      data: { deposits: [], withdrawals: [] },
      loading: false,
      error: null,
    };
  }

  return useQuery(gql(VAULT_QUERIES.GET_VAULT_TRANSACTIONS), {
    variables: { vaultAddress, first, skip },
    skip: !vaultAddress,
    pollInterval: 10000, // Poll every 10 seconds
  });
};
