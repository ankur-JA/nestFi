"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { BanknotesIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { useVaultFactory } from "../../hooks/useVaultFactory";
import Link from "next/link";

export default function TestVaultPage() {
  const [formData, setFormData] = useState({
    name: "Test Vault",
    symbol: "TEST",
    allowlistEnabled: false,
    depositCap: "10000",
    minDeposit: "100",
  });

  const { createVault, loading, success, error, receipt } = useVaultFactory();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name.trim()) {
      alert("Please enter a vault name");
      return;
    }
    
    if (!formData.symbol.trim()) {
      alert("Please enter a vault symbol");
      return;
    }
    
    if (!formData.depositCap || parseFloat(formData.depositCap) <= 0) {
      alert("Please enter a valid deposit cap");
      return;
    }
    
    if (!formData.minDeposit || parseFloat(formData.minDeposit) <= 0) {
      alert("Please enter a valid minimum deposit");
      return;
    }
    
    createVault({
      asset: "0x9d4454B023096f34B160D6B654540c56A1F81688", // MockUSDC address
      ...formData,
    });
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <BanknotesIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500">
            Test Vault Creation
          </h1>
          <p className="text-gray-400 mt-2">
            Create a test vault to verify the system works
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-red-500/20">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <XCircleIcon className="h-5 w-5 text-red-400" />
                <p className="text-red-300">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
                <p className="text-green-300">Vault created successfully!</p>
              </div>
              {receipt && (
                <p className="text-green-300 text-sm mt-2">
                  Transaction: {receipt.transactionHash}
                </p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Vault Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full bg-white/5 border border-red-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-400 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Vault Symbol
              </label>
              <input
                type="text"
                value={formData.symbol}
                onChange={(e) => handleInputChange("symbol", e.target.value)}
                className="w-full bg-white/5 border border-red-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-400 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Deposit Cap (USDC)
              </label>
              <input
                type="number"
                value={formData.depositCap}
                onChange={(e) => handleInputChange("depositCap", e.target.value)}
                className="w-full bg-white/5 border border-red-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-400 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Min Deposit (USDC)
              </label>
              <input
                type="number"
                value={formData.minDeposit}
                onChange={(e) => handleInputChange("minDeposit", e.target.value)}
                className="w-full bg-white/5 border border-red-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-400 transition-colors"
                required
              />
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="allowlist"
                checked={formData.allowlistEnabled}
                onChange={(e) => handleInputChange("allowlistEnabled", e.target.checked)}
                className="rounded border-red-500/30 bg-white/5 text-red-400 focus:ring-red-400"
              />
              <label htmlFor="allowlist" className="text-sm text-gray-300">
                Enable Allowlist
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating Vault...</span>
                </div>
              ) : (
                "Create Test Vault"
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <Link
            href="/dashboard"
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
