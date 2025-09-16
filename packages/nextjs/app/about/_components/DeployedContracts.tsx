"use client";

import { motion } from "framer-motion";
import { ArrowTopRightOnSquareIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

const contracts = [
  {
    name: "ERC7702 Relayer",
    description: "Handles gasless transactions and ERC-7702 delegation",
    address: "0x515ede902A79075B6F600c24d38d3e25AE4D5ea4",
  },
  {
    name: "GroupVault Implementation",
    description: "Core vault logic with ERC-4626 standard",
    address: "0xC5961Aa5a79e9EcF41Eb7d106F70ca5D2DE25b5c",
  },
  {
    name: "Vault Factory",
    description: "Deploys new vault instances using minimal proxies",
    address: "0xF35821E65b52412c13eF759599956D81dAE7F85C0",
  },
  {
    name: "Aave V3 Strategy",
    description: "Yield strategy for Aave V3 lending",
    address: "0x3d15D0e9bf40108f3326c3c87c4BBA2c71FB6cf4",
  },
  {
    name: "Compound USDC Strategy",
    description: "Yield strategy for Compound V3 USDC lending",
    address: "0xeC0A4d5d92bb9E64C5BC7b4564EBe756A8AD12F5",
  },
  {
    name: "Uniswap V3 LP Strategy",
    description: "Liquidity provision strategy for Uniswap V3",
    address: "0x4419dd39553ac9686EcD5aDF925C451CBDF9dd66B",
  },
];

const getEtherscanUrl = (address: string) => {
  return `https://sepolia.etherscan.io/address/${address}`;
};

const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export default function DeployedContracts() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8 }}
      className="py-20"
    >
      <div className="text-center mb-16">
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
        >
          <ShieldCheckIcon className="h-8 w-8 text-white" />
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          Deployed <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-500">Contracts</span>
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-xl text-gray-300 max-w-3xl mx-auto"
        >
          All contracts are deployed on Ethereum Sepolia testnet and verified on Etherscan for full transparency
        </motion.p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contracts.map((contract, index) => (
          <motion.div
            key={contract.address}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="group"
          >
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30 hover:border-green-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 h-full">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-green-400 transition-colors">
                  {contract.name}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {contract.description}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Contract Address:</span>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-green-400 font-mono text-sm">
                      {formatAddress(contract.address)}
                    </code>
                    <motion.a
                      href={getEtherscanUrl(contract.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-xs font-medium transition-all duration-200 hover:shadow-sm"
                    >
                      View
                      <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                    </motion.a>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span>Verified on Etherscan</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="text-center mt-12"
      >
        <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700/30 max-w-2xl mx-auto">
          <h4 className="text-lg font-semibold text-white mb-2">Network Information</h4>
          <div className="text-gray-300 space-y-1">
            <p><span className="text-gray-400">Network:</span> Ethereum Sepolia Testnet</p>
            <p><span className="text-gray-400">Chain ID:</span> 11155111</p>
            <p><span className="text-gray-400">Block Explorer:</span> 
              <a 
                href="https://sepolia.etherscan.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 ml-1 underline"
              >
                sepolia.etherscan.io
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}
