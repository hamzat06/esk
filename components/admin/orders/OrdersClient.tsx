"use client";

import { useAdminOrders } from "@/lib/hooks/useAdminOrders";
import OrdersManager from "./OrdersManager";

interface Order {
  id: string;
  order_number: string;
  total: number;
  status: string;
  created_at: string;
  items: any[];
  delivery_address: any;
  notes: string | null;
  profile: {
    full_name: string;
    email: string;
    phone: string | null;
  };
}

interface OrdersClientProps {
  initialOrders: Order[];
}

export default function OrdersClient({ initialOrders }: OrdersClientProps) {
  // Use React Query hook for automatic caching and auto-refresh every 60s
  const { orders } = useAdminOrders(initialOrders as any);

  return <OrdersManager initialOrders={orders as any} />;
}
