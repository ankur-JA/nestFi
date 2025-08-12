"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import Image from "next/image";
import { motion } from "framer-motion";



const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
     // Added a subtle radial gradient to the background
    <div className="flex flex-col items-center justify-center flex-grow pt-10 bg-black text-white overflow-x-hidden">
      <div className="relative isolate px-4 text-center">
        {/* Decorative background glow */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>

        {/* Main Title with Animation */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500"
        >
          Group Investing Made Simple
        </motion.h1>

        {/* Description with Animation */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg text-gray-300 max-w-2xl mx-auto"
        >
          Create an investment vault, invite friends to deposit funds, and earn yields together. The vault admin
          controls the investments.
        </motion.p>
      </div>

      {/* Central Image with Animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="my-8"
      >
        <Image
          src="/removed_button.png" // IMPORTANT: Replace this with the actual path to your image
          width={400}
          height={300}
          alt="Two people discussing investments at a table"
          className="rounded-lg shadow-2xl shadow-red-500/20"
        />
      </motion.div>

      {/* Get Started Button with Animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Link
          href="/createvault"
          passHref
          className="inline-block bg-red-500 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-red-600 transform hover:scale-105 transition-transform duration-300 ease-in-out"
        >
          GET STARTED
        </Link>
      </motion.div>
    </div>
  );
};

export default Home;
