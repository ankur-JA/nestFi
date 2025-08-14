"use client";

import { motion } from "framer-motion";
import { CodeBracketIcon, UserIcon, SparklesIcon } from "@heroicons/react/24/outline";

export default function CreatorInfo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="mb-12"
    >
      <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 mb-3">
        Made by Gearhead
      </h2>
      <p className="text-sm text-gray-400 mb-6 flex items-center justify-center gap-2">
        <SparklesIcon className="h-4 w-4 text-yellow-400" />
        Solo builder, designing and coding end‑to‑end for DeFi.
      </p>
      <div className="relative overflow-hidden rounded-xl border border-red-500/20 bg-white/5 shadow-xl shadow-red-500/5">
        <div className="absolute -inset-1 bg-gradient-to-r from-red-500/10 via-pink-500/10 to-purple-500/10 blur-2xl" />
        <div className="relative p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-md">
                <UserIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-red-400 mb-1">Gearhead</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-0.5 text-xs rounded-full bg-white/10 border border-white/10 text-gray-300">Solo Builder</span>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-white/10 border border-white/10 text-gray-300">Open Source</span>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-white/10 border border-white/10 text-gray-300">DeFi Native</span>
                </div>
                <p className="text-gray-300 max-w-xl">
                  Building NestFi to make decentralized, collaborative investing simple, safe, and elegant.
                </p>
                <p className="text-gray-400 text-sm mt-2">Built with Scaffold‑ETH 2, Next.js, Wagmi, and Solidity</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <a
                href="https://github.com/ankur-JA/nestFi"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors border border-white/10"
              >
                <CodeBracketIcon className="h-5 w-5" />
                <span>View Source</span>
              </a>
            </div>
          </div>
          <div className="mt-6 text-right text-sm text-gray-400">— Gearhead</div>
        </div>
      </div>
    </motion.div>
  );
}
