"use client";

import { useQuery } from "@tanstack/react-query";

// Types
export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  items: any;
  subtotal: number;
  delivery_fee: number;
  tax: number;
  total: number;
  delivery_address: any;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  payment_intent_id: string | null;
  stripe_session_id: string | null;
  profile?: {
    full_name: string;
    email: string;
    phone: string | null;
  };
}

// Fetch orders
async function fetchOrders(): Promise<Order[]> {
  const response = await fetch("/api/admin/orders");
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch orders");
  }
  return response.json();
}

// Custom hook
export function useAdminOrders(initialData?: Order[]) {
  const query = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: fetchOrders,
    initialData,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Auto-refetch every minute for new orders
  });

  return {
    orders: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
