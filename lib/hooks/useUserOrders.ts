"use client";

import { useQuery } from "@tanstack/react-query";

export interface UserOrder {
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
}

async function fetchUserOrders(): Promise<UserOrder[]> {
  const response = await fetch("/api/user/orders");
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch orders");
  }
  return response.json();
}

export function useUserOrders(initialData?: UserOrder[]) {
  const query = useQuery({
    queryKey: ["user", "orders"],
    queryFn: fetchUserOrders,
    initialData,
    staleTime: 30 * 1000, // 30 seconds
  });

  return {
    orders: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
