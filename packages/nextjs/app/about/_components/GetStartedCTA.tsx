"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function GetStartedCTA() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="text-center mb-12"
    >
      <Link
        href="/createvault"
        className="inline-block bg-red-500 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-red-600 transform hover:scale-105 transition-all duration-300 ease-in-out"
      >
        Start Creating Your Vault
      </Link>
    </motion.div>
  );
}
