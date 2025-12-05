"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { 
  BanknotesIcon,
  ChartBarIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { useVaultContract } from "~~/hooks/useVaultContract";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import deployedContracts from "~~/contracts/deployedContracts";

const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 11155111);

export default function VaultDetails() {
  const params = useParams();
  const router = useRouter();
  const vaultAddress = params?.address as string;
  const { address: userAddress, isConnected } = useAccount();
  const { vaultData, loading, deposit: handleDeposit } = useVaultContract(vaultAddress);
  
  const [depositAmount, setDepositAmount] = useState("");
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState<bigint>(0n);
  const [usdcAllowance, setUsdcAllowance] = useState<bigint>(0n);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [approving, setApproving] = useState(false);
  const [depositing, setDepositing] = useState(false);

  const usdcAddress = process.env.NEXT_PUBLIC_USDC_ADDRESS || "";
  const vaultABI = (deployedContracts as any)[CHAIN_ID]?.GroupVault?.abi || [];

  // Get USDC balance
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: usdcAddress as `0x${string}`,
    abi: [
      {
        type: "function",
        name: "balanceOf",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "approve",
        inputs: [
          { name: "spender", type: "address" },
          { name: "amount", type: "uint256" },
        ],
        outputs: [{ name: "", type: "bool" }],
        stateMutability: "nonpayable",
      },
      {
        type: "function",
        name: "allowance",
        inputs: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
        ],
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
      },
    ],
    functionName: "balanceOf",
    args: [userAddress || "0x0000000000000000000000000000000000000000"],
    query: {
      enabled: !!userAddress && !!usdcAddress,
    },
  });

  // Get USDC allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: usdcAddress as `0x${string}`,
    abi: [
      {
        type: "function",
        name: "allowance",
        inputs: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
        ],
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
      },
    ],
    functionName: "allowance",
    args: [
      userAddress || "0x0000000000000000000000000000000000000000",
      vaultAddress || "0x0000000000000000000000000000000000000000",
    ],
    query: {
      enabled: !!userAddress && !!usdcAddress && !!vaultAddress,
    },
  });

  const { writeContract: approve, data: approveHash } = useWriteContract();
  const { writeContract: deposit, data: depositHash } = useWriteContract();
  const { isLoading: isApproving, isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: isDepositing, isSuccess: depositSuccess } = useWaitForTransactionReceipt({ hash: depositHash });

  useEffect(() => {
    if (balance) setUsdcBalance(balance as bigint);
  }, [balance]);

  useEffect(() => {
    if (allowance) setUsdcAllowance(allowance as bigint);
  }, [allowance]);

  useEffect(() => {
    if (depositAmount && vaultAddress) {
      try {
        const amount = parseUnits(depositAmount, 6);
        setNeedsApproval(amount > (usdcAllowance || 0n));
      } catch {
        setNeedsApproval(false);
      }
    }
  }, [depositAmount, usdcAllowance, vaultAddress]);

  useEffect(() => {
    if (approveSuccess) {
      refetchAllowance();
      setApproving(false);
    }
  }, [approveSuccess, refetchAllowance]);

  useEffect(() => {
    if (depositSuccess) {
      setDepositing(false);
      setShowDepositModal(false);
      setDepositAmount("");
      // Refresh vault data and user balance
      refetchBalance();
      refetchAllowance();
      // Small delay to allow blockchain state to update
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }, [depositSuccess, refetchBalance, refetchAllowance]);

  const handleApprove = async () => {
    if (!usdcAddress || !vaultAddress || !depositAmount) return;
    
    setApproving(true);
    try {
      const amount = parseUnits(depositAmount, 6);
      approve({
        address: usdcAddress as `0x${string}`,
        abi: [
          {
            type: "function",
            name: "approve",
            inputs: [
              { name: "spender", type: "address" },
              { name: "amount", type: "uint256" },
            ],
            outputs: [{ name: "", type: "bool" }],
            stateMutability: "nonpayable",
          },
        ],
        functionName: "approve",
        args: [vaultAddress as `0x${string}`, amount],
      });
    } catch (err) {
      console.error("Approve error:", err);
      setApproving(false);
    }
  };

  const handleDepositClick = async () => {
    if (!vaultAddress || !depositAmount || !userAddress) return;

    if (needsApproval) {
      await handleApprove();
      return;
    }

    setDepositing(true);
    try {
      const amount = parseUnits(depositAmount, 6);
      deposit({
        address: vaultAddress as `0x${string}`,
        abi: vaultABI,
        functionName: "deposit",
        args: [amount, userAddress],
      });
    } catch (err) {
      console.error("Deposit error:", err);
      setDepositing(false);
    }
  };

  const maxDeposit = vaultData?.depositCap ? Number(formatUnits(vaultData.depositCap, 6)) : Infinity;
  const minDeposit = vaultData?.minDeposit ? Number(formatUnits(vaultData.minDeposit, 6)) : 0;
  const userBalanceUsdc = usdcBalance ? Number(formatUnits(usdcBalance, 6)) : 0;
  const totalAssetsUsdc = vaultData?.totalAssets ? Number(formatUnits(vaultData.totalAssets, 6)) : 0;
  const userShares = vaultData?.userShares ? Number(formatUnits(vaultData.userShares, 18)) : 0;
  const userBalanceValue = vaultData?.userBalance ? Number(formatUnits(vaultData.userBalance, 6)) : 0;

  const depositAmountNum = parseFloat(depositAmount) || 0;
  const isValidDeposit = 
    depositAmountNum > 0 &&
    depositAmountNum >= minDeposit &&
    depositAmountNum <= userBalanceUsdc &&
    depositAmountNum <= (maxDeposit - totalAssetsUsdc);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {vaultData?.name || "Investment Vault"}
              </h1>
              <p className="text-gray-400">
                {vaultData?.symbol || "VAULT"} • {vaultAddress?.slice(0, 10)}...{vaultAddress?.slice(-8)}
              </p>
            </div>
            {isConnected ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowDepositModal(true)}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors"
              >
                Deposit USDC
              </motion.button>
            ) : (
              <RainbowKitCustomConnectButton />
            )}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <BanknotesIcon className="h-5 w-5 text-blue-400" />
              </div>
              <span className="text-gray-400 text-sm">Total Value Locked</span>
            </div>
            <div className="text-2xl font-bold text-white">
              ${totalAssetsUsdc.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <ChartBarIcon className="h-5 w-5 text-emerald-400" />
              </div>
              <span className="text-gray-400 text-sm">Your Investment</span>
            </div>
            <div className="text-2xl font-bold text-emerald-400">
              ${userBalanceValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <UserGroupIcon className="h-5 w-5 text-purple-400" />
              </div>
              <span className="text-gray-400 text-sm">Your Shares</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {userShares.toLocaleString(undefined, { maximumFractionDigits: 4 })}
            </div>
          </div>

          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <ArrowTrendingUpIcon className="h-5 w-5 text-yellow-400" />
              </div>
              <span className="text-gray-400 text-sm">Status</span>
            </div>
            <div className={`text-lg font-bold ${vaultData?.isPaused ? "text-yellow-400" : "text-emerald-400"}`}>
              {vaultData?.isPaused ? "Paused" : "Active"}
            </div>
          </div>
        </motion.div>

        {/* Vault Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#12121a] border border-gray-800/50 rounded-xl p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Vault Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-gray-400 text-sm">Minimum Deposit</span>
              <p className="text-white font-medium">${minDeposit.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Deposit Cap</span>
              <p className="text-white font-medium">${maxDeposit.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Allowlist</span>
              <p className="text-white font-medium">
                {vaultData?.allowlistEnabled ? "Enabled" : "Public"}
              </p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Asset</span>
              <p className="text-white font-medium">USDC</p>
            </div>
          </div>
        </motion.div>

        {/* Deposit Modal */}
        <AnimatePresence>
          {showDepositModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowDepositModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#12121a] border border-gray-800/50 rounded-2xl p-6 max-w-md w-full"
              >
                <h2 className="text-2xl font-bold text-white mb-4">Deposit USDC</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Amount (USDC)
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-[#0f0f15] border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                    <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                      <span>Your balance: ${userBalanceUsdc.toLocaleString()}</span>
                      <button
                        onClick={() => setDepositAmount(userBalanceUsdc.toString())}
                        className="text-emerald-400 hover:text-emerald-300"
                      >
                        Max
                      </button>
                    </div>
                  </div>

                  {depositAmountNum > 0 && (
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-blue-400 mb-1">
                        <InformationCircleIcon className="h-4 w-4" />
                        <span>Deposit Details</span>
                      </div>
                      <div className="text-xs text-gray-400 space-y-1">
                        <p>Min deposit: ${minDeposit.toLocaleString()}</p>
                        <p>Remaining capacity: ${(maxDeposit - totalAssetsUsdc).toLocaleString()}</p>
                      </div>
                    </div>
                  )}

                  {!isValidDeposit && depositAmountNum > 0 && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-red-400">
                        <ExclamationTriangleIcon className="h-4 w-4" />
                        <span>
                          {depositAmountNum < minDeposit
                            ? `Minimum deposit is $${minDeposit.toLocaleString()}`
                            : depositAmountNum > userBalanceUsdc
                            ? "Insufficient balance"
                            : depositAmountNum > (maxDeposit - totalAssetsUsdc)
                            ? "Exceeds deposit cap"
                            : "Invalid amount"}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    {needsApproval ? (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleApprove}
                        disabled={approving || isApproving || !isValidDeposit}
                        className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
                      >
                        {approving || isApproving ? "Approving..." : "Approve USDC"}
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleDepositClick}
                        disabled={depositing || isDepositing || !isValidDeposit}
                        className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
                      >
                        {depositing || isDepositing ? "Depositing..." : "Deposit"}
                      </motion.button>
                    )}
                    <button
                      onClick={() => setShowDepositModal(false)}
                      className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
