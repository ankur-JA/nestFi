"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MagnifyingGlassIcon, 
  WalletIcon,
  HomeIcon,
  Bars3Icon,
  XMarkIcon
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Button - Mobile Only */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{
              color: isDark ? '#9ca3af' : '#64748b',
            }}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <Link href="/">
            <NestFiLogo size="md" />
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <RainbowKitCustomConnectButton />
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Mobile Overlay Backdrop */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <AnimatePresence>
          <motion.aside
            initial={false}
            animate={{
              x: sidebarOpen ? 0 : '-100%',
            }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`
              fixed md:static
              top-0 left-0 bottom-0
              w-64 flex flex-col z-50
              transition-colors duration-300
              md:translate-x-0
            `}
            style={{
              background: isDark ? '#0f0f15' : '#f8fafc',
              borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            }}
          >
            {/* Close Button - Mobile Only */}
            <div className="flex items-center justify-between p-4 border-b md:hidden" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
              <span className="text-sm font-semibold" style={{ color: isDark ? '#ffffff' : '#0f172a' }}>Menu</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: isDark ? '#9ca3af' : '#64748b' }}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 pt-6">
              <div className="space-y-1">
                {sidebarLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;

                  return (
                    <Link key={link.href} href={link.href} onClick={() => setSidebarOpen(false)}>
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
              <Link href="/" onClick={() => setSidebarOpen(false)}>
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
          </motion.aside>
        </AnimatePresence>

        {/* Main Content */}
        <main 
          className="flex-1 overflow-auto transition-colors duration-300 w-full min-w-0"
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
