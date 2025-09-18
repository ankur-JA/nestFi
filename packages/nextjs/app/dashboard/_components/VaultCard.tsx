"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { BanknotesIcon, StarIcon, UserIcon } from "@heroicons/react/24/outline";
import { useVaultContract } from "../../../hooks/useVaultContract";
import { formatUnits } from "viem";
import { useRouter } from "next/navigation";

interface VaultInfo {
  address: string;
  owner: string;
  asset: string;
  name: string;
  symbol: string;
  allowlistEnabled: boolean;
  depositCap: string;
  minDeposit: string;
  totalAssets?: string;
  totalSupply?: string;
  userBalance?: string;
  userShares?: string;
  isPaused?: boolean;
  isAdmin: boolean;
  isMember?: boolean;
}

interface VaultCardProps {
  vaultAddress: string;
  isCurrentUserAdmin: boolean;
  vaultInfo?: VaultInfo;
}

const VaultCard: React.FC<VaultCardProps> = ({ 
  vaultAddress, 
  isCurrentUserAdmin,
  vaultInfo 
}) => {
  const { vaultData, loading } = useVaultContract(vaultAddress);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  // Use vaultInfo if provided, otherwise use vaultData
  const displayName = vaultInfo?.name || vaultData?.name || "Vault";
  const displaySymbol = vaultInfo?.symbol || vaultData?.symbol || "vTKN";
  const totalAssets = vaultInfo?.totalAssets || vaultData?.totalAssets?.toString() || "0";
  const totalShares = vaultInfo?.totalSupply || vaultData?.totalSupply?.toString() || "0";
  const userBalance = vaultInfo?.userBalance || vaultData?.userBalance?.toString() || "0";
  const userShares = vaultInfo?.userBalance || vaultData?.userShares?.toString() || "0";

  // Format values for display
  const formatUSDC = (value: string) => {
    try {
      return parseFloat(formatUnits(BigInt(value), 6)).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } catch {
      return "0.00";
    }
  };

  const formatShares = (value: string) => {
    try {
      return parseFloat(formatUnits(BigInt(value), 18)).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } catch {
      return "0.00";
    }
  };

  const handleView = useCallback(() => {
    router.push(`/dashboard/${vaultAddress}`);
  }, [router, vaultAddress]);

  const handlePrimary = useCallback(() => {
    // For now, both Manage (admin) and Deposit (member) go to the same detail page
    router.push(`/dashboard/${vaultAddress}`);
  }, [router, vaultAddress]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-red-500/20 rounded-xl p-6 hover:border-red-500/40 transition-all duration-300 cursor-pointer group"
    >
      {/* Header with Admin/Member Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
            <BanknotesIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white group-hover:text-red-400 transition-colors">
              {displayName}
            </h3>
            <p className="text-sm text-gray-400">{displaySymbol}</p>
          </div>
        </div>
        
        {/* Admin/Member Badge */}
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
          isCurrentUserAdmin 
            ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
            : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
        }`}>
          {isCurrentUserAdmin ? (
            <>
              <StarIcon className="h-3 w-3" />
              <span>Admin</span>
            </>
          ) : (
            <>
              <UserIcon className="h-3 w-3" />
              <span>Member</span>
            </>
          )}
        </div>
      </div>

      {/* Vault Stats */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Total Assets</span>
          <span className="text-white font-medium">
            {loading ? "..." : `${formatUSDC(totalAssets)} USDC`}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Total Shares</span>
          <span className="text-white font-medium">
            {loading ? "..." : formatShares(totalShares)}
          </span>
        </div>

        {!isCurrentUserAdmin && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Your Balance</span>
              <span className="text-blue-400 font-medium">
                {loading ? "..." : `${formatUSDC(userBalance)} USDC`}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Your Shares</span>
              <span className="text-blue-400 font-medium">
                {loading ? "..." : formatShares(userShares)}
              </span>
            </div>
          </>
        )}

        {/* Vault Settings */}
        {vaultInfo && (
          <div className="pt-3 border-t border-gray-700/50">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Min Deposit</span>
              <span className="text-gray-300">{formatUSDC(vaultInfo.minDeposit)} USDC</span>
            </div>
            {vaultInfo.depositCap !== "0" && (
              <div className="flex justify-between items-center text-xs mt-1">
                <span className="text-gray-400">Deposit Cap</span>
                <span className="text-gray-300">{formatUSDC(vaultInfo.depositCap)} USDC</span>
              </div>
            )}
            {vaultInfo.allowlistEnabled && (
              <div className="flex justify-between items-center text-xs mt-1">
                <span className="text-gray-400">Allowlist</span>
                <span className="text-yellow-400">Enabled</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex">
        <button onClick={handleView} className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-red-600 hover:to-pink-600 transition-all duration-200">
          View Details
        </button>
      </div>
    </motion.div>
  );
};

export default VaultCard;
