"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRightIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  UserGroupIcon,
  CubeTransparentIcon,
  BoltIcon,
  LockClosedIcon,
  EyeIcon,
  CogIcon,
  CheckIcon,
  CodeBracketIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { Header } from "~~/components/Header";
import { Footer } from "~~/components/Footer";
import { useTheme } from "~~/contexts/ThemeContext";

const features = [
  {
    icon: ShieldCheckIcon,
    title: "Bank-Grade Security",
    description: "Audited smart contracts with ERC-4626 standards and emergency pause functionality.",
  },
  {
    icon: UserGroupIcon,
    title: "Collaborative Investing",
    description: "Pool resources with trusted partners for collective yield generation.",
  },
  {
    icon: EyeIcon,
    title: "Full Transparency",
    description: "Every transaction and yield distribution is recorded on-chain.",
  },
  {
    icon: BoltIcon,
    title: "Gasless Experience",
    description: "ERC-7702 delegation with Permit2 enables sponsored transactions.",
  },
  {
    icon: CogIcon,
    title: "Proven Strategies",
    description: "Deploy capital to Aave V3, Compound, and Uniswap V3.",
  },
  {
    icon: LockClosedIcon,
    title: "Non-Custodial",
    description: "Your assets remain in smart contracts, never held by third parties.",
  },
];

const contracts = [
  { name: "Vault Factory", address: "0xF358...F85C", type: "Core" },
  { name: "GroupVault", address: "0xC596...5b5c", type: "Core" },
  { name: "Aave Strategy", address: "0x3d15...6cf4", type: "Strategy" },
  { name: "Compound Strategy", address: "0xeC0A...12F5", type: "Strategy" },
];

const techStack = [
  "Solidity",
  "ERC-4626",
  "Next.js 15",
  "Wagmi/Viem",
  "Foundry",
  "TailwindCSS",
];

