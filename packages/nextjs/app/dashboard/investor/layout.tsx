"use client";

import { DashboardLayout } from "~~/components/dashboard/DashboardLayout";

export default function InvestorLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout role="investor">{children}</DashboardLayout>;
}

