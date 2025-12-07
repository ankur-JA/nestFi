"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  SparklesIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CurrencyDollarIcon,
  ClockIcon,
  BoltIcon,
  QueueListIcon,
  LockClosedIcon,
  UserIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import deployedContracts from "~~/contracts/deployedContracts";
import { useTheme } from "~~/contexts/ThemeContext";

const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 11155111);

// Withdrawal model options
const WITHDRAW_MODELS = [
  {
    id: 0,
    name: "Instant",
    title: "Instant Liquidity",
    description: "8-15% idle buffer for fast withdrawals",
    details: "Vault keeps a portion of assets idle in USDC. Investors withdraw instantly as long as the buffer is available.",
    icon: BoltIcon,
    color: "emerald",
    ux: "Fast / Smooth",
    apy: "Slightly Lower",
    bestFor: "Beginner-friendly vaults, low-risk strategies",
    configLabel: "Idle Buffer %",
    configOptions: [8, 10, 12, 15],
    defaultConfig: 10,
  },
  {
    id: 1,
    name: "Scheduled",
    title: "Scheduled Withdrawals",
    description: "Withdraw queue processed on rebalances",
    details: "0% idle assets (fully invested). Withdrawals enter a queue and are processed during curator rebalance or harvest.",
    icon: QueueListIcon,
    color: "blue",
    ux: "Small Delay",
    apy: "Higher",
    bestFor: "LP strategies, higher-risk vaults",
    configLabel: null,
    configOptions: null,
    defaultConfig: 0,
  },
  {
    id: 2,
    name: "Epoch",
    title: "Locked Vault (Epoch-Based)",
    description: "Withdraw only every 7 or 30 days",
    details: "Investors can withdraw only after each epoch ends. Perfect for long-term strategies with predictable withdrawal windows.",
    icon: LockClosedIcon,
    color: "purple",
    ux: "Predictable",
    apy: "Highest",
    bestFor: "Restaking, LP, leverage, long-hold strategies",
    configLabel: "Epoch Length",
    configOptions: [
      { value: 604800, label: "7 Days" },
      { value: 2592000, label: "30 Days" },
    ],
    defaultConfig: 604800,
  },
  {
    id: 3,
    name: "Curator Managed",
    title: "Curator Liquidation",
    description: "Withdraw when curator unwinds positions",
    details: "Curator decides when to unwind positions. Withdrawals require curator-triggered redemption. High trust required.",
    icon: UserIcon,
    color: "amber",
    ux: "High Trust Required",
    apy: "Very Flexible",
    bestFor: "Small private groups, trader-managed vaults, friends & family",
    configLabel: null,
    configOptions: null,
    defaultConfig: 0,
  },
];

