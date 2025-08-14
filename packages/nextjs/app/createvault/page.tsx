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
            <CreateVaultForm />
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