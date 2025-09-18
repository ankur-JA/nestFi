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
  ExclamationTriangleIcon,
  BoltIcon,
  Cog6ToothIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";
import { useAccount, usePublicClient } from "wagmi";
import { formatUnits, parseAbi } from "viem";
import { useVaultContract } from "~~/hooks/useVaultContract";
import { VaultManagement } from "../_components/VaultManagement";
import { VaultActions } from "../_components/VaultActions";

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
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "actions" | "management">("overview");
  const [members, setMembers] = useState<string[]>([]);
  const publicClient = usePublicClient();
  const [strategyAddr, setStrategyAddr] = useState<string>("");
  const [selectedStrategyKey, setSelectedStrategyKey] = useState<string>("");
  const [investAmt, setInvestAmt] = useState<string>("");
  const [divestAmt, setDivestAmt] = useState<string>("");

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
    setStrategy,
    invest,
    divest,
    harvest,
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
        const infoResponse = await fetch(`/api/vault/info?address=${vaultId}&user=${userAddress}`);
        if (!infoResponse.ok) {
          throw new Error(`Failed to fetch vault info: ${infoResponse.status} ${infoResponse.statusText}`);
        }
        const vaultInfo = await infoResponse.json();
        
        console.log("Vault info from API:", vaultInfo);
        
        // Fetch vault owner
        const ownerResponse = await fetch(`/api/vault/owner?address=${vaultId}`);
        if (!ownerResponse.ok) {
          throw new Error(`Failed to fetch vault owner: ${ownerResponse.status} ${ownerResponse.statusText}`);
        }
        const ownerData = await ownerResponse.json();
        
        console.log("Vault owner from API:", ownerData);
        
        // Use actual vault data from API
        const actualVaultData: VaultData = {
          address: vaultId as string,
          asset: vaultInfo.asset || "0x0000000000000000000000000000000000000000",
          name: vaultInfo.name || "Investment Vault",
          symbol: vaultInfo.symbol || "INV",
          totalAssets: vaultInfo.totalAssets || "0",
          totalShares: vaultInfo.totalSupply || "0",
          userBalance: vaultInfo.userBalance || "0",
          userShares: "0", // We'll get this from chainVault when available
          isAdmin: ownerData.owner === userAddress,
        };
        
        setVaultData(actualVaultData);
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

  // Fetch members from AllowlistUpdated events
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        if (!publicClient || !vaultId || !userAddress) return;
        
        // Validate vault address format
        const vaultAddress = Array.isArray(vaultId) ? vaultId[0] : vaultId;
        if (!vaultAddress || !vaultAddress.startsWith('0x') || vaultAddress.length !== 42) {
          console.error("Invalid vault address format:", vaultAddress);
          return;
        }
        
        const eventAbi = parseAbi([
          "event AllowlistUpdated(address indexed user, bool allowed)"
        ]);
        const logs = await publicClient.getLogs({
          address: vaultId as `0x${string}`,
          event: eventAbi[0] as any,
          fromBlock: "earliest",
          toBlock: "latest",
        });
        const latest: Record<string, boolean> = {};
        (logs || []).forEach((log: any) => {
          const u = log.args?.user as string;
          const allowed = Boolean(log.args?.allowed);
          if (u) latest[u.toLowerCase()] = allowed;
        });
        const allowedMembers = Object.entries(latest)
          .filter(([, allowed]) => allowed)
          .map(([addr]) => addr);
        setMembers(allowedMembers);
    } catch (e) {
        console.warn("Failed to load members", e);
      }
    };
    fetchMembers();
  }, [publicClient, vaultId, userAddress, chainVault?.allowlistEnabled]);

  const handleDeposit = () => {
    if (!depositAmount || !deposit) return;
    deposit(depositAmount);
  };

  const handleWithdraw = () => {
    // This would interact with the actual smart contract
    alert("Withdraw functionality would interact with the smart contract");
  };

  const shortAddr = (addr: string) => (addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "");

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(vaultData?.address || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (_) {
      // ignore copy failures
    }
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
      {/* Decorative gradient banner */}
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-red-500/10 via-pink-500/5 to-transparent pointer-events-none" />

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
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`px-3 py-1 text-white text-sm font-semibold rounded-full ${
                vaultData.isAdmin ? "bg-gradient-to-r from-red-500 to-pink-500" : "bg-white/10"
              }`}
            >
              {vaultData.isAdmin ? "Admin" : "Member"}
            </motion.div>
          </div>

          {/* Sub header pills */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleCopyAddress}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 text-sm font-mono hover:bg-white/10 transition"
              title="Copy address"
            >
              {copied ? "Copied!" : `Address: ${shortAddr(vaultData.address)}`}
            </button>
            <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 text-sm">
              {chainVault?.isPaused ? "Paused" : "Active"} | Total Value Locked: {formatUnits(BigInt(vaultData.totalAssets || "0"), 6)} USDC
            </div>
            {chainVault?.allowlistEnabled && (
              <div className={`px-3 py-2 rounded-xl text-sm border ${chainVault?.isAllowed ? "text-green-300 border-green-500/20 bg-green-500/10" : "text-yellow-300 border-yellow-500/20 bg-yellow-500/10"}`}>
                {chainVault?.isAllowed ? "Allowlisted" : "Allowlist required"}
        </div>
      )}
          </div>

          {/* Tabs */}
          <div className="mt-6 flex items-center gap-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 rounded-lg text-sm border transition ${
                activeTab === "overview" ? "bg-white/10 border-white/20 text-white" : "bg-transparent border-white/10 text-gray-300 hover:bg-white/5"
              }`}
            >
              <span className="inline-flex items-center gap-2"><InformationCircleIcon className="h-4 w-4"/>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab("actions")}
              className={`px-4 py-2 rounded-lg text-sm border transition ${
                activeTab === "actions" ? "bg-white/10 border-white/20 text-white" : "bg-transparent border-white/10 text-gray-300 hover:bg-white/5"
              }`}
            >
              <span className="inline-flex items-center gap-2"><BoltIcon className="h-4 w-4"/>Actions</span>
            </button>
            {vaultData.isAdmin && (
              <button
                onClick={() => setActiveTab("management")}
                className={`px-4 py-2 rounded-lg text-sm border transition ${
                  activeTab === "management" ? "bg-white/10 border-white/20 text-white" : "bg-transparent border-white/10 text-gray-300 hover:bg-white/5"
                }`}
              >
                <span className="inline-flex items-center gap-2"><Cog6ToothIcon className="h-4 w-4"/>Management</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>

      <div className="px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Overview tab content */}
          {activeTab === "overview" && (
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
          )}

          {/* Actions tab content */}
          {activeTab === "actions" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl mx-auto"
            >
              <VaultActions 
                vaultAddress={vaultData.address}
                onSuccess={() => {
                  // Refresh vault data after successful transaction
                  window.location.reload();
                }}
              />
            </motion.div>
          )}

          {/* Admin tab content */}
          {vaultData.isAdmin && activeTab === "management" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6"
            >
              <VaultManagement 
                vaultAddress={vaultId as string}
                isAdmin={vaultData.isAdmin}
              />
            </motion.div>
          )}
          {/* Vault address section removed; copy available in header pill */}
        </div>
      </div>
    </div>
  );
};

export default VaultDetailsPage;
