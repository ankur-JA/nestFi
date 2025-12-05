"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import {
  ArrowsRightLeftIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  PauseIcon,
  PlayIcon,
  BanknotesIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useVaultManagement } from "~~/hooks/useVaultManagement";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

// Known token addresses (would come from env in production)
const KNOWN_TOKENS: Record<string, { symbol: string; decimals: number }> = {
  "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238": { symbol: "USDC", decimals: 6 },
  "0x68194a729C2450ad26072b3D33ADaCbcef39D574": { symbol: "DAI", decimals: 18 },
};

// Strategy types
const STRATEGY_TYPES = [
  { 
    id: "uniswap", 
    name: "Uniswap V3", 
    description: "Provide liquidity to USDC-DAI pool", 
    icon: "🦄",
    requiresTwoTokens: true,
    tokens: ["USDC", "DAI"]
  },
  { 
    id: "aave", 
    name: "Aave V3", 
    description: "Lend USDC for yield", 
    icon: "👻",
    requiresTwoTokens: false,
    tokens: ["USDC"]
  },
  { 
    id: "velodrome", 
    name: "Velodrome", 
    description: "LP on Velodrome DEX", 
    icon: "🚴",
    requiresTwoTokens: true,
    tokens: ["USDC", "DAI"]
  },
  { 
    id: "beefy", 
    name: "Beefy", 
    description: "Auto-compound LP rewards", 
    icon: "🐄",
    requiresTwoTokens: false,
    tokens: ["USDC"]
  },
];

type Tab = "overview" | "swap" | "invest" | "settings";

