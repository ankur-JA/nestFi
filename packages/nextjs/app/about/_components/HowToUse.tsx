"use client";

import { motion } from "framer-motion";
import { 
  PlusCircleIcon, 
  UserGroupIcon, 
  BanknotesIcon, 
  ArrowTrendingUpIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

const steps = [
  {
    step: "01",
    icon: PlusCircleIcon,
    title: "Create Your Vault",
    description: "Deploy a new vault with customizable parameters including deposit caps, minimum investments, and access controls.",
    features: ["Custom deposit limits", "Allowlist management", "Strategy selection"]
  },
  {
    step: "02",
    icon: UserGroupIcon,
    title: "Onboard Members",
    description: "Invite trusted participants by adding their wallet addresses to your vault's allowlist for permissioned access.",
    features: ["Wallet verification", "Role assignment", "Capacity management"]
  },
  {
    step: "03",
    icon: BanknotesIcon,
    title: "Pool Capital",
    description: "Members deposit USDC and receive proportional vault shares representing their ownership stake.",
    features: ["Gasless deposits", "Real-time shares", "Transparent pricing"]
  },
  {
    step: "04",
    icon: ArrowTrendingUpIcon,
    title: "Generate Yield",
    description: "Vault curators deploy capital across vetted DeFi strategies while all members share in the returns.",
    features: ["Strategy diversification", "Automatic compounding", "Performance tracking"]
  }
];

export default function HowToUse() {
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
          Getting Started
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-5xl font-bold text-white mb-6"
        >
          How It Works
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl text-gray-400 max-w-2xl mx-auto"
        >
          From vault creation to yield generation—a streamlined process 
          designed for both curators and investors.
        </motion.p>
      </div>

      {/* Steps */}
      <div className="relative">
        {/* Connecting line */}
        <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-red-500/50 via-pink-500/50 to-purple-500/50" />

        <div className="space-y-12 lg:space-y-24">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative grid lg:grid-cols-2 gap-8 lg:gap-16 items-center ${
                index % 2 === 1 ? "lg:direction-rtl" : ""
              }`}
            >
              {/* Content */}
              <div className={`${index % 2 === 1 ? "lg:order-2 lg:text-right" : ""}`}>
                <div className={`flex items-center gap-4 mb-4 ${index % 2 === 1 ? "lg:justify-end" : ""}`}>
                  <span className="text-5xl font-bold text-gray-800">{step.step}</span>
                  <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                </div>
                <p className="text-gray-400 text-lg leading-relaxed mb-6">
                  {step.description}
                </p>
                <ul className={`space-y-2 ${index % 2 === 1 ? "lg:items-end" : ""}`}>
                  {step.features.map((feature) => (
                    <li 
                      key={feature} 
                      className={`flex items-center gap-2 text-gray-300 ${
                        index % 2 === 1 ? "lg:flex-row-reverse" : ""
                      }`}
                    >
                      <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual Card */}
              <div className={`${index % 2 === 1 ? "lg:order-1" : ""}`}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-2xl blur-2xl" />
                  <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700/50">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mb-6">
                      <step.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="h-32 bg-gray-800/50 rounded-xl border border-gray-700/30 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">Interactive Demo Coming Soon</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center dot for timeline */}
              <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gradient-to-r from-red-500 to-pink-500 border-4 border-black z-10" />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
