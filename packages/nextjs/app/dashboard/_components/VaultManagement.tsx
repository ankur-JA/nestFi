"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlusIcon,
  UserMinusIcon,
  PlayIcon,
  PauseIcon,
  CogIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { useVaultContract } from "~~/hooks/useVaultContract";
import { formatUnits, parseUnits } from "viem";

interface VaultManagementProps {
  vaultAddress: string;
  isAdmin: boolean;
}

export const VaultManagement: React.FC<VaultManagementProps> = ({
  vaultAddress,
  isAdmin,
}) => {
  const {
    vaultData,
    loading,
    pause,
    unpause,
    setAllowlist,
    setDepositCap,
    setMinDeposit,
    setStrategy,
    invest,
    divest,
    harvest,
  } = useVaultContract(vaultAddress);

  const [activeTab, setActiveTab] = useState<string>("members");
  const [formData, setFormData] = useState({
    memberAddress: "",
    depositCap: "",
    minDeposit: "",
    strategyAddress: "",
    investAmount: "",
    divestAmount: "",
    harvestAmount: "",
  });
  const [loading_action, setLoadingAction] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Helper function to show success message
  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  // Helper function to show error message
  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  // Format USDC values for display
  const formatUSDC = (value: string | bigint) => {
    try {
      const bigintValue = typeof value === 'string' ? BigInt(value) : value;
      return parseFloat(formatUnits(bigintValue, 6)).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } catch {
      return "0.00";
    }
  };

  // Handle member management
  const handleAddMember = async () => {
    if (!formData.memberAddress) {
      showError("Please enter a member address");
      return;
    }

    try {
      setLoadingAction("add-member");
      await setAllowlist(formData.memberAddress, true);
      showSuccess("Member added successfully!");
      setFormData({ ...formData, memberAddress: "" });
    } catch (err) {
      showError("Failed to add member");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRemoveMember = async () => {
    if (!formData.memberAddress) {
      showError("Please enter a member address");
      return;
    }

    try {
      setLoadingAction("remove-member");
      await setAllowlist(formData.memberAddress, false);
      showSuccess("Member removed successfully!");
      setFormData({ ...formData, memberAddress: "" });
    } catch (err) {
      showError("Failed to remove member");
    } finally {
      setLoadingAction(null);
    }
  };

  // Handle vault settings
  const handleUpdateDepositCap = async () => {
    if (!formData.depositCap) {
      showError("Please enter a deposit cap");
      return;
    }

    try {
      setLoadingAction("deposit-cap");
      const capWei = parseUnits(formData.depositCap, 6);
      await setDepositCap(capWei);
      showSuccess("Deposit cap updated successfully!");
      setFormData({ ...formData, depositCap: "" });
    } catch (err) {
      showError("Failed to update deposit cap");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleUpdateMinDeposit = async () => {
    if (!formData.minDeposit) {
      showError("Please enter a minimum deposit");
      return;
    }

    try {
      setLoadingAction("min-deposit");
      const minWei = parseUnits(formData.minDeposit, 6);
      await setMinDeposit(minWei);
      showSuccess("Minimum deposit updated successfully!");
      setFormData({ ...formData, minDeposit: "" });
    } catch (err) {
      showError("Failed to update minimum deposit");
    } finally {
      setLoadingAction(null);
    }
  };

  // Handle pause/unpause
  const handlePause = async () => {
    try {
      setLoadingAction("pause");
      await pause();
      showSuccess("Vault paused successfully!");
    } catch (err) {
      showError("Failed to pause vault");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleUnpause = async () => {
    try {
      setLoadingAction("unpause");
      await unpause();
      showSuccess("Vault unpaused successfully!");
    } catch (err) {
      showError("Failed to unpause vault");
    } finally {
      setLoadingAction(null);
    }
  };

  // Handle strategy management
  const handleSetStrategy = async () => {
    if (!formData.strategyAddress) {
      showError("Please enter a strategy address");
      return;
    }

    try {
      setLoadingAction("set-strategy");
      await setStrategy(formData.strategyAddress);
      showSuccess("Strategy set successfully!");
      setFormData({ ...formData, strategyAddress: "" });
    } catch (err) {
      showError("Failed to set strategy");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleInvest = async () => {
    if (!formData.investAmount) {
      showError("Please enter an investment amount");
      return;
    }

    try {
      setLoadingAction("invest");
      const amountWei = parseUnits(formData.investAmount, 6);
      await invest(amountWei);
      showSuccess("Investment successful!");
      setFormData({ ...formData, investAmount: "" });
    } catch (err) {
      showError("Failed to invest");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDivest = async () => {
    if (!formData.divestAmount) {
      showError("Please enter a divestment amount");
      return;
    }

    try {
      setLoadingAction("divest");
      const amountWei = parseUnits(formData.divestAmount, 6);
      await divest(amountWei);
      showSuccess("Divestment successful!");
      setFormData({ ...formData, divestAmount: "" });
    } catch (err) {
      showError("Failed to divest");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleHarvest = async () => {
    if (!formData.harvestAmount) {
      showError("Please enter a harvest amount");
      return;
    }

    try {
      setLoadingAction("harvest");
      const amountWei = parseUnits(formData.harvestAmount, 6);
      await harvest(amountWei);
      showSuccess("Harvest successful!");
      setFormData({ ...formData, harvestAmount: "" });
    } catch (err) {
      showError("Failed to harvest");
    } finally {
      setLoadingAction(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <ShieldCheckIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Admin Access Required</h3>
        <p className="text-gray-400">Only vault administrators can access management functions.</p>
      </div>
    );
  }

  const tabs = [
    { id: "members", label: "Members", icon: UserPlusIcon },
    { id: "settings", label: "Settings", icon: CogIcon },
    { id: "controls", label: "Controls", icon: WrenchScrewdriverIcon },
    { id: "strategy", label: "Strategy", icon: ChartBarIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Status Messages */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-500/20 border border-green-500/30 rounded-xl p-4"
          >
            <p className="text-green-400 text-sm">{success}</p>
          </motion.div>
        )}
        
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-500/20 border border-red-500/30 rounded-xl p-4"
          >
            <p className="text-red-400 text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vault Status */}
      <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-2xl p-6 border border-gray-600/30">
        <h3 className="text-xl font-semibold text-white mb-4">Vault Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-gray-400 text-sm">Status</p>
            <p className={`font-semibold ${vaultData?.isPaused ? 'text-red-400' : 'text-green-400'}`}>
              {loading ? "..." : vaultData?.isPaused ? "Paused" : "Active"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Total Assets</p>
            <p className="text-white font-semibold">
              {loading ? "..." : `${formatUSDC(vaultData?.totalAssets || 0n)} USDC`}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Deposit Cap</p>
            <p className="text-white font-semibold">
              {loading ? "..." : `${formatUSDC(vaultData?.depositCap || 0n)} USDC`}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Min Deposit</p>
            <p className="text-white font-semibold">
              {loading ? "..." : `${formatUSDC(vaultData?.minDeposit || 0n)} USDC`}
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-800/30 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-700/50"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-2xl p-6 border border-gray-600/30"
        >
          {/* Members Tab */}
          {activeTab === "members" && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">Manage Members</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Member Address
                  </label>
                  <input
                    type="text"
                    value={formData.memberAddress}
                    onChange={(e) => setFormData({ ...formData, memberAddress: e.target.value })}
                    placeholder="0x..."
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50"
                  />
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={handleAddMember}
                    disabled={loading_action === "add-member"}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UserPlusIcon className="h-4 w-4" />
                    <span>{loading_action === "add-member" ? "Adding..." : "Add Member"}</span>
                  </button>
                  
                  <button
                    onClick={handleRemoveMember}
                    disabled={loading_action === "remove-member"}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UserMinusIcon className="h-4 w-4" />
                    <span>{loading_action === "remove-member" ? "Removing..." : "Remove Member"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">Vault Settings</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Deposit Cap (USDC)
                    </label>
                    <input
                      type="number"
                      value={formData.depositCap}
                      onChange={(e) => setFormData({ ...formData, depositCap: e.target.value })}
                      placeholder="10000"
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50"
                    />
                  </div>
                  
                  <button
                    onClick={handleUpdateDepositCap}
                    disabled={loading_action === "deposit-cap"}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading_action === "deposit-cap" ? "Updating..." : "Update Deposit Cap"}
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Minimum Deposit (USDC)
                    </label>
                    <input
                      type="number"
                      value={formData.minDeposit}
                      onChange={(e) => setFormData({ ...formData, minDeposit: e.target.value })}
                      placeholder="10"
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50"
                    />
                  </div>
                  
                  <button
                    onClick={handleUpdateMinDeposit}
                    disabled={loading_action === "min-deposit"}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading_action === "min-deposit" ? "Updating..." : "Update Min Deposit"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Controls Tab */}
          {activeTab === "controls" && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">Vault Controls</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto">
                    <PauseIcon className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white">Pause Vault</h4>
                  <p className="text-gray-400 text-sm">Temporarily stop all deposits and withdrawals</p>
                  <button
                    onClick={handlePause}
                    disabled={loading_action === "pause" || vaultData?.isPaused}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading_action === "pause" ? "Pausing..." : vaultData?.isPaused ? "Already Paused" : "Pause Vault"}
                  </button>
                </div>
                
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto">
                    <PlayIcon className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white">Unpause Vault</h4>
                  <p className="text-gray-400 text-sm">Resume normal vault operations</p>
                  <button
                    onClick={handleUnpause}
                    disabled={loading_action === "unpause" || !vaultData?.isPaused}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading_action === "unpause" ? "Unpausing..." : !vaultData?.isPaused ? "Already Active" : "Unpause Vault"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Strategy Tab */}
          {activeTab === "strategy" && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">Strategy Management</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Strategy
                  </label>
                  <div className="space-y-4">
                    <select
                      value={formData.strategyAddress}
                      onChange={(e) => setFormData({ ...formData, strategyAddress: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50"
                    >
                      <option value="">No Strategy</option>
                      {process.env.NEXT_PUBLIC_AAVE_STRATEGY && (
                        <option value={process.env.NEXT_PUBLIC_AAVE_STRATEGY}>
                          Aave V3 Strategy ({process.env.NEXT_PUBLIC_AAVE_STRATEGY.slice(0, 8)}...)
                        </option>
                      )}
                      {process.env.NEXT_PUBLIC_COMET_STRATEGY && (
                        <option value={process.env.NEXT_PUBLIC_COMET_STRATEGY}>
                          Compound USDC Strategy ({process.env.NEXT_PUBLIC_COMET_STRATEGY.slice(0, 8)}...)
                        </option>
                      )}
                      {process.env.NEXT_PUBLIC_UNIV3_STRATEGY && (
                        <option value={process.env.NEXT_PUBLIC_UNIV3_STRATEGY}>
                          Uniswap V3 LP Strategy ({process.env.NEXT_PUBLIC_UNIV3_STRATEGY.slice(0, 8)}...)
                        </option>
                      )}
                    </select>
                    
                    <div className="flex space-x-4">
                      <input
                        type="text"
                        value={formData.strategyAddress}
                        onChange={(e) => setFormData({ ...formData, strategyAddress: e.target.value })}
                        placeholder="Or enter custom strategy address (0x...)"
                        className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50"
                      />
                      <button
                        onClick={handleSetStrategy}
                        disabled={loading_action === "set-strategy"}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading_action === "set-strategy" ? "Setting..." : "Set Strategy"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Invest Amount (USDC)
                      </label>
                      <input
                        type="number"
                        value={formData.investAmount}
                        onChange={(e) => setFormData({ ...formData, investAmount: e.target.value })}
                        placeholder="1000"
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50"
                      />
                    </div>
                    <button
                      onClick={handleInvest}
                      disabled={loading_action === "invest"}
                      className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowUpIcon className="h-4 w-4" />
                      <span>{loading_action === "invest" ? "Investing..." : "Invest"}</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Divest Amount (USDC)
                      </label>
                      <input
                        type="number"
                        value={formData.divestAmount}
                        onChange={(e) => setFormData({ ...formData, divestAmount: e.target.value })}
                        placeholder="1000"
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50"
                      />
                    </div>
                    <button
                      onClick={handleDivest}
                      disabled={loading_action === "divest"}
                      className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowDownIcon className="h-4 w-4" />
                      <span>{loading_action === "divest" ? "Divesting..." : "Divest"}</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Harvest Amount (USDC)
                      </label>
                      <input
                        type="number"
                        value={formData.harvestAmount}
                        onChange={(e) => setFormData({ ...formData, harvestAmount: e.target.value })}
                        placeholder="100"
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50"
                      />
                    </div>
                    <button
                      onClick={handleHarvest}
                      disabled={loading_action === "harvest"}
                      className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CurrencyDollarIcon className="h-4 w-4" />
                      <span>{loading_action === "harvest" ? "Harvesting..." : "Harvest"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
