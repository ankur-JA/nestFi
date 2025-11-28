"use client";

import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import { VaultCard } from "~~/components/dashboard/VaultCard";
import { useVaultMembership } from "~~/hooks/useVaultMembership";
import { WalletIcon } from "@heroicons/react/24/outline";

export default function Portfolio() {
  const { address } = useAccount();
  const { memberships: membershipData, loading: isLoading } = useVaultMembership();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">My Portfolio</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage all your vault investments in one place</p>
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
            <VaultCard key={membership.vaultAddress} vault={membership} variant="investor" showActions />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <WalletIcon className="h-16 w-16 mx-auto text-gray-500 dark:text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No investments yet</h3>
          <p className="text-gray-500 dark:text-gray-400">Start investing in vaults to build your portfolio</p>
        </div>
      )}
    </motion.div>
  );
}

