import { createClient } from "@/lib/supabase/server";
import OrdersClient from "@/components/admin/orders/OrdersClient";
import { requirePermission } from "@/lib/auth/permissions";

// Cache for faster navigation
export const revalidate = 30;

export default async function OrdersPage() {
  // Require orders permission
  await requirePermission("orders");

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

  return <OrdersClient initialOrders={orders || []} />;
}
