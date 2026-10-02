"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatUnits } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import deployedContracts from "../contracts/deployedContracts";

const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 31337);

export interface VaultMembership {
  vaultAddress: string;
  vaultName: string;
  vaultSymbol: string;
  role: "admin" | "member";
  userBalance: string;   // in asset units (human)
  totalAssets: string;   // human
  totalSupply: string;
  isPaused: boolean;
  allowlistEnabled: boolean;
  isOnAllowlist: boolean;
}

export interface VaultMembershipState {
  memberships: VaultMembership[];
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  userAddress: string | undefined;
}

/**
 * On-chain scan: walk VaultFactory.allVaults() and derive membership
 * (admin, has shares, or on allowlist) for the connected user.
 */
export const useVaultMembership = () => {
  const { address: userAddress, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [state, setState] = useState<VaultMembershipState>({
    memberships: [],
    loading: false,
    error: null,
    isConnected: false,
    userAddress: undefined,
  });

  const deployed = (deployedContracts as any)[CHAIN_ID] || {};
  const factoryAddress = deployed.VaultFactory?.address as `0x${string}` | undefined;
  const factoryAbi = deployed.VaultFactory?.abi ?? [];
  const vaultAbi = deployed.GroupVault?.abi ?? [];

  const refresh = useCallback(async () => {
    if (!publicClient || !factoryAddress || !userAddress) {
      setState(s => ({ ...s, memberships: [], loading: false, isConnected, userAddress }));
      return;
    }
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const vaults = (await publicClient.readContract<any, any, any>({
        address: factoryAddress,
        abi: factoryAbi,
        functionName: "getAllVaults",
      } as any)) as `0x${string}`[];

      const results: VaultMembership[] = [];
      for (const v of vaults) {
        try {
          const [owner, name, symbol, totalAssets, totalSupply, isPaused, allowlistEnabled, userShares, isOnAllowlist] = await Promise.all([
            publicClient.readContract<any, any, any>({ address: v, abi: vaultAbi, functionName: "owner" } as any) as Promise<`0x${string}`>,
            publicClient.readContract<any, any, any>({ address: v, abi: vaultAbi, functionName: "name" } as any) as Promise<string>,
            publicClient.readContract<any, any, any>({ address: v, abi: vaultAbi, functionName: "symbol" } as any) as Promise<string>,
            publicClient.readContract<any, any, any>({ address: v, abi: vaultAbi, functionName: "totalAssets" } as any) as Promise<bigint>,
            publicClient.readContract<any, any, any>({ address: v, abi: vaultAbi, functionName: "totalSupply" } as any) as Promise<bigint>,
            publicClient.readContract<any, any, any>({ address: v, abi: vaultAbi, functionName: "paused" } as any) as Promise<boolean>,
            publicClient.readContract<any, any, any>({ address: v, abi: vaultAbi, functionName: "allowlistEnabled" } as any) as Promise<boolean>,
            publicClient.readContract<any, any, any>({ address: v, abi: vaultAbi, functionName: "balanceOf", args: [userAddress] } as any) as Promise<bigint>,
            publicClient.readContract<any, any, any>({ address: v, abi: vaultAbi, functionName: "allowlist", args: [userAddress] } as any) as Promise<boolean>,
          ]);

          const isAdmin = owner.toLowerCase() === userAddress.toLowerCase();
          const hasShares = userShares > 0n;
          if (!isAdmin && !hasShares && !isOnAllowlist) continue;

          let userBalance = 0n;
          if (hasShares) {
            userBalance = (await publicClient.readContract<any, any, any>({
              address: v,
              abi: vaultAbi,
              functionName: "convertToAssets",
              args: [userShares],
            } as any)) as bigint;
          }

          results.push({
            vaultAddress: v,
            vaultName: name,
            vaultSymbol: symbol,
            role: isAdmin ? "admin" : "member",
            userBalance: formatUnits(userBalance, 6),
            totalAssets: formatUnits(totalAssets, 6),
            totalSupply: totalSupply.toString(),
            isPaused,
            allowlistEnabled,
            isOnAllowlist,
          });
        } catch {
          // skip problematic vault
        }
      }
      setState({ memberships: results, loading: false, error: null, isConnected, userAddress });
    } catch (err: any) {
      setState({ memberships: [], loading: false, error: err?.message || "Failed", isConnected, userAddress });
    }
  }, [publicClient, factoryAddress, factoryAbi, vaultAbi, userAddress, isConnected]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const adminVaults = useMemo(
    () => state.memberships.filter(m => m.role === "admin"),
    [state.memberships],
  );
  const memberVaults = useMemo(
    () => state.memberships.filter(m => m.role === "member"),
    [state.memberships],
  );
  const totalValueLocked = useMemo(
    () => state.memberships.reduce((sum, m) => sum + parseFloat(m.totalAssets || "0"), 0),
    [state.memberships],
  );

  return useMemo(
    () => ({
      ...state,
      refresh,
      refreshMemberships: refresh, // legacy alias
      adminVaults,
      memberVaults,
      totalValueLocked,
    }),
    [state, refresh, adminVaults, memberVaults, totalValueLocked],
  );
};
