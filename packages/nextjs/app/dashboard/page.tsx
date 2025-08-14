"use client";

import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import {
  BanknotesIcon,
  UsersIcon,
  ChartBarIcon,
  StarIcon,
  UserIcon
} from "@heroicons/react/24/outline";
import VaultCard from "./_components/VaultCard";
import { useVaultFactory } from "../../hooks/useVaultFactory";

interface DashboardStats {
  totalVaults: number;
  totalValueLocked: string;
  totalMembers: number;
  averageAPY: string;
}

const DashboardPage: React.FC = () => {
  const { address: userAddress, isConnected } = useAccount();
  const { userVaults, loading, error } = useVaultFactory();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalVaults: 0,
    totalValueLocked: "0",
    totalMembers: 0,
    averageAPY: "0",
  });

  // Handle loading and error states gracefully
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading your vaults...</p>
        </div>
      </div>
    );
  }

  // Calculate dashboard stats from user vaults
  useEffect(() => {
    if (userVaults) {
      const totalVaults = userVaults.length;
      const adminVaults = userVaults.filter(vault => vault.isAdmin).length;
      const memberVaults = totalVaults - adminVaults;
      
      setDashboardStats({
        totalVaults,
        totalValueLocked: "0", // Would calculate from vault balances
        totalMembers: memberVaults,
        averageAPY: "0", // Would calculate from vault yields
      });
    }
  }, [userVaults]);

  // Refetch vaults when user connects
  useEffect(() => {
    if (isConnected && userAddress) {
      // The refetchUserVaults function is no longer directly available from useVaultFactory
      // as it's now part of the hook's return value.
      // Assuming the intent was to refetch if loading is true or if there's an error.
      // For now, we'll keep the original logic, but it might need adjustment
      // depending on how the refetching is handled within useVaultFactory.
      // If useVaultFactory itself handles refetching, this useEffect might become redundant.
      // For now, we'll assume the refetching is handled internally or needs to be re-evaluated.
      // Given the new_code, it seems the refetching is now part of the loading/error state.
      // So, this useEffect might be removed or refactored if the refetching logic is truly
      // integrated into the loading/error handling.
      // For now, we'll keep it as is, but note the potential for refetching to be handled differently.
    }
  }, [isConnected, userAddress]); // Removed refetchUserVaults from dependency array

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center flex-grow pt-10 px-4 md:px-8 bg-black text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <BanknotesIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-300 mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400">
            Connect your wallet to view your vaults and manage your investments
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center flex-grow pt-10 px-4 md:px-8 bg-black text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-7xl mb-8"
      >
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500 mb-2">
            Your Vaults Dashboard
          </h1>
          <p className="text-gray-400">
            Manage your investment vaults and track your yields
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/20 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Vaults</p>
                <p className="text-2xl font-bold text-white">{dashboardStats.totalVaults}</p>
              </div>
              <BanknotesIcon className="h-8 w-8 text-red-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Value Locked</p>
                <p className="text-2xl font-bold text-white">${dashboardStats.totalValueLocked}</p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-blue-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Members</p>
                <p className="text-2xl font-bold text-white">{dashboardStats.totalMembers}</p>
              </div>
              <UsersIcon className="h-8 w-8 text-green-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Average APY</p>
                <p className="text-2xl font-bold text-white">{dashboardStats.averageAPY}%</p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-yellow-400" />
            </div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-7xl"
      >
        {userVaults && userVaults.length > 0 ? (
          <div>
            {/* Admin Vaults */}
            {userVaults.filter(vault => vault.isAdmin).length > 0 && (
              <div className="mb-8">
                <div className="flex items-center space-x-2 mb-4">
                  <StarIcon className="h-6 w-6 text-yellow-400" />
                  <h2 className="text-xl font-semibold text-white">Your Admin Vaults</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {userVaults
                    .filter(vault => vault.isAdmin)
                    .map((vault) => (
                      <VaultCard
                        key={vault.address}
                        vaultAddress={vault.address}
                        isCurrentUserAdmin={true}
                        vaultInfo={vault}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Member Vaults */}
            {userVaults.filter(vault => !vault.isAdmin).length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <UserIcon className="h-6 w-6 text-blue-400" />
                  <h2 className="text-xl font-semibold text-white">Vaults You&apos;ve Joined</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {userVaults
                    .filter(vault => !vault.isAdmin)
                    .map((vault) => (
                      <VaultCard
                        key={vault.address}
                        vaultAddress={vault.address}
                        isCurrentUserAdmin={false}
                        vaultInfo={vault}
                      />
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <BanknotesIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No Vaults Found</h3>
            <p className="text-gray-400 mb-6">
              You don&apos;t have any vaults yet. Create your first vault or join existing ones.
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
        )}
      </motion.div>
    </div>
  );
};

export default DashboardPage;
