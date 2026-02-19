"use client";

import { useAdminDashboard, DashboardStats } from "@/lib/hooks/useAdminDashboard";
import AdminDashboard from "./AdminDashboard";

interface DashboardClientProps {
  initialStats: DashboardStats;
  permissions: {
    canViewOrders: boolean;
    canViewCustomers: boolean;
    canViewAnalytics: boolean;
    canViewProducts: boolean;
  };
}

export default function DashboardClient({
  initialStats,
  permissions,
}: DashboardClientProps) {
  // Use React Query hook for automatic caching and auto-refresh every 60s
  const { stats } = useAdminDashboard(initialStats);

  return <AdminDashboard stats={stats} permissions={permissions} />;
}
