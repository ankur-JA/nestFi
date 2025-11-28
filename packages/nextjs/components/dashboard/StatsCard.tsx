"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~~/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/solid";

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: string;
  trend?: "up" | "down";
  icon?: React.ReactNode;
}

export const StatsCard = ({ title, value, subtitle, change, trend, icon }: StatsCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-gray-500">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(subtitle || change) && (
          <div className="flex items-center gap-2 mt-1">
            {change && (
              <span
                className={`text-xs flex items-center gap-1 ${trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}
              >
                {trend === "up" && <ArrowUpIcon className="h-3 w-3" />}
                {trend === "down" && <ArrowDownIcon className="h-3 w-3" />}
                {change}
              </span>
            )}
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

