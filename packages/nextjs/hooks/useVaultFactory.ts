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

  // Read all vaults
  const { data: allVaultAddresses, refetch: refetchAllVaults } = useReadContract({
    address: factoryContractAddress as `0x${string}`,
    abi: ((deployedContracts as any)[CHAIN_ID]?.VaultFactory?.abi) || [],
    functionName: "getAllVaults" as any,
    args: [] as any,
    query: {
      enabled: !!factoryContractAddress && !!(deployedContracts as any)[CHAIN_ID]?.VaultFactory?.address,
      refetchInterval: 10000, // Refetch every 10 seconds
      retry: 2,
    },
  });

  // Also try to get vaults by user as a fallback
  const { data: userVaultAddressesFromFactory, refetch: refetchUserVaults } = useReadContract({
    address: factoryContractAddress as `0x${string}`,
    abi: ((deployedContracts as any)[CHAIN_ID]?.VaultFactory?.abi) || [],
    functionName: "getVaultsByUser" as any,
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!factoryContractAddress && !!userAddress && !!(deployedContracts as any)[CHAIN_ID]?.VaultFactory?.address,
      retry: 2,
    },
  });


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
    if (!userAddress) {
      setUserVaults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Combine admin vaults and all discovered vaults, removing duplicates
      const allVaultsToCheck = Array.from(new Set([...adminVaultAddresses, ...allVaultAddresses]));
      
      console.log(`🔍 Fetching details for ${allVaultsToCheck.length} vaults, user: ${userAddress}`);
      
      if (allVaultsToCheck.length === 0) {
        console.log("No vaults to check");
        setUserVaults([]);
        setLoading(false);
        return;
      }

      // Check ownership using VaultFactory first (more reliable)
      const factoryABI = parseAbi([
        "function getVaultOwner(address vault) view returns (address)",
        "function isVaultAdmin(address vault, address user) view returns (bool)",
      ]);

      // Check membership for all vaults
      const vaultResults = await Promise.all(
        allVaultsToCheck.map(async (vaultAddress) => {
          try {
            // First check ownership via VaultFactory (more reliable)
            let isAdmin = false;
            let owner = "0x0000000000000000000000000000000000000000";
            
            if (factoryContractAddress && publicClient) {
              try {
                const factoryOwner = await publicClient.readContract({
                  address: factoryContractAddress as `0x${string}`,
                  abi: factoryABI,
                  functionName: "getVaultOwner",
                  args: [vaultAddress as `0x${string}`],
                });
                owner = factoryOwner as string;
                isAdmin = owner.toLowerCase() === userAddress.toLowerCase();
                
                // Also check via isVaultAdmin for double verification
                if (!isAdmin) {
                  const isAdminCheck = await publicClient.readContract({
                    address: factoryContractAddress as `0x${string}`,
                    abi: factoryABI,
                    functionName: "isVaultAdmin",
                    args: [vaultAddress as `0x${string}`, userAddress as `0x${string}`],
                  });
                  isAdmin = isAdminCheck as boolean;
                }
              } catch (factoryErr) {
                console.log(`Could not check factory ownership for ${vaultAddress}, trying vault owner:`, factoryErr);
                // Fallback to checking vault owner directly
                const ownerResp = await fetch(`/api/vault/owner?address=${vaultAddress}`).then(r => r.ok ? r.json() : null).catch(() => null);
                owner = ownerResp?.owner || "0x0000000000000000000000000000000000000000";
                isAdmin = owner.toLowerCase() === userAddress.toLowerCase();
              }
            } else {
              // Fallback to API
              const ownerResp = await fetch(`/api/vault/owner?address=${vaultAddress}`).then(r => r.ok ? r.json() : null).catch(() => null);
              owner = ownerResp?.owner || "0x0000000000000000000000000000000000000000";
              isAdmin = owner.toLowerCase() === userAddress.toLowerCase();
            }

            // Get vault info
            const infoResp = await fetch(`/api/vault/info?address=${vaultAddress}&user=${userAddress}`).then(r => r.ok ? r.json() : null).catch(() => null);
            const vaultInfo = infoResp || {};
            
            // Check if user is a member (has balance, is on allowlist, or is admin)
            const userBalance = BigInt(vaultInfo.userBalance || "0");
            const isOnAllowlist = vaultInfo.isAllowed || false;
            const isMember = isAdmin || userBalance > 0n || isOnAllowlist;

            console.log(`Vault ${vaultAddress.slice(0, 8)}...: owner=${owner.slice(0, 8)}..., isAdmin=${isAdmin}, hasBalance=${userBalance > 0n}, isMember=${isMember}`);

            // Only return vaults where user is either admin or member
            if (isAdmin || isMember) {
              console.log(`✅ User is member of vault: ${vaultAddress} (admin: ${isAdmin}, member: ${isMember})`);
              return {
                address: vaultAddress,
                owner,
                asset: vaultInfo.asset || "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
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
      console.log(`✅ Found ${userVaults.length} vaults for user (${userVaults.filter(v => v.isAdmin).length} admin, ${userVaults.filter(v => !v.isAdmin).length} member)`);
      setUserVaults(userVaults);

    } catch (err) {
      console.error("Error in fetchVaultDetails:", err);
    } finally {
      setLoading(false);
    }
  }, [userAddress, factoryContractAddress, publicClient]);

  // Manual refresh function to rediscover member vaults
  const refreshVaults = useCallback(async () => {
    if (!userAddress) return;
    
    console.log("🔄 Manually refreshing vaults...");
    setLoading(true);
    
    try {
      // Refetch all vaults from contract
      await Promise.all([
        refetchAllVaults(),
        refetchUserVaults(),
      ]);
      
      // Wait a bit for state to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get all vaults from both sources
      const allVaultsList = (allVaultAddresses as unknown as string[]) || [];
      const userVaultsList = (userVaultAddressesFromFactory as unknown as string[]) || [];
      
      // Also try to discover via events as fallback
      const discoveredVaults = await discoverMemberVaults();
      const allVaults = Array.from(new Set([...allVaultsList, ...userVaultsList, ...discoveredVaults]));
      
      console.log(`🔄 Refresh found ${allVaults.length} vaults`);
      
      // Fetch details for all vaults
      await fetchVaultDetails([], allVaults);
    } catch (err) {
      console.error("Error refreshing vaults:", err);
    } finally {
      setLoading(false);
    }
  }, [userAddress, discoverMemberVaults, fetchVaultDetails, allVaultAddresses, userVaultAddressesFromFactory, refetchAllVaults, refetchUserVaults]);

  useEffect(() => {
    const loadAllVaults = async () => {
      if (!userAddress) {
        setUserVaults([]);
        setLoading(false);
        return;
      }
      
      // Combine all sources: getAllVaults() and getVaultsByUser()
      const allVaultsList = (allVaultAddresses as unknown as string[]) || [];
      const userVaultsList = (userVaultAddressesFromFactory as unknown as string[]) || [];
      
      // Combine and deduplicate
      const combinedVaults = Array.from(new Set([...allVaultsList, ...userVaultsList]));
      
      console.log(`📊 Vault sources: getAllVaults=${allVaultsList.length}, getVaultsByUser=${userVaultsList.length}, combined=${combinedVaults.length}`);
      
      if (combinedVaults.length === 0) {
        // Also try to discover via events as fallback
        console.log("No vaults found, trying event discovery...");
        const discoveredVaults = await discoverMemberVaults();
        await fetchVaultDetails([], discoveredVaults);
      } else {
        // Fetch details for all vaults - fetchVaultDetails will check ownership
        await fetchVaultDetails([], combinedVaults);
      }
    };

    loadAllVaults();
  }, [userAddress, allVaultAddresses, userVaultAddressesFromFactory, discoverMemberVaults, fetchVaultDetails]);

  useEffect(() => {
    if (createVaultSuccess) {
      console.log("✅ Vault created successfully, refreshing...");
      // Refetch all vaults after successful creation
      Promise.all([
        refetchAllVaults(),
        refetchUserVaults(),
      ]).then(() => {
        // Trigger a manual refresh after a short delay to ensure the vault is indexed
        setTimeout(() => {
          refreshVaults();
        }, 1500);
      });
    }
  }, [createVaultSuccess, refetchAllVaults, refetchUserVaults, refreshVaults]);

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

  // Function to manually check a specific vault address
  const checkSpecificVault = useCallback(async (vaultAddress: string) => {
    if (!userAddress) return;
    
    console.log(`🔍 Manually checking specific vault: ${vaultAddress}`);
    setLoading(true);
    
    try {
      // Check this specific vault
      await fetchVaultDetails([], [vaultAddress]);
    } catch (err) {
      console.error("Error checking specific vault:", err);
    } finally {
      setLoading(false);
    }
  }, [userAddress, fetchVaultDetails]);

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
