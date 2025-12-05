"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAccount } from "wagmi";
import { 
  PlusCircleIcon, 
  CurrencyDollarIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  EllipsisHorizontalIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import { useVaultFactory } from "~~/hooks/useVaultFactory";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

export default function ManageVaultsPage() {
  const { address, isConnected } = useAccount();
  const { userVaults: allVaults, loading: isLoading, refreshVaults } = useVaultFactory();

  // Filter vaults owned by this user (admin vaults)
  const myVaults = allVaults?.filter(v => v.isAdmin && v.owner?.toLowerCase() === address?.toLowerCase()) || [];

  // Not connected state
  if (!isConnected) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#12121a] border border-gray-800/50 rounded-2xl p-12 text-center max-w-md"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <UserGroupIcon className="h-8 w-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Connect Wallet</h2>
          <p className="text-gray-400 mb-8">
            Connect your wallet to view and manage your vaults.
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
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Manage Vaults</h1>
            <p className="text-gray-400">
              View and manage all your created vaults.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => refreshVaults()}
              disabled={isLoading}
              className="py-3 px-5 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white font-medium rounded-xl flex items-center gap-2 transition-colors"
            >
              <ArrowPathIcon className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </motion.button>
            <Link href="/curator">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="py-3 px-5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl flex items-center gap-2 transition-colors"
              >
                <PlusCircleIcon className="h-5 w-5" />
                Create Vault
              </motion.button>
            </Link>
          </div>
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
              <span className="text-gray-400 text-sm">Total AUM</span>
            </div>
            <div className="text-2xl font-bold text-white">
              ${myVaults.reduce((sum, v) => sum + parseFloat(v.totalAssets || "0"), 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <UserGroupIcon className="h-5 w-5 text-emerald-400" />
              </div>
              <span className="text-gray-400 text-sm">Total Investors</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {myVaults.length > 0 ? "—" : 0}
            </div>
          </div>
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <ArrowTrendingUpIcon className="h-5 w-5 text-purple-400" />
              </div>
              <span className="text-gray-400 text-sm">Active Vaults</span>
            </div>
            <div className="text-2xl font-bold text-white">{myVaults.length}</div>
          </div>
        </motion.div>

        {/* Vaults List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-[#12121a] border border-gray-800/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : myVaults.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {myVaults.map((vault, index) => (
              <motion.div
                key={vault.address}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -2 }}
                className="bg-[#12121a] border border-gray-800/50 hover:border-gray-700 rounded-xl p-5 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">
                      {vault.name || "Unnamed Vault"}
                    </h3>
                    <span className="text-sm text-gray-500">{vault.symbol || "---"}</span>
                  </div>
                  <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                    <EllipsisHorizontalIcon className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Total Assets</span>
                    <span className="text-white font-medium">
                      ${parseFloat(vault.totalAssets || "0").toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Deposit Cap</span>
                    <span className="text-white font-medium">
                      ${parseFloat(vault.depositCap || "0").toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Status</span>
                    <span className={`font-medium ${vault.isPaused ? "text-yellow-400" : "text-emerald-400"}`}>
                      {vault.isPaused ? "Paused" : "Active"}
                    </span>
                  </div>
                </div>

                <Link href={`/curator/vault/${vault.address}`} className="block mt-4">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-sm font-medium rounded-lg transition-colors"
                  >
                    Manage Vault
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
              <PlusCircleIcon className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No vaults yet</h3>
            <p className="text-gray-400 mb-6">
              Create your first vault to start managing investments.
            </p>
            <Link href="/curator">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="py-3 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl inline-flex items-center gap-2 transition-colors"
              >
                <PlusCircleIcon className="h-5 w-5" />
                Create Your First Vault
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}

