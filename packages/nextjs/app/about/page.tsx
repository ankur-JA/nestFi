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
  CheckCircleIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  DocumentCheckIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  GlobeAltIcon,
  CommandLineIcon,
  CubeTransparentIcon,
} from "@heroicons/react/24/outline";
import { useTheme } from "~~/contexts/ThemeContext";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const curatorBenefits = [
  { icon: BoltIcon, text: "Deploy a professional vault in minutes" },
  { icon: LockClosedIcon, text: "Private or public access controls" },
  { icon: ChartBarIcon, text: "Automated share distribution" },
  { icon: EyeIcon, text: "Transparent performance tracking" },
  { icon: CurrencyDollarIcon, text: "Optional management + performance fees" },
];

const investorBenefits = [
  { icon: BanknotesIcon, text: "Simple USDC deposits" },
  { icon: DocumentCheckIcon, text: "Transparent on-chain records" },
  { icon: ArrowTrendingUpIcon, text: "Live vault performance" },
  { icon: ShieldCheckIcon, text: "Provable share ownership" },
  { icon: ClockIcon, text: "Withdraw anytime (no lock-ins)" },
  { icon: CommandLineIcon, text: "Built on open smart contracts" },
];

const problems = [
  "Manual deposits and payouts",
  "Spreadsheets instead of accounting",
  "No transparent tracking",
  "No fee automation",
  "No way to run a vault safely",
];

const features = [
  {
    icon: ShieldCheckIcon,
    title: "Secure Architecture",
    description: "Built using the widely adopted ERC-4626 vault standard.",
  },
  {
    icon: UserGroupIcon,
    title: "Collaborative Investing",
    description: "Designed for communities, friend groups, and emerging curators.",
  },
  {
    icon: EyeIcon,
    title: "Full Transparency",
    description: "Every deposit, withdrawal, share calculation, and yield distribution is visible on-chain.",
  },
  {
    icon: BoltIcon,
    title: "Gasless Experience",
    description: "ERC-7702 delegation + Permit2 signing for smooth mobile and web onboarding.",
  },
  {
    icon: CogIcon,
    title: "Proven Strategies",
    description: "Route capital to trusted DeFi protocols like Aave V3, Compound, and Uniswap V3.",
  },
  {
    icon: LockClosedIcon,
    title: "Non-Custodial by Design",
    description: "Your assets stay in smart contracts that you control—not centralized intermediaries.",
  },
];

const steps = [
  {
    num: "01",
    title: "Create a Vault",
    description: "Deploy a customizable ERC-4626 vault with your chosen parameters.",
  },
  {
    num: "02",
    title: "Invite Members",
    description: "Add trusted participants or open access publicly.",
  },
  {
    num: "03",
    title: "Pool Capital",
    description: "Members deposit USDC and receive proportional vault shares.",
  },
  {
    num: "04",
    title: "Earn Yield",
    description: "Deploy funds to strategies like Aave V3, Compound, or Uniswap V3.",
  },
];

