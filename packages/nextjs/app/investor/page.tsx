"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAccount } from "wagmi";
import { 
  MagnifyingGlassIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";
import { useVaultFactoryGraph } from "~~/hooks/useVaultFactoryGraph";

export default function InvestorVaultsPage() {
  const { address, isConnected } = useAccount();
  const { userVaults: allVaults, loading: isLoading } = useVaultFactoryGraph();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter vaults by search
  const filteredVaults = allVaults?.filter(vault => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      vault.name?.toLowerCase().includes(term) ||
      vault.symbol?.toLowerCase().includes(term)
    );
  }) || [];

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Discover Vaults</h1>
          <p className="text-gray-400">
            Browse and invest in curated DeFi vaults.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative max-w-md">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search vault by symbol..."
              className="w-full pl-12 pr-4 py-3 bg-[#12121a] border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            />
          </div>
        </motion.div>

        {/* Vaults Table */}
        {isLoading ? (
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl overflow-hidden">
            <div className="animate-pulse">
              <div className="h-14 bg-gray-800/50" />
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-20 border-t border-gray-800/50 bg-gray-800/20" />
              ))}
            </div>
          </div>
        ) : filteredVaults.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#12121a] border border-gray-800/50 rounded-xl overflow-hidden"
          >
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-[#0f0f15] border-b border-gray-800/50 text-sm font-medium text-gray-500">
              <div className="col-span-4">Vault Name</div>
              <div className="col-span-2 text-center">Symbol</div>
              <div className="col-span-2 text-center">TVL</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-2 text-center">Action</div>
            </div>

            {/* Table Body */}
            {filteredVaults.map((vault, index) => (
              <motion.div
                key={vault.address}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="grid grid-cols-12 gap-4 px-6 py-5 border-b border-gray-800/30 last:border-b-0 hover:bg-white/[0.02] transition-colors items-center"
              >
                <div className="col-span-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-400">
                        {vault.symbol?.slice(0, 2) || "V"}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-white">{vault.name || "Unnamed Vault"}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[200px]">
                        {vault.address?.slice(0, 10)}...{vault.address?.slice(-8)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-span-2 text-center">
                  <span className="px-3 py-1 bg-gray-800/50 rounded-full text-sm font-medium text-gray-300">
                    {vault.symbol || "—"}
                  </span>
                </div>
                <div className="col-span-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <CurrencyDollarIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-white font-medium">
                      {parseFloat(vault.totalAssets || "0").toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="col-span-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500" />
                    <span className="text-emerald-400 font-medium">
                      {vault.isPaused ? "Paused" : "Active"}
                    </span>
                  </div>
                </div>
                <div className="col-span-2 text-center">
                  <Link href={`/vaults/${vault.address}`}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg inline-flex items-center gap-1.5 transition-colors"
                    >
                      Deposit
                      <ArrowRightIcon className="h-3.5 w-3.5" />
                    </motion.button>
                  </Link>
                </div>
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
              <MagnifyingGlassIcon className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm ? "No vaults found" : "No vaults available"}
            </h3>
            <p className="text-gray-400">
              {searchTerm 
                ? "Try a different search term." 
                : "Check back later for new investment opportunities."}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

