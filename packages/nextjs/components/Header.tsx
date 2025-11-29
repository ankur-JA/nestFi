"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { motion } from "framer-motion";
import NestFiLogo from "~~/components/NestFiLogo";
import { useTheme } from "~~/contexts/ThemeContext";

export const Header = () => {
  const pathname = usePathname();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  // Determine if we're in curator or investor section
  const isCurator = pathname.startsWith("/curator");
  const isInvestor = pathname.startsWith("/investor");

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 backdrop-blur-xl transition-colors duration-300"
      style={{
        background: isDark ? 'rgba(10,10,15,0.8)' : 'rgba(255,255,255,0.8)',
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
      }}
    >
      <div className="w-full px-6">
        <div className="flex items-center h-16">
          {/* Logo - Fixed left */}
          <div className="flex-shrink-0">
            <Link href="/">
              <NestFiLogo size="md" />
            </Link>
          </div>

          {/* Center space - grows to push content apart */}
          <div className="flex-1" />

          {/* Center Navigation - Only show on curator/investor pages */}
          {(isCurator || isInvestor) && (
            <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              {isCurator && (
                <>
                  <NavLink href="/curator" active={pathname === "/curator"} isDark={isDark}>
                    Create Vault
                  </NavLink>
                  <NavLink href="/curator/manage" active={pathname === "/curator/manage"} isDark={isDark}>
                    Manage Vaults
                  </NavLink>
                </>
              )}
              {isInvestor && (
                <>
                  <NavLink href="/investor" active={pathname === "/investor"} isDark={isDark}>
                    Vaults
                  </NavLink>
                  <NavLink href="/investor/portfolio" active={pathname === "/investor/portfolio"} isDark={isDark}>
                    My Vaults
                  </NavLink>
                </>
              )}
            </nav>
          )}

          {/* Right side - Fixed right */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <RainbowKitCustomConnectButton />
          </div>
        </div>
      </div>
    </motion.header>
  );
};

function NavLink({ 
  href, 
  active, 
  children,
  isDark
}: { 
  href: string; 
  active: boolean; 
  children: React.ReactNode;
  isDark: boolean;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
        style={{
          background: active 
            ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') 
            : 'transparent',
          color: active 
            ? (isDark ? '#ffffff' : '#0f172a')
            : (isDark ? '#9ca3af' : '#64748b'),
        }}
      >
        {children}
      </motion.div>
    </Link>
  );
}
