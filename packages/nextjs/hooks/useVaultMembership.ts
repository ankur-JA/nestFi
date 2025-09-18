"use client";

import { useState, useCallback, useEffect } from "react";
import { useAccount } from "wagmi";

export interface VaultMembership {
  vaultAddress: string;
  vaultName: string;
  vaultSymbol: string;
  role: "admin" | "member";
  userBalance: string;
  totalAssets: string;
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

export const useVaultMembership = () => {
  const { address: userAddress, isConnected } = useAccount();
  const [state, setState] = useState<VaultMembershipState>({
    memberships: [],
    loading: false,
    error: null,
    isConnected: false,
    userAddress: undefined,
  });

  // Check membership for a specific vault
  const checkVaultMembership = useCallback(async (vaultAddress: string): Promise<VaultMembership | null> => {
    if (!userAddress || !vaultAddress) return null;

    try {
      const response = await fetch(
        `/api/vault/check-membership?vaultAddress=${vaultAddress}&userAddress=${userAddress}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.isMember) {
        return null;
      }

      return {
        vaultAddress: data.vaultAddress,
        vaultName: data.vaultName,
        vaultSymbol: data.vaultSymbol,
        role: data.isOwner ? "admin" : "member",
        userBalance: data.userBalance,
        totalAssets: data.totalAssets,
        totalSupply: data.totalSupply,
        isPaused: data.isPaused,
        allowlistEnabled: data.allowlistEnabled,
        isOnAllowlist: data.isOnAllowlist,
      };
    } catch (error) {
      console.error("Error checking vault membership:", error);
      throw error;
    }
  }, [userAddress]);

  // Discover all vaults where the user is a member
  const discoverAllMemberships = useCallback(async (): Promise<VaultMembership[]> => {
    if (!userAddress) return [];

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Try the comprehensive user memberships API first
      let response = await fetch(`/api/vault/user-memberships?userAddress=${userAddress}`);
      
      // If the comprehensive API fails, fall back to the simple API
      if (!response.ok) {
        console.log("Comprehensive API failed, trying simple API...");
        response = await fetch(`/api/vault/simple-memberships?userAddress=${userAddress}`);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const memberships = data.memberships || [];

      console.log(`Found ${memberships.length} vault memberships for user ${userAddress}`);
      console.log("Summary:", data.summary);

      setState(prev => ({
        ...prev,
        memberships,
        loading: false,
        error: null,
      }));

      return memberships;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to discover vault memberships";
      console.error("Error discovering vault memberships:", error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      throw error;
    }
  }, [userAddress]);

  // Refresh memberships
  const refreshMemberships = useCallback(async () => {
    if (!isConnected || !userAddress) {
      setState({
        memberships: [],
        loading: false,
        error: null,
        isConnected: false,
        userAddress: undefined,
      });
      return;
    }

    try {
      await discoverAllMemberships();
    } catch (error) {
      // Error is already handled in discoverAllMemberships
    }
  }, [isConnected, userAddress, discoverAllMemberships]);

  // Auto-discover memberships when wallet connects
  useEffect(() => {
    if (isConnected && userAddress) {
      setState(prev => ({
        ...prev,
        isConnected: true,
        userAddress,
      }));
      
      // Small delay to ensure wallet is fully connected
      const timer = setTimeout(() => {
        refreshMemberships();
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setState({
        memberships: [],
        loading: false,
        error: null,
        isConnected: false,
        userAddress: undefined,
      });
    }
  }, [isConnected, userAddress, refreshMemberships]);

  // Get admin vaults
  const adminVaults = state.memberships.filter(membership => membership.role === "admin");

  // Get member vaults (non-admin)
  const memberVaults = state.memberships.filter(membership => membership.role === "member");

  // Get total value locked across all vaults
  const totalValueLocked = state.memberships.reduce((total, membership) => {
    const assets = BigInt(membership.totalAssets || "0");
    return total + Number(assets) / 1e6; // Convert from USDC units (6 decimals)
  }, 0);

  return {
    ...state,
    adminVaults,
    memberVaults,
    totalValueLocked,
    checkVaultMembership,
    discoverAllMemberships,
    refreshMemberships,
  };
};
