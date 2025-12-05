"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRightIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  BoltIcon,
  LockClosedIcon,
  EyeIcon,
  CogIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useTheme } from "~~/contexts/ThemeContext";

const features = [
  {
    icon: ShieldCheckIcon,
    title: "Bank-Grade Security",
    description: "Audited smart contracts following ERC-4626 standards with multi-signature controls.",
  },
  {
    icon: UserGroupIcon,
    title: "Collaborative Investing",
    description: "Pool resources with trusted partners, family, or DAO contributors.",
  },
  {
    icon: EyeIcon,
    title: "Full Transparency",
    description: "Every transaction and yield distribution recorded on-chain.",
  },
  {
    icon: BoltIcon,
    title: "Gasless Experience",
    description: "ERC-7702 delegation with Permit2 for seamless onboarding.",
  },
  {
    icon: CogIcon,
    title: "Proven Strategies",
    description: "Deploy to Aave V3, Compound, and Uniswap V3 protocols.",
  },
  {
    icon: LockClosedIcon,
    title: "Non-Custodial",
    description: "Your assets in smart contracts, never held by third parties.",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Create Vault",
    description: "Deploy your investment vault with custom parameters and access controls.",
  },
  {
    step: "02",
    title: "Invite Members",
    description: "Add trusted participants to your vault's allowlist.",
  },
  {
    step: "03",
    title: "Pool Capital",
    description: "Members deposit USDC and receive proportional vault shares.",
  },
  {
    step: "04",
    title: "Earn Yields",
    description: "Deploy across DeFi strategies and share returns.",
  },
];

export default function About() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="relative min-h-screen py-12 px-4 md:px-8">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full"
          style={{
            background: isDark
              ? "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 60%)"
              : "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 60%)",
          }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full"
          style={{
            background: isDark
              ? "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 60%)"
              : "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 60%)",
          }}
          animate={{ x: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Hero Section */}
        <section className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <span
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
              style={{
                background: isDark ? "rgba(16,185,129,0.1)" : "rgba(16,185,129,0.1)",
                color: isDark ? "#10b981" : "#059669",
                border: `1px solid ${isDark ? "rgba(16,185,129,0.2)" : "rgba(16,185,129,0.3)"}`,
              }}
            >
              <SparklesIcon className="h-4 w-4" />
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
            The Future of{" "}
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              Group Investing
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed"
            style={{ color: isDark ? "#9ca3af" : "#64748b" }}
          >
            NestFi enables trusted groups to pool capital and access institutional-grade yield 
            strategies through secure, transparent, and fully on-chain smart contracts.
          </motion.p>
        </section>

        {/* What is NestFi */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div
            className="rounded-2xl p-8 md:p-10"
            style={{
              background: isDark
                ? "linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(59,130,246,0.05) 100%)"
                : "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(59,130,246,0.08) 100%)",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"}`,
            }}
          >
            <h2
              className="text-2xl md:text-3xl font-bold mb-6"
              style={{ color: isDark ? "#ffffff" : "#0f172a" }}
            >
              What is NestFi?
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div style={{ color: isDark ? "#d1d5db" : "#4b5563" }}>
                <p className="text-lg leading-relaxed mb-4">
                  NestFi is a decentralized asset management protocol that enables groups to 
                  pool capital and deploy sophisticated yield strategies collectively.
                </p>
                <p className="leading-relaxed">
                  Built on the ERC-4626 tokenized vault standard, NestFi gives you full control 
                  and visibility over your investments without trusting centralized custodians.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "TVL", value: "$0.00", sub: "Total Value Locked" },
                  { label: "Vaults", value: "0", sub: "Active Vaults" },
                  { label: "Network", value: "Sepolia", sub: "Testnet" },
                  { label: "Standard", value: "ERC-4626", sub: "Vault Token" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="p-4 rounded-xl text-center"
                    style={{
                      background: isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.5)",
                      border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
                    }}
                  >
                    <div
                      className="text-xl font-bold"
                      style={{ color: isDark ? "#10b981" : "#059669" }}
                    >
                      {stat.value}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: isDark ? "#6b7280" : "#9ca3af" }}
                    >
                      {stat.sub}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* How It Works */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2
            className="text-2xl md:text-3xl font-bold text-center mb-12"
            style={{ color: isDark ? "#ffffff" : "#0f172a" }}
          >
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {howItWorks.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div
                  className="text-5xl font-bold mb-4"
                  style={{ color: isDark ? "rgba(16,185,129,0.2)" : "rgba(16,185,129,0.3)" }}
                >
                  {item.step}
                </div>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: isDark ? "#ffffff" : "#0f172a" }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-sm"
                  style={{ color: isDark ? "#9ca3af" : "#64748b" }}
                >
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Features */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2
            className="text-2xl md:text-3xl font-bold text-center mb-4"
            style={{ color: isDark ? "#ffffff" : "#0f172a" }}
          >
            Key Features
          </h2>
          <p
            className="text-center mb-12"
            style={{ color: isDark ? "#6b7280" : "#64748b" }}
          >
            Enterprise-grade infrastructure for everyone.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-xl transition-all hover:scale-[1.02]"
                style={{
                  background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"}`,
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    background: isDark ? "rgba(16,185,129,0.1)" : "rgba(16,185,129,0.1)",
                  }}
                >
                  <feature.icon className="h-6 w-6" style={{ color: "#10b981" }} />
                </div>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: isDark ? "#ffffff" : "#0f172a" }}
                >
                  {feature.title}
                </h3>
                <p className="text-sm" style={{ color: isDark ? "#9ca3af" : "#64748b" }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: isDark ? "#ffffff" : "#0f172a" }}
          >
            Ready to start?
          </h2>
          <p className="mb-8" style={{ color: isDark ? "#6b7280" : "#64748b" }}>
            Create your vault or explore existing opportunities.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/createvault">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20"
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
        </motion.section>
      </div>
    </div>
  );
}