// Custom Token Select Component
const TokenSelect = ({
  value,
  onChange,
  options,
  placeholder = "Select token",
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ address: string; symbol: string; balance: string }>;
  placeholder?: string;
  disabled?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedToken = options.find((opt) => opt.address === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-4 py-3 bg-black/30 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition-all flex items-center justify-between ${
          disabled ? "opacity-50 cursor-not-allowed" : "hover:border-gray-700"
        }`}
      >
        <div className="flex items-center gap-3">
          {selectedToken ? (
            <>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-[10px] px-1">
                {selectedToken.symbol}
              </div>
              <div className="text-left">
                <div className="text-white font-medium">{selectedToken.symbol}</div>
                <div className="text-gray-400 text-xs">
                  {parseFloat(selectedToken.balance).toFixed(2)} {selectedToken.symbol}
                </div>
              </div>
            </>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <ChevronDownIcon
          className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-[#1a1a24] border border-gray-800 rounded-xl shadow-2xl max-h-64 overflow-auto"
          >
            {options.length > 0 ? (
              options.map((option) => (
                <button
                  key={option.address}
                  type="button"
                  onClick={() => {
                    onChange(option.address);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-black/50 transition-colors ${
                    value === option.address ? "bg-emerald-500/10 border-l-2 border-emerald-500" : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-[10px] px-1">
                    {option.symbol}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-white font-medium">{option.symbol}</div>
                    <div className="text-gray-400 text-xs">
                      {parseFloat(option.balance).toFixed(2)} {option.symbol}
                    </div>
                  </div>
                  {value === option.address && (
                    <CheckCircleIcon className="h-5 w-5 text-emerald-400" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-500 text-center">No tokens available</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Custom Strategy Select Component
const StrategySelect = ({
  value,
  onChange,
  options,
  placeholder = "Select strategy",
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ id: string; name: string; icon: string; description: string; isAdded: boolean }>;
  placeholder?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedStrategy = options.find((opt) => opt.id === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-black/30 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition-all flex items-center justify-between hover:border-gray-700"
      >
        <div className="flex items-center gap-3">
          {selectedStrategy ? (
            <>
              <span className="text-2xl">{selectedStrategy.icon}</span>
              <div className="text-left">
                <div className="text-white font-medium">{selectedStrategy.name}</div>
                <div className="text-gray-400 text-xs">{selectedStrategy.description}</div>
              </div>
            </>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <ChevronDownIcon
          className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-[#1a1a24] border border-gray-800 rounded-xl shadow-2xl max-h-64 overflow-auto"
          >
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onChange(option.id);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-black/50 transition-colors ${
                  value === option.id ? "bg-emerald-500/10 border-l-2 border-emerald-500" : ""
                }`}
              >
                <span className="text-2xl">{option.icon}</span>
                <div className="flex-1 text-left">
                  <div className="text-white font-medium">{option.name}</div>
                  <div className="text-gray-400 text-xs">{option.description}</div>
                </div>
                <div className="flex items-center gap-2">
                  {option.isAdded && (
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                      Added
                    </span>
                  )}
                  {value === option.id && <CheckCircleIcon className="h-5 w-5 text-emerald-400" />}
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function CuratorVaultPage() {
  const params = useParams();
  const router = useRouter();
  const vaultAddress = params.address as string;
  const { address, isConnected } = useAccount();

  const {
    isOwner,
    loading,
    error,
    tokenBalances,
    strategies,
    vaultState,
    refreshData,
    swapTokens,
    setSwapRouter,
    invest,
    investInStrategy,
    divest,
    divestFromStrategy,
    togglePause,
  } = useVaultManagement(vaultAddress);

  // Fetch vault name
  const [vaultName, setVaultName] = useState<string>("Vault Management");
  
  useEffect(() => {
    const fetchVaultName = async () => {
      try {
        const response = await fetch(`/api/vault/info?address=${vaultAddress}`);
        if (response.ok) {
          const data = await response.json();
          if (data.name && data.name !== "Investment Vault") {
            setVaultName(data.name);
          }
        }
      } catch (err) {
        console.error("Error fetching vault name:", err);
      }
    };
    
    if (vaultAddress) {
      fetchVaultName();
    }
  }, [vaultAddress]);

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [swapForm, setSwapForm] = useState({
    tokenIn: "",
    tokenOut: "",
    amountIn: "",
    amountOutMin: "0",
  });
  const [investForm, setInvestForm] = useState({
    strategy: "",
    token0: "",
    token1: "",
    amount0: "",
    amount1: "",
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Not connected
  if (!isConnected) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#12121a] border border-gray-800/50 rounded-2xl p-12 text-center max-w-md"
        >
          <h2 className="text-2xl font-bold text-white mb-3">Connect Wallet</h2>
          <p className="text-gray-400 mb-8">Connect your wallet to manage this vault.</p>
          <RainbowKitCustomConnectButton />
        </motion.div>
      </div>
    );
  }

  // Not owner
  if (!loading && !isOwner) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#12121a] border border-gray-800/50 rounded-2xl p-12 text-center max-w-md"
        >
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Access Denied</h2>
          <p className="text-gray-400 mb-8">You are not the curator of this vault.</p>
          <Link href="/curator/manage">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="py-3 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl"
            >
              Back to My Vaults
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const handleSwap = async () => {
    if (!swapForm.tokenIn || !swapForm.tokenOut || !swapForm.amountIn) return;
    setActionLoading(true);
    try {
      await swapTokens(swapForm.tokenIn, swapForm.tokenOut, swapForm.amountIn, swapForm.amountOutMin);
      setSuccessMessage("Swap initiated!");
      setTimeout(() => {
        setSuccessMessage("");
        refreshData();
      }, 3000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleInvest = async () => {
    const selectedStrategy = STRATEGY_TYPES.find((s) => s.id === investForm.strategy);
    if (!investForm.strategy || !investForm.token0 || !investForm.amount0) return;
    if (selectedStrategy?.requiresTwoTokens && (!investForm.token1 || !investForm.amount1)) return;
    
    setActionLoading(true);
    try {
      // For now, invest the first token amount
      // In the future, for LP strategies, we'd need to handle both tokens
      await investInStrategy(investForm.strategy, investForm.token0, investForm.amount0);
      
      // If two tokens required, we could swap or invest separately
      if (selectedStrategy?.requiresTwoTokens && investForm.token1 && investForm.amount1) {
        // For LP strategies, you might want to swap first or invest both separately
        // This is a placeholder - actual implementation depends on strategy contract
        await investInStrategy(investForm.strategy, investForm.token1, investForm.amount1);
      }
      
      setSuccessMessage("Investment initiated!");
      setTimeout(() => {
        setSuccessMessage("");
        refreshData();
        // Reset form
        setInvestForm({
          strategy: "",
          token0: "",
          token1: "",
          amount0: "",
          amount1: "",
        });
      }, 3000);
    } finally {
      setActionLoading(false);
    }
  };


  const tabs = [
    { id: "overview", label: "Overview", icon: ChartBarIcon },
    { id: "swap", label: "Swap", icon: ArrowsRightLeftIcon },
    { id: "invest", label: "Invest", icon: BanknotesIcon },
    { id: "settings", label: "Settings", icon: Cog6ToothIcon },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Vaults
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{vaultName}</h1>
              <p className="text-gray-400 font-mono text-sm">
                {vaultAddress.slice(0, 6)}...{vaultAddress.slice(-4)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => refreshData()}
                disabled={loading}
                className="p-2 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors"
              >
                <ArrowPathIcon className={`h-5 w-5 text-gray-400 ${loading ? "animate-spin" : ""}`} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => togglePause()}
                className={`py-2 px-4 rounded-xl flex items-center gap-2 font-medium transition-colors ${
                  vaultState?.isPaused
                    ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                    : "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                }`}
              >
                {vaultState?.isPaused ? (
                  <>
                    <PlayIcon className="h-4 w-4" />
                    Unpause
                  </>
                ) : (
                  <>
                    <PauseIcon className="h-4 w-4" />
                    Pause
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3"
            >
              <CheckCircleIcon className="h-5 w-5 text-emerald-400" />
              <span className="text-emerald-400">{successMessage}</span>
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3"
            >
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              <span className="text-red-400">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-[#12121a] p-1 rounded-xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id ? "bg-emerald-500 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
                  <div className="text-gray-400 text-sm mb-2">Total Assets</div>
                  <div className="text-2xl font-bold text-white">${vaultState?.totalAssets || "0"}</div>
                </div>
                <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
                  <div className="text-gray-400 text-sm mb-2">In Vault</div>
                  <div className="text-2xl font-bold text-emerald-400">${vaultState?.assetsInVault || "0"}</div>
                </div>
                <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
                  <div className="text-gray-400 text-sm mb-2">In Strategies</div>
                  <div className="text-2xl font-bold text-blue-400">${vaultState?.assetsInStrategy || "0"}</div>
                </div>
                <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
                  <div className="text-gray-400 text-sm mb-2">Status</div>
                  <div
                    className={`text-2xl font-bold ${vaultState?.isPaused ? "text-yellow-400" : "text-emerald-400"}`}
                  >
                    {vaultState?.isPaused ? "Paused" : "Active"}
                  </div>
                </div>
              </div>

              {/* Token Balances */}
              <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <CurrencyDollarIcon className="h-5 w-5 text-emerald-400" />
                  Token Balances
                </h3>
                <div className="space-y-3">
                  {tokenBalances.length > 0 ? (
                    tokenBalances.map((token, index) => {
                      const source = token.source || "vault";
                      const strategyName = token.strategyName;
                      const isStrategyToken = source === "strategy";
                      
                      return (
                        <div
                          key={`${token.address}-${index}`}
                          className={`flex items-center justify-between p-4 rounded-xl ${
                            isStrategyToken ? "bg-blue-500/10 border border-blue-500/20" : "bg-black/20"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-[11px] px-1.5 ${
                              isStrategyToken 
                                ? "bg-gradient-to-br from-blue-500 to-cyan-500" 
                                : "bg-gradient-to-br from-blue-500 to-purple-500"
                            }`}>
                              {token.symbol}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-white font-medium">{token.symbol}</span>
                                {isStrategyToken && (
                                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                                    {strategyName || "Strategy"}
                                  </span>
                                )}
                              </div>
                              <div className="text-gray-500 text-sm font-mono">
                                {token.address.slice(0, 6)}...{token.address.slice(-4)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-semibold">
                              {parseFloat(token.balance).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 6,
                              })}
                            </div>
                            <div className="text-gray-500 text-sm">{token.symbol}</div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-gray-500 py-8">No tokens in vault</div>
                  )}
                </div>
              </div>

              {/* Strategies */}
              <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <ChartBarIcon className="h-5 w-5 text-blue-400" />
                  Active Strategies
                </h3>
                <div className="space-y-3">
                  {strategies.length > 0 ? (
                    strategies.map((strategy) => (
                      <div
                        key={strategy.name}
                        className="flex items-center justify-between p-4 bg-black/20 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">
                            {STRATEGY_TYPES.find((s) => s.id === strategy.name)?.icon || "📊"}
                          </div>
                          <div>
                            <div className="text-white font-medium capitalize">{strategy.name}</div>
                            <div className="text-gray-500 text-sm font-mono">
                              {strategy.address.slice(0, 6)}...{strategy.address.slice(-4)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-semibold">${parseFloat(strategy.assets).toLocaleString()}</div>
                          <div className="text-gray-500 text-sm">Invested</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">No active strategies</div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "swap" && (
            <motion.div
              key="swap"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-lg mx-auto"
            >
              <div className="bg-[#12121a] border border-gray-800/50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <ArrowsRightLeftIcon className="h-5 w-5 text-emerald-400" />
                  Swap Tokens
                </h3>

                <div className="space-y-4">
                  {/* From Token */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">From</label>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <TokenSelect
                          value={swapForm.tokenIn}
                          onChange={(value) => setSwapForm({ ...swapForm, tokenIn: value })}
                          options={tokenBalances.map((token) => ({
                            address: token.address,
                            symbol: token.symbol,
                            balance: token.balance,
                          }))}
                          placeholder="Select token"
                        />
                      </div>
                      <input
                        type="text"
                        value={swapForm.amountIn}
                        onChange={(e) => setSwapForm({ ...swapForm, amountIn: e.target.value })}
                        placeholder="0.00"
                        className="w-32 px-4 py-3 bg-black/30 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 placeholder:text-gray-600"
                      />
                    </div>
                  </div>

                  {/* Swap Arrow */}
                  <div className="flex justify-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <ArrowsRightLeftIcon className="h-5 w-5 text-emerald-400 rotate-90" />
                    </div>
                  </div>

                  {/* To Token */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">To</label>
                    <TokenSelect
                      value={swapForm.tokenOut}
                      onChange={(value) => setSwapForm({ ...swapForm, tokenOut: value })}
                      options={Object.entries(KNOWN_TOKENS).map(([addr, info]) => {
                        const balance = tokenBalances.find((t) => t.address.toLowerCase() === addr.toLowerCase());
                        return {
                          address: addr,
                          symbol: info.symbol,
                          balance: balance ? balance.balance : "0",
                        };
                      })}
                      placeholder="Select token"
                    />
                  </div>

                  {/* Min Output */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Minimum Output (slippage protection)</label>
                    <input
                      type="text"
                      value={swapForm.amountOutMin}
                      onChange={(e) => setSwapForm({ ...swapForm, amountOutMin: e.target.value })}
                      placeholder="0"
                      className="w-full px-4 py-3 bg-black/30 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleSwap}
                    disabled={!swapForm.tokenIn || !swapForm.tokenOut || !swapForm.amountIn || actionLoading}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
                  >
                    {actionLoading ? "Processing..." : "Swap Tokens"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "invest" && (
            <motion.div
              key="invest"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Invest Panel */}
              <div className="bg-[#12121a] border border-gray-800/50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <ArrowUpTrayIcon className="h-5 w-5 text-emerald-400" />
                  Invest in Strategy
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Select Strategy</label>
                    <StrategySelect
                      value={investForm.strategy}
                      onChange={(value) => {
                        // Reset token inputs when strategy changes
                        setInvestForm({
                          strategy: value,
                          token0: "",
                          token1: "",
                          amount0: "",
                          amount1: "",
                        });
                      }}
                      options={STRATEGY_TYPES.map((strategy) => ({
                        id: strategy.id,
                        name: strategy.name,
                        icon: strategy.icon,
                        description: strategy.description,
                        isAdded: strategies.some((s) => s.name.toLowerCase() === strategy.id.toLowerCase()),
                      }))}
                      placeholder="Select strategy"
                    />
                  </div>

                  {investForm.strategy && (() => {
                    const selectedStrategy = STRATEGY_TYPES.find((s) => s.id === investForm.strategy);
                    const requiresTwoTokens = selectedStrategy?.requiresTwoTokens || false;
                    
                    if (requiresTwoTokens) {
                      // Two token inputs for LP strategies (Uniswap, Velodrome)
                      // Show all known tokens, not just those with balances
                      const availableTokens = selectedStrategy?.tokens.map((tokenSymbol) => {
                        const tokenEntry = Object.entries(KNOWN_TOKENS).find(
                          ([_, info]) => info.symbol.toUpperCase() === tokenSymbol.toUpperCase()
                        );
                        if (tokenEntry) {
                          const [address, info] = tokenEntry;
                          const balance = tokenBalances.find((t) => t.address.toLowerCase() === address.toLowerCase());
                          return {
                            address,
                            symbol: info.symbol,
                            balance: balance ? balance.balance : "0",
                            decimals: info.decimals,
                          };
                        }
                        return null;
                      }).filter(Boolean) as Array<{ address: string; symbol: string; balance: string; decimals: number }>;
                      
                      return (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              {selectedStrategy?.tokens[0] || "Token 0"}
                            </label>
                            <div className="flex gap-3">
                              <div className="flex-1">
                                <TokenSelect
                                  value={investForm.token0}
                                  onChange={(value) => setInvestForm({ ...investForm, token0: value })}
                                  options={availableTokens.map((token) => ({
                                    address: token.address,
                                    symbol: token.symbol,
                                    balance: token.balance,
                                  }))}
                                  placeholder="Select token"
                                />
                              </div>
                              <input
                                type="text"
                                value={investForm.amount0}
                                onChange={(e) => setInvestForm({ ...investForm, amount0: e.target.value })}
                                placeholder="0.00"
                                className="w-32 px-4 py-3 bg-black/30 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 placeholder:text-gray-600"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              {selectedStrategy?.tokens[1] || "Token 1"}
                            </label>
                            <div className="flex gap-3">
                              <div className="flex-1">
                                <TokenSelect
                                  value={investForm.token1}
                                  onChange={(value) => setInvestForm({ ...investForm, token1: value })}
                                  options={availableTokens.map((token) => ({
                                    address: token.address,
                                    symbol: token.symbol,
                                    balance: token.balance,
                                  }))}
                                  placeholder="Select token"
                                />
                              </div>
                              <input
                                type="text"
                                value={investForm.amount1}
                                onChange={(e) => setInvestForm({ ...investForm, amount1: e.target.value })}
                                placeholder="0.00"
                                className="w-32 px-4 py-3 bg-black/30 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 placeholder:text-gray-600"
                              />
                            </div>
                          </div>
                        </>
                      );
                    } else {
                      // Single token input for lending strategies (Aave, Beefy)
                      return (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              {selectedStrategy?.tokens[0] || "Token"}
                            </label>
                            <div className="flex gap-3">
                              <div className="flex-1">
                                <TokenSelect
                                  value={investForm.token0}
                                  onChange={(value) => setInvestForm({ ...investForm, token0: value })}
                                  options={tokenBalances
                                    .filter((token) => 
                                      selectedStrategy?.tokens.map(t => t.toUpperCase()).includes(token.symbol.toUpperCase())
                                    )
                                    .map((token) => ({
                                      address: token.address,
                                      symbol: token.symbol,
                                      balance: token.balance,
                                    }))}
                                  placeholder="Select token"
                                />
                              </div>
                              <input
                                type="text"
                                value={investForm.amount0}
                                onChange={(e) => setInvestForm({ ...investForm, amount0: e.target.value })}
                                placeholder="0.00"
                                className="w-32 px-4 py-3 bg-black/30 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 placeholder:text-gray-600"
                              />
                            </div>
                          </div>
                        </>
                      );
                    }
                  })()}

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleInvest}
                    disabled={
                      !investForm.strategy || 
                      !investForm.token0 || 
                      !investForm.amount0 || 
                      (STRATEGY_TYPES.find((s) => s.id === investForm.strategy)?.requiresTwoTokens && (!investForm.token1 || !investForm.amount1)) ||
                      actionLoading
                    }
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
                  >
                    {actionLoading ? "Processing..." : "Invest"}
                  </motion.button>
                </div>
              </div>

              {/* Strategy Types */}
              <div className="bg-[#12121a] border border-gray-800/50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <ChartBarIcon className="h-5 w-5 text-blue-400" />
                  Available Strategies
                </h3>

                <div className="space-y-3">
                  {STRATEGY_TYPES.map((strategy) => {
                    const isActive = strategies.some((s) => s.name === strategy.id);
                    return (
                      <div
                        key={strategy.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isActive
                            ? "bg-emerald-500/10 border-emerald-500/30"
                            : "bg-black/20 border-gray-800 hover:border-gray-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{strategy.icon}</span>
                            <div>
                              <div className="text-white font-medium">{strategy.name}</div>
                              <div className="text-gray-500 text-sm">{strategy.description}</div>
                            </div>
                          </div>
                          {isActive && (
                            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Vault Information */}
              <div className="bg-[#12121a] border border-gray-800/50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <CurrencyDollarIcon className="h-5 w-5 text-emerald-400" />
                  Vault Information
                </h3>
                <div className="space-y-3">
                  <div className="p-4 bg-black/20 rounded-xl border border-gray-800/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-400 text-sm">Vault Address</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(vaultAddress)}
                        className="text-emerald-400 hover:text-emerald-300 text-sm font-mono"
                      >
                        {vaultAddress.slice(0, 6)}...{vaultAddress.slice(-4)}
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-gray-400 text-sm">Status</span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          vaultState?.isPaused
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-emerald-500/20 text-emerald-400"
                        }`}
                      >
                        {vaultState?.isPaused ? "⏸ Paused" : "✓ Active"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deposit Settings */}
              <div className="bg-[#12121a] border border-gray-800/50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <BanknotesIcon className="h-5 w-5 text-blue-400" />
                  Deposit Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-black/20 rounded-xl border border-gray-800/50">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-gray-400 text-sm mb-1">Deposit Cap</div>
                        <div className="text-2xl font-bold text-white">
                          ${parseFloat(vaultState?.depositCap || "0").toLocaleString()}
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <BanknotesIcon className="h-6 w-6 text-blue-400" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Maximum total assets the vault can accept</p>
                  </div>

                  <div className="p-4 bg-black/20 rounded-xl border border-gray-800/50">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-gray-400 text-sm mb-1">Minimum Deposit</div>
                        <div className="text-2xl font-bold text-white">
                          ${parseFloat(vaultState?.minDeposit || "0").toLocaleString()}
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <ArrowDownTrayIcon className="h-6 w-6 text-purple-400" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Lowest amount an investor must deposit</p>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-black/20 rounded-xl border border-gray-800/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-gray-400 text-sm mb-1">Allowlist</div>
                      <p className="text-xs text-gray-500">Restrict deposits to approved addresses only</p>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-lg font-medium ${
                        vaultState?.allowlistEnabled
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {vaultState?.allowlistEnabled ? "✓ Enabled" : "✗ Disabled"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Withdrawal Model */}
              <div className="bg-[#12121a] border border-gray-800/50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <ArrowsRightLeftIcon className="h-5 w-5 text-cyan-400" />
                  Withdrawal Model
                </h3>
                <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/20">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-white font-semibold mb-1">Model Type</div>
                      <div className="text-gray-400 text-sm">
                        This setting is immutable and cannot be changed after vault creation
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm font-medium">
                      Immutable
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    💡 The withdrawal model determines how investors can withdraw their funds. Each model has different
                    liquidity requirements and processing times.
                  </div>
                </div>
              </div>

              {/* Strategy Configuration */}
              <div className="bg-[#12121a] border border-gray-800/50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <ChartBarIcon className="h-5 w-5 text-purple-400" />
                  Strategy Configuration
                </h3>
                <div className="space-y-3">
                  {strategies.length > 0 ? (
                    strategies.map((strategy, index) => (
                      <div
                        key={index}
                        className="p-4 bg-black/20 rounded-xl border border-gray-800/50 hover:border-purple-500/30 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                              <span className="text-lg">
                                {STRATEGY_TYPES.find((s) => s.id === strategy.name)?.icon || "📊"}
                              </span>
                            </div>
                            <div>
                              <div className="text-white font-medium capitalize">{strategy.name}</div>
                              <div className="text-gray-500 text-xs font-mono">
                                {strategy.address.slice(0, 8)}...{strategy.address.slice(-6)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-semibold">
                              ${parseFloat(strategy.assets).toLocaleString()}
                            </div>
                            <div className="text-gray-500 text-xs">Invested</div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center bg-black/20 rounded-xl border border-gray-800/50">
                      <ChartBarIcon className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                      <div className="text-gray-400 mb-1">No strategies configured</div>
                      <div className="text-gray-500 text-sm">
                        Add strategies in the <span className="text-emerald-400">Invest</span> tab
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* System Configuration */}
              <div className="bg-[#12121a] border border-gray-800/50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Cog6ToothIcon className="h-5 w-5 text-gray-400" />
                  System Configuration
                </h3>
                <div className="space-y-3">
                  <div className="p-4 bg-black/20 rounded-xl border border-gray-800/50">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-gray-400 text-sm mb-1">Swap Router</div>
                        <p className="text-xs text-gray-500">Uniswap V3 router for token swaps</p>
                      </div>
                      <div className="text-right">
                        {!vaultState?.swapRouter ||
                        vaultState.swapRouter === "0x0000000000000000000000000000000000000000" ? (
                          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm">
                            Not configured
                          </span>
                        ) : (
                          <button
                            onClick={() => navigator.clipboard.writeText(vaultState.swapRouter)}
                            className="text-emerald-400 hover:text-emerald-300 text-sm font-mono"
                          >
                            {vaultState.swapRouter.slice(0, 6)}...{vaultState.swapRouter.slice(-4)}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

