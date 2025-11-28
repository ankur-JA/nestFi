"use client";

import { motion } from "framer-motion";

export default function KeyFeatures() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="mb-12"
    >
      <h2 className="text-2xl font-bold text-red-400 mb-6">Key Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="text-3xl mb-2">🔒</div>
          <h3 className="text-lg font-semibold text-red-400 mb-2">Secure</h3>
          <p className="text-gray-300 text-sm">Built on audited smart contracts with ERC-4626 standards</p>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-2">👥</div>
          <h3 className="text-lg font-semibold text-red-400 mb-2">Group Investing</h3>
          <p className="text-gray-300 text-sm">Pool funds with friends and family for better yields</p>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="text-lg font-semibold text-red-400 mb-2">Transparent</h3>
          <p className="text-gray-300 text-sm">All transactions and yields are visible on-chain</p>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-2">⚡</div>
          <h3 className="text-lg font-semibold text-red-400 mb-2">Gasless UX</h3>
          <p className="text-gray-300 text-sm">ERC-7702 + Permit2 for sponsored deposits and smooth approvals</p>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-2">🧩</div>
          <h3 className="text-lg font-semibold text-red-400 mb-2">Real Strategies</h3>
          <p className="text-gray-300 text-sm">Aave v3 lending adapter on Optimism</p>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-2">🛠️</div>
          <h3 className="text-lg font-semibold text-red-400 mb-2">Admin Controls</h3>
          <p className="text-gray-300 text-sm">Allowlist, caps, pause; invest/divest into strategies from the UI</p>
        </div>
      </div>
    </motion.div>
  );
}
