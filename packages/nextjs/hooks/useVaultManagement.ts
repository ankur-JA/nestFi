"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { useAccount, usePublicClient, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import deployedContracts from "../contracts/deployedContracts";

const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 31337);

export interface StrategyRow {
  name: string;
  address: string;
  assets: string;
}

export interface TokenBalanceRow {
  token: string;
  address: string;        // alias of `token`
  balance: string;
  symbol: string;         // populated for known tokens; "" otherwise
  source?: "vault" | "strategy";
  strategyName?: string;
}

export interface VaultStateView {
  totalAssets: string;
  idleAssets: string;
  investedAssets: string;
  assetsInVault: string;     // legacy alias for idleAssets
  assetsInStrategy: string;  // legacy alias for investedAssets
  requiredIdle: string;
  idleBufferBps: number;
  depositCap: string;
  minDeposit: string;
  isPaused: boolean;
  allowlistEnabled: boolean;
  strategyCount: number;
  swapRouter: string;        // deprecated; always zero-address
}

/**
 * Curator-side vault management: strategy registry + invest/divest + admin.
 */
export const useVaultManagement = (vaultAddress?: string) => {
  const { address: userAddress } = useAccount();
  const publicClient = usePublicClient();

  const deployed = (deployedContracts as any)[CHAIN_ID] || {};
  const vaultAbi = deployed.GroupVault?.abi ?? [];

  const vault = vaultAddress as `0x${string}` | undefined;

  const [isOwner, setIsOwner] = useState(false);
  const [strategies, setStrategies] = useState<StrategyRow[]>([]);
  const [vaultState, setVaultState] = useState<VaultStateView | null>(null);
  const [tokenBalances, setTokenBalances] = useState<TokenBalanceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { writeContractAsync, isPending: isWritePending } = useWriteContract();
  const [actionHash, setActionHash] = useState<`0x${string}` | undefined>();
  const { isSuccess } = useWaitForTransactionReceipt({ hash: actionHash, query: { enabled: !!actionHash } });

  const refreshData = useCallback(async () => {
    if (!publicClient || !vault) return;
    setLoading(true);
    setError(null);
    try {
      const [owner, strategyNames, idleAssets, investedAssets, totalAssets, requiredIdle, idleBps, depositCap, minDeposit, isPaused, allowlistEnabled, assetAddr] = await Promise.all([
        publicClient.readContract<any, any, any>({ address: vault, abi: vaultAbi, functionName: "owner" } as any) as Promise<`0x${string}`>,
        publicClient.readContract<any, any, any>({ address: vault, abi: vaultAbi, functionName: "getStrategyNames" } as any) as Promise<string[]>,
        publicClient.readContract<any, any, any>({ address: vault, abi: vaultAbi, functionName: "idleAssets" } as any) as Promise<bigint>,
        publicClient.readContract<any, any, any>({ address: vault, abi: vaultAbi, functionName: "investedAssets" } as any) as Promise<bigint>,
        publicClient.readContract<any, any, any>({ address: vault, abi: vaultAbi, functionName: "totalAssets" } as any) as Promise<bigint>,
        publicClient.readContract<any, any, any>({ address: vault, abi: vaultAbi, functionName: "requiredIdleBuffer" } as any) as Promise<bigint>,
        publicClient.readContract<any, any, any>({ address: vault, abi: vaultAbi, functionName: "idleBufferBps" } as any) as Promise<bigint>,
        publicClient.readContract<any, any, any>({ address: vault, abi: vaultAbi, functionName: "depositCap" } as any) as Promise<bigint>,
        publicClient.readContract<any, any, any>({ address: vault, abi: vaultAbi, functionName: "minDeposit" } as any) as Promise<bigint>,
        publicClient.readContract<any, any, any>({ address: vault, abi: vaultAbi, functionName: "paused" } as any) as Promise<boolean>,
        publicClient.readContract<any, any, any>({ address: vault, abi: vaultAbi, functionName: "allowlistEnabled" } as any) as Promise<boolean>,
        publicClient.readContract<any, any, any>({ address: vault, abi: vaultAbi, functionName: "asset" } as any) as Promise<`0x${string}`>,
      ]);

      setIsOwner(userAddress != null && owner.toLowerCase() === userAddress.toLowerCase());

      const stratRows: StrategyRow[] = await Promise.all(
        (strategyNames as string[]).map(async name => {
          const [addr, assets] = await Promise.all([
            publicClient.readContract<any, any, any>({ address: vault, abi: vaultAbi, functionName: "getStrategy", args: [name] } as any) as Promise<`0x${string}`>,
            publicClient.readContract<any, any, any>({ address: vault, abi: vaultAbi, functionName: "getStrategyAssets", args: [name] } as any) as Promise<bigint>,
          ]);
          return { name, address: addr, assets: formatUnits(assets, 6) };
        }),
      );
      setStrategies(stratRows);

      setVaultState({
        totalAssets: formatUnits(totalAssets, 6),
        idleAssets: formatUnits(idleAssets, 6),
        investedAssets: formatUnits(investedAssets, 6),
        assetsInVault: formatUnits(idleAssets, 6),
        assetsInStrategy: formatUnits(investedAssets, 6),
        requiredIdle: formatUnits(requiredIdle, 6),
        idleBufferBps: Number(idleBps),
        depositCap: formatUnits(depositCap, 6),
        minDeposit: formatUnits(minDeposit, 6),
        isPaused,
        allowlistEnabled,
        strategyCount: stratRows.length,
        swapRouter: "0x0000000000000000000000000000000000000000",
      });

      setTokenBalances([
        {
          token: assetAddr,
          address: assetAddr,
          balance: formatUnits(idleAssets, 6),
          symbol: "USDC",
          source: "vault",
        },
      ]);
    } catch (err: any) {
      console.error(err);
      setError(err?.shortMessage || err?.message || "Refresh failed");
    } finally {
      setLoading(false);
    }
  }, [publicClient, vault, vaultAbi, userAddress]);

  useEffect(() => {
    refreshData();
  }, [refreshData, isSuccess]);

  const run = useCallback(
    async (fn: string, args: readonly unknown[]) => {
      if (!vault) throw new Error("No vault");
      try {
        const h = await writeContractAsync({ address: vault, abi: vaultAbi, functionName: fn, args });
        setActionHash(h);
        return h;
      } catch (err: any) {
        setError(err?.shortMessage || err?.message || "Action failed");
        throw err;
      }
    },
    [vault, vaultAbi, writeContractAsync],
  );

  const addStrategy = useCallback(
    (name: string, address: `0x${string}`) => run("addStrategy", [name, address]),
    [run],
  );

  const removeStrategy = useCallback((name: string) => run("removeStrategy", [name]), [run]);

  const invest = useCallback(
    (name: string, humanAmount: string) => run("invest", [name, parseUnits(humanAmount, 6)]),
    [run],
  );

  // Legacy signature was (name, token, amount) — token is ignored since
  // GroupVault only operates on its single asset (USDC).
  const investInStrategy = useCallback(
    (name: string, tokenOrAmount: string, maybeAmount?: string) => {
      const amt = maybeAmount == null ? tokenOrAmount : maybeAmount;
      return run("invest", [name, parseUnits(amt, 6)]);
    },
    [run],
  );

  const divest = useCallback(
    (name: string, humanAmount: string) => run("divest", [name, parseUnits(humanAmount, 6)]),
    [run],
  );

  const divestFromStrategy = useCallback(
    (name: string, tokenOrAmount: string, maybeAmount?: string) => {
      const amt = maybeAmount == null ? tokenOrAmount : maybeAmount;
      return run("divest", [name, parseUnits(amt, 6)]);
    },
    [run],
  );

  const togglePause = useCallback(async () => {
    if (!vault || !publicClient) return;
    const paused = (await publicClient.readContract<any, any, any>({
      address: vault,
      abi: vaultAbi,
      functionName: "paused",
    } as any)) as boolean;
    return run(paused ? "unpause" : "pause", []);
  }, [vault, publicClient, vaultAbi, run]);

  const setIdleBufferBps = useCallback((bps: number) => run("setIdleBufferBps", [BigInt(bps)]), [run]);
  const setDepositCap = useCallback(
    (humanCap: string) => run("setDepositCap", [parseUnits(humanCap, 6)]),
    [run],
  );
  const setMinDeposit = useCallback(
    (humanMin: string) => run("setMinDeposit", [parseUnits(humanMin, 6)]),
    [run],
  );
  const setAllowlist = useCallback(
    (user: `0x${string}`, allowed: boolean) => run("setAllowlist", [user, allowed]),
    [run],
  );

  // Legacy no-ops / stubs retained for compatibility with older UI.
  // These used to call VaultManager.swapTokens etc.; in Path B the vault
  // doesn't do swaps internally — strategies handle any conversions.
  const swapTokens = async (..._args: unknown[]) => undefined;
  const setSwapRouter = async (..._args: unknown[]) => undefined;
  const setSwapFee = async (..._args: unknown[]) => undefined;
  const addSupportedToken = async (..._args: unknown[]) => undefined;

  return useMemo(
    () => ({
      isOwner,
      loading: loading || isWritePending,
      error,
      tokenBalances,
      strategies,
      vaultState,
      refreshData,
      addStrategy,
      removeStrategy,
      invest,
      investInStrategy,
      divest,
      divestFromStrategy,
      togglePause,
      setIdleBufferBps,
      setDepositCap,
      setMinDeposit,
      setAllowlist,
      swapTokens,
      setSwapRouter,
      setSwapFee,
      addSupportedToken,
    }),
    [
      isOwner,
      loading,
      isWritePending,
      error,
      tokenBalances,
      strategies,
      vaultState,
      refreshData,
      addStrategy,
      removeStrategy,
      invest,
      investInStrategy,
      divest,
      divestFromStrategy,
      togglePause,
      setIdleBufferBps,
      setDepositCap,
      setMinDeposit,
      setAllowlist,
    ],
  );
};