export default function CreateVaultPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    depositCap: "",
    minDeposit: "",
    allowlistEnabled: false,
    withdrawModel: 0,
    withdrawConfig: 10, // Default: 10% buffer for INSTANT
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const asset = process.env.NEXT_PUBLIC_USDC_ADDRESS || "";
  const factoryAddress = (deployedContracts as any)[CHAIN_ID]?.VaultFactory?.address;
  const factoryAbi = (deployedContracts as any)[CHAIN_ID]?.VaultFactory?.abi;

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleWithdrawModelChange = (modelId: number) => {
    const model = WITHDRAW_MODELS.find(m => m.id === modelId);
    setFormData(prev => ({
      ...prev,
      withdrawModel: modelId,
      withdrawConfig: model?.defaultConfig || 0,
    }));
  };

  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Required";
    if (!formData.symbol.trim()) errors.symbol = "Required";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors: Record<string, string> = {};
    if (!formData.depositCap || parseFloat(formData.depositCap) <= 0) {
      errors.depositCap = "Must be greater than 0";
    }
    if (!formData.minDeposit || parseFloat(formData.minDeposit) <= 0) {
      errors.minDeposit = "Must be greater than 0";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    if (!factoryAddress || !address) return;
    
    try {
      const depositCapWei = parseUnits(formData.depositCap, 6);
      const minDepositWei = parseUnits(formData.minDeposit, 6);
      
      writeContract({
        address: factoryAddress as `0x${string}`,
        abi: factoryAbi,
        functionName: "createVault",
        args: [
          asset as `0x${string}`,
          address,
          formData.name,
          formData.symbol,
          formData.allowlistEnabled,
          depositCapWei,
          minDepositWei,
          formData.withdrawModel,
          BigInt(formData.withdrawConfig),
        ],
      });
    } catch (err) {
      console.error("Error creating vault:", err);
    }
  };

  // Handle success
  React.useEffect(() => {
    if (isSuccess) {
      setSuccess(true);
    }
  }, [isSuccess]);

  const selectedModel = WITHDRAW_MODELS.find(m => m.id === formData.withdrawModel);

  // Not connected state
  if (!isConnected) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl p-12 text-center max-w-md transition-colors duration-300"
          style={{
            background: isDark ? '#12121a' : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
          }}
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <SparklesIcon className="h-8 w-8 text-emerald-500" />
          </div>
          <h2 
            className="text-2xl font-bold mb-3 transition-colors duration-300"
            style={{ color: isDark ? '#ffffff' : '#0f172a' }}
          >
            Connect Wallet
          </h2>
          <p 
            className="mb-8 transition-colors duration-300"
            style={{ color: isDark ? '#9ca3af' : '#64748b' }}
          >
            Connect your wallet to create and manage investment vaults.
          </p>
          <RainbowKitCustomConnectButton />
        </motion.div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl p-12 text-center max-w-md transition-colors duration-300"
          style={{
            background: isDark ? '#12121a' : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircleIcon className="h-10 w-10 text-emerald-500" />
          </motion.div>
          <h2 
            className="text-2xl font-bold mb-3 transition-colors duration-300"
            style={{ color: isDark ? '#ffffff' : '#0f172a' }}
          >
            Vault Created!
          </h2>
          <p 
            className="mb-4 transition-colors duration-300"
            style={{ color: isDark ? '#9ca3af' : '#64748b' }}
          >
            Your vault <span 
              className="font-medium transition-colors duration-300"
              style={{ color: isDark ? '#ffffff' : '#0f172a' }}
            >
              {formData.name}
            </span> has been successfully created.
          </p>
          <div 
            className="rounded-xl p-4 mb-6 text-left transition-colors duration-300"
            style={{
              background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)',
            }}
          >
            <div 
              className="flex items-center gap-2 text-sm mb-2 transition-colors duration-300"
              style={{ color: isDark ? '#9ca3af' : '#64748b' }}
            >
              {selectedModel && <selectedModel.icon className="h-4 w-4" />}
              <span>
                Withdrawal Model: <span 
                  className="transition-colors duration-300"
                  style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                >
                  {selectedModel?.title}
                </span>
              </span>
            </div>
            <p 
              className="text-xs transition-colors duration-300"
              style={{ color: isDark ? '#6b7280' : '#94a3b8' }}
            >
              ⚠️ This setting is permanent and cannot be changed.
            </p>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSuccess(false);
                setFormData({ name: "", symbol: "", depositCap: "", minDeposit: "", allowlistEnabled: false, withdrawModel: 0, withdrawConfig: 10 });
                setStep(1);
              }}
              className="flex-1 py-3 px-6 font-medium rounded-xl transition-colors"
              style={{
                background: isDark ? '#1f2937' : '#e5e7eb',
                color: isDark ? '#ffffff' : '#0f172a',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDark ? '#374151' : '#d1d5db';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDark ? '#1f2937' : '#e5e7eb';
              }}
            >
              Create Another
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/curator/manage")}
              className="flex-1 py-3 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors"
            >
              View Vaults
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 
            className="text-3xl font-bold mb-2 transition-colors duration-300"
            style={{ color: isDark ? '#ffffff' : '#0f172a' }}
          >
            Create Vault
          </h1>
          <p 
            className="transition-colors duration-300"
            style={{ color: isDark ? '#9ca3af' : '#64748b' }}
          >
            Set up a new investment vault for your investors.
          </p>
        </motion.div>

        {/* Progress indicator */}
        <div className="flex items-center gap-4 mb-8">
          {[1, 2, 3].map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-2">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step >= s ? "bg-emerald-500 text-white" : ""
                  }`}
                  style={step < s ? {
                    background: isDark ? '#1f2937' : '#e5e7eb',
                    color: isDark ? '#9ca3af' : '#64748b',
                  } : {}}
                >
                  {s}
                </div>
                <span 
                  className="text-sm hidden sm:block transition-colors duration-300"
                  style={step >= s ? {
                    color: isDark ? '#ffffff' : '#0f172a',
                  } : {
                    color: isDark ? '#6b7280' : '#94a3b8',
                  }}
                >
                  {s === 1 ? "Basic Info" : s === 2 ? "Settings" : "Withdrawal"}
                </span>
              </div>
              {i < 2 && (
                <div 
                  className="flex-1 h-0.5 transition-colors duration-300"
                  style={{
                    background: step > s ? '#10b981' : (isDark ? '#1f2937' : '#e5e7eb'),
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden transition-colors duration-300"
          style={{
            background: isDark ? '#12121a' : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
          }}
        >
          <AnimatePresence mode="wait">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8"
              >
                <h3 
                  className="text-lg font-semibold mb-6 transition-colors duration-300"
                  style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                >
                  Basic Information
                </h3>
                <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <label 
                      className="block text-sm font-medium mb-2 transition-colors duration-300"
                      style={{ color: isDark ? '#d1d5db' : '#374151' }}
                    >
                      Vault Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="e.g., Stable Yield Fund"
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
                        validationErrors.name ? "border-red-500" : ""
                      }`}
                      style={{
                        background: isDark ? '#0a0a0f' : '#f8fafc',
                        color: isDark ? '#ffffff' : '#0f172a',
                        borderColor: validationErrors.name ? '#ef4444' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'),
                      }}
                      onFocus={(e) => {
                        if (!validationErrors.name) {
                          e.currentTarget.style.borderColor = '#10b981';
                        }
                      }}
                      onBlur={(e) => {
                        if (!validationErrors.name) {
                          e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)';
                        }
                      }}
                    />
                    {validationErrors.name && (
                      <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                        <ExclamationTriangleIcon className="h-4 w-4" />
                        {validationErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Symbol */}
                  <div>
                    <label 
                      className="block text-sm font-medium mb-2 transition-colors duration-300"
                      style={{ color: isDark ? '#d1d5db' : '#374151' }}
                    >
                      Vault Symbol
                    </label>
                    <input
                      type="text"
                      value={formData.symbol}
                      onChange={(e) => handleInputChange("symbol", e.target.value.toUpperCase())}
                      placeholder="e.g., NVUSDC"
                      maxLength={10}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
                        validationErrors.symbol ? "border-red-500" : ""
                      }`}
                      style={{
                        background: isDark ? '#0a0a0f' : '#f8fafc',
                        color: isDark ? '#ffffff' : '#0f172a',
                        borderColor: validationErrors.symbol ? '#ef4444' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'),
                      }}
                      onFocus={(e) => {
                        if (!validationErrors.symbol) {
                          e.currentTarget.style.borderColor = '#10b981';
                        }
                      }}
                      onBlur={(e) => {
                        if (!validationErrors.symbol) {
                          e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)';
                        }
                      }}
                    />
                    {validationErrors.symbol && (
                      <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                        <ExclamationTriangleIcon className="h-4 w-4" />
                        {validationErrors.symbol}
                      </p>
                    )}
                  </div>

                  {/* Allowlist */}
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      formData.allowlistEnabled 
                        ? "bg-emerald-500 border-emerald-500" 
                        : "border-gray-600 group-hover:border-gray-500"
                    }`}>
                      {formData.allowlistEnabled && (
                        <CheckCircleIcon className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.allowlistEnabled}
                      onChange={(e) => handleInputChange("allowlistEnabled", e.target.checked)}
                      className="sr-only"
                    />
                    <span 
                      className="text-sm transition-colors duration-300"
                      style={{ color: isDark ? '#d1d5db' : '#374151' }}
                    >
                      Enable allowlist (only approved addresses can deposit)
                    </span>
                  </label>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleNext}
                  disabled={!formData.name || !formData.symbol}
                  className="w-full mt-8 py-4 px-6 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  Next
                  <ArrowRightIcon className="h-4 w-4" />
                </motion.button>
              </motion.div>
            )}

            {/* Step 2: Investment Parameters */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8"
              >
                <h3 className="text-lg font-semibold text-white mb-6">Investment Parameters</h3>
                <div className="space-y-6">
                  {/* Deposit Cap */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Deposit Cap (USDC)
                    </label>
                    <div className="relative">
                      <CurrencyDollarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                      <input
                        type="text"
                        value={formData.depositCap}
                        onChange={(e) => handleInputChange("depositCap", e.target.value.replace(/[^0-9.]/g, ''))}
                        placeholder="50000"
                        className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
                          validationErrors.depositCap ? "border-red-500" : ""
                        }`}
                        style={{
                          background: isDark ? '#0a0a0f' : '#f8fafc',
                          color: isDark ? '#ffffff' : '#0f172a',
                          borderColor: validationErrors.depositCap ? '#ef4444' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'),
                        }}
                        onFocus={(e) => {
                          if (!validationErrors.depositCap) {
                            e.currentTarget.style.borderColor = '#10b981';
                          }
                        }}
                        onBlur={(e) => {
                          if (!validationErrors.depositCap) {
                            e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)';
                          }
                        }}
                      />
                    </div>
                    <p className="text-gray-500 text-xs mt-1">Maximum total assets the vault can accept</p>
                    {validationErrors.depositCap && (
                      <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                        <ExclamationTriangleIcon className="h-4 w-4" />
                        {validationErrors.depositCap}
                      </p>
                    )}
                  </div>

                  {/* Min Deposit */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Minimum Deposit (USDC)
                    </label>
                    <div className="relative">
                      <CurrencyDollarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                      <input
                        type="text"
                        value={formData.minDeposit}
                        onChange={(e) => handleInputChange("minDeposit", e.target.value.replace(/[^0-9.]/g, ''))}
                        placeholder="50"
                        className={`w-full pl-12 pr-4 py-3 bg-[#0a0a0f] border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
                          validationErrors.minDeposit ? "border-red-500" : "border-gray-800 focus:border-emerald-500"
                        }`}
                      />
                    </div>
                    <p className="text-gray-500 text-xs mt-1">Lowest amount an investor must deposit</p>
                    {validationErrors.minDeposit && (
                      <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                        <ExclamationTriangleIcon className="h-4 w-4" />
                        {validationErrors.minDeposit}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 px-6 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                    style={{
                      background: isDark ? '#1f2937' : '#e5e7eb',
                      color: isDark ? '#ffffff' : '#0f172a',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isDark ? '#374151' : '#d1d5db';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isDark ? '#1f2937' : '#e5e7eb';
                    }}
                  >
                    <ArrowLeftIcon className="h-4 w-4" />
                    Back
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleNext}
                    disabled={!formData.depositCap || !formData.minDeposit}
                    className="flex-1 py-4 px-6 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    Next
                    <ArrowRightIcon className="h-4 w-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Withdrawal Model */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8"
              >
                <div className="flex items-start gap-3 mb-6">
                  <div className="flex-1">
                    <h3 
                      className="text-lg font-semibold transition-colors duration-300"
                      style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                    >
                      Select Withdrawal Liquidity Model
                    </h3>
                    <p 
                      className="text-sm mt-1 transition-colors duration-300"
                      style={{ color: isDark ? '#9ca3af' : '#64748b' }}
                    >
                      This setting is <span className="text-amber-500 font-medium">permanent</span> and cannot be changed after deployment.
                    </p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <LockClosedIcon className="h-3 w-3 text-amber-400" />
                    <span className="text-amber-400 text-xs font-medium">Immutable</span>
                  </div>
                </div>

                {/* Withdrawal Model Cards */}
                <div className="space-y-3">
                  {WITHDRAW_MODELS.map((model) => {
                    const isSelected = formData.withdrawModel === model.id;
                    const colorClasses = {
                      emerald: "border-emerald-500/50 bg-emerald-500/5",
                      blue: "border-blue-500/50 bg-blue-500/5",
                      purple: "border-purple-500/50 bg-purple-500/5",
                      amber: "border-amber-500/50 bg-amber-500/5",
                    };
                    const iconColors = {
                      emerald: "text-emerald-400",
                      blue: "text-blue-400",
                      purple: "text-purple-400",
                      amber: "text-amber-400",
                    };

                    return (
                      <motion.div
                        key={model.id}
                        whileHover={{ scale: 1.01 }}
                        onClick={() => handleWithdrawModelChange(model.id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected 
                            ? colorClasses[model.color as keyof typeof colorClasses]
                            : "border-gray-800 hover:border-gray-700 bg-black/20"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isSelected ? `bg-${model.color}-500/20` : "bg-gray-800"
                          }`}>
                            <model.icon className={`h-5 w-5 ${isSelected ? iconColors[model.color as keyof typeof iconColors] : "text-gray-400"}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-white font-medium">{model.title}</h4>
                              {isSelected && (
                                <CheckCircleIcon className={`h-4 w-4 ${iconColors[model.color as keyof typeof iconColors]}`} />
                              )}
                            </div>
                            <p className="text-gray-400 text-sm mt-0.5">{model.description}</p>
                            
                            {/* Model details */}
                            <div className="flex flex-wrap gap-3 mt-3">
                              <span className="text-xs px-2 py-1 bg-black/30 rounded-md text-gray-300">
                                UX: {model.ux}
                              </span>
                              <span className="text-xs px-2 py-1 bg-black/30 rounded-md text-gray-300">
                                APY: {model.apy}
                              </span>
                            </div>
                            <p className="text-gray-500 text-xs mt-2">
                              Best for: {model.bestFor}
                            </p>

                            {/* Configuration options */}
                            {isSelected && model.configOptions && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="mt-4 pt-4 border-t border-gray-800"
                              >
                                <label 
                                  className="block text-sm font-medium mb-2 transition-colors duration-300"
                                  style={{ color: isDark ? '#d1d5db' : '#374151' }}
                                >
                                  {model.configLabel}
                                </label>
                                <div className="flex flex-wrap gap-2">
                                  {model.id === 2 ? (
                                    // Epoch options
                                    (model.configOptions as Array<{value: number; label: string}>).map((option) => (
                                      <button
                                        key={option.value}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleInputChange("withdrawConfig", option.value);
                                        }}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                          formData.withdrawConfig === option.value
                                            ? "bg-purple-500 text-white"
                                            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                                        }`}
                                      >
                                        {option.label}
                                      </button>
                                    ))
                                  ) : (
                                    // Buffer percent options
                                    (model.configOptions as number[]).map((percent) => (
                                      <button
                                        key={percent}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleInputChange("withdrawConfig", percent);
                                        }}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                          formData.withdrawConfig === percent
                                            ? "bg-emerald-500 text-white"
                                            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                                        }`}
                                      >
                                        {percent}%
                                      </button>
                                    ))
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Warning */}
                <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <InformationCircleIcon className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-amber-400 text-sm font-medium">Important</p>
                      <p 
                        className="text-xs mt-1 transition-colors duration-300"
                        style={{ color: isDark ? '#9ca3af' : '#64748b' }}
                      >
                        Once the vault is deployed, the withdrawal model cannot be changed. This protects investors from rugpulls or manipulation.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Error message */}
                {writeError && (
                  <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-red-400 text-sm flex items-center gap-2">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      {writeError.message || "Transaction failed"}
                    </p>
                  </div>
                )}

                <div className="flex gap-3 mt-8">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setStep(2)}
                      className="flex-1 py-4 px-6 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                      style={{
                        background: isDark ? '#1f2937' : '#e5e7eb',
                        color: isDark ? '#ffffff' : '#0f172a',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = isDark ? '#374151' : '#d1d5db';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isDark ? '#1f2937' : '#e5e7eb';
                      }}
                    >
                      <ArrowLeftIcon className="h-4 w-4" />
                      Back
                    </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleSubmit}
                    disabled={isPending || isConfirming}
                    className="flex-1 py-4 px-6 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    {isPending || isConfirming ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {isPending ? "Confirm in wallet..." : "Deploying..."}
                      </>
                    ) : (
                      <>
                        Deploy Vault
                        <SparklesIcon className="h-4 w-4" />
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Summary Preview */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 rounded-xl transition-colors duration-300"
            style={{
              background: isDark ? '#12121a' : '#f8fafc',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            }}
          >
            <h4 
              className="text-sm font-medium mb-3 transition-colors duration-300"
              style={{ color: isDark ? '#9ca3af' : '#64748b' }}
            >
              Vault Summary
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span 
                  className="transition-colors duration-300"
                  style={{ color: isDark ? '#6b7280' : '#94a3b8' }}
                >
                  Name:
                </span>
                <span 
                  className="ml-2 transition-colors duration-300"
                  style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                >
                  {formData.name}
                </span>
              </div>
              <div>
                <span 
                  className="transition-colors duration-300"
                  style={{ color: isDark ? '#6b7280' : '#94a3b8' }}
                >
                  Symbol:
                </span>
                <span 
                  className="ml-2 transition-colors duration-300"
                  style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                >
                  {formData.symbol}
                </span>
              </div>
              <div>
                <span 
                  className="transition-colors duration-300"
                  style={{ color: isDark ? '#6b7280' : '#94a3b8' }}
                >
                  Deposit Cap:
                </span>
                <span 
                  className="ml-2 transition-colors duration-300"
                  style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                >
                  ${formData.depositCap}
                </span>
              </div>
              <div>
                <span 
                  className="transition-colors duration-300"
                  style={{ color: isDark ? '#6b7280' : '#94a3b8' }}
                >
                  Min Deposit:
                </span>
                <span 
                  className="ml-2 transition-colors duration-300"
                  style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                >
                  ${formData.minDeposit}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
