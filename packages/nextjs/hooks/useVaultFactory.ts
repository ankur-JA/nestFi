"use client";

import { useState, useCallback, useEffect } from "react";
import { useAccount, useWriteContract, useTransaction, useReadContract } from "wagmi";
import { parseUnits } from "viem";
import deployedContracts from "../contracts/deployedContracts";

interface CreateVaultParams {
  asset: string;
  name: string;
  symbol: string;
  allowlistEnabled: boolean;
  depositCap: string;
  minDeposit: string;
}

interface VaultInfo {
  address: string;
  owner: string;
  asset: string;
  name: string;
  symbol: string;
  allowlistEnabled: boolean;
  depositCap: string;
  minDeposit: string;
  isAdmin: boolean;
}

export const useVaultFactory = (factoryAddress?: string) => {
  const { address: userAddress } = useAccount();
  const [error, setError] = useState<string | null>(null);
  const [userVaults, setUserVaults] = useState<VaultInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const { writeContract: createVault, data: createVaultData, isPending: createVaultLoading, error: createVaultError } = useWriteContract();
  const { isLoading: createVaultTxLoading, isSuccess: createVaultSuccess, data: createVaultReceipt, error: createVaultTxError } = useTransaction({
    hash: createVaultData,
  });

  const factoryContractAddress = factoryAddress || deployedContracts[31337]?.VaultFactory?.address;

  // Read user's vaults from factory
  const { data: userVaultAddresses, refetch: refetchUserVaults, error: readError } = useReadContract({
    address: factoryContractAddress as `0x${string}`,
    abi: deployedContracts[31337]?.VaultFactory?.abi || [],
    functionName: "getVaultsByUser" as any,
    args: [userAddress || "0x0000000000000000000000000000000000000000"] as any,
    query: {
      enabled: !!userAddress && !!factoryContractAddress && !!deployedContracts[31337]?.VaultFactory?.address,
    },
  });

  // Handle read contract errors
  useEffect(() => {
    if (readError) {
      console.error("Read contract error:", readError);
      // Don't set error state for read errors as they're expected when contract isn't deployed
    }
  }, [readError]);

  // Fetch vault owner
  const fetchVaultOwner = useCallback(async (vaultAddress: string): Promise<string> => {
    try {
      const owner = await fetch(`/api/vault/owner?address=${vaultAddress}`).then(res => res.json());
      return owner.owner;
    } catch (err) {
      console.error("Error fetching vault owner:", err);
      return "0x0000000000000000000000000000000000000000";
    }
  }, []);

  const fetchVaultInfo = useCallback(async (vaultAddress: string) => {
    try {
      const response = await fetch(`/api/vault/info?address=${vaultAddress}`);
      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Error fetching vault info:", err);
      return {
        asset: "0x0000000000000000000000000000000000000000",
        name: "Vault",
        symbol: "vTKN",
        allowlistEnabled: false,
        depositCap: "0",
        minDeposit: "0",
      };
    }
  }, []);

  // Fetch vault details for each vault address
  const fetchVaultDetails = useCallback(async (vaultAddresses: string[]) => {
    if (!vaultAddresses || vaultAddresses.length === 0) {
      setUserVaults([]);
      return;
    }

    setLoading(true);
    const vaultDetails: VaultInfo[] = [];

    try {
      for (const vaultAddress of vaultAddresses) {
        try {
          // Get vault owner
          const owner = await fetchVaultOwner(vaultAddress);
          const isAdmin = owner === userAddress;

          // Get vault info from contract
          const vaultInfo = await fetchVaultInfo(vaultAddress);
          
          vaultDetails.push({
            address: vaultAddress,
            owner,
            asset: vaultInfo.asset,
            name: vaultInfo.name,
            symbol: vaultInfo.symbol,
            allowlistEnabled: vaultInfo.allowlistEnabled,
            depositCap: vaultInfo.depositCap,
            minDeposit: vaultInfo.minDeposit,
            isAdmin,
          });
        } catch (err) {
          console.error(`Error fetching vault details for ${vaultAddress}:`, err);
          // Continue with other vaults even if one fails
        }
      }
    } catch (err) {
      console.error("Error in fetchVaultDetails:", err);
      // Don't set error state for read errors as they're expected when contracts aren't deployed
    }

    setUserVaults(vaultDetails);
    setLoading(false);
  }, [userAddress, fetchVaultInfo, fetchVaultOwner]);

  useEffect(() => {
    if (userAddress && userVaultAddresses) {
      fetchVaultDetails(userVaultAddresses as unknown as string[]);
    }
  }, [userAddress, userVaultAddresses, fetchVaultDetails]);

  useEffect(() => {
    if (createVaultSuccess) {
      refetchUserVaults();
    }
  }, [createVaultSuccess, refetchUserVaults]);

  // Handle transaction errors
  useEffect(() => {
    if (createVaultError) {
      console.error("Create vault error:", createVaultError);
      setError(createVaultError.message || "Failed to create vault");
    }
  }, [createVaultError]);

  useEffect(() => {
    if (createVaultTxError) {
      console.error("Transaction error:", createVaultTxError);
      setError(createVaultTxError.message || "Transaction failed");
    }
  }, [createVaultTxError]);

  const handleCreateVault = useCallback(
    (params: CreateVaultParams) => {
      if (!factoryContractAddress || !userAddress) {
        setError("Factory address or user address not available");
        return;
      }
      
      // Validate parameters
      if (!params.name || !params.name.trim()) {
        setError("Vault name is required");
        return;
      }
      
      if (!params.symbol || !params.symbol.trim()) {
        setError("Vault symbol is required");
        return;
      }
      
      if (!params.asset || params.asset === "0x0000000000000000000000000000000000000000") {
        setError("Invalid asset address");
        return;
      }
      
      try {
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
        });
        
        createVault({
          address: factoryContractAddress as `0x${string}`,
          abi: deployedContracts[31337]?.VaultFactory?.abi || [],
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
      }
    },
    [factoryContractAddress, userAddress, createVault]
  );

  return {
    createVault: handleCreateVault,
    userVaults,
    loading: createVaultLoading || createVaultTxLoading || loading,
    success: createVaultSuccess,
    error,
    setError,
    receipt: createVaultReceipt,
    refetchUserVaults,
  };
};
