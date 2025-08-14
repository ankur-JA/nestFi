"use client";

import { motion } from "framer-motion";
import { SparklesIcon, RocketLaunchIcon } from "@heroicons/react/24/outline";

export default function AboutHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-center mb-20"
    >
      {/* Enhanced NestFi Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="flex items-center justify-center space-x-6 mb-8"
      >
        {/* Main Logo Container */}
        <motion.div
          whileHover={{ scale: 1.05, rotate: 2 }}
          className="relative group"
        >
          {/* Outer glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
          
          {/* Main logo background */}
          <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl p-6 border border-red-500/30 shadow-2xl">
            {/* Logo icon */}
            <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 via-pink-500 to-purple-500 rounded-2xl shadow-lg relative overflow-hidden">
              {/* Animated background pattern */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              
              {/* Nest icon */}
              <div className="relative z-10">
                <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                  <path d="M2 17L12 22L22 17" />
                  <path d="M2 12L12 17L22 12" />
                </svg>
              </div>
              
              {/* Floating particles */}
              <motion.div
                animate={{ y: [-2, 2, -2] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-2 right-2 w-2 h-2 bg-yellow-400 rounded-full"
              />
              <motion.div
                animate={{ y: [2, -2, 2] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-blue-400 rounded-full"
              />
            </div>
            
            {/* NestFi text */}
            <div className="mt-4 text-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-pink-400 to-purple-400"
              >
                NestFi
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-xs text-gray-400 mt-1"
              >
                DeFi Vaults
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <div className="flex flex-col items-start">
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 drop-shadow-[0_10px_30px_rgba(236,72,153,0.25)]">
            About
          </h1>
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="text-yellow-400 mt-2"
          >
            <SparklesIcon className="h-8 w-8" />
          </motion.div>
        </div>
      </motion.div>

      {/* Subtitle with enhanced styling */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="text-xl md:text-2xl text-gray-300 font-medium mb-8 max-w-3xl mx-auto leading-relaxed"
      >
        Decentralized group investing made simple and secure
      </motion.p>

      {/* Feature highlights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="flex flex-wrap items-center justify-center gap-6 mb-8"
      >
        <div className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-red-500/30 shadow shadow-red-500/10">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-300">ERC-4626 Standard</span>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-red-500/30 shadow shadow-red-500/10">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-300"></div>
          <span className="text-sm text-gray-300">Gasless Transactions</span>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-red-500/30 shadow shadow-red-500/10">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-600"></div>
          <span className="text-sm text-gray-300">Multi-Sig Security</span>
        </div>
      </motion.div>

      {/* Call to action hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="flex items-center justify-center space-x-2 text-gray-400"
      >
        <RocketLaunchIcon className="h-5 w-5" />
        <span className="text-sm">Scroll to explore more</span>
      </motion.div>
    </motion.div>
  );
}
