"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatUnits } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import deployedContracts from "../contracts/deployedContracts";

const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 31337);

export interface VaultInfo {
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
  userShares: string;
  isPaused: boolean;
  isAdmin: boolean;
  isMember: boolean;
}

/**
 * On-chain replacement for the (now removed) subgraph-backed hook.
 * Walks VaultFactory.getAllVaults() and returns everything the dashboards need.
 */
export const useVaultFactoryGraph = () => {
  const { address: userAddress } = useAccount();
  const publicClient = usePublicClient();
  const [userVaults, setUserVaults] = useState<VaultInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deployed = (deployedContracts as any)[CHAIN_ID] || {};
  const factoryAddress = deployed.VaultFactory?.address as `0x${string}` | undefined;
  const factoryAbi = deployed.VaultFactory?.abi ?? [];
  const vaultAbi = deployed.GroupVault?.abi ?? [];

  const fetchUserVaults = useCallback(async () => {
    if (!publicClient || !factoryAddress) {
      setUserVaults([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const vaults = (await publicClient.readContract<any, any, any>({
        address: factoryAddress,
        abi: factoryAbi,
        functionName: "getAllVaults",
      } as any)) as `0x${string}`[];

      const results = await Promise.all(
        vaults.map(async (v): Promise<VaultInfo | null> => {
          try {
            const [owner, asset, name, symbol, allowlistEnabled, depositCap, minDeposit, totalAssets, totalSupply, isPaused] = await Promise.all([
              publicClient.readContract<any, any, any>({ address: v, abi: vaultAbi, functionName: "owner" } as any) as Promise<`0x${string}`>,
              publicClient.readContract<any, any, any>({ address: v, abi: vaultAbi, functionName: "asset" } as any) as Promise<`0x${string}`>,
              publicClient.readContract<any, any, any>({ address: v, abi: vaultAbi, functionName: "name" } as any) as Promise<string>,
              publicClient.readContract<any, any, any>({ address: v, abi: vaultAbi, functionName: "symbol" } as any) as Promise<string>,
              publicClient.readContract<any, any, any>({ address: v, abi: vaultAbi, functionName: "allowlistEnabled" } as any) as Promise<boolean>,
              publicClient.readContract<any, any, any>({ address: v, abi: vaultAbi, functionName: "depositCap" } as any) as Promise<bigint>,
              publicClient.readContract<any, any, any>({ address: v, abi: vaultAbi, functionName: "minDeposit" } as any) as Promise<bigint>,
              publicClient.readContract<any, any, any>({ address: v, abi: vaultAbi, functionName: "totalAssets" } as any) as Promise<bigint>,
              publicClient.readContract<any, any, any>({ address: v, abi: vaultAbi, functionName: "totalSupply" } as any) as Promise<bigint>,
              publicClient.readContract<any, any, any>({ address: v, abi: vaultAbi, functionName: "paused" } as any) as Promise<boolean>,
            ]);

            let userShares = 0n;
            let userBalance = 0n;
            if (userAddress) {
              userShares = (await publicClient.readContract<any, any, any>({
                address: v,
                abi: vaultAbi,
                functionName: "balanceOf",
                args: [userAddress],
              } as any)) as bigint;
              if (userShares > 0n) {
                userBalance = (await publicClient.readContract<any, any, any>({
                  address: v,
                  abi: vaultAbi,
                  functionName: "convertToAssets",
                  args: [userShares],
                } as any)) as bigint;
              }
            }

            const isAdmin = userAddress != null && owner.toLowerCase() === userAddress.toLowerCase();
            const isMember = isAdmin || userShares > 0n;

            return {
              address: v,
              owner,
              asset,
              name,
              symbol,
              allowlistEnabled,
              depositCap: formatUnits(depositCap, 6),
              minDeposit: formatUnits(minDeposit, 6),
              totalAssets: formatUnits(totalAssets, 6),
              totalSupply: totalSupply.toString(),
              userBalance: formatUnits(userBalance, 6),
              userShares: userShares.toString(),
              isPaused,
              isAdmin,
              isMember,
            };
          } catch {
            return null;
          }
        }),
      );

      setUserVaults(results.filter((v): v is VaultInfo => v !== null));
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to load vaults");
      setUserVaults([]);
    } finally {
      setLoading(false);
    }
  }, [publicClient, factoryAddress, factoryAbi, vaultAbi, userAddress]);

  useEffect(() => {
    fetchUserVaults();
    const t = setInterval(fetchUserVaults, 15_000);
    return () => clearInterval(t);
  }, [fetchUserVaults]);

  return useMemo(
    () => ({
      userVaults,
      loading,
      error,
      refetch: fetchUserVaults,
    }),
    [userVaults, loading, error, fetchUserVaults],
  );
};
