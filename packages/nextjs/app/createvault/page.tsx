"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircleIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { PageHeader } from "./_components/PageHeader";
import { CreateVaultForm } from "./_components/CreateVaultForm";
import SuccessMessage from "./_components/SuccessMessage";

export default function CreateVaultPage() {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSuccess = () => {
    setShowSuccess(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <AnimatePresence mode="wait">
        {!showSuccess ? (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <PageHeader />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="sticky top-20 z-10 mb-6 hidden md:block">
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3">
                  <SparklesIcon className="h-5 w-5 text-pink-400" />
                  <p className="text-sm text-gray-300">
                    Tip: You can enable allowlist for private vaults or leave it open for public deposits.
                  </p>
                </div>
              </div>
              <CreateVaultForm />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <SuccessMessage onReset={() => setShowSuccess(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}