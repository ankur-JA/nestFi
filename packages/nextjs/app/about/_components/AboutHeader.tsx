"use client";

import { motion } from "framer-motion";
import { ArrowDownIcon } from "@heroicons/react/24/outline";

export default function AboutHeader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="text-center mb-32 pt-8"
    >
      {/* Overline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mb-6"
      >
        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20 text-red-400">
          <span className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse" />
          Institutional-Grade DeFi Infrastructure
        </span>
      </motion.div>

      {/* Main Title */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6"
      >
        <span className="text-white">The Future of</span>
        <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-pink-500 to-purple-500">
          Collaborative Investing
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="text-xl md:text-2xl text-gray-400 font-light max-w-3xl mx-auto mb-12 leading-relaxed"
      >
        NestFi empowers groups to pool capital and access institutional-grade yield strategies 
        through secure, transparent, and fully on-chain smart contracts.
      </motion.p>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="flex flex-wrap justify-center gap-8 md:gap-16 mb-16"
      >
        <div className="text-center">
          <div className="text-3xl md:text-4xl font-bold text-white mb-1">ERC-4626</div>
          <div className="text-sm text-gray-500 uppercase tracking-wider">Vault Standard</div>
        </div>
        <div className="text-center">
          <div className="text-3xl md:text-4xl font-bold text-white mb-1">100%</div>
          <div className="text-sm text-gray-500 uppercase tracking-wider">On-Chain</div>
        </div>
        <div className="text-center">
          <div className="text-3xl md:text-4xl font-bold text-white mb-1">Gasless</div>
          <div className="text-sm text-gray-500 uppercase tracking-wider">Transactions</div>
        </div>
        <div className="text-center">
          <div className="text-3xl md:text-4xl font-bold text-white mb-1">Multi-Sig</div>
          <div className="text-sm text-gray-500 uppercase tracking-wider">Security</div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="flex flex-col items-center"
      >
        <span className="text-sm text-gray-500 mb-3">Discover More</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ArrowDownIcon className="h-5 w-5 text-gray-500" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
