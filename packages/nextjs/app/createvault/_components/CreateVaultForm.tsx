"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  SparklesIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";
import { useDeFiVaults } from "~~/hooks/useDeFiVaults";

export const CreateVaultForm = () => {
  const { createVault, loading, error } = useDeFiVaults();
  
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    depositCap: "",
    minDeposit: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const asset = "0xb7278A61aa25c888815aFC32Ad3cC52fF24fE575"; // MockUSDC address

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = "Vault name is required";
    } else if (formData.name.length < 3) {
      errors.name = "Vault name must be at least 3 characters";
    }
    
    if (!formData.symbol.trim()) {
      errors.symbol = "Vault symbol is required";
    } else if (formData.symbol.length < 2) {
      errors.symbol = "Vault symbol must be at least 2 characters";
    }
    
    if (!formData.depositCap || parseFloat(formData.depositCap) <= 0) {
      errors.depositCap = "Deposit cap must be greater than 0";
    }
    
    if (!formData.minDeposit || parseFloat(formData.minDeposit) <= 0) {
      errors.minDeposit = "Minimum deposit must be greater than 0";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      createVault({
        asset,
        name: formData.name,
        symbol: formData.symbol,
        allowlistEnabled: false,
        depositCap: formData.depositCap,
        minDeposit: formData.minDeposit,
      });
    } catch (err) {
      console.error("Error creating vault:", err);
    }
  };

  const steps = [
    { id: 1, title: "Basic Info", icon: SparklesIcon },
    { id: 2, title: "Vault Settings", icon: ChartBarIcon },
    { id: 3, title: "Review & Create", icon: ShieldCheckIcon }
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Progress Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <div className="flex items-center justify-center space-x-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-center space-x-3"
            >
              <motion.div
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  currentStep >= step.id
                    ? "bg-gradient-to-r from-red-500 to-pink-500 border-red-500 text-white"
                    : "bg-gray-800 border-gray-600 text-gray-400"
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <step.icon className="h-6 w-6" />
              </motion.div>
              <div className="hidden sm:block">
                <div className={`font-medium ${currentStep >= step.id ? "text-white" : "text-gray-400"}`}>
                  {step.title}
                </div>
              </div>
              {index < steps.length - 1 && (
                <motion.div
                  className={`w-16 h-0.5 hidden sm:block ${
                    currentStep > step.id ? "bg-gradient-to-r from-red-500 to-pink-500" : "bg-gray-600"
                  }`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: currentStep > step.id ? 1 : 0 }}
                  transition={{ duration: 0.5 }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Form Container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl border border-gray-700/50 overflow-hidden"
      >
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Step 1: Basic Information */}
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  >
                    <SparklesIcon className="h-8 w-8 text-white" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-white mb-2">Basic Information</h2>
                  <p className="text-gray-300">Let's start with the fundamentals of your vault</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Vault Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 ${
                          validationErrors.name 
                            ? "border-red-500 focus:ring-red-500/50" 
                            : "border-gray-600 focus:border-red-500 focus:ring-red-500/50"
                        }`}
                        placeholder="Enter vault name..."
                      />
                      {formData.name && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          <CheckCircleIcon className="h-5 w-5 text-green-400" />
                        </motion.div>
                      )}
                    </div>
                    {validationErrors.name && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm mt-2 flex items-center gap-1"
                      >
                        <ExclamationTriangleIcon className="h-4 w-4" />
                        {validationErrors.name}
                      </motion.p>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Vault Symbol
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.symbol}
                        onChange={(e) => handleInputChange("symbol", e.target.value.toUpperCase())}
                        className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 ${
                          validationErrors.symbol 
                            ? "border-red-500 focus:ring-red-500/50" 
                            : "border-gray-600 focus:border-red-500 focus:ring-red-500/50"
                        }`}
                        placeholder="e.g., MYVAULT"
                        maxLength={10}
                      />
                      {formData.symbol && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          <CheckCircleIcon className="h-5 w-5 text-green-400" />
                        </motion.div>
                      )}
                    </div>
                    {validationErrors.symbol && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm mt-2 flex items-center gap-1"
                      >
                        <ExclamationTriangleIcon className="h-4 w-4" />
                        {validationErrors.symbol}
                      </motion.p>
                    )}
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="flex justify-end"
                >
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    disabled={!formData.name || !formData.symbol}
                    className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next Step
                  </button>
                </motion.div>
              </motion.div>
            )}

            {/* Step 2: Vault Settings */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  >
                    <ChartBarIcon className="h-8 w-8 text-white" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-white mb-2">Vault Settings</h2>
                  <p className="text-gray-300">Configure your vault's investment parameters</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      <CurrencyDollarIcon className="h-4 w-4 inline mr-2" />
                      Deposit Cap (USDC)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.depositCap}
                        onChange={(e) => handleInputChange("depositCap", e.target.value)}
                        className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 ${
                          validationErrors.depositCap 
                            ? "border-red-500 focus:ring-red-500/50" 
                            : "border-gray-600 focus:border-red-500 focus:ring-red-500/50"
                        }`}
                        placeholder="10000"
                        min="0"
                        step="0.01"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        USDC
                      </div>
                    </div>
                    {validationErrors.depositCap && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm mt-2 flex items-center gap-1"
                      >
                        <ExclamationTriangleIcon className="h-4 w-4" />
                        {validationErrors.depositCap}
                      </motion.p>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      <ShieldCheckIcon className="h-4 w-4 inline mr-2" />
                      Minimum Deposit (USDC)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.minDeposit}
                        onChange={(e) => handleInputChange("minDeposit", e.target.value)}
                        className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 ${
                          validationErrors.minDeposit 
                            ? "border-red-500 focus:ring-red-500/50" 
                            : "border-gray-600 focus:border-red-500 focus:ring-red-500/50"
                        }`}
                        placeholder="100"
                        min="0"
                        step="0.01"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        USDC
                      </div>
                    </div>
                    {validationErrors.minDeposit && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm mt-2 flex items-center gap-1"
                      >
                        <ExclamationTriangleIcon className="h-4 w-4" />
                        {validationErrors.minDeposit}
                      </motion.p>
                    )}
                  </motion.div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition-all duration-300"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    disabled={!formData.depositCap || !formData.minDeposit}
                    className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next Step
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Review & Create */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  >
                    <ShieldCheckIcon className="h-8 w-8 text-white" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-white mb-2">Review & Create</h2>
                  <p className="text-gray-300">Review your vault configuration and create it</p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700/50"
                >
                  <h3 className="text-xl font-semibold text-white mb-4">Vault Summary</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Name:</span>
                        <span className="text-white font-medium">{formData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Symbol:</span>
                        <span className="text-white font-medium">{formData.symbol}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Deposit Cap:</span>
                        <span className="text-white font-medium">{formData.depositCap} USDC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Min Deposit:</span>
                        <span className="text-white font-medium">{formData.minDeposit} USDC</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/20 border border-red-500/30 rounded-xl p-4"
                  >
                    <p className="text-red-400 text-sm flex items-center gap-2">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      {error}
                    </p>
                  </motion.div>
                )}

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition-all duration-300"
                  >
                    Previous
                  </button>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating Vault...
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="h-5 w-5" />
                        Create Vault
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </motion.div>
    </div>
  );
};
