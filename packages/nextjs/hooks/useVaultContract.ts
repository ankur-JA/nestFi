"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAccount, useReadContract, useWriteContract, useTransaction } from "wagmi";
import { parseUnits } from "viem";
import deployedContracts from "../contracts/deployedContracts";

export interface VaultData {
  address: string;
  name: string;
  symbol: string;
  asset: string;
  totalAssets: bigint;
  totalSupply: bigint;
  depositCap: bigint;
  minDeposit: bigint;
  allowlistEnabled: boolean;
  isAllowed: boolean;
  userBalance: bigint;
  userShares: bigint;
  isPaused: boolean;
  strategy?: string;
}

export const useVaultContract = (vaultAddress?: string) => {
  const { address: userAddress } = useAccount();
  const [vaultData, setVaultData] = useState<VaultData | null>(null);
  const [error, setError] = useState<string | null>(null);


  // Use deployed vault ABI
  const vaultABI = useMemo(() => deployedContracts[31337]?.GroupVault?.abi || [], []);

  // Read vault data
  const { data: name, isLoading: nameLoading } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: vaultABI,
    functionName: "name",
    query: {
      enabled: !!vaultAddress,
    },
  });

  const { data: symbol, isLoading: symbolLoading } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: vaultABI,
    functionName: "symbol",
    query: {
      enabled: !!vaultAddress,
    },
  });

  const { data: asset, isLoading: assetLoading } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: vaultABI,
    functionName: "asset",
    query: {
      enabled: !!vaultAddress,
    },
  });

  const { data: totalAssets, isLoading: totalAssetsLoading } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: vaultABI,
    functionName: "totalAssets",
    query: {
      enabled: !!vaultAddress,
    },
  });

  const { data: totalSupply, isLoading: totalSupplyLoading } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: vaultABI,
    functionName: "totalSupply",
    query: {
      enabled: !!vaultAddress,
    },
  });

  const { data: depositCap, isLoading: depositCapLoading } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: vaultABI,
    functionName: "depositCap",
    query: {
      enabled: !!vaultAddress,
    },
  });

  const { data: minDeposit, isLoading: minDepositLoading } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: vaultABI,
    functionName: "minDeposit",
    query: {
      enabled: !!vaultAddress,
    },
  });

  const { data: strategyAddr } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: vaultABI,
    functionName: "strategy" as any,
    query: {
      enabled: !!vaultAddress,
    },
  });

  const { data: allowlistEnabled, isLoading: allowlistLoading } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: vaultABI,
    functionName: "allowlistEnabled",
    query: {
      enabled: !!vaultAddress,
    },
  });

  const { data: isAllowed, isLoading: isAllowedLoading } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: vaultABI,
    functionName: "isAllowed",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!vaultAddress && !!userAddress,
    },
  });

  const { data: userBalance, isLoading: userBalanceLoading } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: vaultABI,
    functionName: "balanceOf",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!vaultAddress && !!userAddress,
    },
  });

  const { data: isPaused, isLoading: pausedLoading } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: vaultABI,
    functionName: "paused",
    query: {
      enabled: !!vaultAddress,
    },
  });

  // Write functions
  const { writeContract: deposit, data: depositData, isPending: depositLoading } = useWriteContract();

  const { writeContract: withdraw, data: withdrawData, isPending: withdrawLoading } = useWriteContract();

  const { writeContract: setAllowlist, isPending: setAllowlistLoading } = useWriteContract();

  const { writeContract: setDepositCap, isPending: setDepositCapLoading } = useWriteContract();

  const { writeContract: setMinDeposit, isPending: setMinDepositLoading } = useWriteContract();

  const { writeContract: pause, isPending: pauseLoading } = useWriteContract();

  const { writeContract: unpause, isPending: unpauseLoading } = useWriteContract();

  const { writeContract: setStrategyWrite } = useWriteContract();
  const { writeContract: investWrite } = useWriteContract();
  const { writeContract: divestWrite } = useWriteContract();
  const { writeContract: harvestWrite } = useWriteContract();

  // Wait for transactions
  const { isLoading: depositTxLoading, isSuccess: depositSuccess } = useTransaction({
    hash: depositData,
  });

  const { isLoading: withdrawTxLoading, isSuccess: withdrawSuccess } = useTransaction({
    hash: withdrawData,
  });

  // Combine vault data
  useEffect(() => {
    if (vaultAddress && name && symbol && asset && totalAssets !== undefined && totalSupply !== undefined) {
      setVaultData({
        address: vaultAddress,
        name: name as string,
        symbol: symbol as string,
        asset: asset as string,
        totalAssets: totalAssets as bigint,
        totalSupply: totalSupply as bigint,
        depositCap: depositCap as bigint || 0n,
        minDeposit: minDeposit as bigint || 0n,
        allowlistEnabled: allowlistEnabled as boolean || false,
        isAllowed: isAllowed as boolean || false,
        userBalance: userBalance as bigint || 0n,
        userShares: userBalance as bigint || 0n, // balanceOf returns shares
        isPaused: isPaused as boolean || false,
        strategy: (strategyAddr as string) || undefined,
      });
    }
  }, [
    vaultAddress,
    name,
    symbol,
    asset,
    totalAssets,
    totalSupply,
    depositCap,
    minDeposit,
    allowlistEnabled,
    isAllowed,
    userBalance,
    isPaused,
    strategyAddr,
  ]);

  // Action functions
  const handleDeposit = useCallback(
    (amount: string, receiver?: string) => {
      if (!vaultAddress || !amount) return;
      
      try {
        const amountWei = parseUnits(amount, 6); // USDC has 6 decimals
        deposit({
          address: vaultAddress as `0x${string}`,
          abi: vaultABI,
          functionName: "deposit",
          args: [amountWei, receiver || userAddress || "0x0000000000000000000000000000000000000000"],
        });
      } catch (err) {
        setError("Deposit failed");
        console.error("Deposit error:", err);
      }
    },
    [vaultAddress, deposit, userAddress, vaultABI]
  );

  const handleWithdraw = useCallback(
    (shares: string, receiver?: string) => {
      if (!vaultAddress || !shares) return;
      
      try {
        const sharesWei = parseUnits(shares, 18); // ERC20 shares have 18 decimals
        withdraw({
          address: vaultAddress as `0x${string}`,
          abi: vaultABI,
          functionName: "withdraw",
          args: [sharesWei, receiver || userAddress || "0x0000000000000000000000000000000000000000", userAddress || "0x0000000000000000000000000000000000000000"],
        });
      } catch (err) {
        setError("Withdraw failed");
        console.error("Withdraw error:", err);
      }
    },
    [vaultAddress, withdraw, userAddress, vaultABI]
  );

  const handleSetAllowlist = useCallback(
    (user: string, allowed: boolean) => {
      if (!vaultAddress) return;
      
      try {
        setAllowlist({
          address: vaultAddress as `0x${string}`,
          abi: vaultABI,
          functionName: "setAllowlist",
          args: [user, allowed],
        });
      } catch (err) {
        setError("Set allowlist failed");
        console.error("Set allowlist error:", err);
      }
    },
    [vaultAddress, setAllowlist, vaultABI]
  );

  const handleSetDepositCap = useCallback(
    (cap: string) => {
      if (!vaultAddress || !cap) return;
      
      try {
        const capWei = parseUnits(cap, 6); // USDC has 6 decimals
        setDepositCap({
          address: vaultAddress as `0x${string}`,
          abi: vaultABI,
          functionName: "setDepositCap",
          args: [capWei],
        });
      } catch (err) {
        setError("Set deposit cap failed");
        console.error("Set deposit cap error:", err);
      }
    },
    [vaultAddress, setDepositCap, vaultABI]
  );

  const handleSetMinDeposit = useCallback(
    (min: string) => {
      if (!vaultAddress || !min) return;
      
      try {
        const minWei = parseUnits(min, 6); // USDC has 6 decimals
        setMinDeposit({
          address: vaultAddress as `0x${string}`,
          abi: vaultABI,
          functionName: "setMinDeposit",
          args: [minWei],
        });
      } catch (err) {
        setError("Set min deposit failed");
        console.error("Set min deposit error:", err);
      }
    },
    [vaultAddress, setMinDeposit, vaultABI]
  );

  const handlePause = useCallback(() => {
    if (!vaultAddress) return;
    
    try {
      pause({
        address: vaultAddress as `0x${string}`,
        abi: vaultABI,
        functionName: "pause",
      });
    } catch (err) {
      setError("Pause failed");
      console.error("Pause error:", err);
    }
  }, [vaultAddress, pause, vaultABI]);

  const handleUnpause = useCallback(() => {
    if (!vaultAddress) return;
    
    try {
      unpause({
        address: vaultAddress as `0x${string}`,
        abi: vaultABI,
        functionName: "unpause",
      });
    } catch (err) {
      setError("Unpause failed");
      console.error("Unpause error:", err);
    }
  }, [vaultAddress, unpause, vaultABI]);

  const handleSetStrategy = useCallback((addr: string) => {
    if (!vaultAddress || !addr) return;
    try {
      setStrategyWrite({
        address: vaultAddress as `0x${string}`,
        abi: vaultABI,
        functionName: "setStrategy" as any,
        args: [addr],
      });
    } catch (err) {
      setError("Set strategy failed");
      console.error("Set strategy error:", err);
    }
  }, [vaultAddress, setStrategyWrite, vaultABI]);

  const handleInvest = useCallback((assets: string) => {
    if (!vaultAddress || !assets) return;
    try {
      const amt = parseUnits(assets, 6);
      investWrite({
        address: vaultAddress as `0x${string}`,
        abi: vaultABI,
        functionName: "invest" as any,
        args: [amt],
      });
    } catch (err) {
      setError("Invest failed");
      console.error("Invest error:", err);
    }
  }, [vaultAddress, investWrite, vaultABI]);

  const handleDivest = useCallback((assets: string) => {
    if (!vaultAddress || !assets) return;
    try {
      const amt = parseUnits(assets, 6);
      divestWrite({
        address: vaultAddress as `0x${string}`,
        abi: vaultABI,
        functionName: "divest" as any,
        args: [amt],
      });
    } catch (err) {
      setError("Divest failed");
      console.error("Divest error:", err);
    }
  }, [vaultAddress, divestWrite, vaultABI]);

  const handleHarvest = useCallback((yieldAssets: string) => {
    if (!vaultAddress || !yieldAssets) return;
    try {
      const amt = parseUnits(yieldAssets, 6);
      harvestWrite({
        address: vaultAddress as `0x${string}`,
        abi: vaultABI,
        functionName: "harvest" as any,
        args: [amt],
      });
    } catch (err) {
      setError("Harvest failed");
      console.error("Harvest error:", err);
    }
  }, [vaultAddress, harvestWrite, vaultABI]);

  // Loading states
  const isLoading =
    nameLoading ||
    symbolLoading ||
    assetLoading ||
    totalAssetsLoading ||
    totalSupplyLoading ||
    depositCapLoading ||
    minDepositLoading ||
    allowlistLoading ||
    isAllowedLoading ||
    userBalanceLoading ||
    pausedLoading ||
    depositLoading ||
    withdrawLoading ||
    depositTxLoading ||
    withdrawTxLoading;

  return {
    vaultData,
    loading: isLoading,
    error,
    setError,
    
    // Actions
    deposit: handleDeposit,
    withdraw: handleWithdraw,
    setAllowlist: handleSetAllowlist,
    setDepositCap: handleSetDepositCap,
    setMinDeposit: handleSetMinDeposit,
    pause: handlePause,
    unpause: handleUnpause,
    setStrategy: handleSetStrategy,
    invest: handleInvest,
    divest: handleDivest,
    harvest: handleHarvest,
    
    // Transaction states
    depositLoading: depositLoading || depositTxLoading,
    withdrawLoading: withdrawLoading || withdrawTxLoading,
    setAllowlistLoading,
    setDepositCapLoading,
    setMinDepositLoading,
    pauseLoading,
    unpauseLoading,
    
    // Success states
    depositSuccess,
    withdrawSuccess,
  };
};
