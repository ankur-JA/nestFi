"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  MagnifyingGlassIcon, 
  WalletIcon,
  HomeIcon
} from "@heroicons/react/24/outline";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import NestFiLogo from "~~/components/NestFiLogo";

const sidebarLinks = [
  { href: "/investor", label: "Vaults", icon: MagnifyingGlassIcon },
  { href: "/investor/portfolio", label: "My Vaults", icon: WalletIcon },
];

export default function InvestorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f0f15] border-r border-gray-800/50 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800/50">
          <Link href="/">
            <NestFiLogo size="md" />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link key={link.href} href={link.href}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {link.label}
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Back to Home */}
        <div className="p-4 border-t border-gray-800/50">
          <Link href="/">
            <motion.div
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
            >
              <HomeIcon className="h-5 w-5" />
              Back to Home
            </motion.div>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-16 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-gray-800/50 flex items-center justify-end px-6">
          <RainbowKitCustomConnectButton />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

