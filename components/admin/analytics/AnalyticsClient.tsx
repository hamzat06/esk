"use client";

import { useAdminAnalytics } from "@/lib/hooks/useAdminAnalytics";
import AnalyticsManager from "./AnalyticsManager";

interface AnalyticsClientProps {
  initialData: {
    orders: any[];
    products: any[];
    customers: any[];
    pageViews: any[];
  };
}

export default function AnalyticsClient({ initialData }: AnalyticsClientProps) {
  // Use React Query hook for automatic caching
  const { data } = useAdminAnalytics(initialData);

  return (
    <AnalyticsManager
      orders={data?.orders || []}
      products={data?.products || []}
      customers={data?.customers || []}
      pageViews={data?.pageViews || []}
    />
  );
}
