import { supabase } from "@/lib/supabase/client";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "delivered"
  | "cancelled";

export async function fetchOrders(status?: OrderStatus) {
  let query = supabase
    .from("orders")
    .select(
      `
      *,
      profile:profiles(full_name, email, phone)
    `,
    )
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const { data, error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function fetchOrderById(id: string) {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      profile:profiles(full_name, email, phone)
    `,
    )
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
