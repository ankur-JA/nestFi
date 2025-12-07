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
import { useTheme } from "~~/contexts/ThemeContext";

export default function ManageVaultsPage() {
  const { address, isConnected } = useAccount();
  const { userVaults: allVaults, loading: isLoading, refreshVaults } = useVaultFactory();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Filter vaults owned by this user (admin vaults)
  const myVaults = allVaults?.filter(v => v.isAdmin && v.owner?.toLowerCase() === address?.toLowerCase()) || [];

  // Not connected state
  if (!isConnected) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl p-12 text-center max-w-md transition-colors duration-300"
          style={{
            background: isDark ? '#12121a' : '#f8fafc',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
          }}
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <UserGroupIcon className="h-8 w-8 text-emerald-400" />
          </div>
          <h2 
            className="text-2xl font-bold mb-3 transition-colors duration-300"
            style={{ color: isDark ? '#ffffff' : '#0f172a' }}
          >
            Connect Wallet
          </h2>
          <p 
            className="mb-8 transition-colors duration-300"
            style={{ color: isDark ? '#9ca3af' : '#64748b' }}
          >
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
            <h1 
              className="text-3xl font-bold mb-2 transition-colors duration-300"
              style={{ color: isDark ? '#ffffff' : '#0f172a' }}
            >
              Manage Vaults
            </h1>
            <p 
              className="transition-colors duration-300"
              style={{ color: isDark ? '#9ca3af' : '#64748b' }}
            >
              View and manage all your created vaults.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => refreshVaults()}
              disabled={isLoading}
              className="py-3 px-5 disabled:opacity-50 text-white font-medium rounded-xl flex items-center gap-2 transition-colors"
              style={{
                background: isDark ? '#1f2937' : '#e5e7eb',
                color: isDark ? '#ffffff' : '#0f172a',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = isDark ? '#374151' : '#d1d5db';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDark ? '#1f2937' : '#e5e7eb';
              }}
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
          <div 
            className="rounded-xl p-5 transition-colors duration-300"
            style={{
              background: isDark ? '#12121a' : '#ffffff',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <CurrencyDollarIcon className="h-5 w-5 text-blue-400" />
              </div>
              <span 
                className="text-sm transition-colors duration-300"
                style={{ color: isDark ? '#9ca3af' : '#64748b' }}
              >
                Total AUM
              </span>
            </div>
            <div 
              className="text-2xl font-bold transition-colors duration-300"
              style={{ color: isDark ? '#ffffff' : '#0f172a' }}
            >
              ${myVaults.reduce((sum, v) => sum + parseFloat(v.totalAssets || "0"), 0).toLocaleString()}
            </div>
          </div>
          <div 
            className="rounded-xl p-5 transition-colors duration-300"
            style={{
              background: isDark ? '#12121a' : '#ffffff',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <UserGroupIcon className="h-5 w-5 text-emerald-400" />
              </div>
              <span 
                className="text-sm transition-colors duration-300"
                style={{ color: isDark ? '#9ca3af' : '#64748b' }}
              >
                Total Investors
              </span>
            </div>
            <div 
              className="text-2xl font-bold transition-colors duration-300"
              style={{ color: isDark ? '#ffffff' : '#0f172a' }}
            >
              {myVaults.length > 0 ? "—" : 0}
            </div>
          </div>
          <div 
            className="rounded-xl p-5 transition-colors duration-300"
            style={{
              background: isDark ? '#12121a' : '#ffffff',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <ArrowTrendingUpIcon className="h-5 w-5 text-purple-400" />
              </div>
              <span 
                className="text-sm transition-colors duration-300"
                style={{ color: isDark ? '#9ca3af' : '#64748b' }}
              >
                Active Vaults
              </span>
            </div>
            <div 
              className="text-2xl font-bold transition-colors duration-300"
              style={{ color: isDark ? '#ffffff' : '#0f172a' }}
            >
              {myVaults.length}
            </div>
          </div>
        </motion.div>

        {/* Vaults List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div 
                key={i} 
                className="h-48 rounded-xl animate-pulse transition-colors duration-300"
                style={{
                  background: isDark ? '#12121a' : '#f1f5f9',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                }}
              />
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
                className="rounded-xl p-5 transition-all cursor-pointer group"
                style={{
                  background: isDark ? '#12121a' : '#ffffff',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 
                      className="text-lg font-semibold group-hover:text-emerald-400 transition-colors"
                      style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                    >
                      {vault.name || "Unnamed Vault"}
                    </h3>
                    <span 
                      className="text-sm transition-colors duration-300"
                      style={{ color: isDark ? '#6b7280' : '#64748b' }}
                    >
                      {vault.symbol || "---"}
                    </span>
                  </div>
                  <button 
                    className="p-2 rounded-lg transition-colors"
                    style={{
                      color: isDark ? '#6b7280' : '#64748b',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <EllipsisHorizontalIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span 
                      className="transition-colors duration-300"
                      style={{ color: isDark ? '#6b7280' : '#64748b' }}
                    >
                      Total Assets
                    </span>
                    <span 
                      className="font-medium transition-colors duration-300"
                      style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                    >
                      ${parseFloat(vault.totalAssets || "0").toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span 
                      className="transition-colors duration-300"
                      style={{ color: isDark ? '#6b7280' : '#64748b' }}
                    >
                      Deposit Cap
                    </span>
                    <span 
                      className="font-medium transition-colors duration-300"
                      style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                    >
                      ${parseFloat(vault.depositCap || "0").toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span 
                      className="transition-colors duration-300"
                      style={{ color: isDark ? '#6b7280' : '#64748b' }}
                    >
                      Status
                    </span>
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
            className="rounded-xl p-12 text-center transition-colors duration-300"
            style={{
              background: isDark ? '#12121a' : '#ffffff',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            }}
          >
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-colors duration-300"
              style={{
                background: isDark ? 'rgba(31,41,55,0.5)' : 'rgba(0,0,0,0.05)',
              }}
            >
              <PlusCircleIcon 
                className="h-8 w-8 transition-colors duration-300"
                style={{ color: isDark ? '#6b7280' : '#9ca3af' }}
              />
            </div>
            <h3 
              className="text-xl font-semibold mb-2 transition-colors duration-300"
              style={{ color: isDark ? '#ffffff' : '#0f172a' }}
            >
              No vaults yet
            </h3>
            <p 
              className="mb-6 transition-colors duration-300"
              style={{ color: isDark ? '#9ca3af' : '#64748b' }}
            >
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

