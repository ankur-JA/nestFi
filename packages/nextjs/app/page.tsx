"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ChartBarIcon, 
  ShieldCheckIcon, 
  RocketLaunchIcon, 
  UsersIcon,
  ArrowRightIcon,
  StarIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";
import NestFiLogo from "~~/components/NestFiLogo";

const features = [
  {
    icon: ShieldCheckIcon,
    title: "Secure Vaults",
    description: "Your investments are protected by industry-leading security protocols and smart contract audits."
  },
  {
    icon: ChartBarIcon,
    title: "Smart Investing",
    description: "Automated strategies and professional management for optimal returns on your investments."
  },
  {
    icon: UsersIcon,
    title: "Community Driven",
    description: "Join a community of investors and share strategies for collective financial growth."
  },
  {
    icon: RocketLaunchIcon,
    title: "Gasless Transactions",
    description: "Experience seamless DeFi with our innovative gasless transaction technology."
  }
];

const stats = [
  { number: "100%", label: "Secure" },
  { number: "24/7", label: "Available" },
  { number: "0%", label: "Gas Fees" },
  { number: "∞", label: "Possibilities" }
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-red-500/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-40 right-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 left-1/3 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, 60, 0],
            y: [0, -40, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="flex items-center gap-3"
                >
                  <NestFiLogo size="lg" showText={false} />
                  <span className="text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                    Welcome to NestFi
                  </span>
                </motion.div>
                
                <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Your <span className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">Financial Nest</span> for the Future
                </h1>
                
                <p className="text-xl text-gray-300 leading-relaxed">
                  Discover the power of DeFi investment vaults. Secure, smart, and gasless - 
                  your journey to financial freedom starts here.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/createvault"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-red-500/25 transition-all duration-300"
                  >
                    <SparklesIcon className="h-5 w-5" />
                    Create Your First Vault
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gray-800/50 text-white font-semibold rounded-xl border border-gray-700 hover:bg-gray-700/50 transition-all duration-300"
                  >
                    <ChartBarIcon className="h-5 w-5" />
                    View Dashboard
                  </Link>
                </motion.div>
              </div>
            </motion.div>

            {/* Right side - Story illustration */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50">
                {/* Story scene */}
                <div className="space-y-6">
                  {/* Boy explaining to girl */}
                  <div className="flex items-center justify-center space-x-8">
                    {/* Boy */}
                    <motion.div
                      className="relative"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">👨‍💼</span>
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <StarIcon className="h-3 w-3 text-white" />
                      </div>
                    </motion.div>

                    {/* Vault visualization */}
                    <motion.div
                      className="relative"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <div className="w-32 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl border-4 border-yellow-300 relative overflow-hidden">
                        {/* Coins inside vault */}
                        <div className="absolute inset-2 flex flex-wrap gap-1">
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">$</span>
                          </div>
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">$</span>
                          </div>
                          <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">$</span>
                          </div>
                          <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">$</span>
                          </div>
                        </div>
                        {/* Growth indicator */}
                        <motion.div
                          className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                      </div>
                      <div className="text-center mt-2">
                        <span className="text-sm text-gray-300 font-medium">Investment Vault</span>
                      </div>
                    </motion.div>

                    {/* Girl */}
                    <motion.div
                      className="relative"
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">👩‍💼</span>
                      </div>
                      <div className="absolute -top-2 -left-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                        <SparklesIcon className="h-3 w-3 text-white" />
                      </div>
                    </motion.div>
                  </div>

                  {/* Explanation text */}
                  <div className="text-center space-y-3">
                    <motion.div
                      className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-4 border border-blue-500/30"
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <p className="text-gray-200 text-sm leading-relaxed">
                        <span className="font-semibold text-blue-400">"See how easy it is?"</span> 
                        <br />
                        "You just deposit your assets into a vault, and our smart contracts handle the rest. 
                        It's like having a professional investment manager, but completely decentralized!"
                      </p>
                    </motion.div>
                  </div>

                  {/* Connection lines */}
                  <div className="relative h-8">
                    <motion.div
                      className="absolute top-1/2 left-1/4 w-1/2 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                      animate={{ scaleX: [0, 1, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-gray-400 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Why Choose <span className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">NestFi</span>?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the future of DeFi with our innovative vault system designed for security, 
              efficiency, and maximum returns.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-red-500/30 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl p-12 border border-gray-700/50"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Start Your <span className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">Investment Journey</span>?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of investors who trust NestFi for their DeFi investments. 
              Create your first vault in minutes and start earning today.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/createvault"
                className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-red-500/25 transition-all duration-300 text-lg"
              >
                <SparklesIcon className="h-6 w-6" />
                Get Started Now
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
