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
              className={`relative group px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                isActive 
                  ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/25" 
                  : "text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-red-500/10 hover:to-pink-500/10"
              } flex items-center gap-2`}
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
      className="sticky top-0 z-40 navbar h-24 shrink-0 justify-between bg-gradient-to-r from-black/95 via-gray-900/95 to-black/95 backdrop-blur-xl shadow-2xl shadow-red-500/20 border-b border-red-500/20 px-6"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-500/5 rounded-full blur-2xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-pink-500/5 rounded-full blur-2xl animate-pulse delay-1000" />
      </div>

      <div className="navbar-start w-auto lg:w-1/2 relative z-10">
        {/* Mobile menu */}
        <div className="lg:hidden dropdown">
          <motion.label 
            tabIndex={0} 
            className="ml-1 btn btn-ghost hover:bg-red-500/10 rounded-lg transition-all duration-300 p-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bars3Icon className="h-5 w-5 text-gray-300 hover:text-white transition-colors" />
          </motion.label>
          <ul
            tabIndex={0}
            className="menu menu-compact dropdown-content mt-2 p-3 shadow-xl bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl rounded-xl border border-red-500/20 w-56 z-50"
            onClick={() => {
              burgerMenuRef?.current?.removeAttribute("open");
            }}
          >
            <HeaderMenuLinks />
          </ul>
        </div>

        {/* Mobile Logo */}
        <Link href="/" passHref className="lg:hidden flex items-center gap-2 ml-2 mr-6 shrink-0 group">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-32 h-10"
            whileHover={{ scale: 1.05 }}
          >
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ zIndex: -2 }}
            />
            
            {/* Logo image */}
            <div className="relative w-full h-full p-1.5">
              <Image 
                alt="NestFi logo" 
                className="cursor-pointer transition-all duration-300 group-hover:drop-shadow-xl group-hover:drop-shadow-red-500/60 group-hover:brightness-110" 
                fill 
                src="/logo.svg" 
              />
            </div>
            
            {/* Animated border */}
            <motion.div
              className="absolute inset-0 rounded-xl border border-transparent group-hover:border-red-500/30 transition-all duration-300"
              style={{ zIndex: -1 }}
            />
          </motion.div>
        </Link>

        {/* Logo */}
        <Link href="/" passHref className="hidden lg:flex items-center gap-3 ml-2 mr-12 shrink-0 group">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-48 h-14"
            whileHover={{ scale: 1.05 }}
          >
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              style={{ zIndex: -3 }}
            />
            
            {/* Background layers */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-red-500/15 to-pink-500/15 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ zIndex: -2 }}
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ zIndex: -1 }}
            />
            
            {/* Logo image */}
            <div className="relative w-full h-full p-2">
              <Image 
                alt="NestFi logo" 
                className="cursor-pointer transition-all duration-500 group-hover:drop-shadow-2xl group-hover:drop-shadow-red-500/70 group-hover:brightness-110" 
                fill 
                src="/logo.svg" 
              />
            </div>
            
            {/* Animated border */}
            <motion.div
              className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-red-500/30 transition-all duration-500"
              style={{ zIndex: -1 }}
            />
            
            {/* Sparkle effect */}
            <motion.div
              className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-pink-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </Link>

        {/* Navigation Menu */}
        <div className="hidden lg:flex items-center gap-6 mr-8">
          {menuLinks.map(({ label, href, icon }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href={href}
                className="flex items-center gap-2 px-4 py-2.5 text-gray-300 hover:text-white transition-all duration-300 rounded-lg hover:bg-red-500/10 hover:shadow-lg hover:shadow-red-500/20"
              >
                {icon}
                <span className="font-medium">{label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right side */}
      <div className="navbar-end grow relative z-10">
        {/* Right side elements */}
        <div className="flex items-center gap-4 ml-auto">
          <FaucetButton />
          <RainbowKitCustomConnectButton />
        </div>
      </div>
    </motion.div>
  );
};