"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export interface UserOrder {
  id: string;
  orderNumber: string;
  userId: string;
  items: any;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  deliveryAddress: any;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  paymentIntentId: string | null;
  stripeSessionId: string | null;
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
          const n = payload.new as any;
          queryClient.setQueryData<UserOrder[]>(["user", "orders"], (old) => {
            if (!old) return old;
            return old.map((o) =>
              o.id === n.id
                ? {
                    ...o,
                    status: n.status ?? o.status,
                    updatedAt: n.updated_at ?? o.updatedAt,
                  }
                : o,
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
