"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "~~/components/ui/card";
import { Button } from "~~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~~/components/ui/tabs";
import { Badge } from "~~/components/ui/badge";
import { useVaultContract } from "~~/hooks/useVaultContract";
import {
  BanknotesIcon,
  ChartBarIcon,
  UserGroupIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export default function VaultDetails() {
  const params = useParams();
  const vaultAddress = params?.address as string;
  const { vaultData, loading } = useVaultContract(vaultAddress);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">{vaultData?.name || "Vault"}</h1>
                <Badge>{vaultData?.symbol || "VAULT"}</Badge>
              </div>
              <p className="text-gray-500 dark:text-gray-400">High-yield investment vault</p>
            </div>
            <Button size="lg">Connect to Invest</Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  <BanknotesIcon className="h-4 w-4 inline mr-1" />
                  Total Value Locked
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$0.00</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  <ChartBarIcon className="h-4 w-4 inline mr-1" />
                  APY
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">8.5%</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  <UserGroupIcon className="h-4 w-4 inline mr-1" />
                  Investors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  <ShieldCheckIcon className="h-4 w-4 inline mr-1" />
                  Risk Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary">Low</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="strategy">Strategy</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>About This Vault</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 dark:text-gray-400">
                    This vault implements a conservative DeFi strategy focused on stable yield generation
                    through lending protocols and liquidity provision.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Vault Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Minimum Deposit</span>
                    <span className="font-medium">$100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Deposit Cap</span>
                    <span className="font-medium">$1,000,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Allowlist</span>
                    <Badge variant="outline">Public</Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Chart</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    Performance data will be displayed here
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="strategy">
              <Card>
                <CardHeader>
                  <CardTitle>Investment Strategy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-500 dark:text-gray-400">
                    This vault employs a multi-strategy approach to maximize returns while managing risk.
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Strategy Breakdown:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-500 dark:text-gray-400">
                      <li>100% Aave V3 Lending</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

