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
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";
import { useTheme } from "~~/contexts/ThemeContext";

export default function InvestorPortfolioPage() {
  const { address, isConnected } = useAccount();
  const { memberVaults, loading: isLoading, refreshMemberships } = useVaultMembership();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!isConnected) return;
    
    const interval = setInterval(() => {
      refreshMemberships();
    }, 30000);

    return () => clearInterval(interval);
  }, [isConnected, refreshMemberships]);

  // Filter out admin vaults - only show vaults where user is an investor (not curator)
  // memberVaults already filters for role === "member" (non-admin)
  const investorVaults = memberVaults || [];

  // Calculate portfolio stats - only for investor vaults
  const totalValue = investorVaults.reduce((sum, m) => sum + parseFloat(m.userBalance || "0") / 1e6, 0) || 0;
  const totalEarnings = 0; // Earnings tracking not available yet
  const activeVaults = investorVaults.length;

  // Not connected state
  if (!isConnected) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl p-12 text-center max-w-md transition-colors duration-300"
          style={{
            background: isDark ? '#12121a' : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
          }}
        >
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-6">
            <WalletIcon className="h-8 w-8 text-blue-500" />
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
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 
              className="text-3xl font-bold mb-2 transition-colors duration-300"
              style={{ color: isDark ? '#ffffff' : '#0f172a' }}
            >
              My Vaults
            </h1>
            <p 
              className="transition-colors duration-300"
              style={{ color: isDark ? '#9ca3af' : '#64748b' }}
            >
              Track your investments and portfolio performance.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => refreshMemberships()}
            disabled={isLoading}
            className="p-3 rounded-xl transition-colors disabled:opacity-50"
            style={{
              background: isDark ? '#1f2937' : '#e5e7eb',
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = isDark ? '#374151' : '#d1d5db';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDark ? '#1f2937' : '#e5e7eb';
            }}
            title="Refresh vaults"
          >
            <ArrowPathIcon 
              className={`h-5 w-5 transition-colors duration-300 ${isLoading ? "animate-spin" : ""}`}
              style={{ color: isDark ? '#9ca3af' : '#64748b' }}
            />
          </motion.button>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <div 
            className="border rounded-xl p-5 transition-colors duration-300"
            style={{
              background: isDark ? '#12121a' : '#ffffff',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <CurrencyDollarIcon className="h-5 w-5 text-blue-500" />
              </div>
              <span 
                className="text-sm transition-colors duration-300"
                style={{ color: isDark ? '#9ca3af' : '#64748b' }}
              >
                Total Portfolio Value
              </span>
            </div>
            <div 
              className="text-2xl font-bold transition-colors duration-300"
              style={{ color: isDark ? '#ffffff' : '#0f172a' }}
            >
              ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          </div>
          <div 
            className="border rounded-xl p-5 transition-colors duration-300"
            style={{
              background: isDark ? '#12121a' : '#ffffff',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-500" />
              </div>
              <span 
                className="text-sm transition-colors duration-300"
                style={{ color: isDark ? '#9ca3af' : '#64748b' }}
              >
                Total Earnings
              </span>
            </div>
            <div className="text-2xl font-bold text-emerald-500">
              +${totalEarnings.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          </div>
          <div 
            className="border rounded-xl p-5 transition-colors duration-300"
            style={{
              background: isDark ? '#12121a' : '#ffffff',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <ChartBarIcon className="h-5 w-5 text-purple-500" />
              </div>
              <span 
                className="text-sm transition-colors duration-300"
                style={{ color: isDark ? '#9ca3af' : '#64748b' }}
              >
                Active Investments
              </span>
            </div>
            <div 
              className="text-2xl font-bold transition-colors duration-300"
              style={{ color: isDark ? '#ffffff' : '#0f172a' }}
            >
              {activeVaults}
            </div>
          </div>
        </motion.div>

        {/* Investments List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div 
                key={i} 
                className="h-48 border rounded-xl animate-pulse transition-colors duration-300"
                style={{
                  background: isDark ? '#12121a' : '#f1f5f9',
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                }}
              />
            ))}
          </div>
        ) : investorVaults.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {investorVaults.map((membership, index) => (
              <motion.div
                key={membership.vaultAddress}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -2 }}
                className="border rounded-xl p-5 transition-all cursor-pointer group"
                style={{
                  background: isDark ? '#12121a' : '#ffffff',
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-500">
                        {membership.vaultSymbol?.slice(0, 2) || "V"}
                      </span>
                    </div>
                    <div>
                      <h3 
                        className="font-semibold transition-colors duration-300 group-hover:text-blue-500"
                        style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                      >
                        {membership.vaultName || "Unnamed Vault"}
                      </h3>
                      <span 
                        className="text-sm transition-colors duration-300"
                        style={{ color: isDark ? '#6b7280' : '#94a3b8' }}
                      >
                        {membership.vaultSymbol || "—"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span 
                      className="transition-colors duration-300"
                      style={{ color: isDark ? '#6b7280' : '#64748b' }}
                    >
                      Your Balance
                    </span>
                    <span 
                      className="font-medium transition-colors duration-300"
                      style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                    >
                      ${(parseFloat(membership.userBalance || "0") / 1e6).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
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
                      ${(parseFloat(membership.totalAssets || "0") / 1e6).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span 
                      className="transition-colors duration-300"
                      style={{ color: isDark ? '#6b7280' : '#64748b' }}
                    >
                      Status
                    </span>
                    <span className={`font-medium ${membership.isPaused ? "text-yellow-500" : "text-emerald-500"}`}>
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
            className="border rounded-xl p-12 text-center transition-colors duration-300"
            style={{
              background: isDark ? '#12121a' : '#ffffff',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'},
            }}
          >
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-colors duration-300"
              style={{
                background: isDark ? 'rgba(31,41,55,0.5)' : 'rgba(0,0,0,0.05)',
              }}
            >
              <WalletIcon 
                className="h-8 w-8 transition-colors duration-300"
                style={{ color: isDark ? '#6b7280' : '#9ca3af' }}
              />
            </div>
            <h3 
              className="text-xl font-semibold mb-2 transition-colors duration-300"
              style={{ color: isDark ? '#ffffff' : '#0f172a' }}
            >
              No investments yet
            </h3>
            <p 
              className="mb-6 transition-colors duration-300"
              style={{ color: isDark ? '#9ca3af' : '#64748b' }}
            >
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

