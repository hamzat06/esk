import { supabase } from "@/lib/supabase/client";

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

/**
 * Fetch all orders for the current user
 */
export async function fetchUserOrders(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((order) => ({
    id: order.id,
    orderNumber: order.order_number,
    userId: order.user_id,
    items: order.items as OrderItem[],
    subtotal: Number(order.subtotal),
    deliveryFee: Number(order.delivery_fee),
    tax: Number(order.tax),
    total: Number(order.total),
    deliveryAddress: order.delivery_address as Order["deliveryAddress"],
    status: order.status as OrderStatus,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    notes: order.notes,
    paymentIntentId: order.payment_intent_id,
    stripeSessionId: order.stripe_session_id,
  }));
}

/**
 * Fetch a single order by ID
 */
export async function fetchOrderById(orderId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (error) {
    console.error("Error fetching order:", error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    orderNumber: data.order_number,
    userId: data.user_id,
    items: data.items as OrderItem[],
    subtotal: Number(data.subtotal),
    deliveryFee: Number(data.delivery_fee),
    tax: Number(data.tax),
    total: Number(data.total),
    deliveryAddress: data.delivery_address as Order["deliveryAddress"],
    status: data.status as OrderStatus,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    notes: data.notes,
    paymentIntentId: data.payment_intent_id,
    stripeSessionId: data.stripe_session_id,
  };
}

/**
 * Reorder - creates a new cart with items from a previous order
 */
export async function reorderItems(orderId: string): Promise<boolean> {
  try {
    const order = await fetchOrderById(orderId);
    if (!order) return false;

    // This would integrate with your cart system
    // For now, this is a placeholder that returns success
    console.log("Reordering items:", order.items);
    return true;
  } catch (error) {
    console.error("Error reordering:", error);
    return false;
  }
}
