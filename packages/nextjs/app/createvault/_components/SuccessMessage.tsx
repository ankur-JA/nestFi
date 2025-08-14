"use client";

import React from "react";
import { motion } from "framer-motion";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function SuccessMessage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full border border-red-500/20 text-center"
      >
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <BanknotesIcon className="h-8 w-8 text-green-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Vault Created!</h3>
        <p className="text-gray-300 mb-6">
          Your vault has been successfully created! 🎉
        </p>
        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="block w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full transition-colors"
          >
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="block w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-full transition-colors"
          >
            Create Another Vault
          </button>
        </div>
      </motion.div>
    </div>
  );
}
