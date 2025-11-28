"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~~/components/ui/card";
import { Badge } from "~~/components/ui/badge";
import { Button } from "~~/components/ui/button";
import {
  BanknotesIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
} from "@heroicons/react/24/outline";

interface VaultCardProps {
  vault: any;
  variant: "investor" | "manager";
  showActions?: boolean;
}

export const VaultCard = ({ vault, variant, showActions = false }: VaultCardProps) => {
  const isManager = variant === "manager";
  
  // Format numbers for display
  const formatValue = (value: string | number = "0") => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(num) ? "0.00" : num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const totalAssets = formatValue(vault.totalAssets || vault.totalValue || "0");
  const userBalance = formatValue(vault.userBalance || vault.balance || "0");
  const apy = vault.apy || "8.5";
  const investorCount = vault.investorCount || vault.memberCount || 0;

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{vault.name || "Unnamed Vault"}</CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{vault.symbol || "VAULT"}</p>
            </div>
            <Badge variant={isManager ? "default" : "secondary"}>
              {isManager ? "Manager" : "Investor"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Main Stats */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <BanknotesIcon className="h-4 w-4" />
                {isManager ? "Total Assets" : "Your Balance"}
              </span>
              <span className="font-semibold">
                ${isManager ? totalAssets : userBalance}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <ChartBarIcon className="h-4 w-4" />
                APY
              </span>
              <span className="font-semibold text-green-500">{apy}%</span>
            </div>

            {isManager && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <UserGroupIcon className="h-4 w-4" />
                  Investors
                </span>
                <span className="font-semibold">{investorCount}</span>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="pt-2 border-t space-y-1">
            {vault.allowlistEnabled && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">Allowlist</span>
                <Badge variant="outline" className="text-xs">Enabled</Badge>
              </div>
            )}
            {vault.depositCap && vault.depositCap !== "0" && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">Cap</span>
                <span>${formatValue(vault.depositCap)}</span>
              </div>
            )}
          </div>
        </CardContent>

        {showActions && (
          <CardFooter className="flex gap-2">
            {isManager ? (
              <>
                <Link href={`/dashboard/manager/vaults/${vault.address}`} className="flex-1">
                  <Button variant="default" className="w-full">
                    <CogIcon className="h-4 w-4 mr-2" />
                    Manage
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href={`/vaults/${vault.address || vault.vaultAddress}`} className="flex-1">
                  <Button variant="outline" className="w-full">View</Button>
                </Link>
                <Button variant="default" className="flex-1">Deposit</Button>
              </>
            )}
          </CardFooter>
        )}

        {!showActions && (
          <CardFooter>
            <Link 
              href={
                isManager 
                  ? `/dashboard/manager/vaults/${vault.address}`
                  : `/vaults/${vault.address || vault.vaultAddress}`
              } 
              className="w-full"
            >
              <Button variant="ghost" className="w-full">View Details →</Button>
            </Link>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
};

