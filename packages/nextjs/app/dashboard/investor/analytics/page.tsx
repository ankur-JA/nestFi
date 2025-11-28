"use client";

import { motion } from "framer-motion";
import { StatsCard } from "~~/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "~~/components/ui/card";

export default function Analytics() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Portfolio Analytics</h1>
        <p className="text-gray-500 dark:text-gray-400">Track your investment performance over time</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatsCard title="30 Day Return" value="+12.5%" change="+2.3%" trend="up" />
        <StatsCard title="Total Fees Paid" value="$45.20" subtitle="Lifetime" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
            Performance chart coming soon...
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-500 dark:text-gray-400">Transaction history coming soon...</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

