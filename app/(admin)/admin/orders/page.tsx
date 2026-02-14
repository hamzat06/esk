import { createClient } from "@/lib/supabase/server";
import OrdersManager from "@/components/admin/orders/OrdersManager";

export default async function OrdersPage() {
  const supabase = await createClient();

  // Fetch all orders with customer profiles
  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      profile:profiles(full_name, email, phone)
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch orders:", error);
  }

  return <OrdersManager initialOrders={orders || []} />;
}
