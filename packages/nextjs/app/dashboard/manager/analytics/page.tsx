"use client";

import { motion } from "framer-motion";
import { StatsCard } from "~~/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "~~/components/ui/card";

export default function ManagerAnalytics() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Analytics</h1>
        <p className="text-gray-500 dark:text-gray-400">Track your vault performance and investor activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatsCard title="Total AUM Growth" value="+25.3%" change="+5.2%" trend="up" subtitle="Last 30 days" />
        <StatsCard title="New Investors" value="12" subtitle="This month" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AUM Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
            AUM chart coming soon...
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Investor Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
            Growth chart coming soon...
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

