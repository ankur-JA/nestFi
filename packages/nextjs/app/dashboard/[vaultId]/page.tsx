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
import { useVaultContract } from "~~/hooks/useVaultContract";

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
  const [memberToAllow, setMemberToAllow] = useState<string>("");
  const [newDepositCap, setNewDepositCap] = useState<string>("");
  const [newMinDeposit, setNewMinDeposit] = useState<string>("");

  // On-chain vault hook
  const {
    vaultData: chainVault,
    loading: chainLoading,
    pause,
    unpause,
    setAllowlist,
    setDepositCap,
    setMinDeposit,
    deposit,
  } = useVaultContract((vaultId as string) || undefined);

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

  // When on-chain data is available, hydrate UI values
  useEffect(() => {
    if (!vaultId || !chainVault) return;
    setVaultData(prev => ({
      address: (vaultId as string) || prev?.address || "",
      asset: (prev?.asset ?? chainVault.asset) as string,
      name: chainVault.name || prev?.name || "Vault",
      symbol: chainVault.symbol || prev?.symbol || "vTKN",
      totalAssets: (chainVault.totalAssets?.toString?.() as string) || prev?.totalAssets || "0",
      totalShares: (chainVault.totalSupply?.toString?.() as string) || prev?.totalShares || "0",
      userBalance: (chainVault.userBalance?.toString?.() as string) || prev?.userBalance || "0",
      userShares: (chainVault.userShares?.toString?.() as string) || prev?.userShares || "0",
      isAdmin: prev?.isAdmin ?? false,
    }));
  }, [vaultId, chainVault]);

  const handleDeposit = () => {
    if (!depositAmount) return;
    deposit(depositAmount);
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

          {/* Sub header pills */}
          <div className="flex flex-wrap gap-3">
            <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 text-sm font-mono">
              Vault Address: <span className="text-white">{vaultData.address}</span>
            </div>
            <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 text-sm">
              {chainVault?.isPaused ? "Paused" : "Active"} | Total Value Locked: {formatUnits(BigInt(vaultData.totalAssets || "0"), 6)} USDC
            </div>
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

          {/* Admin Controls */}
          {vaultData.isAdmin && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-4">Admin Controls</h3>
                <div className="flex flex-wrap gap-3">
                  <button onClick={pause} className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition">Pause Vault</button>
                  <button onClick={unpause} className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition">Unpause Vault</button>
                </div>
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-sm text-gray-400">Allowlist Address</label>
                    <div className="mt-1 flex gap-2">
                      <input value={memberToAllow} onChange={e=>setMemberToAllow(e.target.value)} placeholder="0x..." className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-500" />
                      <button onClick={() => setAllowlist(memberToAllow, true)} className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white">Add</button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Withdraw Cap</label>
                    <div className="mt-1 flex gap-2">
                      <input value={newDepositCap} onChange={e=>setNewDepositCap(e.target.value)} placeholder="10000" className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-500" />
                      <button onClick={() => setDepositCap(newDepositCap)} className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20">Set</button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Set Min Deposit</label>
                    <div className="mt-1 flex gap-2">
                      <input value={newMinDeposit} onChange={e=>setNewMinDeposit(e.target.value)} placeholder="10" className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-500" />
                      <button onClick={() => setMinDeposit(newMinDeposit)} className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20">Set</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-4">Yield Strategies</h3>
                <p className="text-gray-400 text-sm">Aave / UniSwap LP (placeholder)</p>
                <div className="mt-4 h-40 rounded-lg bg-black/20 border border-white/10" />
              </div>

              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>Deposited 10,000 USDC</li>
                  <li>Deposited 1,000 USDC</li>
                </ul>
              </div>
            </motion.div>
          )}
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
