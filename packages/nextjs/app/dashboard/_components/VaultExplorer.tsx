"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { MagnifyingGlassIcon, UserIcon, ExclamationTriangleIcon, PlusIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { isAddress } from "viem";
import { useAccount } from "wagmi";
import VaultCard from "./VaultCard";
import { useVaultFactory } from "../../../hooks/useVaultFactory";

interface VaultExplorerProps {
  onVaultFound: (vaultAddress: string) => void;
}

export const VaultExplorer: React.FC<VaultExplorerProps> = ({ onVaultFound }) => {
  const [vaultAddress, setVaultAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foundVault, setFoundVault] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const { checkVaultMembership } = useVaultFactory();
  const { address: userAddress } = useAccount();

  // Don't render if no user is connected
  if (!userAddress) {
    return null;
  }

  const handleCheckVault = async () => {
    if (!vaultAddress) {
      setError("Please enter a vault address");
      return;
    }

    if (!isAddress(vaultAddress)) {
      setError("Please enter a valid Ethereum address");
      return;
    }

    // Additional validation
    if (vaultAddress === "0x0000000000000000000000000000000000000000") {
      setError("Invalid vault address: zero address");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      console.log("Starting vault membership check for:", vaultAddress);
      
      // Check if user is a member of this vault
      const vaultInfo = await checkVaultMembership(vaultAddress);

      if (!vaultInfo) {
        setError("You are not a member of this vault. Ask the admin to add you to the allowlist or make a deposit.");
        return;
      }

      setFoundVault(vaultInfo);
      setSuccessMessage(`✅ You are a member of this vault! ${vaultInfo.isAdmin ? '(Admin)' : '(Member)'}`);
      onVaultFound(vaultAddress);
    } catch (err) {
      console.error("Error checking vault:", err);
      setError("Failed to check vault. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setVaultAddress("");
    setFoundVault(null);
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-2xl p-8 border border-gray-600/30">
      <div className="text-center mb-6">
        <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Explore Vaults</h3>
        <p className="text-gray-400 max-w-md mx-auto">
          Enter a vault address to check if you're a member. If you are, it will be added to your dashboard.
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-4"
        >
          <p className="text-red-400 text-sm flex items-center gap-2">
            <ExclamationTriangleIcon className="h-4 w-4" />
            {error}
          </p>
        </motion.div>
      )}

      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 mb-4"
        >
          <p className="text-green-400 text-sm flex items-center gap-2">
            <CheckCircleIcon className="h-4 w-4" />
            {successMessage}
          </p>
        </motion.div>
      )}

      <div className="space-y-4 max-w-md mx-auto">
        <div className="flex space-x-4">
          <input
            type="text"
            value={vaultAddress}
            onChange={(e) => setVaultAddress(e.target.value)}
            placeholder="Enter vault address (0x...)"
            className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
          />
          <button
            onClick={handleCheckVault}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <MagnifyingGlassIcon className="h-4 w-4" />
                Check
              </>
            )}
          </button>
        </div>

        {foundVault && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 mb-4">
              <p className="text-green-400 text-sm">✅ Vault found! Here are the details:</p>
            </div>
            
            <VaultCard
              vaultAddress={foundVault.address}
              isCurrentUserAdmin={false}
              vaultInfo={foundVault}
            />
            
            <div className="flex space-x-4 mt-4">
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-all duration-300"
              >
                Check Another
              </button>
              <button
                onClick={() => window.open(`/dashboard/${foundVault.address}`, '_blank')}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300"
              >
                View Vault
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500 max-w-lg mx-auto">
          💡 <strong>Tip:</strong> Member vaults are discovered when admins add you to their allowlist or when you make deposits. 
          You can also manually check specific vault addresses here.
        </p>
      </div>
    </div>
  );
};
