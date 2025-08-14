"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hardhat } from "viem/chains";
import { Bars3Icon, BugAntIcon, HomeIcon, ChartBarIcon, PlusCircleIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
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
  {
    label: "Debug Contracts",
    href: "/debug",
    icon: <BugAntIcon className="h-5 w-5" />,
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${
                isActive ? "bg-red-500/20 text-red-400" : "hover:bg-red-500/10"
              } py-2.5 px-5 text-base font-medium rounded-full gap-2 flex items-center transition-colors duration-300`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
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
    // Fixed height for the navbar
    <div className="sticky top-0 z-20 navbar h-24 shrink-0 justify-between bg-black/50 backdrop-blur-md shadow-lg shadow-red-500/10 px-0 sm:px-4">
      <div className="navbar-start w-auto lg:w-1/2">
        <div className="lg:hidden dropdown">
          <label tabIndex={0} className="ml-1 btn btn-ghost hover:bg-transparent">
            <Bars3Icon className="h-6 w-6" />
          </label>
          <ul
            tabIndex={0}
            className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
            onClick={() => {
              burgerMenuRef?.current?.removeAttribute("open");
            }}
          >
            <HeaderMenuLinks />
          </ul>
        </div>
        <Link href="/" passHref className="hidden lg:flex items-center gap-2 ml-4 mr-6 shrink-0">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            // We can increase the logo size, and the fixed height of the navbar
            // will contain it. The Tailwind `h-*` and `w-*` classes are now more for the logo container
            className="flex relative w-60 h-100" 
          >
            <Image alt="NestFi logo" className="cursor-pointer" fill src="/logo.svg" />
          </motion.div>
        </Link>
        <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2">
          <HeaderMenuLinks />
        </ul>
      </div>
      <div className="navbar-end grow mr-4">
        <RainbowKitCustomConnectButton />
        {isLocalNetwork && <FaucetButton />}
      </div>
    </div>
  );
};