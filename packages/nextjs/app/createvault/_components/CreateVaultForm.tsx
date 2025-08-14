"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { BanknotesIcon, UsersIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { useVaultFactory } from "../../../hooks/useVaultFactory";

interface CreateVaultFormProps {
  onSuccess?: () => void;
}

export default function CreateVaultForm({ onSuccess }: CreateVaultFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    allowlistEnabled: false,
    depositCap: "",
    minDeposit: "",
  });

  const { createVault, loading, success, error } = useVaultFactory();

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
      asset: "0x9d4454B023096f34B160D6B654540c56A1F81688", // MockUSDC address from latest deployment
      ...formData,
    });
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Call onSuccess when vault is created
  React.useEffect(() => {
    if (success && onSuccess) {
      onSuccess();
    }
  }, [success, onSuccess]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-red-500/20"
    >
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vault Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Vault Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="w-full bg-white/5 border border-red-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-400 transition-colors"
            placeholder="e.g., My Investment Vault"
            required
          />
        </div>

        {/* Vault Symbol */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Vault Symbol
          </label>
          <input
            type="text"
            value={formData.symbol}
            onChange={(e) => handleInputChange("symbol", e.target.value)}
            className="w-full bg-white/5 border border-red-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-400 transition-colors"
            placeholder="e.g., MIV"
            required
          />
        </div>

        {/* Allowlist Toggle */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-red-500/20">
          <div className="flex items-center space-x-3">
            <ShieldCheckIcon className="h-5 w-5 text-red-400" />
            <div>
              <p className="text-white font-medium">Enable Allowlist</p>
              <p className="text-gray-400 text-sm">
                Only approved addresses can join this vault
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.allowlistEnabled}
              onChange={(e) => handleInputChange("allowlistEnabled", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
          </label>
        </div>

        {/* Deposit Cap */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Deposit Cap (USDC)
          </label>
          <input
            type="number"
            value={formData.depositCap}
            onChange={(e) => handleInputChange("depositCap", e.target.value)}
            className="w-full bg-white/5 border border-red-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-400 transition-colors"
            placeholder="e.g., 100000"
            min="0"
            step="0.01"
          />
          <p className="text-gray-400 text-sm mt-1">
            Maximum total value that can be deposited (0 = no limit)
          </p>
        </div>

        {/* Minimum Deposit */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Minimum Deposit (USDC)
          </label>
          <input
            type="number"
            value={formData.minDeposit}
            onChange={(e) => handleInputChange("minDeposit", e.target.value)}
            className="w-full bg-white/5 border border-red-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-400 transition-colors"
            placeholder="e.g., 100"
            min="0"
            step="0.01"
          />
          <p className="text-gray-400 text-sm mt-1">
            Minimum amount required for each deposit (0 = no minimum)
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <UsersIcon className="h-5 w-5 text-blue-400 mt-0.5" />
            <div>
              <p className="text-blue-300 font-medium">Vault Creation Info</p>
              <ul className="text-blue-200 text-sm mt-2 space-y-1">
                <li>• You will be the admin of this vault</li>
                <li>• You can add/remove members if allowlist is enabled</li>
                <li>• You control the investment strategies</li>
                <li>• This is a demo - no real blockchain transaction</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-full transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formData.name || !formData.symbol}
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-full transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <BanknotesIcon className="h-4 w-4" />
                <span>Create Vault</span>
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
