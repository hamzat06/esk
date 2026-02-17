import { supabase } from "@/lib/supabase/client";
import { sendOrderStatusEmail } from "@/lib/notifications/email";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "delivered"
  | "cancelled";

export type OrderItem = {
  id: string;
  productId: string;
  title: string;
  image?: string | null;
  quantity: number;
  basePrice: number;
  options: Record<string, { label: string; price: number }>;
  unitPrice: number;
  totalPrice: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  };
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  notes?: string | null;
  paymentIntentId?: string | null;
  stripeSessionId?: string | null;
};

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
  // First get the order with customer details
  const { data: orderBefore, error: fetchError } = await supabase
    .from("orders")
    .select(
      `
      *,
      profile:profiles(full_name, email, phone)
    `,
    )
    .eq("id", id)
    .single();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  // Update the order status
  const { data, error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Send status update email (don't await, run in background)
  if (orderBefore?.profile) {
    sendOrderStatusEmail(
      id,
      status,
      orderBefore.profile.email,
      orderBefore.profile.full_name,
      orderBefore.order_number,
    ).catch((error) => {
      console.error("Failed to send status email:", error);
      // Don't throw - we don't want email failure to break the status update
    });
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
