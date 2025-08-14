"use client";

import { motion } from "framer-motion";
import { UsersIcon, ShieldCheckIcon, ChartBarIcon } from "@heroicons/react/24/outline";

export default function WhatIsNestFi() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="relative"
    >
      {/* Background card */}
      <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-red-500/20 shadow-2xl">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl">
                <UsersIcon className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400">
                What is NestFi?
              </h2>
            </div>
            
            <p className="text-lg text-gray-300 leading-relaxed mb-6">
              NestFi is a revolutionary decentralized platform that enables group investing through smart contract-powered vaults. 
              Users can create investment vaults, invite friends to join, and collectively earn yields on their pooled funds.
            </p>
            
            <p className="text-gray-400 leading-relaxed">
              The platform leverages ERC-4626 standards for secure, transparent, and efficient yield farming, 
              making DeFi accessible to everyone through collaborative investment strategies.
            </p>
          </motion.div>

          {/* Visual elements */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              {/* Feature cards */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-red-500/20 to-pink-500/20 p-4 rounded-xl border border-red-500/30"
              >
                <ShieldCheckIcon className="h-8 w-8 text-red-400 mb-2" />
                <h3 className="text-white font-semibold mb-1">Secure</h3>
                <p className="text-gray-300 text-sm">Multi-sig protection</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-4 rounded-xl border border-blue-500/30"
              >
                <ChartBarIcon className="h-8 w-8 text-blue-400 mb-2" />
                <h3 className="text-white font-semibold mb-1">Transparent</h3>
                <p className="text-gray-300 text-sm">On-chain verification</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-4 rounded-xl border border-green-500/30"
              >
                <UsersIcon className="h-8 w-8 text-green-400 mb-2" />
                <h3 className="text-white font-semibold mb-1">Collaborative</h3>
                <p className="text-gray-300 text-sm">Group investing</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-4 rounded-xl border border-purple-500/30"
              >
                <div className="h-8 w-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg mb-2 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">ERC</span>
                </div>
                <h3 className="text-white font-semibold mb-1">Standard</h3>
                <p className="text-gray-300 text-sm">ERC-4626 compliant</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
