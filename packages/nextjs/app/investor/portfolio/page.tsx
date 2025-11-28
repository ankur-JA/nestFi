"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAccount } from "wagmi";
import { 
  WalletIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";
import { useVaultMembership } from "~~/hooks/useVaultMembership";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

export default function InvestorPortfolioPage() {
  const { address, isConnected } = useAccount();
  const { memberships: membershipData, loading: isLoading } = useVaultMembership();

  // Calculate portfolio stats
  const totalValue = membershipData?.reduce((sum, m) => sum + parseFloat(m.userBalance || "0") / 1e6, 0) || 0;
  const totalEarnings = 0; // Earnings tracking not available yet
  const activeVaults = membershipData?.length || 0;

  // Not connected state
  if (!isConnected) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#12121a] border border-gray-800/50 rounded-2xl p-12 text-center max-w-md"
        >
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-6">
            <WalletIcon className="h-8 w-8 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Connect Wallet</h2>
          <p className="text-gray-400 mb-8">
            Connect your wallet to view your portfolio.
          </p>
          <RainbowKitCustomConnectButton />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">My Vaults</h1>
          <p className="text-gray-400">
            Track your investments and portfolio performance.
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <CurrencyDollarIcon className="h-5 w-5 text-blue-400" />
              </div>
              <span className="text-gray-400 text-sm">Total Portfolio Value</span>
            </div>
            <div className="text-2xl font-bold text-white">
              ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-400" />
              </div>
              <span className="text-gray-400 text-sm">Total Earnings</span>
            </div>
            <div className="text-2xl font-bold text-emerald-400">
              +${totalEarnings.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <ChartBarIcon className="h-5 w-5 text-purple-400" />
              </div>
              <span className="text-gray-400 text-sm">Active Investments</span>
            </div>
            <div className="text-2xl font-bold text-white">{activeVaults}</div>
          </div>
        </motion.div>

        {/* Investments List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-[#12121a] border border-gray-800/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : membershipData && membershipData.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {membershipData.map((membership, index) => (
              <motion.div
                key={membership.vaultAddress}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -2 }}
                className="bg-[#12121a] border border-gray-800/50 hover:border-gray-700 rounded-xl p-5 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-400">
                        {membership.vaultSymbol?.slice(0, 2) || "V"}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {membership.vaultName || "Unnamed Vault"}
                      </h3>
                      <span className="text-sm text-gray-500">{membership.vaultSymbol || "—"}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Your Balance</span>
                    <span className="text-white font-medium">
                      ${(parseFloat(membership.userBalance || "0") / 1e6).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Total Assets</span>
                    <span className="text-white font-medium">
                      ${(parseFloat(membership.totalAssets || "0") / 1e6).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Status</span>
                    <span className={`font-medium ${membership.isPaused ? "text-yellow-400" : "text-emerald-400"}`}>
                      {membership.isPaused ? "Paused" : "Active"}
                    </span>
                  </div>
                </div>

                <Link href={`/vaults/${membership.vaultAddress}`} className="block mt-4">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-sm font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    View Details
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </motion.button>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#12121a] border border-gray-800/50 rounded-xl p-12 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-gray-800/50 flex items-center justify-center mx-auto mb-6">
              <WalletIcon className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No investments yet</h3>
            <p className="text-gray-400 mb-6">
              Start by discovering and investing in vaults.
            </p>
            <Link href="/investor">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl inline-flex items-center gap-2 transition-colors"
              >
                Discover Vaults
                <ArrowRightIcon className="h-4 w-4" />
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}

