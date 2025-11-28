"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { VaultCard } from "~~/components/dashboard/VaultCard";
import { Button } from "~~/components/ui/button";
import { Badge } from "~~/components/ui/badge";
import { useVaultFactoryGraph } from "~~/hooks/useVaultFactoryGraph";

export default function PublicVaults() {
  const { userVaults: allVaults, loading: isLoading } = useVaultFactoryGraph();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "high-apy" | "low-risk">("all");

  const filteredVaults = allVaults?.filter(vault => {
    const matchesSearch = vault.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vault.symbol?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-6 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold mb-4">Explore Vaults</h1>
            <p className="text-xl text-gray-500 dark:text-gray-400">
              Discover investment opportunities across all available vaults
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400" />
              <input
                type="text"
                placeholder="Search vaults by name or symbol..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-2">
              <Badge
                variant={filterType === "all" ? "default" : "outline"}
                className="cursor-pointer px-4 py-2"
                onClick={() => setFilterType("all")}
              >
                All Vaults
              </Badge>
              <Badge
                variant={filterType === "high-apy" ? "default" : "outline"}
                className="cursor-pointer px-4 py-2"
                onClick={() => setFilterType("high-apy")}
              >
                High APY
              </Badge>
              <Badge
                variant={filterType === "low-risk" ? "default" : "outline"}
                className="cursor-pointer px-4 py-2"
                onClick={() => setFilterType("low-risk")}
              >
                Low Risk
              </Badge>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 flex flex-col md:flex-row items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Want to create your own vault?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Join as a fund manager and start managing investments</p>
            </div>
            <Link href="/dashboard/manager/create">
              <Button size="lg">Create Vault</Button>
            </Link>
          </div>

          {/* Vaults Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-80 bg-muted animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : filteredVaults && filteredVaults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVaults.map(vault => (
                <VaultCard key={vault.address} vault={vault} variant="investor" showActions />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <MagnifyingGlassIcon className="h-16 w-16 mx-auto text-gray-500 dark:text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No vaults found</h3>
              <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

