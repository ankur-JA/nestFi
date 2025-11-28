"use client";

import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useVaultFactoryGraph } from "~~/hooks/useVaultFactoryGraph";
import { WalletIcon } from "@heroicons/react/24/outline";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

export default function DashboardRouter() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const { userVaults: allVaults, loading: isLoading } = useVaultFactoryGraph();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    // Don't redirect if not connected - show connect prompt instead
    if (!isConnected || !address) {
      return;
    }

    if (isLoading) return;

    // Check if user has created any vaults (is a manager)
    const hasCreatedVaults = allVaults?.some(v => v.owner?.toLowerCase() === address.toLowerCase());

    // Route based on role - default to investor if no vaults created
    if (hasCreatedVaults) {
      router.push("/dashboard/manager");
    } else {
      router.push("/dashboard/investor");
    }
  }, [isMounted, address, isConnected, allVaults, isLoading, router]);

  if (!isMounted) {
    return null;
  }

  // Show connect wallet prompt if not connected
  if (!isConnected) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <WalletIcon className="h-10 w-10 text-primary" />
            </div>
            
            <h1 className="text-3xl font-bold mb-3">Connect Your Wallet</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Connect your wallet to access your investment dashboard and start managing your vaults.
            </p>
            
            <div className="flex justify-center mb-6">
              <RainbowKitCustomConnectButton />
            </div>
            
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Don't have a wallet?{" "}
                <a
                  href="https://metamask.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Get MetaMask
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
      </div>
    </div>
  );
}
