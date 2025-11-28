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
  CurrencyDollarIcon
} from "@heroicons/react/24/outline";
import { useVaultFactory } from "~~/hooks/useVaultFactory";
import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

export default function CreateVaultPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { createVault, loading, error } = useVaultFactory();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    depositCap: "",
    minDeposit: "",
    allowlistEnabled: false
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const asset = process.env.NEXT_PUBLIC_USDC_ADDRESS || "";

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: "" }));
    }
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
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    
    try {
      await createVault({
        asset,
        name: formData.name,
        symbol: formData.symbol,
        allowlistEnabled: formData.allowlistEnabled,
        depositCap: formData.depositCap,
        minDeposit: formData.minDeposit,
      });
      setSuccess(true);
    } catch (err) {
      console.error("Error creating vault:", err);
    }
  };

  // Not connected state
  if (!isConnected) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#12121a] border border-gray-800/50 rounded-2xl p-12 text-center max-w-md"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <SparklesIcon className="h-8 w-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Connect Wallet</h2>
          <p className="text-gray-400 mb-8">
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
          className="bg-[#12121a] border border-gray-800/50 rounded-2xl p-12 text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircleIcon className="h-10 w-10 text-emerald-400" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-3">Vault Created!</h2>
          <p className="text-gray-400 mb-8">
            Your vault <span className="text-white font-medium">{formData.name}</span> has been successfully created.
          </p>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSuccess(false);
                setFormData({ name: "", symbol: "", depositCap: "", minDeposit: "", allowlistEnabled: false });
                setStep(1);
              }}
              className="flex-1 py-3 px-6 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors"
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
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Create Vault</h1>
          <p className="text-gray-400">
            Set up a new investment vault in just a few steps.
          </p>
        </motion.div>

        {/* Progress indicator */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 1 ? "bg-emerald-500 text-white" : "bg-gray-800 text-gray-400"
            }`}>
              1
            </div>
            <span className={`text-sm ${step >= 1 ? "text-white" : "text-gray-500"}`}>Basic Info</span>
          </div>
          <div className={`flex-1 h-0.5 ${step >= 2 ? "bg-emerald-500" : "bg-gray-800"}`} />
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 2 ? "bg-emerald-500 text-white" : "bg-gray-800 text-gray-400"
            }`}>
              2
            </div>
            <span className={`text-sm ${step >= 2 ? "text-white" : "text-gray-500"}`}>Settings</span>
          </div>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#12121a] border border-gray-800/50 rounded-2xl overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8"
              >
                <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Name of Vault
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="e.g., Zombie Fund"
                      className={`w-full px-4 py-3 bg-[#0a0a0f] border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
                        validationErrors.name ? "border-red-500" : "border-gray-800 focus:border-emerald-500"
                      }`}
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Symbol of Vault
                    </label>
                    <input
                      type="text"
                      value={formData.symbol}
                      onChange={(e) => handleInputChange("symbol", e.target.value.toUpperCase())}
                      placeholder="e.g., ZOF"
                      maxLength={10}
                      className={`w-full px-4 py-3 bg-[#0a0a0f] border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
                        validationErrors.symbol ? "border-red-500" : "border-gray-800 focus:border-emerald-500"
                      }`}
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
                    <span className="text-gray-300 text-sm">
                      Enable allowlist (only approved addresses can deposit)
                    </span>
                  </label>
                </div>

                {/* Next Button */}
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

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8"
              >
                <div className="space-y-6">
                  {/* Deposit Cap */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Deposit Cap (USD)
                    </label>
                    <div className="relative">
                      <CurrencyDollarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                      <input
                        type="text"
                        value={formData.depositCap}
                        onChange={(e) => handleInputChange("depositCap", e.target.value.replace(/[^0-9.]/g, ''))}
                        placeholder="10000"
                        className={`w-full pl-12 pr-4 py-3 bg-[#0a0a0f] border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
                          validationErrors.depositCap ? "border-red-500" : "border-gray-800 focus:border-emerald-500"
                        }`}
                      />
                    </div>
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
                      Min Deposit (USD)
                    </label>
                    <div className="relative">
                      <CurrencyDollarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                      <input
                        type="text"
                        value={formData.minDeposit}
                        onChange={(e) => handleInputChange("minDeposit", e.target.value.replace(/[^0-9.]/g, ''))}
                        placeholder="10"
                        className={`w-full pl-12 pr-4 py-3 bg-[#0a0a0f] border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
                          validationErrors.minDeposit ? "border-red-500" : "border-gray-800 focus:border-emerald-500"
                        }`}
                      />
                    </div>
                    {validationErrors.minDeposit && (
                      <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                        <ExclamationTriangleIcon className="h-4 w-4" />
                        {validationErrors.minDeposit}
                      </p>
                    )}
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-red-400 text-sm flex items-center gap-2">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      {error}
                    </p>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 mt-8">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 px-6 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <ArrowLeftIcon className="h-4 w-4" />
                    Back
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleSubmit}
                    disabled={loading || !formData.depositCap || !formData.minDeposit}
                    className="flex-1 py-4 px-6 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        Create Vault
                        <SparklesIcon className="h-4 w-4" />
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

