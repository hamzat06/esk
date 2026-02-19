"use client";

import { useUserOrders } from "@/lib/hooks/useUserOrders";
import OrdersList from "./OrdersList";

interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: any[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  deliveryAddress: any;
  status: string;
  createdAt: string;
  updatedAt: string;
  notes: string | null;
  paymentIntentId: string | null;
  stripeSessionId: string | null;
}

interface OrdersListClientProps {
  initialOrders: Order[];
}

export default function OrdersListClient({
  initialOrders,
}: OrdersListClientProps) {
  // Use React Query hook for automatic caching
  const { orders } = useUserOrders(initialOrders as any);

  return <OrdersList orders={orders as any} />;
}
