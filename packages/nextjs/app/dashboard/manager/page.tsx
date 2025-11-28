"use client";

import { useAccount } from "wagmi";
import Link from "next/link";
import { motion } from "framer-motion";
import { StatsCard } from "~~/components/dashboard/StatsCard";
import { VaultCard } from "~~/components/dashboard/VaultCard";
import { Button } from "~~/components/ui/button";
import { ClientOnly } from "~~/components/ClientOnly";
import { useVaultFactoryGraph } from "~~/hooks/useVaultFactoryGraph";
import { WalletIcon, CurrencyDollarIcon, UserGroupIcon, PlusCircleIcon } from "@heroicons/react/24/outline";

function ManagerDashboardContent() {
  const { address } = useAccount();
  const { userVaults: allVaults, loading: isLoading } = useVaultFactoryGraph();

  // Filter vaults owned by this user
  const myVaults = allVaults?.filter(v => v.owner?.toLowerCase() === address?.toLowerCase()) || [];

  // Calculate stats
  const totalVaults = myVaults.length;
  const totalAUM = myVaults.reduce((sum, v) => sum + parseFloat(v.totalAssets || "0"), 0);
  const totalInvestors = myVaults.length; // Placeholder - investor count not tracked on-chain

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold mb-2">Manager Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your vaults and track performance</p>
        </div>
        <Link href="/dashboard/manager/create">
          <Button>
            <PlusCircleIcon className="h-5 w-5 mr-2" />
            Create New Vault
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total AUM"
          value={`$${totalAUM.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          subtitle="Assets under management"
          icon={<CurrencyDollarIcon className="h-5 w-5" />}
        />
        <StatsCard
          title="Total Vaults"
          value={totalVaults.toString()}
          subtitle="Active vaults"
          icon={<WalletIcon className="h-5 w-5" />}
        />
        <StatsCard
          title="Total Investors"
          value={totalInvestors.toString()}
          subtitle="Across all vaults"
          icon={<UserGroupIcon className="h-5 w-5" />}
        />
      </div>

      {/* My Vaults */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Vaults</h2>
          <Link href="/dashboard/manager/vaults">
            <Button variant="outline">View All</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : myVaults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myVaults.slice(0, 6).map(vault => (
              <VaultCard key={vault.address} vault={vault} variant="manager" />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <WalletIcon className="h-16 w-16 mx-auto text-gray-500 dark:text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No vaults created yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first vault to start managing investments</p>
            <Link href="/dashboard/manager/create">
              <Button>
                <PlusCircleIcon className="h-5 w-5 mr-2" />
                Create Your First Vault
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/manager/create">
            <div className="p-6 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
              <h3 className="font-semibold mb-2">Create New Vault</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Set up a new investment vault</p>
            </div>
          </Link>
          <Link href="/dashboard/manager/vaults">
            <div className="p-6 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
              <h3 className="font-semibold mb-2">Manage Vaults</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Update settings and strategies</p>
            </div>
          </Link>
          <Link href="/dashboard/manager/analytics">
            <div className="p-6 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
              <h3 className="font-semibold mb-2">View Analytics</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Track performance metrics</p>
            </div>
          </Link>
        </div>
      </section>
    </motion.div>
  );
}

export default function ManagerDashboard() {
  return (
    <ClientOnly
      fallback={
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }
    >
      <ManagerDashboardContent />
    </ClientOnly>
  );
}

