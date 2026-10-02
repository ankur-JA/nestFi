"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { parseUnits } from "viem";
import { useAccount, usePublicClient, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import deployedContracts from "../contracts/deployedContracts";

const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 31337);

export interface CreateVaultParams {
  name: string;
  symbol: string;
  allowlistEnabled: boolean;
  depositCap: string;   // human string, 6 decimals (USDC)
  minDeposit: string;   // human string, 6 decimals
  idleBufferBps: number; // 800-1500
}

export interface VaultInfo {
  address: string;
  owner: string;
  stakeAmount: string;
  vaultId: string;
  // enriched reads from the vault itself (optional — populated lazily)
  name?: string;
  symbol?: string;
  totalAssets?: string;
  depositCap?: string;
  minDeposit?: string;
  isPaused?: boolean;
  isAdmin?: boolean;
  allowlistEnabled?: boolean;
  idleBufferBps?: number;
}

export const useVaultFactory = (overrideAddress?: `0x${string}`) => {
  const { address: userAddress } = useAccount();
  const publicClient = usePublicClient();
  const [error, setError] = useState<string | null>(null);
  const [userVaults, setUserVaults] = useState<VaultInfo[]>([]);

  const deployed = (deployedContracts as any)[CHAIN_ID] || {};
  const factoryAddress = (overrideAddress || deployed.VaultFactory?.address) as `0x${string}` | undefined;
  const factoryAbi = deployed.VaultFactory?.abi ?? [];
  const stakingAddress = deployed.CuratorStaking?.address as `0x${string}` | undefined;
  const stakingAbi = deployed.CuratorStaking?.abi ?? [];
  const assetAddress = deployed.MockUSDC?.address as `0x${string}` | undefined;
  const assetAbi = deployed.MockUSDC?.abi ?? [];

  const { data: allVaults, refetch: refetchAllVaults } = useReadContract({
    address: factoryAddress,
    abi: factoryAbi,
    functionName: "getAllVaults",
    query: { enabled: !!factoryAddress, refetchInterval: 10_000 },
  });

  const { data: userVaultAddrs, refetch: refetchUserVaults } = useReadContract({
    address: factoryAddress,
    abi: factoryAbi,
    functionName: "getVaultsByUser",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!factoryAddress && !!userAddress, refetchInterval: 10_000 },
  });

  const { writeContractAsync: writeApprove } = useWriteContract();
  const { writeContractAsync: writeCreateVault, data: createVaultHash } = useWriteContract();
  const { isLoading: createVaultTxLoading, isSuccess: createVaultSuccess } = useWaitForTransactionReceipt({
    hash: createVaultHash,
    query: { enabled: !!createVaultHash },
  });

  const [submitting, setSubmitting] = useState(false);

  const createVault = useCallback(
    async (params: CreateVaultParams) => {
      setError(null);
      if (!factoryAddress || !stakingAddress || !assetAddress || !userAddress) {
        setError("Contracts not deployed or wallet not connected");
        return;
      }
      if (!params.name.trim() || !params.symbol.trim()) {
        setError("Vault name and symbol are required");
        return;
      }
      if (params.idleBufferBps < 800 || params.idleBufferBps > 1500) {
        setError("Idle buffer must be between 8% and 15%");
        return;
      }

      try {
        setSubmitting(true);
        const depositCap = parseUnits(params.depositCap, 6);
        const minDeposit = parseUnits(params.minDeposit, 6);
        const stakeAmount = (depositCap * 200n) / 10_000n;

        // 1) Approve CuratorStaking for the required stake
        const approveHash = await writeApprove({
          address: assetAddress,
          abi: assetAbi,
          functionName: "approve",
          args: [stakingAddress, stakeAmount],
        });
        if (publicClient) {
          await publicClient.waitForTransactionReceipt({ hash: approveHash });
        }

        // 2) Call factory.createVault
        await writeCreateVault({
          address: factoryAddress,
          abi: factoryAbi,
          functionName: "createVault",
          args: [
            params.name,
            params.symbol,
            params.allowlistEnabled,
            depositCap,
            minDeposit,
            BigInt(params.idleBufferBps),
          ],
        });
      } catch (err: any) {
        console.error("createVault error:", err);
        setError(parseWalletError(err));
      } finally {
        setSubmitting(false);
      }
    },
    [
      factoryAddress,
      stakingAddress,
      assetAddress,
      userAddress,
      writeApprove,
      writeCreateVault,
      publicClient,
      factoryAbi,
      assetAbi,
    ],
  );

  // Refresh user vault list after a successful create
  useEffect(() => {
    if (createVaultSuccess) {
      refetchAllVaults();
      refetchUserVaults();
    }
  }, [createVaultSuccess, refetchAllVaults, refetchUserVaults]);

  const vaultAbi = deployed.GroupVault?.abi ?? [];

  // Enrich with factory-side owner/stake/id AND vault-side name/symbol/totals.
  const refreshUserVaults = useCallback(async () => {
    if (!publicClient || !factoryAddress || !userVaultAddrs) {
      setUserVaults([]);
      return;
    }
    const addrs = userVaultAddrs as `0x${string}`[];
    const infos = await Promise.all(
      addrs.map(async (vault): Promise<VaultInfo> => {
        try {
          const [owner, stakeAmount, vaultId, name, symbol, totalAssets, depositCap, minDeposit, isPaused, allowlistEnabled, idleBufferBps] =
            await Promise.all([
              publicClient.readContract<any, any, any>({ address: factoryAddress, abi: factoryAbi, functionName: "getVaultOwner", args: [vault] } as any),
              publicClient.readContract<any, any, any>({ address: factoryAddress, abi: factoryAbi, functionName: "curatorStakeFor", args: [vault] } as any),
              publicClient.readContract<any, any, any>({ address: factoryAddress, abi: factoryAbi, functionName: "vaultId", args: [vault] } as any),
              publicClient.readContract<any, any, any>({ address: vault, abi: vaultAbi, functionName: "name" } as any),
              publicClient.readContract<any, any, any>({ address: vault, abi: vaultAbi, functionName: "symbol" } as any),
              publicClient.readContract<any, any, any>({ address: vault, abi: vaultAbi, functionName: "totalAssets" } as any),
              publicClient.readContract<any, any, any>({ address: vault, abi: vaultAbi, functionName: "depositCap" } as any),
              publicClient.readContract<any, any, any>({ address: vault, abi: vaultAbi, functionName: "minDeposit" } as any),
              publicClient.readContract<any, any, any>({ address: vault, abi: vaultAbi, functionName: "paused" } as any),
              publicClient.readContract<any, any, any>({ address: vault, abi: vaultAbi, functionName: "allowlistEnabled" } as any),
              publicClient.readContract<any, any, any>({ address: vault, abi: vaultAbi, functionName: "idleBufferBps" } as any),
            ]);
          const ownerStr = owner as string;
          return {
            address: vault,
            owner: ownerStr,
            stakeAmount: (stakeAmount as bigint).toString(),
            vaultId: (vaultId as bigint).toString(),
            name: name as string,
            symbol: symbol as string,
            totalAssets: (totalAssets as bigint).toString(),
            depositCap: (depositCap as bigint).toString(),
            minDeposit: (minDeposit as bigint).toString(),
            isPaused: isPaused as boolean,
            allowlistEnabled: allowlistEnabled as boolean,
            idleBufferBps: Number(idleBufferBps as bigint),
            isAdmin: userAddress != null && ownerStr.toLowerCase() === userAddress.toLowerCase(),
          };
        } catch {
          return { address: vault, owner: "", stakeAmount: "0", vaultId: "0" };
        }
      }),
    );
    setUserVaults(infos);
  }, [publicClient, factoryAddress, userVaultAddrs, factoryAbi, vaultAbi, userAddress]);

  useEffect(() => {
    refreshUserVaults();
  }, [refreshUserVaults]);

  return useMemo(
    () => ({
      createVault,
      userVaults,
      allVaults: (allVaults as string[]) ?? [],
      loading: submitting || createVaultTxLoading,
      success: createVaultSuccess,
      error,
      setError,
      refetchUserVaults: refreshUserVaults,
      refetchAllVaults,
      refreshVaults: refreshUserVaults,  // legacy alias
      checkVaultMembership: async (_vault: string): Promise<VaultInfo | null> => null,  // legacy stub
      factoryAddress,
      stakingAddress,
      assetAddress,
    }),
    [
      createVault,
      userVaults,
      allVaults,
      submitting,
      createVaultTxLoading,
      createVaultSuccess,
      error,
      refreshUserVaults,
      refetchAllVaults,
      factoryAddress,
      stakingAddress,
      assetAddress,
    ],
  );
};

function parseWalletError(err: any): string {
  const raw = (err?.shortMessage || err?.message || String(err)).toLowerCase();
  if (raw.includes("user rejected") || raw.includes("user denied")) return "Transaction cancelled";
  if (raw.includes("insufficient funds")) return "Insufficient funds for gas";
  if (raw.includes("insufficient allowance")) return "Approve USDC to CuratorStaking first";
  if (raw.includes("notfactory")) return "Factory not wired to staking contract";
  if (raw.includes("idlebufferoutofrange")) return "Idle buffer must be 8-15%";
  if (raw.includes("cap=0")) return "Deposit cap must be greater than 0";
  return err?.shortMessage || err?.message || "Transaction failed";
}
