"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { useAccount, usePublicClient, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import deployedContracts from "../contracts/deployedContracts";

const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 31337);

export interface VaultLimits {
  maxDeposit: string;
  maxMint: string;
  maxRedeem: string;
  maxWithdraw: string;
  minDeposit: string;
}

export interface VaultBalances {
  userBalance: string; // assets
  userShares: string;
}

/**
 * Deposit / withdraw flow with on-chain approve step for the ERC-4626 vault.
 */
export const useVaultActions = (vaultAddress?: string) => {
  const { address: userAddress } = useAccount();
  const publicClient = usePublicClient();

  const deployed = (deployedContracts as any)[CHAIN_ID] || {};
  const vaultAbi = deployed.GroupVault?.abi ?? [];
  const assetAddress = deployed.MockUSDC?.address as `0x${string}` | undefined;
  const assetAbi = deployed.MockUSDC?.abi ?? [];

  const vault = vaultAddress as `0x${string}` | undefined;

  const [limits, setLimits] = useState<VaultLimits | null>(null);
  const [balances, setBalances] = useState<VaultBalances | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();
  const [actionHash, setActionHash] = useState<`0x${string}` | undefined>();
  const { isLoading: txLoading, isSuccess: txSuccess } = useWaitForTransactionReceipt({
    hash: actionHash,
    query: { enabled: !!actionHash },
  });

  const fetchVaultData = useCallback(async () => {
    if (!publicClient || !vault || !userAddress) return;
    setLoading(true);
    setError(null);
    try {
      const [maxDeposit, maxMint, maxRedeem, maxWithdraw, minDeposit, assetBalance, userShares, assetDecimals] = await Promise.all([
        publicClient.readContract<any, any, any>({ address: vault, abi: vaultAbi, functionName: "maxDeposit", args: [userAddress] } as any) as Promise<bigint>,
        publicClient.readContract<any, any, any>({ address: vault, abi: vaultAbi, functionName: "maxMint", args: [userAddress] } as any) as Promise<bigint>,
        publicClient.readContract<any, any, any>({ address: vault, abi: vaultAbi, functionName: "maxRedeem", args: [userAddress] } as any) as Promise<bigint>,
        publicClient.readContract<any, any, any>({ address: vault, abi: vaultAbi, functionName: "maxWithdraw", args: [userAddress] } as any) as Promise<bigint>,
        publicClient.readContract<any, any, any>({ address: vault, abi: vaultAbi, functionName: "minDeposit" } as any) as Promise<bigint>,
        assetAddress
          ? (publicClient.readContract<any, any, any>({ address: assetAddress, abi: assetAbi, functionName: "balanceOf", args: [userAddress] } as any) as Promise<bigint>)
          : Promise.resolve(0n),
        publicClient.readContract<any, any, any>({ address: vault, abi: vaultAbi, functionName: "balanceOf", args: [userAddress] } as any) as Promise<bigint>,
        assetAddress
          ? (publicClient.readContract<any, any, any>({ address: assetAddress, abi: assetAbi, functionName: "decimals" } as any) as Promise<number>)
          : Promise.resolve(6),
      ]);

      const d = Number(assetDecimals ?? 6);
      setLimits({
        maxDeposit: formatUnits(maxDeposit, d),
        maxMint: maxMint.toString(),
        maxRedeem: maxRedeem.toString(),
        maxWithdraw: formatUnits(maxWithdraw, d),
        minDeposit: formatUnits(minDeposit, d),
      });
      setBalances({
        userBalance: formatUnits(assetBalance, d),
        userShares: userShares.toString(),
      });
    } catch (err: any) {
      setError(err?.shortMessage || err?.message || "Fetch failed");
    } finally {
      setLoading(false);
    }
  }, [publicClient, vault, userAddress, vaultAbi, assetAddress, assetAbi]);

  useEffect(() => {
    fetchVaultData();
  }, [fetchVaultData, txSuccess]);

  const previewTransaction = useCallback(
    async (actionOrFn: string, humanAmount: string): Promise<string | null> => {
      if (!publicClient || !vault || !humanAmount) return null;
      try {
        const amount = parseUnits(humanAmount, 6);
        // Accept both "deposit"/"withdraw" shortcuts and the raw ERC-4626 preview fn names.
        const fn =
          actionOrFn === "deposit"
            ? "previewDeposit"
            : actionOrFn === "withdraw"
              ? "previewWithdraw"
              : actionOrFn === "redeem"
                ? "previewRedeem"
                : actionOrFn === "mint"
                  ? "previewMint"
                  : actionOrFn;
        const out = (await publicClient.readContract<any, any, any>({
          address: vault,
          abi: vaultAbi,
          functionName: fn,
          args: [amount],
        } as any)) as bigint;
        return out.toString();
      } catch {
        return null;
      }
    },
    [publicClient, vault, vaultAbi],
  );

  // Helpers consumed by the UI
  const formatAmount = useCallback((value: string | bigint, decimals = 6): string => {
    try {
      const big = typeof value === "bigint" ? value : BigInt(value);
      return formatUnits(big, decimals);
    } catch {
      return String(value ?? "0");
    }
  }, []);

  const validateDeposit = useCallback(
    (humanAmount: string): string | null => {
      if (!humanAmount || Number.isNaN(parseFloat(humanAmount))) return "Enter an amount";
      const amt = parseFloat(humanAmount);
      if (amt <= 0) return "Amount must be positive";
      if (limits && amt < parseFloat(limits.minDeposit)) {
        return `Minimum deposit is ${limits.minDeposit} USDC`;
      }
      if (limits && amt > parseFloat(limits.maxDeposit)) {
        return `Exceeds remaining deposit cap (${limits.maxDeposit})`;
      }
      if (balances && amt > parseFloat(balances.userBalance)) {
        return "Insufficient USDC balance";
      }
      return null;
    },
    [limits, balances],
  );

  const validateWithdraw = useCallback(
    (humanAmount: string): string | null => {
      if (!humanAmount || Number.isNaN(parseFloat(humanAmount))) return "Enter an amount";
      const amt = parseFloat(humanAmount);
      if (amt <= 0) return "Amount must be positive";
      if (limits && amt > parseFloat(limits.maxWithdraw)) {
        return `Exceeds withdrawable amount (${limits.maxWithdraw})`;
      }
      return null;
    },
    [limits],
  );

  const deposit = useCallback(
    async (humanAmount: string) => {
      setError(null);
      if (!vault || !userAddress || !assetAddress) throw new Error("Not ready");
      try {
        const amount = parseUnits(humanAmount, 6);

        // Check current allowance; approve only if needed
        const allowance = (await publicClient!.readContract<any, any, any>({
          address: assetAddress,
          abi: assetAbi,
          functionName: "allowance",
          args: [userAddress, vault],
        } as any)) as bigint;

        if (allowance < amount) {
          const approveHash = await writeContractAsync({
            address: assetAddress,
            abi: assetAbi,
            functionName: "approve",
            args: [vault, amount],
          });
          await publicClient!.waitForTransactionReceipt({ hash: approveHash });
        }

        const h = await writeContractAsync({
          address: vault,
          abi: vaultAbi,
          functionName: "deposit",
          args: [amount, userAddress],
        });
        setActionHash(h);
        return h;
      } catch (err: any) {
        setError(err?.shortMessage || err?.message || "Deposit failed");
        throw err;
      }
    },
    [vault, userAddress, assetAddress, assetAbi, vaultAbi, writeContractAsync, publicClient],
  );

  const withdraw = useCallback(
    async (humanAmount: string) => {
      setError(null);
      if (!vault || !userAddress) throw new Error("Not ready");
      try {
        const h = await writeContractAsync({
          address: vault,
          abi: vaultAbi,
          functionName: "withdraw",
          args: [parseUnits(humanAmount, 6), userAddress, userAddress],
        });
        setActionHash(h);
        return h;
      } catch (err: any) {
        setError(err?.shortMessage || err?.message || "Withdraw failed");
        throw err;
      }
    },
    [vault, userAddress, vaultAbi, writeContractAsync],
  );

  return useMemo(
    () => ({
      limits,
      balances,
      loading: loading || txLoading,
      isTxPending: txLoading,
      isTxLoading: txLoading,
      isTxSuccess: txSuccess,
      txError: null as string | null,
      isSuccess: txSuccess,
      error,
      fetchVaultData,
      previewTransaction,
      deposit,
      withdraw,
      formatAmount,
      validateDeposit,
      validateWithdraw,
    }),
    [
      limits,
      balances,
      loading,
      txLoading,
      txSuccess,
      error,
      fetchVaultData,
      previewTransaction,
      deposit,
      withdraw,
      formatAmount,
      validateDeposit,
      validateWithdraw,
    ],
  );
};
