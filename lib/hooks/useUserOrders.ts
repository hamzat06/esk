"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

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
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["user", "orders"],
    queryFn: fetchUserOrders,
    initialData,
    staleTime: 30 * 1000,
  });

  useEffect(() => {
    const channel = supabase
      .channel("user-orders-realtime")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          // Update just the changed order in the cache without a full refetch
          queryClient.setQueryData<UserOrder[]>(["user", "orders"], (old) => {
            if (!old) return old;
            return old.map((o) =>
              o.id === payload.new.id ? { ...o, ...payload.new } : o,
            );
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        () => {
          // New order placed — refetch to get full shape with joins
          queryClient.invalidateQueries({ queryKey: ["user", "orders"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    orders: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
