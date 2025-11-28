"use client";

import { DashboardLayout } from "~~/components/dashboard/DashboardLayout";

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout role="manager">{children}</DashboardLayout>;
}

