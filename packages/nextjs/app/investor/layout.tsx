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
import { useTheme } from "~~/contexts/ThemeContext";

const sidebarLinks = [
  { href: "/investor", label: "Browse Vaults", icon: MagnifyingGlassIcon },
  { href: "/investor/portfolio", label: "My Vaults", icon: WalletIcon },
];

export default function InvestorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div 
      className="min-h-screen flex flex-col transition-colors duration-300"
      style={{ 
        background: isDark ? '#0a0a0f' : '#ffffff',
      }}
    >
      {/* Top Header - Full Width */}
      <header 
        className="h-16 flex items-center justify-between px-4 sm:px-6 transition-colors duration-300"
        style={{
          background: isDark ? '#0a0a0f' : '#ffffff',
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        }}
      >
        <Link href="/">
          <NestFiLogo size="md" />
        </Link>
        <div className="flex items-center gap-3">
          <RainbowKitCustomConnectButton />
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside 
          className="w-64 flex flex-col transition-colors duration-300"
          style={{
            background: isDark ? '#0f0f15' : '#f8fafc',
            borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
          }}
        >
          {/* Navigation */}
          <nav className="flex-1 p-4 pt-6">
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
                          : isDark 
                            ? "text-gray-400 hover:text-white hover:bg-white/5"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
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
          <div 
            className="p-4 transition-colors duration-300"
            style={{
              borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            }}
          >
            <Link href="/">
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isDark 
                    ? "text-gray-400 hover:text-white hover:bg-white/5"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <HomeIcon className="h-5 w-5" />
                Back Home
              </motion.div>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main 
          className="flex-1 overflow-auto transition-colors duration-300"
          style={{
            background: isDark ? '#0a0a0f' : '#ffffff',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
