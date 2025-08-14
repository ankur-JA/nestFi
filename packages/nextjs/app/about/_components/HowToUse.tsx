"use client";

import { motion } from "framer-motion";
import { UsersIcon, BanknotesIcon, ChartBarIcon } from "@heroicons/react/24/outline";

export default function HowToUse() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mb-12"
    >
      <h2 className="text-2xl font-bold text-red-400 mb-6">How to Use NestFi</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Create Vault */}
        <div className="bg-white/5 p-6 rounded-lg border border-red-500/20">
          <div className="flex items-center mb-4">
            <BanknotesIcon className="h-8 w-8 text-red-400 mr-3" />
            <h3 className="text-xl font-semibold text-red-400">1. Create a Vault</h3>
          </div>
          <p className="text-gray-300">
            Start by creating your investment vault. Set deposit caps, minimum deposits, and choose whether to enable allowlists for member control.
          </p>
        </div>

        {/* Add Members */}
        <div className="bg-white/5 p-6 rounded-lg border border-red-500/20">
          <div className="flex items-center mb-4">
            <UsersIcon className="h-8 w-8 text-red-400 mr-3" />
            <h3 className="text-xl font-semibold text-red-400">2. Add Members</h3>
          </div>
          <p className="text-gray-300">
            Invite friends by adding their wallet addresses to your vault. You can also let them join directly if you disable allowlists.
          </p>
        </div>

        {/* Deposit USDC */}
        <div className="bg-white/5 p-6 rounded-lg border border-red-500/20">
          <div className="flex items-center mb-4">
            <BanknotesIcon className="h-8 w-8 text-red-400 mr-3" />
            <h3 className="text-xl font-semibold text-red-400">3. Deposit USDC</h3>
          </div>
          <p className="text-gray-300">
            Members can deposit USDC into the vault. The vault admin controls how these funds are invested across various DeFi protocols.
          </p>
        </div>

        {/* Earn Yields */}
        <div className="bg-white/5 p-6 rounded-lg border border-red-500/20">
          <div className="flex items-center mb-4">
            <ChartBarIcon className="h-8 w-8 text-red-400 mr-3" />
            <h3 className="text-xl font-semibold text-red-400">4. Earn Yields</h3>
          </div>
          <p className="text-gray-300">
            Watch your vault grow as the admin invests in yield-generating strategies. All members share in the profits proportionally.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
