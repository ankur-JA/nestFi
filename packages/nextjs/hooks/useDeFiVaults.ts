"use client";

import { useState, useCallback, useEffect } from "react";
import { useAccount, useWriteContract, useTransaction } from "wagmi";
import { parseUnits } from "viem";
import { DeFiDataService, VaultData, VaultMetadata } from "~~/lib/defi-data";
import { Web3StorageService } from "~~/lib/ipfs";
import deployedContracts from "../contracts/deployedContracts";
const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 11155111);

interface CreateVaultParams {
  asset: string;
  name: string;
  symbol: string;
  allowlistEnabled: boolean;
  depositCap: string;
  minDeposit: string;
  description?: string;
  image?: File;
}

export const useDeFiVaults = () => {
  const { address: userAddress } = useAccount();
  const [userVaults, setUserVaults] = useState<VaultData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { writeContract: createVault, data: createVaultData, isPending: createVaultLoading, error: createVaultError } = useWriteContract();
  const { isLoading: createVaultTxLoading, isSuccess: createVaultSuccess, data: createVaultReceipt, error: createVaultTxError } = useTransaction({
    hash: createVaultData,
    query: {
      enabled: !!createVaultData,
    },
  });

  const factoryContractAddress = (deployedContracts as any)[CHAIN_ID]?.VaultFactory?.address;

  // Fetch user vaults
  const fetchUserVaults = useCallback(async () => {
    if (!userAddress) {
      setUserVaults([]);
      return;
    }

    try {
      setLoading(true);
      const vaults = await DeFiDataService.getUserVaults(userAddress);
      setUserVaults(vaults);
    } catch (err) {
      console.error("Error fetching user vaults:", err);
      setError("Failed to fetch user vaults");
    } finally {
      setLoading(false);
    }
  }, [userAddress]);

  // Create vault with metadata
  const handleCreateVault = useCallback(async (params: CreateVaultParams) => {
    if (!factoryContractAddress || !userAddress) {
      setError("Factory address or user address not available");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Upload metadata to IPFS/Web3.Storage
      let metadataUri: string | undefined;
      if (params.description || params.image) {
        const metadata: VaultMetadata = {
          name: params.name,
          symbol: params.symbol,
          description: params.description || "",
          tags: ["defi", "vault", "investment"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Upload image if provided
        if (params.image) {
          try {
            const imageCid = await Web3StorageService.uploadImage(params.image);
            metadata.image = `ipfs://${imageCid}`;
          } catch (err) {
            console.warn("Failed to upload image:", err);
          }
        }

        metadataUri = await DeFiDataService.uploadVaultMetadata(metadata);
      }

      // Create vault on blockchain
      const depositCapWei = parseUnits(params.depositCap, 6);
      const minDepositWei = parseUnits(params.minDeposit, 6);

      console.log("Creating vault with params:", {
        asset: params.asset,
        admin: userAddress,
        name: params.name,
        symbol: params.symbol,
        allowlistEnabled: params.allowlistEnabled,
        depositCap: depositCapWei.toString(),
        minDeposit: minDepositWei.toString(),
        metadataUri,
      });

      createVault({
        address: factoryContractAddress as `0x${string}`,
        abi: ((deployedContracts as any)[CHAIN_ID]?.VaultFactory?.abi) || [],
        functionName: "createVault",
        args: [
          params.asset as `0x${string}`,
          userAddress,
          params.name,
          params.symbol,
          params.allowlistEnabled,
          depositCapWei,
          minDepositWei,
        ],
      });
    } catch (err) {
      console.error("Create vault error:", err);
      setError(err instanceof Error ? err.message : "Failed to create vault");
      setLoading(false);
    }
  }, [factoryContractAddress, userAddress, createVault]);

  // Handle transaction success
  useEffect(() => {
    if (createVaultSuccess) {
      console.log("Vault created successfully:", createVaultReceipt);
      // Refresh user vaults
      fetchUserVaults();
      setLoading(false);
    }
  }, [createVaultSuccess, createVaultReceipt, fetchUserVaults]);

  // Handle transaction errors
  useEffect(() => {
    if (createVaultError) {
      console.error("Create vault error:", createVaultError);
      setError(createVaultError.message || "Failed to create vault");
      setLoading(false);
    }
  }, [createVaultError]);

  useEffect(() => {
    if (createVaultTxError) {
      console.error("Transaction error:", createVaultTxError);
      setError(createVaultTxError.message || "Transaction failed");
      setLoading(false);
    }
  }, [createVaultTxError]);

  // Initial fetch
  useEffect(() => {
    fetchUserVaults();
  }, [fetchUserVaults]);

  // Get vault details
  const getVaultDetails = useCallback(async (vaultAddress: string) => {
    try {
      return await DeFiDataService.getVaultDetails(vaultAddress, userAddress);
    } catch (err) {
      console.error("Error fetching vault details:", err);
      throw err;
    }
  }, [userAddress]);

  // Get vault transactions
  const getVaultTransactions = useCallback(async (vaultAddress: string, first: number = 10, skip: number = 0) => {
    try {
      return await DeFiDataService.getVaultTransactions(vaultAddress, first, skip);
    } catch (err) {
      console.error("Error fetching vault transactions:", err);
      throw err;
    }
  }, []);

  // Get vault analytics
  const getVaultAnalytics = useCallback(async (vaultAddress: string) => {
    try {
      return await DeFiDataService.getVaultAnalytics(vaultAddress);
    } catch (err) {
      console.error("Error fetching vault analytics:", err);
      throw err;
    }
  }, []);

  return {
    // Data
    userVaults,
    loading: createVaultLoading || createVaultTxLoading || loading,
    error,
    success: createVaultSuccess,
    receipt: createVaultReceipt,

    // Actions
    createVault: handleCreateVault,
    fetchUserVaults,
    getVaultDetails,
    getVaultTransactions,
    getVaultAnalytics,

    // Utilities
    setError,
  };
};
