"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircleIcon, SparklesIcon, RocketLaunchIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface SuccessMessageProps {
  onReset?: () => void;
}

export default function SuccessMessage({ onReset }: SuccessMessageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-green-500/20 rounded-full blur-2xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl"
          animate={{ 
            scale: [1, 0.8, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl p-12 max-w-lg w-full border border-gray-700/50 text-center shadow-2xl"
      >
        {/* Success icon with animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
        >
          <CheckCircleIcon className="h-12 w-12 text-white" />
        </motion.div>

        {/* Floating sparkles */}
        <motion.div
          className="absolute top-4 right-4 w-3 h-3 bg-yellow-400 rounded-full"
          animate={{ 
            y: [0, -10, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0]
          }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        />
        <motion.div
          className="absolute top-8 left-4 w-2 h-2 bg-pink-400 rounded-full"
          animate={{ 
            y: [0, -8, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0]
          }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
        />

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-4xl font-bold text-white mb-4"
        >
          Vault Created! 🎉
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-lg text-gray-300 mb-8 leading-relaxed"
        >
          Your investment vault has been successfully created and is ready to accept deposits! 
          <span className="text-green-400 font-semibold"> Secure</span>, 
          <span className="text-blue-400 font-semibold"> smart</span>, and 
          <span className="text-purple-400 font-semibold"> ready to grow</span>.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="space-y-4"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href="/dashboard"
              className="block w-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold py-4 px-6 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <RocketLaunchIcon className="h-5 w-5 inline mr-2" />
              Go to Dashboard
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <button
              onClick={onReset}
              className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 border border-gray-600 hover:border-gray-500"
            >
              <SparklesIcon className="h-5 w-5 inline mr-2" />
              Create Another Vault
            </button>
          </motion.div>
        </motion.div>

        {/* Celebration animation */}
        <motion.div
          className="absolute -top-2 -left-2 w-4 h-4 bg-yellow-400 rounded-full"
          animate={{ 
            y: [0, -20, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0]
          }}
          transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
        />
        <motion.div
          className="absolute -top-4 right-2 w-3 h-3 bg-pink-400 rounded-full"
          animate={{ 
            y: [0, -15, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0]
          }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 2 }}
        />
      </motion.div>
    </div>
  );
}
