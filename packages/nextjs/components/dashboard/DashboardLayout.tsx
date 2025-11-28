"use client";

import { Sidebar } from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "investor" | "manager";
}

export const DashboardLayout = ({ children, role }: DashboardLayoutProps) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8 max-w-7xl">{children}</div>
      </main>
    </div>
  );
};

