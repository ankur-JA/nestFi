"use client";

import { useAccount } from "wagmi";
import Link from "next/link";
import { motion } from "framer-motion";
import { StatsCard } from "~~/components/dashboard/StatsCard";
import { VaultCard } from "~~/components/dashboard/VaultCard";
import { Button } from "~~/components/ui/button";
import { ClientOnly } from "~~/components/ClientOnly";
import { useVaultMembership } from "~~/hooks/useVaultMembership";
import { WalletIcon, CurrencyDollarIcon, ChartBarIcon } from "@heroicons/react/24/outline";

function InvestorDashboardContent() {
  const { address } = useAccount();
  const { memberships: membershipData, loading: isLoading } = useVaultMembership();

  // Calculate stats
  const activeVaults = membershipData?.length || 0;
  const totalValue = membershipData?.reduce((sum, m) => sum + parseFloat(m.userBalance || "0") / 1e6, 0) || 0;
  const totalEarnings = 0; // Earnings tracking not available yet

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-8">
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-bold mb-2">My Portfolio</h1>
        <p className="text-gray-500 dark:text-gray-400">Track your investments and discover new opportunities</p>
      </motion.div>

      {/* Stats Overview */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Portfolio Value"
          value={`$${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          change="+12.5%"
          trend="up"
          icon={<CurrencyDollarIcon className="h-5 w-5" />}
        />
        <StatsCard
          title="Total Earnings"
          value={`$${totalEarnings.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          subtitle="All time"
          icon={<ChartBarIcon className="h-5 w-5" />}
        />
        <StatsCard
          title="Active Vaults"
          value={activeVaults.toString()}
          subtitle="Currently invested"
          icon={<WalletIcon className="h-5 w-5" />}
        />
      </motion.div>

      {/* My Investments */}
      <motion.section variants={itemVariants}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Investments</h2>
          <Link href="/dashboard/investor/discover">
            <Button>Discover More Vaults</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : membershipData && membershipData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {membershipData.map(membership => (
              <VaultCard key={membership.vaultAddress} vault={membership} variant="investor" />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <WalletIcon className="h-16 w-16 mx-auto text-gray-500 dark:text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No investments yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Start by exploring available vaults</p>
            <Link href="/dashboard/investor/discover">
              <Button>Discover Vaults</Button>
            </Link>
          </div>
        )}
      </motion.section>

      {/* Quick Actions */}
      <motion.section variants={itemVariants}>
        <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/dashboard/investor/discover">
            <div className="p-6 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
              <h3 className="font-semibold mb-2">Explore Vaults</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Find the best investment opportunities</p>
            </div>
          </Link>
          <Link href="/dashboard/investor/analytics">
            <div className="p-6 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
              <h3 className="font-semibold mb-2">View Analytics</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Track your portfolio performance</p>
            </div>
          </Link>
        </div>
      </motion.section>
    </motion.div>
  );
}

export default function InvestorDashboard() {
  return (
    <ClientOnly
      fallback={
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }
    >
      <InvestorDashboardContent />
    </ClientOnly>
  );
}

