"use client";

import { motion } from "framer-motion";
import AboutHeader from "./_components/AboutHeader";
import WhatIsNestFi from "./_components/WhatIsNestFi";
import HowToUse from "./_components/HowToUse";
import KeyFeatures from "./_components/KeyFeatures";
import CreatorInfo from "./_components/CreatorInfo";
import GetStartedCTA from "./_components/GetStartedCTA";

export default function About() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden relative">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-purple-500/5 rounded-full blur-2xl animate-pulse delay-500"></div>
        <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1500"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <AboutHeader />
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="space-y-24"
          >
            <WhatIsNestFi />
            <HowToUse />
            <KeyFeatures />
            <CreatorInfo />
            <GetStartedCTA />
          </motion.div>
        </div>
      </div>

      {/* Decorative gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-black/20 to-black pointer-events-none"></div>
    </div>
  );
}