"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { graphqlClient } from "../lib/graphql";

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

export const useVaultFactoryGraph = () => {
  const { address: userAddress } = useAccount();
  const [userVaults, setUserVaults] = useState<VaultInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all user vaults (admin + member)
  const fetchUserVaults = useCallback(async () => {
    if (!userAddress) {
      setUserVaults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch vaults where user is admin (owner)
      const adminVaults = await graphqlClient.getUserVaults(userAddress);
      
      // Fetch vaults where user is a member (has shares or is on allowlist)
      const memberVaults = await graphqlClient.getUserMemberships(userAddress);
      const allowlistVaults = await graphqlClient.getUserAllowlistMemberships(userAddress);

      // Combine all vaults
      const allVaults: VaultInfo[] = [];

      // Add admin vaults
      adminVaults.forEach((vault: any) => {
        allVaults.push({
          address: vault.address,
          owner: vault.owner,
          asset: vault.asset,
          name: vault.name || "Investment Vault",
          symbol: vault.symbol || "INV",
          allowlistEnabled: vault.allowlistEnabled,
          depositCap: vault.depositCap,
          minDeposit: vault.minDeposit,
          totalAssets: vault.totalAssets,
          totalSupply: vault.totalSupply,
          userBalance: "0", // Admin doesn't need balance for admin vaults
          userShares: "0",
          isPaused: vault.isPaused,
          isAdmin: true,
          isMember: true, // Admin is always a member
        });
      });

      // Add member vaults (with shares)
      memberVaults.forEach((membership: any) => {
        const vault = membership.vault;
        allVaults.push({
          address: vault.address,
          owner: vault.owner,
          asset: vault.asset,
          name: vault.name || "Investment Vault",
          symbol: vault.symbol || "INV",
          allowlistEnabled: vault.allowlistEnabled,
          depositCap: vault.depositCap,
          minDeposit: vault.minDeposit,
          totalAssets: vault.totalAssets,
          totalSupply: vault.totalSupply,
          userBalance: membership.balance,
          userShares: membership.shares,
          isPaused: vault.isPaused,
          isAdmin: vault.owner.toLowerCase() === userAddress.toLowerCase(),
          isMember: true,
        });
      });

      // Add allowlist-only vaults (no shares yet)
      allowlistVaults.forEach((membership: any) => {
        const vault = membership.vault;
        
        // Check if this vault is already in the list (avoid duplicates)
        const exists = allVaults.some(v => v.address.toLowerCase() === vault.address.toLowerCase());
        if (!exists && membership.isAllowed) {
          allVaults.push({
            address: vault.address,
            owner: vault.owner,
            asset: vault.asset,
            name: vault.name || "Investment Vault",
            symbol: vault.symbol || "INV",
            allowlistEnabled: vault.allowlistEnabled,
            depositCap: vault.depositCap,
            minDeposit: vault.minDeposit,
            totalAssets: vault.totalAssets,
            totalSupply: vault.totalSupply,
            userBalance: "0",
            userShares: "0",
            isPaused: vault.isPaused,
            isAdmin: vault.owner.toLowerCase() === userAddress.toLowerCase(),
            isMember: membership.isAllowed,
          });
        }
      });

      // Remove duplicates based on vault address
      const uniqueVaults = allVaults.filter((vault, index, self) => 
        index === self.findIndex(v => v.address.toLowerCase() === vault.address.toLowerCase())
      );

      setUserVaults(uniqueVaults);
    } catch (err: any) {
      console.error("Error fetching user vaults:", err);
      setError(err.message || "Failed to fetch vaults");
    } finally {
      setLoading(false);
    }
  }, [userAddress]);

  // Fetch vault details for a specific vault
  const fetchVaultDetails = useCallback(async (vaultAddress: string): Promise<VaultInfo | null> => {
    if (!userAddress) return null;

    try {
      const vault = await graphqlClient.getVaultDetails(vaultAddress);
      if (!vault) return null;

      // Get user membership
      const membership = await graphqlClient.getUserVaultMembership(vaultAddress, userAddress);

      return {
        address: vault.address,
        owner: vault.owner,
        asset: vault.asset,
        name: vault.name || "Investment Vault",
        symbol: vault.symbol || "INV",
        allowlistEnabled: vault.allowlistEnabled,
        depositCap: vault.depositCap,
        minDeposit: vault.minDeposit,
        totalAssets: vault.totalAssets,
        totalSupply: vault.totalSupply,
        userBalance: membership?.balance || "0",
        userShares: membership?.shares || "0",
        isPaused: vault.isPaused,
        isAdmin: vault.owner.toLowerCase() === userAddress.toLowerCase(),
        isMember: membership?.isAllowed || false,
      };
    } catch (err: any) {
      console.error("Error fetching vault details:", err);
      return null;
    }
  }, [userAddress]);

  // Refresh vaults
  const refetchVaults = useCallback(() => {
    fetchUserVaults();
  }, [fetchUserVaults]);

  // Load vaults when user connects
  useEffect(() => {
    if (userAddress) {
      fetchUserVaults();
    } else {
      setUserVaults([]);
      setLoading(false);
    }
  }, [userAddress, fetchUserVaults]);

  return {
    userVaults,
    loading,
    error,
    refetchVaults,
    fetchVaultDetails,
  };
};
