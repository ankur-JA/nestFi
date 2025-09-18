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
  const [allDiscoveredVaults, setAllDiscoveredVaults] = useState<string[]>([]);

  const { writeContract: createVault, data: createVaultData, isPending: createVaultLoading, error: createVaultError } = useWriteContract();
  const { isLoading: createVaultTxLoading, isSuccess: createVaultSuccess, data: createVaultReceipt, error: createVaultTxError } = useTransaction({
    hash: createVaultData,
    query: {
      enabled: !!createVaultData,
    },
  });

  const factoryContractAddress = factoryAddress || (deployedContracts as any)[CHAIN_ID]?.VaultFactory?.address;

  // Discover member vaults by checking known vault addresses
  const discoverMemberVaults = useCallback(async () => {
    if (!userAddress) return [];
    
    try {
      console.log("Discovering member vaults...");
      
      // For now, we'll use a simple approach: check if there are any vaults
      // where the user has a balance or is on the allowlist
      // This could be enhanced with a registry or The Graph in the future
      
      // Get all vaults created by the factory (limited range to avoid RPC issues)
      if (!publicClient) {
        console.log("No public client available for member vault discovery");
        return [];
      }
      
      try {
        const factoryABI = parseAbi([
          "event VaultCreated(address indexed vault, address indexed admin, address indexed asset, string name, string symbol)"
        ]);
        
        // Get recent VaultCreated events (last 10 blocks to avoid RPC limits)
        const currentBlock = await publicClient.getBlockNumber();
        const fromBlock = currentBlock > 10n ? currentBlock - 10n : 0n;
        
        const logs = await publicClient.getLogs({
          address: factoryContractAddress as `0x${string}`,
          event: factoryABI[0] as any,
          fromBlock,
          toBlock: currentBlock,
        });
        
        const vaultAddresses = logs.map((log: any) => log.args?.vault as string).filter(Boolean);
        console.log(`Found ${vaultAddresses.length} vaults to check for membership`);
        
        setAllDiscoveredVaults(vaultAddresses);
        return vaultAddresses;
      } catch (rpcError) {
        console.warn("RPC error during vault discovery, falling back to empty list:", rpcError);
        setAllDiscoveredVaults([]);
        return [];
      }
    } catch (err) {
      console.error("Error discovering member vaults:", err);
      return [];
    }
  }, [userAddress, publicClient, factoryContractAddress]);

  // Read user's own created vaults (admin vaults)
  const { data: userVaultAddresses, refetch: refetchUserVaults, error: readError } = useReadContract({
    address: factoryContractAddress as `0x${string}`,
    abi: ((deployedContracts as any)[CHAIN_ID]?.VaultFactory?.abi) || [],
    functionName: "getVaultsByUser" as any,
    args: [userAddress || "0x0000000000000000000000000000000000000000"] as any,
    query: {
      enabled: !!userAddress && !!factoryContractAddress && !!(deployedContracts as any)[CHAIN_ID]?.VaultFactory?.address,
      refetchInterval: 30000, // Refetch every 30 seconds instead of constantly
      retry: 1, // Reduce retries to avoid spam
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
      const response = await fetch(`/api/vault/owner?address=${vaultAddress}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const owner = await response.json();
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
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
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

  // Enhanced vault loading that checks membership for all discovered vaults
  const fetchVaultDetails = useCallback(async (adminVaultAddresses: string[], allVaultAddresses: string[]) => {
    setLoading(true);
    try {
      // Combine admin vaults and all discovered vaults, removing duplicates
      const allVaultsToCheck = Array.from(new Set([...adminVaultAddresses, ...allVaultAddresses]));
      
      if (allVaultsToCheck.length === 0) {
        setUserVaults([]);
        setLoading(false);
        return;
      }

      // Check membership for all vaults
      const vaultResults = await Promise.all(
        allVaultsToCheck.map(async (vaultAddress) => {
          try {
            const [ownerResp, infoResp] = await Promise.all([
              fetch(`/api/vault/owner?address=${vaultAddress}`).then(r => r.ok ? r.json() : null).catch(() => null),
              fetch(`/api/vault/info?address=${vaultAddress}&user=${userAddress}`).then(r => r.ok ? r.json() : null).catch(() => null),
            ]);

            const owner: string = ownerResp?.owner || "0x0000000000000000000000000000000000000000";
            const isAdmin = owner.toLowerCase() === (userAddress || "").toLowerCase();
            const vaultInfo = infoResp || {};
            
            // Check if user is a member (has balance, is on allowlist, or is admin)
            const userBalance = BigInt(vaultInfo.userBalance || "0");
            const isOnAllowlist = vaultInfo.isAllowed || false; // From API response
            const isMember = isAdmin || userBalance > 0n || isOnAllowlist;

            // Debug logging for the specific vault
            if (vaultAddress.toLowerCase() === "0xba230e7c7E39D09443d8Da0a332DD787BD1352cb".toLowerCase()) {
              console.log("🔍 Debugging specific vault:", {
                vaultAddress,
                userAddress,
                owner,
                isAdmin,
                userBalance: userBalance.toString(),
                isOnAllowlist,
                isMember,
                vaultInfo
              });
            }

            // Only return vaults where user is either admin or member
            if (isAdmin || isMember) {
              console.log(`✅ User is member of vault: ${vaultAddress} (admin: ${isAdmin}, member: ${isMember})`);
              return {
                address: vaultAddress,
                owner,
                asset: vaultInfo.asset || "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // USDC on Sepolia
                name: vaultInfo.name || "Investment Vault",
                symbol: vaultInfo.symbol || "INV",
                allowlistEnabled: Boolean(vaultInfo.allowlistEnabled),
                depositCap: vaultInfo.depositCap || "10000000000",
                minDeposit: vaultInfo.minDeposit || "10000000",
                totalAssets: vaultInfo.totalAssets || "0",
                totalSupply: vaultInfo.totalSupply || "0",
                userBalance: vaultInfo.userBalance || "0",
                isPaused: Boolean(vaultInfo.isPaused),
                isAdmin,
                isMember,
              };
            } else {
              console.log(`❌ User is NOT member of vault: ${vaultAddress} (admin: ${isAdmin}, member: ${isMember})`);
            }
            return null;
          } catch (err) {
            console.error(`Error fetching details for ${vaultAddress}:`, err);
            return null;
          }
        })
      );

      // Filter out null results (vaults where user is not a member)
      const userVaults = vaultResults.filter(Boolean) as VaultInfo[];
      setUserVaults(userVaults);

    } catch (err) {
      console.error("Error in fetchVaultDetails:", err);
    } finally {
      setLoading(false);
    }
  }, [userAddress]);

  useEffect(() => {
    const loadAllVaults = async () => {
      if (!userAddress) return;
      
      // Discover member vaults first
      const allVaults = await discoverMemberVaults();
      
      // Then fetch details for both admin vaults and all discovered vaults
      const adminVaults = (userVaultAddresses as unknown as string[]) || [];
      await fetchVaultDetails(adminVaults, allVaults);
    };

    loadAllVaults();
  }, [userAddress, userVaultAddresses, discoverMemberVaults, fetchVaultDetails]);

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

  // Check if user is a member of a specific vault and add to user vaults if they are
  const checkVaultMembership = useCallback(async (vaultAddress: string): Promise<VaultInfo | null> => {
    if (!userAddress || !vaultAddress) return null;

    // Validate vault address format
    if (!vaultAddress.startsWith('0x') || vaultAddress.length !== 42) {
      console.error("Invalid vault address format:", vaultAddress);
      return null;
    }

    try {
      console.log("Checking membership for vault:", vaultAddress);
      const response = await fetch(`/api/vault/check-membership?vaultAddress=${vaultAddress}&userAddress=${userAddress}`);
      
      if (!response.ok) {
        console.error("API response not ok:", response.status, response.statusText);
        return null;
      }
      
      const data = await response.json();
      
      if (data.error) {
        console.error("API error:", data.error);
        return null;
      }
      
      if (!data.isMember) return null;

      const vaultInfo: VaultInfo = {
        address: vaultAddress,
        owner: data.isOwner ? userAddress : "unknown",
        asset: "0x0000000000000000000000000000000000000000", // We'll get this from the main API
        name: data.vaultName || "Investment Vault",
        symbol: data.vaultSymbol || "INV",
        allowlistEnabled: data.allowlistEnabled,
        depositCap: "0", // We'll get this from the main API
        minDeposit: "0", // We'll get this from the main API
        totalAssets: data.totalAssets || "0",
        totalSupply: data.totalSupply || "0",
        userBalance: data.userBalance || "0",
        isPaused: data.isPaused || false,
        isAdmin: data.isOwner,
        isMember: true,
      };

      // Add this vault to the user's vault list if it's not already there
      setUserVaults(prevVaults => {
        const exists = prevVaults.some(vault => vault.address.toLowerCase() === vaultAddress.toLowerCase());
        if (!exists) {
          return [...prevVaults, vaultInfo];
        }
        return prevVaults;
      });

      return vaultInfo;
    } catch (err) {
      console.error("Error checking vault membership:", err);
      return null;
    }
  }, [userAddress]);

  // Load admin vaults when user connects
  useEffect(() => {
    const loadAdminVaults = async () => {
      if (!userAddress) {
        setUserVaults([]);
        setLoading(false);
        return;
      }
      
      const adminVaults = (userVaultAddresses as unknown as string[]) || [];
      if (adminVaults.length > 0) {
        await fetchVaultDetails(adminVaults, []);
      } else {
        setUserVaults([]);
        setLoading(false);
      }
    };
    
    loadAdminVaults();
  }, [userAddress, userVaultAddresses, fetchVaultDetails]);

  // Manual refresh function to rediscover member vaults
  const refreshVaults = useCallback(async () => {
    if (!userAddress) return;
    
    console.log("Manually refreshing vaults...");
    setLoading(true);
    
    try {
      // Discover member vaults
      const allVaults = await discoverMemberVaults();
      
      // Get admin vaults
      const adminVaults = (userVaultAddresses as unknown as string[]) || [];
      
      // Fetch details for all vaults
      await fetchVaultDetails(adminVaults, allVaults);
    } catch (err) {
      console.error("Error refreshing vaults:", err);
    } finally {
      setLoading(false);
    }
  }, [userAddress, discoverMemberVaults, fetchVaultDetails, userVaultAddresses]);

  // Function to manually check a specific vault address
  const checkSpecificVault = useCallback(async (vaultAddress: string) => {
    if (!userAddress) return;
    
    console.log(`Manually checking specific vault: ${vaultAddress}`);
    setLoading(true);
    
    try {
      // Get admin vaults
      const adminVaults = (userVaultAddresses as unknown as string[]) || [];
      
      // Add the specific vault to the list to check
      const vaultsToCheck = [...adminVaults, vaultAddress];
      
      // Fetch details for all vaults including the specific one
      await fetchVaultDetails(adminVaults, [vaultAddress]);
    } catch (err) {
      console.error("Error checking specific vault:", err);
    } finally {
      setLoading(false);
    }
  }, [userAddress, fetchVaultDetails, userVaultAddresses]);

  return {
    createVault: handleCreateVault,
    userVaults,
    loading: createVaultLoading || createVaultTxLoading || loading,
    success: createVaultSuccess,
    error,
    setError,
    receipt: createVaultReceipt,
    refetchUserVaults,
    checkVaultMembership,
    refreshVaults,
    checkSpecificVault,
  };
};
