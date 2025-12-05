"use client";

import { motion } from "framer-motion";
import { ArrowTopRightOnSquareIcon, CubeIcon, CheckBadgeIcon } from "@heroicons/react/24/outline";

const contracts = [
  {
    name: "ERC7702 Relayer",
    description: "Gasless transaction handler with ERC-7702 delegation support",
    address: "0x515ede902A79075B6F600c24d38d3e25AE4D5ea4",
    type: "Infrastructure"
  },
  {
    name: "GroupVault Implementation",
    description: "Core vault logic implementing ERC-4626 tokenized vault standard",
    address: "0xC5961Aa5a79e9EcF41Eb7d106F70ca5D2DE25b5c",
    type: "Core"
  },
  {
    name: "Vault Factory",
    description: "Deploys minimal proxy vault instances with deterministic addresses",
    address: "0xF35821E65b52412c13eF759599956D81dAE7F85C",
    type: "Core"
  },
  {
    name: "Aave V3 Strategy",
    description: "Lending adapter for Aave V3 USDC supply positions",
    address: "0x3d15D0e9bf40108f3326c3c87c4BBA2c71FB6cf4",
    type: "Strategy"
  },
  {
    name: "Compound Strategy",
    description: "Lending adapter for Compound V3 USDC market",
    address: "0xeC0A4d5d92bb9E64C5BC7b4564EBe756A8AD12F5",
    type: "Strategy"
  },
  {
    name: "Uniswap V3 LP Strategy",
    description: "Concentrated liquidity provision for Uniswap V3 pools",
    address: "0x4419dd39553ac9686EcD5aDF925C451CBDF9dd66",
    type: "Strategy"
  },
];

const getEtherscanUrl = (address: string) => {
  return `https://sepolia.etherscan.io/address/${address}`;
};

const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "Core": return "text-red-400 bg-red-400/10 border-red-400/20";
    case "Strategy": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
    case "Infrastructure": return "text-purple-400 bg-purple-400/10 border-purple-400/20";
    default: return "text-gray-400 bg-gray-400/10 border-gray-400/20";
  }
};

export default function DeployedContracts() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8 }}
      className="relative py-20"
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
          On-Chain Infrastructure
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-5xl font-bold text-white mb-6"
        >
          Deployed Contracts
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl text-gray-400 max-w-2xl mx-auto"
        >
          All smart contracts are deployed on Ethereum Sepolia testnet 
          and verified on Etherscan for complete transparency.
        </motion.p>
      </div>

      {/* Contracts Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {contracts.map((contract, index) => (
          <motion.div
            key={contract.address}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group"
          >
            <div className="h-full bg-gradient-to-br from-gray-900 to-gray-800/50 rounded-2xl p-6 border border-gray-800 hover:border-gray-700 transition-all duration-300">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center">
                  <CubeIcon className="h-6 w-6 text-gray-400" />
                </div>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getTypeColor(contract.type)}`}>
                  {contract.type}
                </span>
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-red-400 transition-colors">
                {contract.name}
              </h3>
              <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                {contract.description}
              </p>

              {/* Address & Link */}
              <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Contract Address</div>
                    <code className="text-sm text-green-400 font-mono">
                      {formatAddress(contract.address)}
                    </code>
                  </div>
                  <motion.a
                    href={getEtherscanUrl(contract.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    View
                    <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                  </motion.a>
                </div>
              </div>

              {/* Verified badge */}
              <div className="flex items-center gap-2 mt-3 text-xs text-emerald-400">
                <CheckBadgeIcon className="h-4 w-4" />
                <span>Verified on Etherscan</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Network Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-800">
          <div className="text-center mb-6">
            <h4 className="text-xl font-semibold text-white mb-2">Network Configuration</h4>
            <p className="text-gray-400 text-sm">Currently deployed on Ethereum testnet</p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-gray-800/50 rounded-xl">
              <div className="text-sm text-gray-500 mb-1">Network</div>
              <div className="font-semibold text-white">Sepolia</div>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-xl">
              <div className="text-sm text-gray-500 mb-1">Chain ID</div>
              <div className="font-semibold text-white font-mono">11155111</div>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-xl">
              <div className="text-sm text-gray-500 mb-1">Status</div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="font-semibold text-green-400">Live</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}
