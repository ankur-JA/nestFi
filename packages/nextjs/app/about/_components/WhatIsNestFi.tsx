"use client";

import { motion } from "framer-motion";
import { 
  CubeTransparentIcon, 
  LockClosedIcon, 
  UsersIcon, 
  ChartBarIcon,
  BoltIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";

const highlights = [
  {
    icon: CubeTransparentIcon,
    title: "Tokenized Vaults",
    description: "ERC-4626 compliant vault shares representing your proportional ownership"
  },
  {
    icon: LockClosedIcon,
    title: "Non-Custodial",
    description: "Your assets remain in audited smart contracts, never held by third parties"
  },
  {
    icon: UsersIcon,
    title: "Permissioned Access",
    description: "Curator-controlled allowlists ensure only trusted participants join"
  },
  {
    icon: ChartBarIcon,
    title: "Transparent Accounting",
    description: "Real-time NAV calculations and full on-chain transaction history"
  },
  {
    icon: BoltIcon,
    title: "Gas Optimized",
    description: "ERC-7702 delegation and Permit2 for gasless user experiences"
  },
  {
    icon: ShieldCheckIcon,
    title: "Battle-Tested",
    description: "Built on proven DeFi primitives: Aave, Compound, and Uniswap"
  }
];

export default function WhatIsNestFi() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8 }}
      className="relative"
    >
      {/* Section Header */}
      <div className="text-center mb-16">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-block text-sm font-semibold text-red-400 tracking-wider uppercase mb-4"
        >
          Protocol Overview
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-5xl font-bold text-white mb-6"
        >
          What is NestFi?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed"
        >
          NestFi is a decentralized asset management protocol that enables trusted groups 
          to pool capital and deploy sophisticated yield strategies collectively—all governed 
          by transparent, immutable smart contracts.
        </motion.p>
      </div>

      {/* Main Content Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-gray-800/50 mb-12"
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Description */}
          <div>
            <h3 className="text-2xl font-semibold text-white mb-6">
              Institutional Infrastructure for Everyone
            </h3>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                Traditional asset management requires trust in centralized custodians and opaque 
                fee structures. NestFi eliminates these barriers by leveraging the ERC-4626 
                tokenized vault standard.
              </p>
              <p>
                Vault curators can deploy capital across vetted DeFi strategies while members 
                maintain full visibility into every transaction. Share prices update in real-time, 
                reflecting the true value of underlying assets.
              </p>
              <p>
                Whether you&apos;re managing a family office, investment club, or DAO treasury, 
                NestFi provides the infrastructure to operate with institutional rigor and 
                complete transparency.
              </p>
            </div>
          </div>

          {/* Right: Visual */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-purple-500/20 rounded-2xl blur-3xl" />
            <div className="relative bg-gray-800/50 rounded-2xl p-8 border border-gray-700/50">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 mb-4">
                  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                    <path d="M2 17L12 22L22 17" />
                    <path d="M2 12L12 17L22 12" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-white">NestFi Protocol</h4>
                <p className="text-sm text-gray-400 mt-1">Decentralized Vault Management</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                  <span className="text-gray-400">Total Value Locked</span>
                  <span className="text-white font-mono">$0.00</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                  <span className="text-gray-400">Active Vaults</span>
                  <span className="text-white font-mono">0</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                  <span className="text-gray-400">Network</span>
                  <span className="text-green-400 font-mono">Sepolia</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Feature Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {highlights.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group p-6 bg-gray-900/50 rounded-2xl border border-gray-800/50 hover:border-red-500/30 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-pink-500/20 flex items-center justify-center mb-4 group-hover:from-red-500/30 group-hover:to-pink-500/30 transition-all duration-300">
              <item.icon className="h-6 w-6 text-red-400" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">{item.title}</h4>
            <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
