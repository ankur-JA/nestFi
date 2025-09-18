"use client";

import { useState, useCallback } from "react";
import { useAccount, useWriteContract, useTransaction } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import deployedContracts from "../contracts/deployedContracts";

const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 11155111);

interface VaultLimits {
  maxDeposit: string;
  maxMint: string;
  maxRedeem: string;
  maxWithdraw: string;
  minDeposit: string;
}

interface VaultBalances {
  userBalance: string;
  userShares: string;
}

interface VaultPreview {
  preview: string | null;
}

export const useVaultActions = (vaultAddress?: string) => {
  const { address: userAddress } = useAccount();
  const { writeContract, data: txData, isPending: isTxPending, error: txError } = useWriteContract();
  const { isLoading: isTxLoading, isSuccess: isTxSuccess, error: txReceiptError } = useTransaction({
    hash: txData,
    query: { enabled: !!txData },
  });

  const [limits, setLimits] = useState<VaultLimits | null>(null);
  const [balances, setBalances] = useState<VaultBalances | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const vaultABI = (deployedContracts as any)[CHAIN_ID]?.GroupVault?.abi || [];

  // Fetch vault limits and balances
  const fetchVaultData = useCallback(async () => {
    if (!vaultAddress || !userAddress) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/vault/actions?address=${vaultAddress}&user=${userAddress}`
      );
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setLimits(data.limits);
      setBalances(data.userBalances);
    } catch (err: any) {
      setError(err.message || "Failed to fetch vault data");
    } finally {
      setLoading(false);
    }
  }, [vaultAddress, userAddress]);

  // Preview transaction
  const previewTransaction = useCallback(async (action: string, amount: string) => {
    if (!vaultAddress || !userAddress || !amount) return null;

    try {
      const response = await fetch(
        `/api/vault/actions?address=${vaultAddress}&user=${userAddress}&action=${action}&amount=${amount}`
      );
      const data = await response.json();
      return data.preview;
    } catch (err) {
      console.error("Preview failed:", err);
      return null;
    }
  }, [vaultAddress, userAddress]);

  // Deposit assets
  const deposit = useCallback(async (amount: string, receiver?: string) => {
    if (!vaultAddress || !amount || !userAddress) return;

    try {
      const assets = parseUnits(amount, 6); // USDC has 6 decimals
      const to = receiver || userAddress;

      await writeContract({
        address: vaultAddress as `0x${string}`,
        abi: vaultABI,
        functionName: "deposit",
        args: [assets, to],
      });
    } catch (err: any) {
      setError(err.message || "Deposit failed");
    }
  }, [vaultAddress, userAddress, writeContract, vaultABI]);

  // Withdraw assets
  const withdraw = useCallback(async (amount: string, receiver?: string, owner?: string) => {
    if (!vaultAddress || !amount || !userAddress) return;

    try {
      const assets = parseUnits(amount, 6); // USDC has 6 decimals
      const to = receiver || userAddress;
      const from = owner || userAddress;

      await writeContract({
        address: vaultAddress as `0x${string}`,
        abi: vaultABI,
        functionName: "withdraw",
        args: [assets, to, from],
      });
    } catch (err: any) {
      setError(err.message || "Withdraw failed");
    }
  }, [vaultAddress, userAddress, writeContract, vaultABI]);

  // Mint shares
  const mint = useCallback(async (shares: string, receiver?: string) => {
    if (!vaultAddress || !shares || !userAddress) return;

    try {
      const sharesAmount = parseUnits(shares, 18); // Vault tokens typically have 18 decimals
      const to = receiver || userAddress;

      await writeContract({
        address: vaultAddress as `0x${string}`,
        abi: vaultABI,
        functionName: "mint",
        args: [sharesAmount, to],
      });
    } catch (err: any) {
      setError(err.message || "Mint failed");
    }
  }, [vaultAddress, userAddress, writeContract, vaultABI]);

  // Redeem shares
  const redeem = useCallback(async (shares: string, receiver?: string, owner?: string) => {
    if (!vaultAddress || !shares || !userAddress) return;

    try {
      const sharesAmount = parseUnits(shares, 18); // Vault tokens typically have 18 decimals
      const to = receiver || userAddress;
      const from = owner || userAddress;

      await writeContract({
        address: vaultAddress as `0x${string}`,
        abi: vaultABI,
        functionName: "redeem",
        args: [sharesAmount, to, from],
      });
    } catch (err: any) {
      setError(err.message || "Redeem failed");
    }
  }, [vaultAddress, userAddress, writeContract, vaultABI]);

  // Helper functions
  const formatAmount = useCallback((amount: string, decimals: number = 6) => {
    return formatUnits(BigInt(amount), decimals);
  }, []);

  const parseAmount = useCallback((amount: string, decimals: number = 6) => {
    return parseUnits(amount, decimals);
  }, []);

  // Validation helpers
  const validateDeposit = useCallback((amount: string) => {
    if (!amount || !limits) return "Enter an amount";
    
    const amountBigInt = parseAmount(amount);
    const minDeposit = BigInt(limits.minDeposit);
    const maxDeposit = BigInt(limits.maxDeposit);

    if (amountBigInt < minDeposit) {
      return `Minimum deposit is ${formatAmount(limits.minDeposit)} USDC`;
    }
    
    if (amountBigInt > maxDeposit) {
      return `Maximum deposit is ${formatAmount(limits.maxDeposit)} USDC`;
    }

    return null;
  }, [limits, parseAmount, formatAmount]);

  const validateWithdraw = useCallback((amount: string) => {
    if (!amount || !limits || !balances) return "Enter an amount";
    
    const amountBigInt = parseAmount(amount);
    const maxWithdraw = BigInt(limits.maxWithdraw);
    const userBalance = BigInt(balances.userBalance);

    if (amountBigInt > userBalance) {
      return "Insufficient balance";
    }
    
    if (amountBigInt > maxWithdraw) {
      return `Maximum withdraw is ${formatAmount(limits.maxWithdraw)} USDC`;
    }

    return null;
  }, [limits, balances, parseAmount, formatAmount]);

  return {
    // Data
    limits,
    balances,
    loading,
    error,
    
    // Actions
    deposit,
    withdraw,
    mint,
    redeem,
    fetchVaultData,
    previewTransaction,
    
    // Helpers
    formatAmount,
    parseAmount,
    validateDeposit,
    validateWithdraw,
    
    // Transaction state
    isTxPending,
    isTxLoading,
    isTxSuccess,
    txError: txError || txReceiptError,
  };
};
