export interface VaultData {
  address: string;
  name: string;
  symbol: string;
  totalAssets: string;
  totalSupply: string;
  asset: string;
  owner: string;
  allowlistEnabled: boolean;
  depositCap: string;
  minDeposit: string;
  isPaused: boolean;
  strategy?: string;
  createdAt: number;
  updatedAt: number;
}

export interface VaultMetadata {
  name: string;
  symbol: string;
  description?: string;
  image?: string;
  website?: string;
  twitter?: string;
  discord?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export class DeFiDataService {
  private static instance: DeFiDataService;

  public static getInstance(): DeFiDataService {
    if (!DeFiDataService.instance) {
      DeFiDataService.instance = new DeFiDataService();
    }
    return DeFiDataService.instance;
  }

  async getVaultData(vaultAddress: string): Promise<VaultData | null> {
    try {
      const response = await fetch(`/api/vault/info?address=${vaultAddress}`);
      if (!response.ok) {
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching vault data:', error);
      return null;
    }
  }

  async getVaultMetadata(vaultAddress: string): Promise<VaultMetadata | null> {
    try {
      // This could be extended to fetch from IPFS or other metadata sources
      const vaultData = await this.getVaultData(vaultAddress);
      if (!vaultData) {
        return null;
      }

      return {
        name: vaultData.name,
        symbol: vaultData.symbol,
        description: `Investment vault for ${vaultData.asset}`,
      };
    } catch (error) {
      console.error('Error fetching vault metadata:', error);
      return null;
    }
  }

  async getAllVaults(): Promise<VaultData[]> {
    try {
      // This could be extended to fetch from a subgraph or API
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Error fetching all vaults:', error);
      return [];
    }
  }

  async getUserVaults(userAddress: string): Promise<VaultData[]> {
    try {
      // This could be extended to fetch from a subgraph or API
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Error fetching user vaults:', error);
      return [];
    }
  }

  async uploadVaultMetadata(metadata: VaultMetadata): Promise<string> {
    try {
      // This could be extended to upload to IPFS
      // For now, return a placeholder URI
      return `ipfs://metadata-${Date.now()}`;
    } catch (error) {
      console.error('Error uploading vault metadata:', error);
      throw error;
    }
  }
}

// Export a default instance
export const defiDataService = DeFiDataService.getInstance();
