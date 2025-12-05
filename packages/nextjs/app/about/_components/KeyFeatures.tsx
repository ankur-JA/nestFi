"use client";

import { motion } from "framer-motion";
import {
  ShieldCheckIcon,
  UsersIcon,
  EyeIcon,
  BoltIcon,
  CpuChipIcon,
  AdjustmentsHorizontalIcon,
  LockClosedIcon,
  ArrowPathIcon,
  CurrencyDollarIcon
} from "@heroicons/react/24/outline";

const features = [
  {
    icon: ShieldCheckIcon,
    title: "Bank-Grade Security",
    description: "Audited smart contracts following ERC-4626 standards with multi-signature controls and emergency pause functionality.",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    icon: UsersIcon,
    title: "Collaborative Investing",
    description: "Pool resources with trusted partners, family members, or DAO contributors for collective yield generation.",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: EyeIcon,
    title: "Full Transparency",
    description: "Every transaction, fee, and yield distribution is recorded on-chain and verifiable by all participants.",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    icon: BoltIcon,
    title: "Gasless Experience",
    description: "ERC-7702 delegation combined with Permit2 enables sponsored transactions for seamless onboarding.",
    gradient: "from-yellow-500 to-orange-500"
  },
  {
    icon: CpuChipIcon,
    title: "Proven Strategies",
    description: "Deploy capital to battle-tested protocols: Aave V3 lending, Compound USDC markets, and Uniswap V3 LP.",
    gradient: "from-red-500 to-pink-500"
  },
  {
    icon: AdjustmentsHorizontalIcon,
    title: "Curator Controls",
    description: "Comprehensive admin dashboard for allowlist management, deposit caps, strategy allocation, and emergency controls.",
    gradient: "from-indigo-500 to-purple-500"
  }
];

const technicalFeatures = [
  {
    icon: LockClosedIcon,
    label: "Non-Custodial",
    description: "Assets secured by smart contracts"
  },
  {
    icon: ArrowPathIcon,
    label: "Composable",
    description: "Integrate with any DeFi protocol"
  },
  {
    icon: CurrencyDollarIcon,
    label: "Fee Transparency",
    description: "Clear, on-chain fee structures"
  }
];

export default function KeyFeatures() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8 }}
      className="relative py-20"
    >
      {/* Section Header */}
      <div className="text-center mb-20">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-block text-sm font-semibold text-red-400 tracking-wider uppercase mb-4"
        >
          Platform Capabilities
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-5xl font-bold text-white mb-6"
        >
          Enterprise Features
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl text-gray-400 max-w-2xl mx-auto"
        >
          Built for professional asset managers and sophisticated investors 
          who demand the highest standards of security and transparency.
        </motion.p>
      </div>

      {/* Main Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group relative"
          >
            {/* Hover glow effect */}
            <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
            
            <div className="relative h-full bg-gradient-to-br from-gray-900 to-gray-800/50 rounded-2xl p-8 border border-gray-800 group-hover:border-gray-700 transition-all duration-300">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Technical Features Bar */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-800"
      >
        <div className="grid md:grid-cols-3 gap-8">
          {technicalFeatures.map((item, index) => (
            <div key={item.label} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <item.icon className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <div className="font-semibold text-white">{item.label}</div>
                <div className="text-sm text-gray-400">{item.description}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.section>
  );
}
