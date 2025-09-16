"use client";

import { useState, useCallback, useEffect } from "react";
import { useAccount, useWriteContract, useTransaction, useReadContract, usePublicClient } from "wagmi";
import { parseUnits, parseAbi } from "viem";
import deployedContracts from "../contracts/deployedContracts";
const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 11155111);

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
  totalAssets: string;
  totalSupply: string;
  userBalance: string;
  isPaused: boolean;
  isAdmin: boolean;
  isMember: boolean;
}

export const useVaultFactory = (factoryAddress?: string) => {
  const { address: userAddress } = useAccount();
  const publicClient = usePublicClient();
  const [error, setError] = useState<string | null>(null);
  const [userVaults, setUserVaults] = useState<VaultInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const { writeContract: createVault, data: createVaultData, isPending: createVaultLoading, error: createVaultError } = useWriteContract();
  const { isLoading: createVaultTxLoading, isSuccess: createVaultSuccess, data: createVaultReceipt, error: createVaultTxError } = useTransaction({
    hash: createVaultData,
    query: {
      enabled: !!createVaultData,
    },
  });

  const factoryContractAddress = factoryAddress || (deployedContracts as any)[CHAIN_ID]?.VaultFactory?.address;

  // Read user's own created vaults (fast path) to keep existing behavior
  const { data: userVaultAddresses, refetch: refetchUserVaults, error: readError } = useReadContract({
    address: factoryContractAddress as `0x${string}`,
    abi: ((deployedContracts as any)[CHAIN_ID]?.VaultFactory?.abi) || [],
    functionName: "getVaultsByUser" as any,
    args: [userAddress || "0x0000000000000000000000000000000000000000"] as any,
    query: {
      enabled: !!userAddress && !!factoryContractAddress && !!(deployedContracts as any)[CHAIN_ID]?.VaultFactory?.address,
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
      const url = userAddress 
        ? `/api/vault/info?address=${vaultAddress}&user=${userAddress}`
        : `/api/vault/info?address=${vaultAddress}`;
      const response = await fetch(url);
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
        totalAssets: "0",
        totalSupply: "0",
        userBalance: "0",
        isPaused: false,
      };
    }
  }, [userAddress]);

  // Fetch vault details for each vault address
  const fetchVaultDetails = useCallback(async (vaultAddresses: string[]) => {
    if (!vaultAddresses || vaultAddresses.length === 0) {
      setUserVaults([]);
      return;
    }

    setLoading(true);
    try {
      // Augment list with all created vaults discovered via events so other users can see them
      let combined = [...vaultAddresses];
      try {
        if (publicClient && factoryContractAddress) {
          const eventAbi = parseAbi([
            "event VaultCreated(address indexed vault, address indexed owner, address indexed asset, string name, string symbol, bool allowlistEnabled, uint256 depositCap, uint256 minDeposit)"
          ]);
          const logs = await publicClient.getLogs({
            address: factoryContractAddress as `0x${string}`,
            event: eventAbi[0] as any,
            fromBlock: 0n,
            toBlock: "latest",
          });
          const fromEvents = (logs || []).map(l => (l as any).args?.vault as string).filter(Boolean);
          combined = Array.from(new Set([...combined, ...fromEvents]));
        }
      } catch (e) {
        console.warn("Failed to read VaultCreated logs; falling back to user-only vaults.", e);
      }

      const results = await Promise.all(
        combined.map(async (vaultAddress) => {
          try {
            const [ownerResp, infoResp] = await Promise.all([
              fetch(`/api/vault/owner?address=${vaultAddress}`, { cache: "no-store" }).then(r => r.json()),
              fetch(`/api/vault/info?address=${vaultAddress}`, { cache: "no-store" }).then(r => r.json()),
            ]);

            const owner: string = ownerResp?.owner || "0x0000000000000000000000000000000000000000";
            const isAdmin = owner.toLowerCase() === (userAddress || "").toLowerCase();

            const vaultInfo = infoResp || {};

            // Determine membership: admin OR allowlisted OR has shares
            let isMember = isAdmin;
            try {
              if (publicClient && userAddress) {
                const erc20Abi = parseAbi([
                  "function balanceOf(address) view returns (uint256)",
                  "function isAllowed(address) view returns (bool)"
                ]);
                const [bal, allowed] = await Promise.all([
                  publicClient.readContract({
                    address: vaultAddress as `0x${string}`,
                    abi: erc20Abi,
                    functionName: "balanceOf",
                    args: [userAddress],
                  }) as Promise<bigint>,
                  publicClient.readContract({
                    address: vaultAddress as `0x${string}`,
                    abi: erc20Abi,
                    functionName: "isAllowed",
                    args: [userAddress],
                  }) as Promise<boolean>,
                ]);
                isMember = isMember || allowed || (bal as bigint) > 0n;
              }
            } catch (e) {
              // ignore membership errors
            }

            const item: VaultInfo = {
              address: vaultAddress,
              owner,
              asset: vaultInfo.asset || "0x0000000000000000000000000000000000000000",
              name: vaultInfo.name || "Vault",
              symbol: vaultInfo.symbol || "vTKN",
              allowlistEnabled: Boolean(vaultInfo.allowlistEnabled),
              depositCap: vaultInfo.depositCap || "0",
              minDeposit: vaultInfo.minDeposit || "0",
              totalAssets: vaultInfo.totalAssets || "0",
              totalSupply: vaultInfo.totalSupply || "0",
              userBalance: vaultInfo.userBalance || "0",
              isPaused: Boolean(vaultInfo.isPaused),
              isAdmin,
              isMember,
            };

            return item;
          } catch (err) {
            console.error(`Error fetching vault details for ${vaultAddress}:`, err);
            return null;
          }
        })
      );

      const finalVaults = (results.filter(Boolean) as VaultInfo[])
        .filter(v => v.isAdmin || v.isMember);
      setUserVaults(finalVaults);
    } catch (err) {
      console.error("Error in fetchVaultDetails:", err);
      // Don't set error state for read errors as they're expected when contracts aren't deployed
    } finally {
      setLoading(false);
    }
  }, [userAddress, publicClient, factoryContractAddress]);

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
      
      // Parse user-friendly error messages
      let userFriendlyMessage = "Failed to create vault";
      
      if (createVaultError.message) {
        const errorMsg = createVaultError.message.toLowerCase();
        
        if (errorMsg.includes("user rejected") || errorMsg.includes("user denied") || errorMsg.includes("rejected")) {
          userFriendlyMessage = "Transaction cancelled by user";
        } else if (errorMsg.includes("insufficient funds") || errorMsg.includes("insufficient balance")) {
          userFriendlyMessage = "Insufficient funds for gas fees";
        } else if (errorMsg.includes("network") || errorMsg.includes("connection")) {
          userFriendlyMessage = "Network connection error. Please try again";
        } else if (errorMsg.includes("gas")) {
          userFriendlyMessage = "Gas estimation failed. Please try again";
        } else if (errorMsg.includes("nonce")) {
          userFriendlyMessage = "Transaction conflict. Please try again";
        } else {
          userFriendlyMessage = "Transaction failed. Please try again";
        }
      }
      
      setError(userFriendlyMessage);
    }
  }, [createVaultError]);

  useEffect(() => {
    if (createVaultTxError) {
      console.error("Transaction error:", createVaultTxError);
      
      // Parse user-friendly transaction error messages
      let userFriendlyMessage = "Transaction failed";
      
      if (createVaultTxError.message) {
        const errorMsg = createVaultTxError.message.toLowerCase();
        
        if (errorMsg.includes("user rejected") || errorMsg.includes("user denied") || errorMsg.includes("rejected")) {
          userFriendlyMessage = "Transaction cancelled by user";
        } else if (errorMsg.includes("insufficient funds")) {
          userFriendlyMessage = "Insufficient funds for gas fees";
        } else if (errorMsg.includes("gas")) {
          userFriendlyMessage = "Gas limit exceeded or estimation failed";
        } else if (errorMsg.includes("reverted")) {
          userFriendlyMessage = "Transaction reverted. Please check your inputs";
        } else {
          userFriendlyMessage = "Transaction failed. Please try again";
        }
      }
      
      setError(userFriendlyMessage);
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
          gas: 3000000n, // Increase gas limit
        });
      } catch (err) {
        console.error("Create vault error:", err);
        
        // Parse user-friendly error messages for creation errors
        let userFriendlyMessage = "Failed to create vault";
        
        if (err instanceof Error && err.message) {
          const errorMsg = err.message.toLowerCase();
          
          if (errorMsg.includes("user rejected") || errorMsg.includes("user denied") || errorMsg.includes("rejected")) {
            userFriendlyMessage = "Transaction cancelled by user";
          } else if (errorMsg.includes("insufficient funds")) {
            userFriendlyMessage = "Insufficient funds for gas fees";
          } else if (errorMsg.includes("network")) {
            userFriendlyMessage = "Network connection error. Please try again";
          } else if (errorMsg.includes("invalid")) {
            userFriendlyMessage = "Invalid input parameters. Please check your entries";
          } else {
            userFriendlyMessage = "Failed to create vault. Please try again";
          }
        }
        
        setError(userFriendlyMessage);
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