export default function About() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div 
      className="relative min-h-screen transition-colors duration-300"
      style={{ 
        background: isDark ? '#030303' : 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 25%, #f0fdfa 50%, #ecfeff 75%, #f0f9ff 100%)',
      }}
    >
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{
            background: isDark
              ? "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{
            background: isDark
              ? "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 left-1/2 w-[800px] h-[400px] rounded-full blur-3xl"
          style={{
            background: isDark
              ? "radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="px-4 md:px-8 pt-16 pb-24">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8"
            >
              <span
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold tracking-wide"
                style={{
                  background: "linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(20,184,166,0.15) 100%)",
                  color: "#10b981",
                  border: "1px solid rgba(16,185,129,0.3)",
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
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-[1.15] tracking-tight"
              style={{ color: isDark ? "#ffffff" : "#0f172a" }}
            >
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Pool. Invest. Earn.
              </span>
              <br />
              <span style={{ color: isDark ? "#e5e7eb" : "#1e293b" }}>
                Together, On-Chain, Trustlessly.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-10"
              style={{ color: isDark ? "#9ca3af" : "#64748b" }}
            >
              NestFi makes group investing effortless. Whether you're a DeFi researcher, 
              a community leader, or a group of friends investing together, NestFi gives you 
              a transparent, automated vault you control entirely on-chain.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/curator">
                <button className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all hover:scale-[1.02]">
                  Start as Curator
                  <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link href="/investor">
                <button
                  className="px-8 py-4 rounded-xl font-semibold transition-all hover:scale-[1.02]"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                    color: isDark ? "#ffffff" : "#0f172a",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                  }}
                >
                  Invest in a Vault
                </button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* What NestFi Does */}
        <section className="px-4 md:px-8 py-20">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl p-8 md:p-12 overflow-hidden relative"
              style={{
                background: isDark
                  ? "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(20,184,166,0.04) 100%)"
                  : "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(20,184,166,0.05) 100%)",
                border: `1px solid ${isDark ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.2)"}`,
              }}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-3xl" />
              
              <h2
                className="text-3xl md:text-4xl font-bold mb-6"
                style={{ color: isDark ? "#ffffff" : "#0f172a" }}
              >
                What NestFi Does
              </h2>
              <p
                className="text-lg mb-10 max-w-2xl"
                style={{ color: isDark ? "#d1d5db" : "#4b5563" }}
              >
                NestFi lets trusted groups pool capital and deploy it into proven DeFi yield 
                strategies using fully on-chain vaults.
              </p>

              <div className="grid md:grid-cols-5 gap-4">
                {[
                  { icon: "👤", text: "Curators create the vault" },
                  { icon: "💵", text: "Members deposit USDC" },
                  { icon: "⚙️", text: "Smart contract handles accounting" },
                  { icon: "⚡", text: "Instant withdrawals" },
                  { icon: "🔍", text: "Everything on-chain" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="text-center p-4"
                  >
                    <div className="text-3xl mb-3">{item.icon}</div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: isDark ? "#e5e7eb" : "#374151" }}
                    >
                      {item.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Why People Use NestFi (Problem Section) */}
        <section className="px-4 md:px-8 py-20">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{ color: isDark ? "#ffffff" : "#0f172a" }}
              >
                Why People Use NestFi
              </h2>
              <p
                className="text-lg max-w-2xl mx-auto"
                style={{ color: isDark ? "#9ca3af" : "#64748b" }}
              >
                Group investing already exists—friend circles, Telegram channels, Discord servers, 
                DAO contributors—<span className="font-semibold" style={{ color: isDark ? "#f87171" : "#dc2626" }}>but the tools are broken:</span>
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Problems */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-3"
              >
                {problems.map((problem, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-4 rounded-xl"
                    style={{
                      background: isDark ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.05)",
                      border: `1px solid ${isDark ? "rgba(239,68,68,0.15)" : "rgba(239,68,68,0.1)"}`,
                    }}
                  >
                    <span className="text-red-500 text-lg">✗</span>
                    <span style={{ color: isDark ? "#fca5a5" : "#dc2626" }}>{problem}</span>
                  </div>
                ))}
              </motion.div>

              {/* Solution */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-8 rounded-2xl"
                style={{
                  background: isDark
                    ? "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.05) 100%)"
                    : "linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0.06) 100%)",
                  border: `1px solid ${isDark ? "rgba(16,185,129,0.2)" : "rgba(16,185,129,0.25)"}`,
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircleIcon className="h-6 w-6 text-emerald-500" />
                  </div>
                  <h3
                    className="text-xl font-bold"
                    style={{ color: isDark ? "#ffffff" : "#0f172a" }}
                  >
                    NestFi solves this
                  </h3>
                </div>
                <p
                  className="text-lg leading-relaxed"
                  style={{ color: isDark ? "#d1d5db" : "#4b5563" }}
                >
                  One simple system that handles <span className="text-emerald-500 font-semibold">deposits</span>, 
                  {" "}<span className="text-emerald-500 font-semibold">accounting</span>, 
                  {" "}<span className="text-emerald-500 font-semibold">share distribution</span>, 
                  {" "}<span className="text-emerald-500 font-semibold">fees</span>, and 
                  {" "}<span className="text-emerald-500 font-semibold">withdrawals</span>—automatically.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Designed For Section */}
        <section className="px-4 md:px-8 py-20">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* For Curators */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl p-8 relative overflow-hidden"
                style={{
                  background: isDark
                    ? "linear-gradient(180deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.02) 100%)"
                    : "linear-gradient(180deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.03) 100%)",
                  border: `1px solid ${isDark ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.2)"}`,
                }}
              >
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl" />
                
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #10b981, #14b8a6)" }}
                  >
                    <CubeTransparentIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3
                      className="text-2xl font-bold"
                      style={{ color: isDark ? "#ffffff" : "#0f172a" }}
                    >
                      For Curators
                    </h3>
                    <p className="text-sm" style={{ color: isDark ? "#6b7280" : "#64748b" }}>
                      DeFi analysts • Strategy builders • Community leaders
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {curatorBenefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <benefit.icon className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                      <span style={{ color: isDark ? "#d1d5db" : "#4b5563" }}>{benefit.text}</span>
                    </div>
                  ))}
                </div>

                <div
                  className="p-4 rounded-xl"
                  style={{
                    background: isDark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.5)",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
                  }}
                >
                  <p
                    className="text-sm italic"
                    style={{ color: isDark ? "#9ca3af" : "#64748b" }}
                  >
                    "You focus on the strategy. NestFi handles the operations, accounting, and mechanics."
                  </p>
                </div>
              </motion.div>

              {/* For Investors */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl p-8 relative overflow-hidden"
                style={{
                  background: isDark
                    ? "linear-gradient(180deg, rgba(59,130,246,0.08) 0%, rgba(59,130,246,0.02) 100%)"
                    : "linear-gradient(180deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.03) 100%)",
                  border: `1px solid ${isDark ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.2)"}`,
                }}
              >
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl" />
                
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
                  >
                    <UserGroupIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3
                      className="text-2xl font-bold"
                      style={{ color: isDark ? "#ffffff" : "#0f172a" }}
                    >
                      For Investors
                    </h3>
                    <p className="text-sm" style={{ color: isDark ? "#6b7280" : "#64748b" }}>
                      Community members • DAO contributors • Groups
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {investorBenefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <benefit.icon className="h-5 w-5 text-blue-500 flex-shrink-0" />
                      <span style={{ color: isDark ? "#d1d5db" : "#4b5563" }}>{benefit.text}</span>
                    </div>
                  ))}
                </div>

                <div
                  className="p-4 rounded-xl"
                  style={{
                    background: isDark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.5)",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
                  }}
                >
                  <p
                    className="text-sm italic"
                    style={{ color: isDark ? "#9ca3af" : "#64748b" }}
                  >
                    "No custodians. No trust assumptions. Just math and code."
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="px-4 md:px-8 py-20">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{ color: isDark ? "#ffffff" : "#0f172a" }}
              >
                How NestFi Works
              </h2>
              <p style={{ color: isDark ? "#6b7280" : "#64748b" }}>
                Four simple steps to decentralized group investing
              </p>
            </motion.div>

            <div className="relative">
              {/* Connection Line */}
              <div
                className="absolute top-16 left-0 right-0 h-0.5 hidden md:block"
                style={{
                  background: isDark
                    ? "linear-gradient(90deg, transparent, rgba(16,185,129,0.3), rgba(16,185,129,0.3), transparent)"
                    : "linear-gradient(90deg, transparent, rgba(16,185,129,0.4), rgba(16,185,129,0.4), transparent)",
                }}
              />

              <div className="grid md:grid-cols-4 gap-8">
                {steps.map((step, i) => (
                  <motion.div
                    key={step.num}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                    className="relative text-center"
                  >
                    <div
                      className="w-14 h-14 rounded-2xl mx-auto mb-6 flex items-center justify-center text-xl font-bold relative z-10"
                      style={{
                        background: "linear-gradient(135deg, #10b981, #14b8a6)",
                        color: "#ffffff",
                        boxShadow: "0 8px 30px rgba(16,185,129,0.3)",
                      }}
                    >
                      {step.num}
                    </div>
                    <h3
                      className="text-lg font-semibold mb-2"
                      style={{ color: isDark ? "#ffffff" : "#0f172a" }}
                    >
                      {step.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: isDark ? "#9ca3af" : "#64748b" }}
                    >
                      {step.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mt-12 text-sm"
              style={{ color: isDark ? "#6b7280" : "#9ca3af" }}
            >
              ✓ All actions are recorded transparently on-chain
            </motion.p>
          </div>
        </section>

        {/* Key Features */}
        <section className="px-4 md:px-8 py-20">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{ color: isDark ? "#ffffff" : "#0f172a" }}
              >
                Key Features
              </h2>
              <p style={{ color: isDark ? "#6b7280" : "#64748b" }}>
                Enterprise-grade infrastructure for everyone
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="group p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                    style={{
                      background: isDark ? "rgba(16,185,129,0.1)" : "rgba(16,185,129,0.1)",
                    }}
                  >
                    <feature.icon className="h-6 w-6 text-emerald-500" />
                  </div>
                  <h3
                    className="text-lg font-semibold mb-2"
                    style={{ color: isDark ? "#ffffff" : "#0f172a" }}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: isDark ? "#9ca3af" : "#64748b" }}>
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Vision */}
        <section className="px-4 md:px-8 py-20">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl p-10 md:p-14 text-center relative overflow-hidden"
              style={{
                background: isDark
                  ? "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(59,130,246,0.05) 50%, rgba(139,92,246,0.05) 100%)"
                  : "linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(59,130,246,0.08) 50%, rgba(139,92,246,0.08) 100%)",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
              }}
            >
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-20 -left-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl" />
              </div>

              <div className="relative z-10">
                <GlobeAltIcon
                  className="h-12 w-12 mx-auto mb-6"
                  style={{ color: "#10b981" }}
                />
                <h2
                  className="text-3xl md:text-4xl font-bold mb-6"
                  style={{ color: isDark ? "#ffffff" : "#0f172a" }}
                >
                  Our Vision
                </h2>
                <p
                  className="text-lg mb-8 max-w-2xl mx-auto leading-relaxed"
                  style={{ color: isDark ? "#d1d5db" : "#4b5563" }}
                >
                  NestFi is building the future of decentralized group investing. A world where:
                </p>

                <div className="grid sm:grid-cols-2 gap-4 max-w-xl mx-auto mb-10">
                  {[
                    "Anyone can launch a vault",
                    "Anyone can invest with transparency",
                    "Small groups operate like pro funds",
                    "Performance is provable on-chain",
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-2 justify-center"
                    >
                      <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
                      <span style={{ color: isDark ? "#e5e7eb" : "#374151" }}>{item}</span>
                    </motion.div>
                  ))}
                </div>

                <p
                  className="text-xl font-semibold"
                  style={{ color: isDark ? "#ffffff" : "#0f172a" }}
                >
                  NestFi democratizes asset management—
                  <br />
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                    simple, trustless, and accessible.
                  </span>
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 md:px-8 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{ color: isDark ? "#ffffff" : "#0f172a" }}
              >
                Ready to get started?
              </h2>
              <p
                className="text-lg mb-10"
                style={{ color: isDark ? "#6b7280" : "#64748b" }}
              >
                Create your vault or explore existing opportunities.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/curator">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="group px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/25"
                  >
                    Launch a Vault
                    <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>
                <Link href="/investor">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-10 py-4 rounded-xl font-semibold"
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
      </div>
    </div>
  );
}
