"use client";

import { useAccount } from "wagmi";
import Link from "next/link";
import { motion } from "framer-motion";
import { VaultCard } from "~~/components/dashboard/VaultCard";
import { Button } from "~~/components/ui/button";
import { useVaultFactoryGraph } from "~~/hooks/useVaultFactoryGraph";
import { PlusCircleIcon, WalletIcon } from "@heroicons/react/24/outline";

export default function MyVaults() {
  const { address } = useAccount();
  const { userVaults: allVaults, loading: isLoading } = useVaultFactoryGraph();

  const myVaults = allVaults?.filter(v => v.owner?.toLowerCase() === address?.toLowerCase()) || [];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold mb-2">My Vaults</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage all your created vaults</p>
        </div>
        <Link href="/dashboard/manager/create">
          <Button>
            <PlusCircleIcon className="h-5 w-5 mr-2" />
            Create New Vault
          </Button>
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
          {myVaults.map(vault => (
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
    </motion.div>
  );
}

