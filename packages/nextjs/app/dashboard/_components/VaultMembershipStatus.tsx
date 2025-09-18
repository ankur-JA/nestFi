"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  BanknotesIcon,
  UsersIcon,
  StarIcon,
  UserIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useVaultMembership, VaultMembership } from "../../../hooks/useVaultMembership";

interface VaultMembershipStatusProps {
  className?: string;
}

const VaultMembershipCard: React.FC<{ membership: VaultMembership }> = ({ membership }) => {
  const formatBalance = (balance: string) => {
    const num = Number(balance) / 1e6; // Convert from USDC units
    return num > 0 ? `$${num.toFixed(2)}` : "$0.00";
  };

  const formatTotalAssets = (assets: string) => {
    const num = Number(assets) / 1e6; // Convert from USDC units
    return num > 0 ? `$${num.toFixed(2)}` : "$0.00";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-xl p-6 border border-gray-600/30 hover:border-gray-500/50 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-white truncate">
              {membership.vaultName}
            </h3>
            <span className="text-sm text-gray-400">
              ({membership.vaultSymbol})
            </span>
          </div>
          <p className="text-sm text-gray-400 font-mono break-all">
            {membership.vaultAddress}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {membership.role === "admin" ? (
            <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
              <StarIcon className="h-4 w-4 text-yellow-400" />
              <span className="text-xs font-medium text-yellow-400">Admin</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <UserIcon className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-medium text-blue-400">Member</span>
            </div>
          )}
          {membership.isPaused && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-red-500/20 border border-red-500/30 rounded-lg">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-400" />
              <span className="text-xs font-medium text-red-400">Paused</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-400">Your Balance</p>
          <p className="text-white font-semibold">{formatBalance(membership.userBalance)}</p>
        </div>
        <div>
          <p className="text-gray-400">Total Assets</p>
          <p className="text-white font-semibold">{formatTotalAssets(membership.totalAssets)}</p>
        </div>
      </div>

      {membership.allowlistEnabled && (
        <div className="mt-3 pt-3 border-t border-gray-600/30">
          <div className="flex items-center space-x-2">
            {membership.isOnAllowlist ? (
              <CheckCircleIcon className="h-4 w-4 text-green-400" />
            ) : (
              <XCircleIcon className="h-4 w-4 text-red-400" />
            )}
            <span className="text-xs text-gray-400">
              Allowlist: {membership.isOnAllowlist ? "Approved" : "Not Approved"}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export const VaultMembershipStatus: React.FC<VaultMembershipStatusProps> = ({ className = "" }) => {
  const {
    memberships,
    adminVaults,
    memberVaults,
    totalValueLocked,
    loading,
    error,
    isConnected,
    userAddress,
    refreshMemberships,
  } = useVaultMembership();

  if (!isConnected) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <BanknotesIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-300 mb-2">Connect Your Wallet</h3>
        <p className="text-gray-400">
          Connect your wallet to view your vault memberships and roles
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-300 text-lg">Loading your vault memberships...</p>
        <p className="text-gray-400 text-sm mt-2">
          Checking {userAddress} across all vaults
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <ExclamationTriangleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-red-400 mb-2">Error Loading Memberships</h3>
        <p className="text-gray-400 mb-4">{error}</p>
        <button
          onClick={refreshMemberships}
          className="inline-flex items-center px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 font-semibold rounded-lg hover:bg-red-500/30 transition-all duration-200"
        >
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Try Again
        </button>
      </div>
    );
  }

  if (memberships.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <UsersIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-300 mb-2">No Vault Memberships Found</h3>
        <p className="text-gray-400 mb-6">
          You're not a member of any vault yet. Create your first vault or join existing ones.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/createvault"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200"
          >
            <BanknotesIcon className="h-5 w-5 mr-2" />
            Create New Vault
          </a>
          <button className="inline-flex items-center px-6 py-3 border border-gray-600 text-gray-300 font-semibold rounded-lg hover:border-gray-500 hover:text-white transition-all duration-200">
            <UsersIcon className="h-5 w-5 mr-2" />
            Browse Vaults
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Vaults</p>
              <p className="text-2xl font-bold text-white">{memberships.length}</p>
            </div>
            <BanknotesIcon className="h-8 w-8 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Admin Vaults</p>
              <p className="text-2xl font-bold text-white">{adminVaults.length}</p>
            </div>
            <StarIcon className="h-8 w-8 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Value Locked</p>
              <p className="text-2xl font-bold text-white">${totalValueLocked.toFixed(2)}</p>
            </div>
            <BanknotesIcon className="h-8 w-8 text-yellow-400" />
          </div>
        </motion.div>
      </div>

      {/* Admin Vaults */}
      {adminVaults.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-6">
            <StarIcon className="h-6 w-6 text-yellow-400" />
            <h2 className="text-xl font-semibold text-white">Your Admin Vaults</h2>
            <span className="text-sm text-gray-400">({adminVaults.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminVaults.map((membership) => (
              <VaultMembershipCard key={membership.vaultAddress} membership={membership} />
            ))}
          </div>
        </div>
      )}

      {/* Member Vaults */}
      {memberVaults.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-6">
            <UserIcon className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Vaults You've Joined</h2>
            <span className="text-sm text-gray-400">({memberVaults.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memberVaults.map((membership) => (
              <VaultMembershipCard key={membership.vaultAddress} membership={membership} />
            ))}
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={refreshMemberships}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/50 rounded-lg text-gray-300 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Memberships
        </button>
      </div>
    </div>
  );
};
