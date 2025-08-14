"use client";

import React from "react";
import { motion } from "framer-motion";
import { SparklesIcon, RocketLaunchIcon, StarIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import NestFiLogo from "~~/components/NestFiLogo";

export const PageHeader = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-10 left-10 w-32 h-32 bg-red-500/20 rounded-full blur-2xl"
          animate={{ 
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-20 right-20 w-40 h-40 bg-pink-500/20 rounded-full blur-2xl"
          animate={{ 
            x: [0, -40, 0],
            y: [0, 40, 0],
            scale: [1, 0.8, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-10 left-1/3 w-24 h-24 bg-yellow-500/20 rounded-full blur-2xl"
          animate={{ 
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 text-center py-16 px-6">
        {/* Main title with enhanced effects */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          {/* Logo and title */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <NestFiLogo size="xl" showText={false} animated={true} />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-center"
            >
              <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-2">
                Create Your Vault
              </h1>
              <p className="text-xl text-gray-300 font-medium">
                Build Your Financial Future
              </p>
            </motion.div>
          </div>

          {/* Floating icons */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              whileHover={{ scale: 1.2, rotate: 360 }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full border border-blue-500/30"
            >
              <RocketLaunchIcon className="h-5 w-5 text-blue-400" />
              <span className="text-blue-300 font-medium">Launch</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              whileHover={{ scale: 1.2, rotate: 360 }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full border border-green-500/30"
            >
              <ShieldCheckIcon className="h-5 w-5 text-green-400" />
              <span className="text-green-300 font-medium">Secure</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              whileHover={{ scale: 1.2, rotate: 360 }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full border border-yellow-500/30"
            >
              <StarIcon className="h-5 w-5 text-yellow-400" />
              <span className="text-yellow-300 font-medium">Grow</span>
            </motion.div>
          </div>

          {/* Animated sparkles */}
          <div className="relative h-20">
            <motion.div
              className="absolute top-0 left-1/4 w-2 h-2 bg-yellow-400 rounded-full"
              animate={{ 
                y: [0, -20, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{ duration: 3, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="absolute top-4 right-1/3 w-1.5 h-1.5 bg-pink-400 rounded-full"
              animate={{ 
                y: [0, -15, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            />
            <motion.div
              className="absolute top-8 left-1/2 w-1 h-1 bg-blue-400 rounded-full"
              animate={{ 
                y: [0, -25, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
            />
            <motion.div
              className="absolute top-2 right-1/4 w-2.5 h-2.5 bg-red-400 rounded-full"
              animate={{ 
                y: [0, -18, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{ duration: 2.8, repeat: Infinity, delay: 1.5 }}
            />
          </div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="max-w-3xl mx-auto"
          >
            <p className="text-lg text-gray-300 leading-relaxed">
              Create your own investment vault and start building wealth with our innovative DeFi platform. 
              <span className="text-red-400 font-semibold"> Secure</span>, 
              <span className="text-pink-400 font-semibold"> smart</span>, and 
              <span className="text-purple-400 font-semibold"> gasless</span> - 
              your journey to financial freedom begins here.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
