"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  PlusCircleIcon, 
  Squares2X2Icon,
  HomeIcon
} from "@heroicons/react/24/outline";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import NestFiLogo from "~~/components/NestFiLogo";
import { SettingsDropdown } from "~~/components/SettingsDropdown";

const sidebarLinks = [
  { href: "/curator", label: "Create Vault", icon: PlusCircleIcon },
  { href: "/curator/manage", label: "Manage Vaults", icon: Squares2X2Icon },
];

export default function CuratorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Top Header - Full Width */}
      <header className="h-16 bg-[#0a0a0f] border-b border-gray-800/50 flex items-center justify-between px-6">
        <Link href="/">
          <NestFiLogo size="md" />
        </Link>
        <div className="flex items-center gap-3">
          <SettingsDropdown />
          <RainbowKitCustomConnectButton />
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-[#0f0f15] border-r border-gray-800/50 flex flex-col">
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
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
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
                Back Home
              </motion.div>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
