"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hardhat } from "viem/chains";
import { Bars3Icon, HomeIcon, ChartBarIcon, PlusCircleIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { motion } from "framer-motion";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
    icon: <HomeIcon className="h-5 w-5" />
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <ChartBarIcon className="h-5 w-5" />
  },
  {
    label: "CreateVault",
    href: "/createvault",
    icon: <PlusCircleIcon className="h-5 w-5" />
  },
  {
    label: "About",
    href: "/about",
    icon: <InformationCircleIcon className="h-5 w-5" />
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <motion.li key={href} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href={href}
              passHref
              className={`relative group px-6 py-3 text-base font-semibold rounded-xl transition-all duration-300 ${
                isActive 
                  ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/25" 
                  : "text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-red-500/10 hover:to-pink-500/10"
              } flex items-center gap-3`}
            >
              <motion.div
                animate={{ rotate: isActive ? 360 : 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className={`${isActive ? "text-white" : "text-gray-400 group-hover:text-red-400"}`}
              >
                {icon}
              </motion.div>
              <span className="relative">
                {label}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-red-400 to-pink-400 rounded-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </span>
              <motion.div
                className={`absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  isActive ? "opacity-100" : ""
                }`}
                style={{ zIndex: -1 }}
              />
            </Link>
          </motion.li>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="sticky top-0 z-50 navbar h-20 shrink-0 justify-between bg-gradient-to-r from-black/90 via-gray-900/90 to-black/90 backdrop-blur-xl shadow-2xl shadow-red-500/20 border-b border-red-500/20 px-0 sm:px-4"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="navbar-start w-auto lg:w-1/2 relative z-10">
        {/* Mobile menu */}
        <div className="lg:hidden dropdown">
          <motion.label 
            tabIndex={0} 
            className="ml-1 btn btn-ghost hover:bg-red-500/10 rounded-xl transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bars3Icon className="h-6 w-6 text-gray-300 hover:text-white transition-colors" />
          </motion.label>
          <ul
            tabIndex={0}
            className="menu menu-compact dropdown-content mt-3 p-4 shadow-xl bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl rounded-2xl border border-red-500/20 w-64"
            onClick={() => {
              burgerMenuRef?.current?.removeAttribute("open");
            }}
          >
            <HeaderMenuLinks />
          </ul>
        </div>

        {/* Logo */}
        <Link href="/" passHref className="hidden lg:flex items-center gap-3 ml-4 mr-8 shrink-0 group">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-48 h-16"
            whileHover={{ scale: 1.05 }}
          >
            <Image 
              alt="NestFi logo" 
              className="cursor-pointer transition-all duration-300 group-hover:drop-shadow-lg group-hover:drop-shadow-red-500/50" 
              fill 
              src="/logo.svg" 
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ zIndex: -1 }}
            />
          </motion.div>
        </Link>

        {/* Desktop menu */}
        <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-3">
          <HeaderMenuLinks />
        </ul>
      </div>

      {/* Right side */}
      <div className="navbar-end grow mr-4 relative z-10">
        <div className="flex items-center gap-3">
          {/* Network indicator */}
          {isLocalNetwork && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30"
            >
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-yellow-300">Local Network</span>
            </motion.div>
          )}

          {/* Faucet button */}
          {isLocalNetwork && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <FaucetButton />
            </motion.div>
          )}

          {/* Connect button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RainbowKitCustomConnectButton />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};