export default function About() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className="min-h-screen relative overflow-hidden transition-colors duration-300"
      style={{ background: isDark ? "#030303" : "#fafafa" }}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 transition-colors duration-300"
          style={{
            background: isDark
              ? "linear-gradient(to bottom right, #020617, #030303, #020617)"
              : "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 25%, #f0fdfa 50%, #ecfeff 75%, #f0f9ff 100%)",
          }}
        />
        <motion.div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full"
          style={{
            background: isDark
              ? "radial-gradient(circle, rgba(20,184,166,0.12) 0%, rgba(20,184,166,0.04) 40%, transparent 70%)"
              : "radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.05) 40%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.8, 0.6] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <Header />

      <div className="relative z-10">
        {/* Hero */}
        <section className="px-6 lg:px-12 xl:px-20 pt-20 pb-16">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm"
                style={{
                  background: isDark ? "rgba(20,184,166,0.1)" : "rgba(16,185,129,0.1)",
                  border: `1px solid ${isDark ? "rgba(20,184,166,0.2)" : "rgba(16,185,129,0.3)"}`,
                  color: isDark ? "#2dd4bf" : "#059669",
                }}
              >
                About NestFi
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
              style={{ color: isDark ? "#ffffff" : "#0f172a" }}
            >
              Decentralized Asset Management for{" "}
              <span className="bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 bg-clip-text text-transparent">
                Everyone
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
              style={{ color: isDark ? "#9ca3af" : "#64748b" }}
            >
              NestFi enables trusted groups to pool capital and access institutional-grade 
              yield strategies through secure, transparent smart contracts.
            </motion.p>
          </div>
        </section>

        {/* What is NestFi */}
        <section className="px-6 lg:px-12 xl:px-20 py-16">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl p-8 md:p-12"
              style={{
                background: isDark
                  ? "linear-gradient(to bottom right, #0a0f14, #070a0d)"
                  : "linear-gradient(to bottom right, #ffffff, #f8fafc)",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"}`,
              }}
            >
              <h2
                className="text-2xl md:text-3xl font-bold mb-6"
                style={{ color: isDark ? "#ffffff" : "#0f172a" }}
              >
                What is NestFi?
              </h2>
              <div className="space-y-4" style={{ color: isDark ? "#9ca3af" : "#64748b" }}>
                <p className="text-lg leading-relaxed">
                  NestFi is a decentralized protocol that enables groups to pool capital and 
                  deploy sophisticated yield strategies collectively—all governed by transparent, 
                  immutable smart contracts.
                </p>
                <p className="leading-relaxed">
                  Traditional asset management requires trust in centralized custodians. 
                  NestFi eliminates these barriers by leveraging the ERC-4626 tokenized vault standard, 
                  giving you full control and visibility over your investments.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 lg:px-12 xl:px-20 py-16">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2
                className="text-3xl font-bold mb-4"
                style={{ color: isDark ? "#ffffff" : "#0f172a" }}
              >
                Key Features
              </h2>
              <p style={{ color: isDark ? "#6b7280" : "#64748b" }}>
                Built for professional asset managers and sophisticated investors.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-2xl transition-all"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"}`,
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{
                      background: isDark ? "rgba(20,184,166,0.1)" : "rgba(16,185,129,0.1)",
                    }}
                  >
                    <feature.icon
                      className="h-6 w-6"
                      style={{ color: isDark ? "#2dd4bf" : "#10b981" }}
                    />
                  </div>
                  <h3
                    className="text-lg font-semibold mb-2"
                    style={{ color: isDark ? "#ffffff" : "#0f172a" }}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-sm" style={{ color: isDark ? "#6b7280" : "#64748b" }}>
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Deployed Contracts */}
        <section className="px-6 lg:px-12 xl:px-20 py-16">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2
                className="text-3xl font-bold mb-4"
                style={{ color: isDark ? "#ffffff" : "#0f172a" }}
              >
                Deployed Contracts
              </h2>
              <p style={{ color: isDark ? "#6b7280" : "#64748b" }}>
                All contracts deployed on Sepolia testnet and verified on Etherscan.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-4">
              {contracts.map((contract, i) => (
                <motion.div
                  key={contract.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-5 rounded-xl flex items-center justify-between"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"}`,
                  }}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="font-medium"
                        style={{ color: isDark ? "#ffffff" : "#0f172a" }}
                      >
                        {contract.name}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: isDark ? "rgba(20,184,166,0.1)" : "rgba(16,185,129,0.1)",
                          color: isDark ? "#2dd4bf" : "#059669",
                        }}
                      >
                        {contract.type}
                      </span>
                    </div>
                    <code
                      className="text-sm font-mono"
                      style={{ color: isDark ? "#6b7280" : "#64748b" }}
                    >
                      {contract.address}
                    </code>
                  </div>
                  <a
                    href="#"
                    className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                    style={{ color: isDark ? "#6b7280" : "#64748b" }}
                  >
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Builder */}
        <section className="px-6 lg:px-12 xl:px-20 py-16">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl p-8 md:p-10 text-center"
              style={{
                background: isDark
                  ? "linear-gradient(to bottom right, #0a0f14, #070a0d)"
                  : "linear-gradient(to bottom right, #ffffff, #f8fafc)",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"}`,
              }}
            >
              <div
                className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center text-2xl font-bold"
                style={{
                  background: "linear-gradient(135deg, #14b8a6, #10b981)",
                  color: "#ffffff",
                }}
              >
                G
              </div>
              <h2
                className="text-2xl font-bold mb-2"
                style={{ color: isDark ? "#ffffff" : "#0f172a" }}
              >
                Built by Gearhead
              </h2>
              <p className="mb-6" style={{ color: isDark ? "#6b7280" : "#64748b" }}>
                Full-Stack Web3 Developer
              </p>
              <p
                className="mb-8 max-w-xl mx-auto"
                style={{ color: isDark ? "#9ca3af" : "#64748b" }}
              >
                Building elegant, secure, and user-centric DeFi applications. 
                NestFi represents a vision for democratizing sophisticated investment strategies.
              </p>

              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1.5 rounded-full text-sm"
                    style={{
                      background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                      color: isDark ? "#9ca3af" : "#64748b",
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <a
                href="https://github.com/ankur-JA/nestFi"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all"
                style={{
                  background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                  color: isDark ? "#ffffff" : "#0f172a",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                }}
              >
                <CodeBracketIcon className="h-5 w-5" />
                View Source Code
              </a>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 lg:px-12 xl:px-20 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{ color: isDark ? "#ffffff" : "#0f172a" }}
              >
                Ready to get started?
              </h2>
              <p className="mb-8" style={{ color: isDark ? "#6b7280" : "#64748b" }}>
                Create your vault or start investing in minutes.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/createvault">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/25"
                  >
                    Create Vault
                    <ArrowRightIcon className="h-4 w-4" />
                  </motion.button>
                </Link>
                <Link href="/vaults">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 rounded-xl font-semibold"
                    style={{
                      background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                      color: isDark ? "#ffffff" : "#0f172a",
                      border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                    }}
                  >
                    Explore Vaults
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section
          className="px-6 lg:px-12 xl:px-20 py-12"
          style={{ borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)"}` }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {[
                { icon: ShieldCheckIcon, label: "ERC-4626 Standard" },
                { icon: ChartBarIcon, label: "Multi-Strategy" },
                { icon: CubeTransparentIcon, label: "Non-Custodial" },
                { icon: UserGroupIcon, label: "Transparent" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2"
                  style={{ color: isDark ? "#6b7280" : "#64748b" }}
                >
                  <item.icon
                    className="h-5 w-5"
                    style={{ color: isDark ? "rgba(20,184,166,0.7)" : "#10b981" }}
                  />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
