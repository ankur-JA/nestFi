"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";

interface MockVault {
  address: string;
  name: string;
  symbol: string;
  asset: string;
  totalAssets: string;
  totalSupply: string;
  depositCap: string;
  minDeposit: string;
  allowlistEnabled: boolean;
  isAllowed: boolean;
  userBalance: string;
  userShares: string;
  isPaused: boolean;
}

export const useMockVaultData = (vaultAddress?: string) => {
  const [vaultData, setVaultData] = useState<MockVault | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createVault = useCallback(() => {
    // Mock vault creation
    console.log("Creating mock vault");
    return Promise.resolve();
  }, []);

  const fetchVaultData = useCallback(async () => {
    if (!vaultAddress) {
      setVaultData(null);
      return;
    }

    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setVaultData({
        address: vaultAddress || "0x0000000000000000000000000000000000000000",
        name: "Mock Vault",
        symbol: "MV",
        totalAssets: "1000000",
        totalSupply: "1000000",
        userBalance: "100000",
        userShares: "100000",
        asset: "0x9d4454B023096f34B160D6B654540c56A1F81688",
        allowlistEnabled: false,
        depositCap: "10000000",
        minDeposit: "100000",
        isAllowed: true,
        isPaused: false,
      });
    } catch (err) {
      setError("Failed to fetch vault data");
      console.error("Fetch vault data error:", err);
    } finally {
      setLoading(false);
    }
  }, [vaultAddress]);

  useEffect(() => {
    fetchVaultData();
  }, [fetchVaultData]);

  return {
    vaultData,
    loading,
    error,
    createVault,
  };
};

export const useMockVaultFactory = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createVault = async (params: any) => {
    setLoading(true);
    setError(null);
    
    // Simulate vault creation
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      
      // Reset success after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }, 2000);
  };

  return {
    createVault,
    loading,
    success,
    error,
    setError,
  };
};
