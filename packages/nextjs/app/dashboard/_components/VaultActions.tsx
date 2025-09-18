"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowDownTrayIcon, 
  ArrowUpTrayIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";
import { useVaultActions } from "~~/hooks/useVaultActions";

interface VaultActionsProps {
  vaultAddress: string;
  onSuccess?: () => void;
}

export const VaultActions: React.FC<VaultActionsProps> = ({ vaultAddress, onSuccess }) => {
  const {
    limits,
    balances,
    loading,
    error,
    deposit,
    withdraw,
    fetchVaultData,
    previewTransaction,
    formatAmount,
    validateDeposit,
    validateWithdraw,
    isTxPending,
    isTxLoading,
    isTxSuccess,
    txError,
  } = useVaultActions(vaultAddress);

  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [depositPreview, setDepositPreview] = useState<string | null>(null);
  const [withdrawPreview, setWithdrawPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");

  // Load vault data on mount
  useEffect(() => {
    fetchVaultData();
  }, [fetchVaultData]);

  // Handle successful transactions
  useEffect(() => {
    if (isTxSuccess) {
      setDepositAmount("");
      setWithdrawAmount("");
      setDepositPreview(null);
      setWithdrawPreview(null);
      fetchVaultData(); // Refresh data
      onSuccess?.();
    }
  }, [isTxSuccess, fetchVaultData, onSuccess]);

  // Preview deposit
  useEffect(() => {
    const previewDeposit = async () => {
      if (depositAmount && !validateDeposit(depositAmount)) {
        const preview = await previewTransaction("previewDeposit", depositAmount);
        setDepositPreview(preview);
      } else {
        setDepositPreview(null);
      }
    };

    previewDeposit();
  }, [depositAmount, previewTransaction, validateDeposit]);

  // Preview withdraw
  useEffect(() => {
    const previewWithdraw = async () => {
      if (withdrawAmount && !validateWithdraw(withdrawAmount)) {
        const preview = await previewTransaction("previewWithdraw", withdrawAmount);
        setWithdrawPreview(preview);
      } else {
        setWithdrawPreview(null);
      }
    };

    previewWithdraw();
  }, [withdrawAmount, previewTransaction, validateWithdraw]);

  const handleDeposit = async () => {
    const validation = validateDeposit(depositAmount);
    if (validation) return;
    
    await deposit(depositAmount);
  };

  const handleWithdraw = async () => {
    const validation = validateWithdraw(withdrawAmount);
    if (validation) return;
    
    await withdraw(withdrawAmount);
  };

  const depositValidation = validateDeposit(depositAmount);
  const withdrawValidation = validateWithdraw(withdrawAmount);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-400">Loading vault data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {(error || txError) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 border border-red-500/30 rounded-xl p-4"
        >
          <p className="text-red-400 text-sm flex items-center gap-2">
            <ExclamationTriangleIcon className="h-4 w-4" />
            {error || txError?.message || "Transaction failed"}
          </p>
        </motion.div>
      )}

      {/* Success Display */}
      {isTxSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/20 border border-green-500/30 rounded-xl p-4"
        >
          <p className="text-green-400 text-sm flex items-center gap-2">
            <CheckCircleIcon className="h-4 w-4" />
            Transaction successful!
          </p>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab("deposit")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === "deposit"
              ? "bg-blue-500 text-white shadow-lg"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <ArrowDownTrayIcon className="h-4 w-4 inline mr-2" />
          Deposit
        </button>
        <button
          onClick={() => setActiveTab("withdraw")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === "withdraw"
              ? "bg-blue-500 text-white shadow-lg"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <ArrowUpTrayIcon className="h-4 w-4 inline mr-2" />
          Withdraw
        </button>
      </div>

      {/* User Balances */}
      {balances && (
        <div className="bg-gray-800/30 rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Your Balances</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400">USDC Balance</p>
              <p className="text-lg font-semibold text-white">
                {formatAmount(balances.userBalance)} USDC
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Vault Shares</p>
              <p className="text-lg font-semibold text-white">
                {formatAmount(balances.userShares, 18)} VTK
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Tab */}
      <AnimatePresence>
        {activeTab === "deposit" && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount (USDC)
              </label>
              <input
                type="number"
                step="0.000001"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
              />
              
              {/* Deposit Limits */}
              {limits && (
                <div className="mt-2 text-xs text-gray-400">
                  <p>Min: {formatAmount(limits.minDeposit)} USDC</p>
                  <p>Max: {formatAmount(limits.maxDeposit)} USDC</p>
                </div>
              )}

              {/* Validation Error */}
              {depositValidation && (
                <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  {depositValidation}
                </p>
              )}

              {/* Preview */}
              {depositPreview && (
                <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-blue-400 flex items-center gap-1">
                    <InformationCircleIcon className="h-4 w-4" />
                    You will receive ~{formatAmount(depositPreview, 18)} vault tokens
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleDeposit}
              disabled={!!depositValidation || isTxPending || isTxLoading || !depositAmount}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(isTxPending || isTxLoading) ? "Processing..." : "Deposit"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Withdraw Tab */}
      <AnimatePresence>
        {activeTab === "withdraw" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount (USDC)
              </label>
              <input
                type="number"
                step="0.000001"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
              />
              
              {/* Withdraw Limits */}
              {limits && (
                <div className="mt-2 text-xs text-gray-400">
                  <p>Max: {formatAmount(limits.maxWithdraw)} USDC</p>
                </div>
              )}

              {/* Validation Error */}
              {withdrawValidation && (
                <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  {withdrawValidation}
                </p>
              )}

              {/* Preview */}
              {withdrawPreview && (
                <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-blue-400 flex items-center gap-1">
                    <InformationCircleIcon className="h-4 w-4" />
                    You will burn ~{formatAmount(withdrawPreview, 18)} vault tokens
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleWithdraw}
              disabled={!!withdrawValidation || isTxPending || isTxLoading || !withdrawAmount}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(isTxPending || isTxLoading) ? "Processing..." : "Withdraw"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
