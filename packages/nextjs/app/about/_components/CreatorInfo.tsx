"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CodeBracketIcon } from "@heroicons/react/24/outline";

export default function CreatorInfo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="mb-12"
    >
      <h2 className="text-2xl font-bold text-red-400 mb-6">Built With ❤️</h2>
      <div className="bg-white/5 p-6 rounded-lg border border-red-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-red-400 mb-2">NestFi Team</h3>
            <p className="text-gray-300 mb-4">
              A passionate team building the future of decentralized group investing. 
              We believe in making DeFi accessible to everyone through collaborative investment strategies.
            </p>
            <p className="text-gray-400 text-sm">
              Built with Scaffold-ETH 2, Next.js, and Solidity
            </p>
          </div>
          <div className="flex space-x-4">
            <Link
              href="https://github.com/your-username/nestfi"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
              <CodeBracketIcon className="h-5 w-5" />
              <span>GitHub</span>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
