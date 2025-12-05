"use client";

import { motion } from "framer-motion";
import { CodeBracketIcon } from "@heroicons/react/24/outline";

const techStack = [
  { name: "Solidity", category: "Smart Contracts" },
  { name: "ERC-4626", category: "Vault Standard" },
  { name: "Next.js 15", category: "Frontend" },
  { name: "Wagmi/Viem", category: "Web3 SDK" },
  { name: "Foundry", category: "Development" },
  { name: "TailwindCSS", category: "Styling" },
];

export default function CreatorInfo() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8 }}
      className="relative py-20"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/5 to-transparent pointer-events-none" />

      <div className="relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-block text-sm font-semibold text-red-400 tracking-wider uppercase mb-4"
          >
            The Builder
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            Crafted by <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500">Gearhead</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto"
          >
            A solo developer passionate about building elegant, secure, and 
            user-centric DeFi applications.
          </motion.p>
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 via-pink-500/20 to-purple-500/20 rounded-3xl blur-xl" />
            
            <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 md:p-12 border border-gray-800">
              <div className="grid md:grid-cols-2 gap-12">
                {/* Left: Profile */}
                <div>
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-red-500/25">
                      G
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Gearhead</h3>
                      <p className="text-gray-400">Full-Stack Web3 Developer</p>
                    </div>
                  </div>

                  <div className="space-y-4 text-gray-300 leading-relaxed mb-8">
                    <p>
                      NestFi represents a vision for democratizing sophisticated investment 
                      strategies—making them accessible to everyday users through the power 
                      of decentralized technology.
                    </p>
                    <p>
                      Every line of code is written with security, efficiency, and user 
                      experience in mind. This is DeFi infrastructure built to last.
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                      Solo Builder
                    </span>
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Open Source
                    </span>
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      DeFi Native
                    </span>
                  </div>

                  {/* GitHub Button */}
                  <motion.a
                    href="https://github.com/ankur-JA/nestFi"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-3 px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <CodeBracketIcon className="h-5 w-5" />
                    View Source Code
                  </motion.a>
                </div>

                {/* Right: Tech Stack */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-6">Technology Stack</h4>
                  <div className="space-y-4">
                    {techStack.map((tech, index) => (
                      <motion.div
                        key={tech.name}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50"
                      >
                        <div>
                          <div className="font-medium text-white">{tech.name}</div>
                          <div className="text-sm text-gray-500">{tech.category}</div>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quote */}
              <div className="mt-12 pt-8 border-t border-gray-800">
                <blockquote className="text-center">
                  <p className="text-xl text-gray-300 italic mb-4">
                    &ldquo;Building the financial infrastructure I wish existed—transparent, 
                    accessible, and truly decentralized.&rdquo;
                  </p>
                  <cite className="text-gray-500">— Gearhead</cite>
                </blockquote>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
