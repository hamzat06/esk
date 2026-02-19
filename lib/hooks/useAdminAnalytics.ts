"use client";

import { useQuery } from "@tanstack/react-query";

export interface AnalyticsData {
  orders: any[];
  products: any[];
  customers: any[];
  pageViews: any[];
}

async function fetchAnalytics(): Promise<AnalyticsData> {
  const response = await fetch("/api/admin/analytics");
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch analytics");
  }
  return response.json();
}

export function useAdminAnalytics(initialData?: AnalyticsData) {
  const query = useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: fetchAnalytics,
    initialData,
    staleTime: 60 * 1000, // 60 seconds (analytics can be slightly stale)
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
