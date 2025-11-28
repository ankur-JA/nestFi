"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  MagnifyingGlassIcon,
  WalletIcon,
  ChartBarIcon,
  PlusCircleIcon,
  CogIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

interface SidebarProps {
  role: "investor" | "manager";
}

export const Sidebar = ({ role }: SidebarProps) => {
  const pathname = usePathname();

  const investorLinks = [
    { href: "/dashboard/investor", label: "Overview", icon: HomeIcon },
    { href: "/dashboard/investor/discover", label: "Discover Vaults", icon: MagnifyingGlassIcon },
    { href: "/dashboard/investor/portfolio", label: "My Portfolio", icon: WalletIcon },
    { href: "/dashboard/investor/analytics", label: "Analytics", icon: ChartBarIcon },
  ];

  const managerLinks = [
    { href: "/dashboard/manager", label: "Overview", icon: HomeIcon },
    { href: "/dashboard/manager/create", label: "Create Vault", icon: PlusCircleIcon },
    { href: "/dashboard/manager/vaults", label: "My Vaults", icon: WalletIcon },
    { href: "/dashboard/manager/analytics", label: "Analytics", icon: ChartBarIcon },
  ];

  const links = role === "investor" ? investorLinks : managerLinks;

  return (
    <div className="w-64 border-r bg-white dark:bg-gray-900 h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
            N
          </div>
          <span className="text-xl font-bold">NestFi</span>
        </Link>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {links.map(link => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <HomeIcon className="h-5 w-5" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
      </div>
    </div>
  );
};

