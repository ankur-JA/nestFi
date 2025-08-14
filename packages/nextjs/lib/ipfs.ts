// Vault metadata interface
export interface VaultMetadata {
  name: string;
  symbol: string;
  description: string;
  image?: string;
  website?: string;
  social?: {
    twitter?: string;
    discord?: string;
    telegram?: string;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Simple metadata storage service (development fallback)
export class MetadataStorageService {
  // For development, we'll use a simple in-memory storage
  // In production, this would be replaced with IPFS or similar
  private static storage = new Map<string, VaultMetadata>();

  static async uploadVaultMetadata(metadata: VaultMetadata): Promise<string> {
    try {
      const id = `metadata_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.storage.set(id, metadata);
      return id;
    } catch (error) {
      console.error('Error storing metadata:', error);
      throw new Error('Failed to store metadata');
    }
  }

  static async getVaultMetadata(id: string): Promise<VaultMetadata> {
    try {
      const metadata = this.storage.get(id);
      if (!metadata) {
        throw new Error('Metadata not found');
      }
      return metadata;
    } catch (error) {
      console.error('Error fetching metadata:', error);
      throw new Error('Failed to fetch metadata');
    }
  }

  static async uploadImage(file: File): Promise<string> {
    try {
      const id = `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      // In a real implementation, this would upload to IPFS
      // For now, we'll just return a placeholder
      return `ipfs://placeholder/${id}`;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  }
}

// Export the simpler service as the default
export const Web3StorageService = MetadataStorageService;
export const IPFSService = MetadataStorageService;
