"use client";

import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import {
  BanknotesIcon,
  UsersIcon,
  ChartBarIcon,
  StarIcon,
  UserIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import VaultCard from "./_components/VaultCard";
import { VaultExplorer } from "./_components/VaultExplorer";
import { VaultMembershipStatus } from "./_components/VaultMembershipStatus";
import { useVaultFactory } from "../../hooks/useVaultFactory";

interface DashboardStats {
  totalVaults: number;
  totalValueLocked: string;
  totalMembers: number;
  averageAPY: string;
}

const DashboardPage: React.FC = () => {
  const { address: userAddress, isConnected } = useAccount();
  const { userVaults, loading, error, refreshVaults, checkSpecificVault } = useVaultFactory();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalVaults: 0,
    totalValueLocked: "0",
    totalMembers: 0,
    averageAPY: "0",
  });

  // Calculate dashboard stats from user vaults
  useEffect(() => {
    if (userVaults) {
      const totalVaults = userVaults.length;
      const adminVaults = userVaults.filter(vault => vault.isAdmin).length;
      const memberVaults = userVaults.filter(vault => vault.isMember && !vault.isAdmin).length;
      
      // Calculate total value locked from vault balances
      const totalValueLocked = userVaults.reduce((sum, vault) => {
        const assets = BigInt(vault.totalAssets || "0");
        return sum + Number(assets) / 1e6; // Convert from USDC units (6 decimals)
      }, 0);
      
      // For now, set totalMembers to the number of member vaults (could be enhanced later)
      const totalMembers = memberVaults;
      
      setDashboardStats({
        totalVaults,
        totalValueLocked: totalValueLocked.toFixed(2),
        totalMembers,
        averageAPY: "0", // Would calculate from vault yields
      });
    }
  }, [userVaults]);

  return (
    <div className="flex flex-col items-center flex-grow pt-10 px-4 md:px-8 bg-black text-white">
      {/* Not connected state */}
      {!isConnected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-20"
        >
          <BanknotesIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-300 mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400">
            Connect your wallet to view your vaults and manage your investments
          </p>
        </motion.div>
      )}

      {/* Loading state */}
      {isConnected && loading && (
        <div className="min-h-[40vh] w-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300 text-lg">Loading your vaults...</p>
          </div>
        </div>
      )}

      {/* Main content */}
      {isConnected && !loading && (
        <>

          {/* Main Dashboard Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-7xl mb-8"
          >
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
                Your Vault Dashboard
              </h1>
              <p className="text-gray-400">
                Overview of all vaults where you have admin or member access
              </p>
            </div>
            <VaultMembershipStatus />
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
                {userVaults.filter(vault => !vault.isAdmin && vault.isMember).length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center space-x-2 mb-4">
                      <UserIcon className="h-6 w-6 text-blue-400" />
                      <h2 className="text-xl font-semibold text-white">Vaults You&apos;ve Joined</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {userVaults
                        .filter(vault => !vault.isAdmin && vault.isMember)
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

                {/* Explore Other Vaults - Temporarily disabled to prevent blockchain errors */}
                {false && isConnected && userAddress && (
                  <div className="mb-8">
                    <VaultExplorer onVaultFound={(address) => {
                      console.log("Found vault:", address);
                      // The vault will be automatically added to the user's vault list
                      // No need to reload the page
                    }} />
                  </div>
                )}
              </div>
            ) : null}
          </motion.div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
