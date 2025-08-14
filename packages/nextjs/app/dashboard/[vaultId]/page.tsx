// app/dashboard/[vaultId]/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  UsersIcon, 
  ShieldCheckIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";

interface VaultData {
  address: string;
  asset: string;
  name: string;
  symbol: string;
  totalAssets: string;
  totalShares: string;
  userBalance: string;
  userShares: string;
  isAdmin: boolean;
}

const VaultDetailsPage: React.FC = () => {
  const router = useRouter();
  const { vaultId } = useParams();
  const { address: userAddress, isConnected } = useAccount();
  
  const [vaultData, setVaultData] = useState<VaultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>("");

  useEffect(() => {
    if (!vaultId || !isConnected) {
      setLoading(false);
      return;
    }

    const fetchVaultData = async () => {
      try {
        setLoading(true);
        
        // Fetch vault info from API
        const infoResponse = await fetch(`/api/vault/info?address=${vaultId}`);
        const vaultInfo = await infoResponse.json();
        
        // Fetch vault owner
        const ownerResponse = await fetch(`/api/vault/owner?address=${vaultId}`);
        const ownerData = await ownerResponse.json();
        
        // For now, we'll use mock data since the contract calls might not work
        // In a real implementation, you'd call the actual contract functions
        const mockVaultData: VaultData = {
          address: vaultId as string,
          asset: vaultInfo.asset || "0x0000000000000000000000000000000000000000",
          name: vaultInfo.name || "Unknown Vault",
          symbol: vaultInfo.symbol || "vTKN",
          totalAssets: "1000000", // 1 USDC in wei
          totalShares: "1000000000000000000", // 1 share token
          userBalance: "100000", // 0.1 USDC in wei
          userShares: "100000000000000000", // 0.1 share tokens
          isAdmin: ownerData.owner === userAddress,
        };
        
        setVaultData(mockVaultData);
      } catch (err) {
        console.error("Error fetching vault data:", err);
        setError("Failed to load vault details");
      } finally {
        setLoading(false);
      }
    };

    fetchVaultData();
  }, [vaultId, userAddress, isConnected]);

  const handleDeposit = () => {
    // This would interact with the actual smart contract
    alert("Deposit functionality would interact with the smart contract");
  };

  const handleWithdraw = () => {
    // This would interact with the actual smart contract
    alert("Withdraw functionality would interact with the smart contract");
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Wallet Not Connected</h2>
          <p className="text-gray-300 mb-4">Please connect your wallet to view vault details</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading vault details...</p>
        </div>
      </div>
    );
  }

  if (error || !vaultData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Vault</h2>
          <p className="text-gray-300 mb-4">{error || "Vault not found"}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <div className="relative pt-8 pb-6 px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          <div className="flex items-center gap-4 mb-6">
            <motion.button
              onClick={() => router.push("/dashboard")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-all duration-300"
            >
              <ArrowLeftIcon className="h-6 w-6 text-white" />
            </motion.button>
            <div>
              <h1 className="text-3xl font-bold text-white">{vaultData.name}</h1>
              <p className="text-gray-400">{vaultData.symbol}</p>
            </div>
            {vaultData.isAdmin && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-semibold rounded-full"
              >
                Admin
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Vault Stats */}
      <div className="px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-3">
                <CurrencyDollarIcon className="h-6 w-6 text-green-400" />
                <h3 className="text-lg font-semibold text-white">Total Assets</h3>
              </div>
              <p className="text-2xl font-bold text-white">
                {formatUnits(BigInt(vaultData.totalAssets), 6)} USDC
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-3">
                <ChartBarIcon className="h-6 w-6 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Total Shares</h3>
              </div>
              <p className="text-2xl font-bold text-white">
                {formatUnits(BigInt(vaultData.totalShares), 18)} {vaultData.symbol}
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-3">
                <ShieldCheckIcon className="h-6 w-6 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Your Balance</h3>
              </div>
              <p className="text-2xl font-bold text-white">
                {formatUnits(BigInt(vaultData.userBalance), 6)} USDC
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-3">
                <UsersIcon className="h-6 w-6 text-yellow-400" />
                <h3 className="text-lg font-semibold text-white">Your Shares</h3>
              </div>
              <p className="text-2xl font-bold text-white">
                {formatUnits(BigInt(vaultData.userShares), 18)} {vaultData.symbol}
              </p>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Deposit */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
              <h3 className="text-xl font-semibold text-white mb-4">Deposit</h3>
              <div className="space-y-4">
                <input
                  type="number"
                  placeholder="Amount (USDC)"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-all duration-300"
                />
                <motion.button
                  onClick={handleDeposit}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300"
                >
                  Deposit
                </motion.button>
              </div>
            </div>

            {/* Withdraw */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
              <h3 className="text-xl font-semibold text-white mb-4">Withdraw</h3>
              <div className="space-y-4">
                <input
                  type="number"
                  placeholder="Amount (USDC)"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-all duration-300"
                />
                <motion.button
                  onClick={handleWithdraw}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
                >
                  Withdraw
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Vault Address */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50"
          >
            <h3 className="text-lg font-semibold text-white mb-3">Vault Address</h3>
            <p className="text-gray-300 font-mono text-sm break-all">{vaultData.address}</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default VaultDetailsPage;
