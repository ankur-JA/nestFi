"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useReadContract, usePublicClient, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { 
  MagnifyingGlassIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import deployedContracts from "~~/contracts/deployedContracts";

const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 11155111);

interface VaultInfo {
  address: string;
  name: string;
  symbol: string;
  totalAssets: string;
  isPaused: boolean;
}

export default function InvestorVaultsPage() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const factoryAddress = (deployedContracts as any)[CHAIN_ID]?.VaultFactory?.address;
  const [allVaults, setAllVaults] = useState<VaultInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVault, setSelectedVault] = useState<VaultInfo | null>(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [usdcBalance, setUsdcBalance] = useState<bigint>(0n);
  const [usdcAllowance, setUsdcAllowance] = useState<bigint>(0n);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [approving, setApproving] = useState(false);
  const [depositing, setDepositing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const usdcAddress = process.env.NEXT_PUBLIC_USDC_ADDRESS || "";
  
  // Get all vault addresses from factory
  const { data: allVaultAddresses, refetch: refetchVaults } = useReadContract({
    address: factoryAddress as `0x${string}`,
    abi: ((deployedContracts as any)[CHAIN_ID]?.VaultFactory?.abi) || [],
    functionName: "getAllVaults" as any,
    query: {
      enabled: !!factoryAddress,
      refetchInterval: 30000,
    },
  });

  // Fetch vault details for all vaults
  useEffect(() => {
    const fetchAllVaults = async () => {
      if (!allVaultAddresses || !Array.isArray(allVaultAddresses) || allVaultAddresses.length === 0) {
        setAllVaults([]);
        return;
      }

      setIsLoading(true);
      try {
        const vaultDetails = await Promise.all(
          (allVaultAddresses as string[]).map(async (vaultAddress) => {
            try {
              const response = await fetch(`/api/vault/info?address=${vaultAddress}`);
              if (!response.ok) return null;
              const data = await response.json();
              return {
                address: vaultAddress,
                name: data.name || "Unnamed Vault",
                symbol: data.symbol || "---",
                totalAssets: data.totalAssets || "0",
                isPaused: data.isPaused || false,
              };
            } catch (err) {
              console.error(`Error fetching vault ${vaultAddress}:`, err);
              return null;
            }
          })
        );
        
        setAllVaults(vaultDetails.filter(Boolean) as VaultInfo[]);
      } catch (err) {
        console.error("Error fetching vaults:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllVaults();
  }, [allVaultAddresses]);
  const [searchTerm, setSearchTerm] = useState("");

  // USDC contract ABI
  const usdcABI = [
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
  ];

  // Get GroupVault ABI - for localhost, we need to provide the ABI manually
  // since deployedContracts might not have it
  const baseABI = (deployedContracts as any)[CHAIN_ID]?.GroupVault?.abi || [];
  
  // Essential GroupVault ABI functions for deposits
  const essentialABI = [
    {
      type: "function",
      name: "deposit",
      inputs: [
        { name: "assets", type: "uint256", internalType: "uint256" },
        { name: "receiver", type: "address", internalType: "address" },
      ],
      outputs: [{ name: "shares", type: "uint256", internalType: "uint256" }],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "balanceOf",
      inputs: [{ name: "account", type: "address", internalType: "address" }],
      outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "totalAssets",
      inputs: [],
      outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "asset",
      inputs: [],
      outputs: [{ name: "", type: "address", internalType: "address" }],
      stateMutability: "view",
    },
  ];
  
  // Check if deposit function exists in base ABI
  const hasDeposit = baseABI.some((item: any) => item.name === "deposit" && item.type === "function");
  
  // Merge ABIs: use base if it has deposit, otherwise combine base with essential
  const vaultABI = hasDeposit ? baseABI : [...baseABI, ...essentialABI];

  // Get USDC balance
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: usdcAddress as `0x${string}`,
    abi: usdcABI,
    functionName: "balanceOf",
    args: [address || "0x0000000000000000000000000000000000000000"],
    query: {
      enabled: !!address && !!usdcAddress,
    },
  });

  // Get USDC allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: usdcAddress as `0x${string}`,
    abi: usdcABI,
    functionName: "allowance",
    args: [
      address || "0x0000000000000000000000000000000000000000",
      selectedVault?.address || "0x0000000000000000000000000000000000000000",
    ],
    query: {
      enabled: !!address && !!usdcAddress && !!selectedVault,
    },
  });

  const { writeContract: approve, data: approveHash, error: approveError } = useWriteContract();
  const { writeContract: deposit, data: depositHash, error: depositError } = useWriteContract();
  const { isLoading: isApproving, isSuccess: approveSuccess, isError: approveTxError } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: isDepositing, isSuccess: depositSuccess, isError: depositTxError } = useWaitForTransactionReceipt({ hash: depositHash });

  useEffect(() => {
    if (balance) setUsdcBalance(balance as bigint);
  }, [balance]);

  useEffect(() => {
    if (allowance) setUsdcAllowance(allowance as bigint);
  }, [allowance]);

  useEffect(() => {
    if (depositAmount && selectedVault) {
      try {
        const amount = parseUnits(depositAmount, 6);
        setNeedsApproval(amount > (usdcAllowance || 0n));
      } catch {
        setNeedsApproval(false);
      }
    }
  }, [depositAmount, usdcAllowance, selectedVault]);

  useEffect(() => {
    if (approveSuccess) {
      console.log("✅ Approval confirmed, refetching allowance...");
      refetchAllowance();
      setApproving(false);
    }
  }, [approveSuccess, refetchAllowance]);

  useEffect(() => {
    if (depositSuccess) {
      console.log("✅ Deposit transaction confirmed!");
      setDepositing(false);
      setShowDepositModal(false);
      setDepositAmount("");
      setSuccessMessage("Deposit successful!");
      
      // Refetch balance multiple times to ensure it updates (blockchain state propagation delay)
      refetchBalance();
      refetchAllowance();
      refetchVaults();
      
      setTimeout(() => {
        refetchBalance();
        refetchAllowance();
      }, 1000);
      
      setTimeout(() => {
        refetchBalance();
        refetchAllowance();
        refetchVaults();
      }, 3000);
      
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    }
  }, [depositSuccess, refetchBalance, refetchAllowance, refetchVaults]);

  // Handle deposit errors
  useEffect(() => {
    if (depositError || depositTxError) {
      console.error("❌ Deposit error:", depositError || depositTxError);
      setDepositing(false);
      setSuccessMessage("");
      // You could set an error message here if you have an error state
    }
  }, [depositError, depositTxError]);

  const handleApprove = async () => {
    if (!usdcAddress || !selectedVault || !depositAmount) return;
    
    setApproving(true);
    try {
      const amount = parseUnits(depositAmount, 6);
      approve({
        address: usdcAddress as `0x${string}`,
        abi: usdcABI,
        functionName: "approve",
        args: [selectedVault.address as `0x${string}`, amount],
      });
    } catch (err) {
      console.error("Approve error:", err);
      setApproving(false);
    }
  };

  const handleDeposit = async () => {
    if (!selectedVault || !depositAmount || !address) {
      console.error("Missing required data for deposit");
      return;
    }

    if (needsApproval) {
      console.log("Approval needed, calling handleApprove...");
      await handleApprove();
      return;
    }

    setDepositing(true);
    try {
      const amount = parseUnits(depositAmount, 6);
      console.log("📤 Initiating deposit:", {
        vault: selectedVault.address,
        amount: depositAmount,
        amountWei: amount.toString(),
        receiver: address,
      });
      
      deposit({
        address: selectedVault.address as `0x${string}`,
        abi: vaultABI,
        functionName: "deposit",
        args: [amount, address],
      });
    } catch (err) {
      console.error("❌ Deposit error:", err);
      setDepositing(false);
      setSuccessMessage("");
    }
  };

  const openDepositModal = (vault: VaultInfo) => {
    setSelectedVault(vault);
    setShowDepositModal(true);
    setDepositAmount("");
  };

  const userBalanceUsdc = usdcBalance ? Number(formatUnits(usdcBalance, 6)) : 0;
  const depositAmountNum = parseFloat(depositAmount) || 0;
  const isValidDeposit = depositAmountNum > 0 && depositAmountNum <= userBalanceUsdc;

  // Filter vaults by search
  const filteredVaults = allVaults?.filter(vault => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      vault.name?.toLowerCase().includes(term) ||
      vault.symbol?.toLowerCase().includes(term)
    );
  }) || [];

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Discover Vaults</h1>
          <p className="text-gray-400">
            Browse and invest in curated DeFi vaults.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative max-w-md">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search vault by symbol..."
              className="w-full pl-12 pr-4 py-3 bg-[#12121a] border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            />
          </div>
        </motion.div>

        {/* Vaults Table */}
        {isLoading ? (
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl overflow-hidden">
            <div className="animate-pulse">
              <div className="h-14 bg-gray-800/50" />
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-20 border-t border-gray-800/50 bg-gray-800/20" />
              ))}
            </div>
          </div>
        ) : filteredVaults.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#12121a] border border-gray-800/50 rounded-xl overflow-hidden"
          >
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-[#0f0f15] border-b border-gray-800/50 text-sm font-medium text-gray-500">
              <div className="col-span-4">Vault Name</div>
              <div className="col-span-2 text-center">Symbol</div>
              <div className="col-span-2 text-center">TVL</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-2 text-center">Action</div>
            </div>

            {/* Table Body */}
            {filteredVaults.map((vault, index) => (
              <motion.div
                key={vault.address}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="grid grid-cols-12 gap-4 px-6 py-5 border-b border-gray-800/30 last:border-b-0 hover:bg-white/[0.02] transition-colors items-center"
              >
                <div className="col-span-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-400">
                        {vault.symbol?.slice(0, 2) || "V"}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-white">{vault.name || "Unnamed Vault"}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[200px]">
                        {vault.address?.slice(0, 10)}...{vault.address?.slice(-8)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-span-2 text-center">
                  <span className="px-3 py-1 bg-gray-800/50 rounded-full text-sm font-medium text-gray-300">
                    {vault.symbol || "—"}
                  </span>
                </div>
                <div className="col-span-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <CurrencyDollarIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-white font-medium">
                      {parseFloat(vault.totalAssets || "0").toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="col-span-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500" />
                    <span className="text-emerald-400 font-medium">
                      {vault.isPaused ? "Paused" : "Active"}
                    </span>
                  </div>
                </div>
                <div className="col-span-2 text-center">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openDepositModal(vault)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg inline-flex items-center gap-1.5 transition-colors"
                  >
                    Deposit
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#12121a] border border-gray-800/50 rounded-xl p-12 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-gray-800/50 flex items-center justify-center mx-auto mb-6">
              <MagnifyingGlassIcon className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm ? "No vaults found" : "No vaults available"}
            </h3>
            <p className="text-gray-400">
              {searchTerm 
                ? "Try a different search term." 
                : "Check back later for new investment opportunities."}
            </p>
          </motion.div>
        )}

        {/* Deposit Modal */}
        <AnimatePresence>
          {showDepositModal && selectedVault && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowDepositModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#12121a] border border-gray-800/50 rounded-2xl p-6 max-w-md w-full"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">Deposit to Vault</h2>
                    <p className="text-sm text-gray-400 mt-1">{selectedVault.name}</p>
                  </div>
                  <button
                    onClick={() => setShowDepositModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Success Message */}
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2"
                  >
                    <CheckCircleIcon className="h-5 w-5 text-emerald-400" />
                    <span className="text-emerald-400 text-sm">{successMessage}</span>
                  </motion.div>
                )}

                {/* Vault Info */}
                <div className="mb-6 p-4 bg-black/20 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Total Value Locked</span>
                    <span className="text-white font-semibold">
                      ${parseFloat(selectedVault.totalAssets || "0").toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Your USDC Balance</span>
                    <span className="text-white font-semibold">
                      {userBalanceUsdc.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDC
                    </span>
                  </div>
                </div>

                {/* Deposit Amount */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Deposit Amount (USDC)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="flex-1 px-4 py-3 bg-black/30 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 placeholder:text-gray-600"
                    />
                    <button
                      onClick={() => setDepositAmount(userBalanceUsdc.toString())}
                      className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-xl transition-colors"
                    >
                      Max
                    </button>
                  </div>
                  {depositAmountNum > userBalanceUsdc && (
                    <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      Insufficient balance
                    </p>
                  )}
                </div>

                {/* Action Button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleDeposit}
                  disabled={!isValidDeposit || approving || depositing || isApproving || isDepositing}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
                >
                  {approving || isApproving
                    ? "Approving..."
                    : needsApproval
                    ? "Approve USDC"
                    : depositing || isDepositing
                    ? "Depositing..."
                    : "Deposit"}
                </motion.button>
                
                {(depositError || depositTxError) && (
                  <div className="mt-2 text-sm text-red-400 flex items-center gap-2">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    Deposit failed. Please check console for details.
                  </div>
                )}

                {!isConnected && (
                  <p className="mt-4 text-center text-sm text-gray-400">
                    Please connect your wallet to deposit
                  </p>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

