"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowRightIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  UserGroupIcon,
  BanknotesIcon,
  CogIcon,
  CheckIcon,
  SparklesIcon,
  CubeTransparentIcon
} from "@heroicons/react/24/outline";
import { Header } from "~~/components/Header";
import { Footer } from "~~/components/Footer";
import { useTheme } from "~~/contexts/ThemeContext";

export default function HomePage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Track page view on mount (only once per session)
  useEffect(() => {
    const hasTracked = sessionStorage.getItem("nestfi_landing_viewed");
    
    if (!hasTracked) {
      // Track the page view
      fetch("/api/pageviews/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ page: "landing" }),
      }).catch(console.error);
      
      // Mark as tracked for this session
      sessionStorage.setItem("nestfi_landing_viewed", "true");
    }
  }, []);

  return (
    <div 
      className="min-h-screen relative overflow-x-hidden transition-colors duration-300"
      style={{ background: isDark ? '#030303' : '#fafafa' }}
    >
      
      {/* Premium Gradient Background */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 transition-colors duration-300"
          style={{ 
            background: isDark 
              ? 'linear-gradient(to bottom right, #020617, #030303, #020617)' 
              : 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 25%, #f0fdfa 50%, #ecfeff 75%, #f0f9ff 100%)' 
          }}
        />
        
        {/* Top glow */}
        <motion.div 
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[300px] h-[200px] sm:w-[500px] sm:h-[350px] md:w-[700px] md:h-[500px] lg:w-[900px] lg:h-[600px] rounded-full"
          style={{
            background: isDark 
              ? 'radial-gradient(circle, rgba(20,184,166,0.12) 0%, rgba(20,184,166,0.04) 40%, transparent 70%)'
              : 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.05) 40%, transparent 70%)',
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.8, 0.6] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Left glow */}
        <motion.div 
          className="absolute top-1/4 -left-10 sm:-left-16 md:-left-20 w-[200px] h-[200px] sm:w-[400px] sm:h-[400px] md:w-[600px] md:h-[600px] rounded-full"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.03) 50%, transparent 70%)'
              : 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, rgba(59,130,246,0.02) 50%, transparent 70%)',
          }}
          animate={{ x: [0, 40, 0], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Right glow */}
        <motion.div 
          className="absolute top-1/3 -right-10 sm:-right-16 md:-right-20 w-[200px] h-[200px] sm:w-[400px] sm:h-[400px] md:w-[600px] md:h-[600px] rounded-full"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.03) 50%, transparent 70%)'
              : 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.02) 50%, transparent 70%)',
          }}
          animate={{ x: [0, -40, 0], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <div className="relative z-10">
        
        {/* Hero Section */}
        <section className="px-4 sm:px-6 lg:px-12 xl:px-20 pt-16 sm:pt-20 pb-12 sm:pb-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-6 sm:mb-8"
              >
                <span 
                  className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm backdrop-blur-sm"
                  style={{
                    background: isDark ? 'rgba(20,184,166,0.1)' : 'rgba(16,185,129,0.1)',
                    border: `1px solid ${isDark ? 'rgba(20,184,166,0.2)' : 'rgba(16,185,129,0.3)'}`,
                    color: isDark ? '#2dd4bf' : '#059669',
                  }}
                >
                  <SparklesIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="whitespace-nowrap">The Future of DeFi Asset Management</span>
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-[1.1] tracking-tight px-2"
              >
                <span style={{ color: isDark ? '#ffffff' : '#0f172a' }}>Invest together.</span>
                <br />
                <span className="bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 bg-clip-text text-transparent">
                  Grow together.
                </span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed px-4"
                style={{ color: isDark ? '#9ca3af' : '#64748b' }}
              >
                Pool funds into curated DeFi vaults. Expert curators manage strategies, 
                investors earn yields. Fully transparent, on-chain.
              </motion.p>
            </div>

            {/* Role Selection Cards */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid lg:grid-cols-2 gap-6 sm:gap-8"
            >
              {/* Investor Card */}
              <div className="relative group">
                <div 
                  className="absolute -inset-1 rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition-all duration-500"
                  style={{ background: 'linear-gradient(to right, rgba(59,130,246,0.3), rgba(6,182,212,0.3))' }}
                />
                <div 
                  className="relative rounded-3xl p-6 sm:p-8 lg:p-10 transition-all duration-300 h-full"
                  style={{
                    background: isDark 
                      ? 'linear-gradient(to bottom right, #0a0f14, #070a0d)' 
                      : 'linear-gradient(to bottom right, #ffffff, #f8fafc)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`,
                    boxShadow: isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.06)',
                  }}
                >
                  
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6 sm:mb-8">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div 
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: isDark ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.1)',
                          border: `1px solid ${isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.2)'}`,
                        }}
                      >
                        <BanknotesIcon className="h-6 w-6 sm:h-7 sm:w-7 text-blue-500" />
                      </div>
                      <div>
                        <h2 
                          className="text-xl sm:text-2xl font-bold"
                          style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                        >
                          Investor
                        </h2>
                        <p className="text-sm sm:text-base" style={{ color: isDark ? '#6b7280' : '#64748b' }}>Deposit & Earn Yield</p>
                      </div>
                    </div>
                    <div 
                      className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-full flex-shrink-0"
                      style={{
                        background: isDark ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.1)',
                        border: `1px solid ${isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.2)'}`,
                      }}
                    >
                      <span className="text-xs font-medium text-blue-500 whitespace-nowrap">Passive Income</span>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p 
                    className="text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed"
                    style={{ color: isDark ? '#9ca3af' : '#64748b' }}
                  >
                    Deposit USDC into vaults managed by expert curators. Sit back and watch your investment grow with professional DeFi strategies.
                  </p>
                  
                  {/* Features Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                    {[
                      "Browse vault strategies",
                      "Deposit any amount",
                      "Earn DeFi yields",
                      "Withdraw anytime"
                    ].map((feature) => (
                      <div key={feature} className="flex items-center gap-2 sm:gap-3">
                        <div 
                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.15)' }}
                        >
                          <CheckIcon className="h-3 w-3 text-blue-500" />
                        </div>
                        <span 
                          className="text-xs sm:text-sm"
                          style={{ color: isDark ? '#9ca3af' : '#64748b' }}
                        >
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <Link href="/investor" className="block">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25"
                    >
                      Start Investing
                      <ArrowRightIcon className="h-4 w-4" />
                    </motion.button>
                  </Link>
                </div>
              </div>

              {/* Curator Card */}
              <div className="relative group">
                <div 
                  className="absolute -inset-1 rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition-all duration-500"
                  style={{ background: 'linear-gradient(to right, rgba(16,185,129,0.3), rgba(20,184,166,0.3))' }}
                />
                <div 
                  className="relative rounded-3xl p-6 sm:p-8 lg:p-10 transition-all duration-300 h-full"
                  style={{
                    background: isDark 
                      ? 'linear-gradient(to bottom right, #0a0f14, #070a0d)' 
                      : 'linear-gradient(to bottom right, #ffffff, #f8fafc)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`,
                    boxShadow: isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.06)',
                  }}
                >
                  
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6 sm:mb-8">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div 
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)',
                          border: `1px solid ${isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.2)'}`,
                        }}
                      >
                        <CogIcon className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-500" />
                      </div>
                      <div>
                        <h2 
                          className="text-xl sm:text-2xl font-bold"
                          style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                        >
                          Curator
                        </h2>
                        <p className="text-sm sm:text-base" style={{ color: isDark ? '#6b7280' : '#64748b' }}>Manage & Earn Fees</p>
                      </div>
                    </div>
                    <div 
                      className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-full flex-shrink-0"
                      style={{
                        background: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.1)',
                        border: `1px solid ${isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.2)'}`,
                      }}
                    >
                      <span className="text-xs font-medium text-emerald-500 whitespace-nowrap">Active Income</span>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p 
                    className="text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed"
                    style={{ color: isDark ? '#9ca3af' : '#64748b' }}
                  >
                    Create vaults, deploy strategies across DeFi protocols, and earn management fees. Build your reputation as a fund manager.
                  </p>
                  
                  {/* Features Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                    {[
                      "Create investment vaults",
                      "Multi-protocol strategies",
                      "Earn management fees",
                      "On-chain reputation"
                    ].map((feature) => (
                      <div key={feature} className="flex items-center gap-2 sm:gap-3">
                        <div 
                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.15)' }}
                        >
                          <CheckIcon className="h-3 w-3 text-emerald-500" />
                        </div>
                        <span 
                          className="text-xs sm:text-sm"
                          style={{ color: isDark ? '#9ca3af' : '#64748b' }}
                        >
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <Link href="/curator" className="block">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/25"
                    >
                      Create a Vault
                      <ArrowRightIcon className="h-4 w-4" />
                    </motion.button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Why NestFi - Simple & Clean */}
        <section className="px-4 sm:px-6 lg:px-12 xl:px-20 py-12 sm:py-16 md:py-20">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 text-center"
            >
              {[
                { 
                  emoji: "🔒", 
                  title: "Non-Custodial", 
                  desc: "Your funds, your control. Always." 
                },
                { 
                  emoji: "📊", 
                  title: "Transparent", 
                  desc: "Every transaction visible on-chain." 
                },
                { 
                  emoji: "⚡", 
                  title: "No Lock-ups", 
                  desc: "Withdraw anytime you want." 
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 sm:p-6"
                >
                  <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{item.emoji}</div>
                  <h3 
                    className="text-lg sm:text-xl font-bold mb-2"
                    style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-base" style={{ color: isDark ? '#6b7280' : '#64748b' }}>{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section 
          className="px-4 sm:px-6 lg:px-12 xl:px-20 py-12 sm:py-16"
          style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'}` }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-12 gap-y-4 sm:gap-y-6">
              {[
                { icon: ShieldCheckIcon, label: "ERC-4626 Standard" },
                { icon: ChartBarIcon, label: "Multi-Strategy Support" },
                { icon: UserGroupIcon, label: "Fully Transparent" },
                { icon: CubeTransparentIcon, label: "Non-Custodial" },
              ].map((item) => (
                <div 
                  key={item.label} 
                  className="flex items-center gap-2 sm:gap-3"
                  style={{ color: isDark ? '#6b7280' : '#64748b' }}
                >
                  <item.icon className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: isDark ? 'rgba(20,184,166,0.7)' : '#10b981' }} />
                  <span className="text-xs sm:text-sm font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
// trigger build
// trigger build
