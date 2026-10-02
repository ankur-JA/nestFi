"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { parseUnits } from "viem";
import { useAccount, usePublicClient, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import deployedContracts from "../contracts/deployedContracts";

const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 31337);

export interface VaultData {
  address: `0x${string}`;
  asset: `0x${string}` | undefined;
  name: string;
  symbol: string;
  owner: `0x${string}` | undefined;
  depositCap: bigint;
  minDeposit: bigint;
  idleBufferBps: bigint;
  totalAssets: bigint;
  idleAssets: bigint;
  investedAssets: bigint;
  requiredIdle: bigint;
  totalSupply: bigint;
  userShares: bigint;
  userBalance: bigint; // user position valued in asset
  allowlistEnabled: boolean;
  isPaused: boolean;
  isAdmin: boolean;
  isAllowed: boolean;
  strategyNames: string[];
}

export const useVaultContract = (vaultAddress?: string) => {
  const { address: userAddress } = useAccount();
  const publicClient = usePublicClient();

  const deployed = (deployedContracts as any)[CHAIN_ID] || {};
  const vaultAbi = deployed.GroupVault?.abi ?? [];

  const vault = (vaultAddress as `0x${string}` | undefined) || undefined;

  const { data, refetch, isLoading } = useReadContracts({
    contracts: vault
      ? [
          { address: vault, abi: vaultAbi, functionName: "asset" },
          { address: vault, abi: vaultAbi, functionName: "name" },
          { address: vault, abi: vaultAbi, functionName: "symbol" },
          { address: vault, abi: vaultAbi, functionName: "owner" },
          { address: vault, abi: vaultAbi, functionName: "depositCap" },
          { address: vault, abi: vaultAbi, functionName: "minDeposit" },
          { address: vault, abi: vaultAbi, functionName: "idleBufferBps" },
          { address: vault, abi: vaultAbi, functionName: "totalAssets" },
          { address: vault, abi: vaultAbi, functionName: "idleAssets" },
          { address: vault, abi: vaultAbi, functionName: "investedAssets" },
          { address: vault, abi: vaultAbi, functionName: "requiredIdleBuffer" },
          { address: vault, abi: vaultAbi, functionName: "totalSupply" },
          { address: vault, abi: vaultAbi, functionName: "allowlistEnabled" },
          { address: vault, abi: vaultAbi, functionName: "paused" },
          { address: vault, abi: vaultAbi, functionName: "getStrategyNames" },
          ...(userAddress
            ? [
                { address: vault, abi: vaultAbi, functionName: "balanceOf", args: [userAddress] as const },
                { address: vault, abi: vaultAbi, functionName: "isAllowed", args: [userAddress] as const },
              ]
            : []),
        ]
      : [],
    query: { enabled: !!vault, refetchInterval: 10_000 },
  });

  const [userBalanceInAsset, setUserBalanceInAsset] = useState<bigint>(0n);

  const vaultData: VaultData | null = useMemo(() => {
    if (!vault || !data) return null;
    const r = (i: number) => data[i]?.result;
    const asset = r(0) as `0x${string}` | undefined;
    const name = (r(1) as string) ?? "";
    const symbol = (r(2) as string) ?? "";
    const owner = r(3) as `0x${string}` | undefined;
    const depositCap = (r(4) as bigint) ?? 0n;
    const minDeposit = (r(5) as bigint) ?? 0n;
    const idleBufferBps = (r(6) as bigint) ?? 0n;
    const totalAssets = (r(7) as bigint) ?? 0n;
    const idleAssets = (r(8) as bigint) ?? 0n;
    const investedAssets = (r(9) as bigint) ?? 0n;
    const requiredIdle = (r(10) as bigint) ?? 0n;
    const totalSupply = (r(11) as bigint) ?? 0n;
    const allowlistEnabled = (r(12) as boolean) ?? false;
    const isPaused = (r(13) as boolean) ?? false;
    const strategyNames = (r(14) as string[]) ?? [];
    const userShares = userAddress ? ((r(15) as bigint) ?? 0n) : 0n;
    const isAllowed = userAddress ? ((r(16) as boolean) ?? !allowlistEnabled) : !allowlistEnabled;
    const isAdmin = userAddress != null && owner != null && owner.toLowerCase() === userAddress.toLowerCase();

    return {
      address: vault,
      asset,
      name,
      symbol,
      owner,
      depositCap,
      minDeposit,
      idleBufferBps,
      totalAssets,
      idleAssets,
      investedAssets,
      requiredIdle,
      totalSupply,
      userShares,
      userBalance: userBalanceInAsset,
      allowlistEnabled,
      isPaused,
      isAdmin,
      isAllowed,
      strategyNames,
    };
  }, [vault, data, userAddress, userBalanceInAsset]);

  // Convert userShares -> underlying assets
  useEffect(() => {
    (async () => {
      if (!publicClient || !vault || !vaultData?.userShares || vaultData.userShares === 0n) {
        setUserBalanceInAsset(0n);
        return;
      }
      try {
        const assets = (await publicClient.readContract<any, any, any>({
          address: vault,
          abi: vaultAbi,
          functionName: "convertToAssets",
          args: [vaultData.userShares],
        } as any)) as bigint;
        setUserBalanceInAsset(assets);
      } catch {
        setUserBalanceInAsset(0n);
      }
    })();
  }, [publicClient, vault, vaultAbi, vaultData?.userShares]);

  // ---------- Write actions ----------
  const { writeContractAsync } = useWriteContract();
  const [actionHash, setActionHash] = useState<`0x${string}` | undefined>();
  const { isLoading: txLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: actionHash,
    query: { enabled: !!actionHash },
  });

  useEffect(() => {
    if (isSuccess) refetch();
  }, [isSuccess, refetch]);

  const call = useCallback(
    async (fn: string, args: readonly unknown[]) => {
      if (!vault) throw new Error("No vault");
      const h = await writeContractAsync({ address: vault, abi: vaultAbi, functionName: fn, args });
      setActionHash(h);
      return h;
    },
    [vault, vaultAbi, writeContractAsync],
  );

  const deposit = useCallback(
    async (humanAmount: string) => {
      if (!userAddress) throw new Error("No wallet");
      return call("deposit", [parseUnits(humanAmount, 6), userAddress]);
    },
    [call, userAddress],
  );

  const withdraw = useCallback(
    async (humanAmount: string) => {
      if (!userAddress) throw new Error("No wallet");
      return call("withdraw", [parseUnits(humanAmount, 6), userAddress, userAddress]);
    },
    [call, userAddress],
  );

  // invest/divest accept EITHER (name, amount) or (amount) alone — in the
  // single-arg form we fall back to the first registered strategy name.
  const _firstStrategy = useCallback(() => vaultData?.strategyNames?.[0] ?? "default", [vaultData]);

  const invest = useCallback(
    (nameOrAmount: string, maybeAmount?: string) => {
      const [name, amt] = maybeAmount == null ? [_firstStrategy(), nameOrAmount] : [nameOrAmount, maybeAmount];
      return call("invest", [name, parseUnits(amt, 6)]);
    },
    [call, _firstStrategy],
  );

  const divest = useCallback(
    (nameOrAmount: string, maybeAmount?: string) => {
      const [name, amt] = maybeAmount == null ? [_firstStrategy(), nameOrAmount] : [nameOrAmount, maybeAmount];
      return call("divest", [name, parseUnits(amt, 6)]);
    },
    [call, _firstStrategy],
  );

  // addStrategy / setStrategy: accept (name, address) or (address) alone.
  const addStrategy = useCallback(
    (nameOrAddress: string, maybeAddress?: string) => {
      const [name, address] = maybeAddress == null ? ["default", nameOrAddress] : [nameOrAddress, maybeAddress];
      return call("addStrategy", [name, address]);
    },
    [call],
  );

  const removeStrategy = useCallback((name: string) => call("removeStrategy", [name]), [call]);
  const pause = useCallback(() => call("pause", []), [call]);
  const unpause = useCallback(() => call("unpause", []), [call]);
  const setAllowlist = useCallback(
    (user: string, allowed: boolean) => call("setAllowlist", [user as `0x${string}`, allowed]),
    [call],
  );
  const setDepositCap = useCallback(
    (humanCap: string) => call("setDepositCap", [parseUnits(humanCap, 6)]),
    [call],
  );
  const setMinDeposit = useCallback(
    (humanMin: string) => call("setMinDeposit", [parseUnits(humanMin, 6)]),
    [call],
  );
  const setIdleBufferBps = useCallback(
    (bps: number) => call("setIdleBufferBps", [BigInt(bps)]),
    [call],
  );

  // Back-compat aliases used by older UI
  const setStrategy = addStrategy;
  const harvest = useCallback(async (_amount?: string): Promise<undefined> => undefined, []);

  return {
    vaultData,
    loading: isLoading || txLoading,
    actionHash,
    refetch,
    deposit,
    withdraw,
    invest,
    divest,
    addStrategy,
    removeStrategy,
    setStrategy,
    harvest,
    pause,
    unpause,
    setAllowlist,
    setDepositCap,
    setMinDeposit,
    setIdleBufferBps,
  };
};
