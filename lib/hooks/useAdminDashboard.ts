"use client";

import { useQuery } from "@tanstack/react-query";

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  todayOrders: number;
  activeOrders: number;
  pendingOrders: number;
  totalCustomers: number;
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch("/api/admin/dashboard");
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch dashboard stats");
  }
  return response.json();
}

export function useAdminDashboard(initialData?: DashboardStats) {
  const query = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: fetchDashboardStats,
    initialData,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Auto-refetch every minute
  });

  return {
    stats: query.data || {
      totalOrders: 0,
      totalRevenue: 0,
      todayOrders: 0,
      activeOrders: 0,
      pendingOrders: 0,
      totalCustomers: 0,
    },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
