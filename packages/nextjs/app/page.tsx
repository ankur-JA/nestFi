"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowRightIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CubeTransparentIcon,
  BanknotesIcon,
  CogIcon
} from "@heroicons/react/24/outline";
import { Header } from "~~/components/Header";
import { Footer } from "~~/components/Footer";
import { useTheme } from "~~/contexts/ThemeContext";

const FADE_UP_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const } },
};

export default function HomePage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = mounted ? theme === "dark" : true; // Default dark for initial render

  useEffect(() => {
    setMounted(true);
    const hasTracked = sessionStorage.getItem("nestfi_landing_viewed");
    
    if (!hasTracked) {
      fetch("/api/pageviews/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: "landing" }),
      }).catch(console.error);
      
      sessionStorage.setItem("nestfi_landing_viewed", "true");
    }
  }, []);

  return (
    <div 
      className="min-h-screen relative overflow-x-hidden selection:bg-emerald-500/30 font-sans transition-colors duration-300"
      style={{ 
        backgroundColor: isDark ? '#000000' : '#ffffff',
        color: isDark ? '#ffffff' : '#09090b'
      }}
    >
      {/* Premium Fintech Background Grid */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Subtle Glows */}
      <div className="absolute inset-0 flex justify-center z-0 overflow-hidden pointer-events-none">
        <div className="w-full max-w-7xl relative">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px]" />
          <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-500/10 blur-[100px]" />
        </div>
      </div>

      <Header />

      <main className="relative z-10 flex flex-col items-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        {/* HERO SECTION */}
        <motion.div 
          initial="hidden"
          animate="show"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.15,
              },
            },
          }}
          className="text-center w-full max-w-4xl mx-auto mt-12 mb-20"
        >
          <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="flex justify-center mb-6">
            <div className="inline-flex items-center rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-3 py-1 text-sm text-zinc-600 dark:text-zinc-300 backdrop-blur-sm shadow-sm transition-colors">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2"></span>
              The Future of On-Chain Asset Management
            </div>
          </motion.div>

          <motion.h1 
            variants={FADE_UP_ANIMATION_VARIANTS}
            className="text-5xl md:text-7xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 mb-6 leading-[1.1]"
          >
            Invest together.
            <br />
            <span className="text-zinc-400 dark:text-zinc-500">Grow together.</span>
          </motion.h1>

          <motion.p 
            variants={FADE_UP_ANIMATION_VARIANTS}
            className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light"
          >
            Pool funds into curated DeFi vaults. Expert curators manage strategies, 
            investors earn yields. Fully transparent and strictly non-custodial.
          </motion.p>

          <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/investor" className="w-full sm:w-auto">
              <button 
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                Start Investing
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/curator" className="w-full sm:w-auto">
              <button 
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
              >
                Create a Vault
              </button>
            </Link>
          </motion.div>
        </motion.div>

        {/* METRICS SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full grid grid-cols-2 md:grid-cols-4 gap-8 py-10 mb-24 border-y border-zinc-200 dark:border-zinc-800/50"
        >
          {[
            { label: "Total Value Locked", value: "$42.5M" },
            { label: "Active Vaults", value: "128" },
            { label: "Average Yield", value: "14.2%" },
            { label: "Total Users", value: "14,500+" },
          ].map((metric, i) => (
            <div key={i} className="text-center">
              <h4 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">{metric.label}</h4>
              <p className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">{metric.value}</p>
            </div>
          ))}
        </motion.div>

        {/* BENTO BOX (ROLES) */}
        <div className="w-full mb-32">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-4">Choose your path</h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">Whether you want to passively earn or actively manage, NextFi has you covered.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div 
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative group rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-8 sm:p-10 shadow-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="h-14 w-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center mb-8">
                <BanknotesIcon className="h-7 w-7 text-emerald-500" />
              </div>
              
              <h3 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">Investors</h3>
              <p className="text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
                Deposit assets into community-vetted vaults. Sit back and watch your investment grow while professional curators execute complex DeFi strategies on your behalf.
              </p>
              
              <ul className="space-y-4 mb-8">
                {["One-click deposits", "Vetted risk profiles", "Withdraw any time, instantly"].map((item, i) => (
                  <li key={i} className="flex items-center text-zinc-700 dark:text-zinc-300 text-sm font-medium">
                    <ShieldCheckIcon className="h-5 w-5 text-emerald-500 mr-3" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative group rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-8 sm:p-10 shadow-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="h-14 w-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center mb-8">
                <CogIcon className="h-7 w-7 text-teal-500" />
              </div>
              
              <h3 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">Curators</h3>
              <p className="text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
                Launch your own on-chain fund. Define your strategy, attract capital, and earn performance fees while keeping operations entirely transparent.
              </p>
              
              <ul className="space-y-4 mb-8">
                {["Zero setup costs", "Automated fee distribution", "Build on-chain reputation"].map((item, i) => (
                  <li key={i} className="flex items-center text-zinc-700 dark:text-zinc-300 text-sm font-medium">
                    <ChartBarIcon className="h-5 w-5 text-teal-500 mr-3" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* FEATURES */}
        <div className="w-full pb-20">
          <div className="grid md:grid-cols-3 gap-12 text-center text-sm">
            {[
              {
                icon: CubeTransparentIcon,
                title: "Strictly Non-custodial",
                desc: "Your funds never leave the smart contract. Absolute control remains with the depositors."
              },
              {
                icon: ChartBarIcon,
                title: "ERC-4626 Standard",
                desc: "Built on Ethereum's standard for tokenized vaults, ensuring high composability."
              },
              {
                icon: ShieldCheckIcon,
                title: "Transparent Strategies",
                desc: "Every transaction, allocation, and fee is verifiable directly on the blockchain."
              }
            ].map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex flex-col items-center"
              >
                <div className="h-12 w-12 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mb-5">
                  <f.icon className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
                </div>
                <h4 className="font-semibold text-base text-zinc-900 dark:text-white mb-2">{f.title}</h4>
                <p className="text-zinc-500 dark:text-zinc-400 px-4">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
