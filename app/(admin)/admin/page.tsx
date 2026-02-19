// app/admin/page.tsx

import { createClient } from "@/lib/supabase/server";
import DashboardClient from "@/components/admin/DashboardClient";
import { requireAdmin, hasPermission } from "@/lib/auth/permissions";

// Enable Next.js caching - revalidate every 30 seconds
export const revalidate = 30;

export default async function AdminPage() {
  // Require admin authentication
  const profile = await requireAdmin();

  const supabase = await createClient();

  // Check admin permissions
  const canViewOrders = hasPermission(profile, "orders");
  const canViewCustomers = hasPermission(profile, "customers");
  const canViewAnalytics = hasPermission(profile, "analytics");
  const canViewProducts = hasPermission(profile, "products");

  // Initialize stats
  let totalOrders = 0;
  let totalRevenue = 0;
  let todayOrders = 0;
  let activeOrders = 0;
  let pendingOrders = 0;
  let totalCustomers = 0;

  // Calculate today's start time once
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fetch all data in parallel for maximum performance
  const [ordersData, customersData] = await Promise.all([
    // Fetch all order stats in parallel (if permitted)
    canViewOrders || canViewAnalytics
      ? Promise.all([
          // Total orders count
          supabase
            .from("orders")
            .select("*", { count: "exact", head: true }),
          // Recent orders for revenue
          supabase
            .from("orders")
            .select("total")
            .order("created_at", { ascending: false })
            .limit(100),
          // Today's orders count
          supabase
            .from("orders")
            .select("*", { count: "exact", head: true })
            .gte("created_at", today.toISOString()),
          // Active orders count
          supabase
            .from("orders")
            .select("*", { count: "exact", head: true })
            .in("status", ["confirmed", "preparing", "ready"]),
          // Pending orders count
          supabase
            .from("orders")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending"),
        ])
      : Promise.resolve([null, null, null, null, null]),

    // Fetch customers count (if permitted)
    canViewCustomers
      ? supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "customer")
      : Promise.resolve(null),
  ]);

  // Extract order stats if available
  if (ordersData) {
    const [totalCount, recentOrders, todayCount, activeCount, pendingCount] =
      ordersData;

    totalOrders = totalCount?.count || 0;
    totalRevenue =
      recentOrders?.data?.reduce(
        (sum, order) => sum + Number(order.total),
        0,
      ) || 0;
    todayOrders = todayCount?.count || 0;
    activeOrders = activeCount?.count || 0;
    pendingOrders = pendingCount?.count || 0;
  }

  // Extract customers count if available
  if (customersData) {
    totalCustomers = customersData.count || 0;
  }

  return (
    <DashboardClient
      initialStats={{
        totalOrders,
        totalRevenue,
        totalCustomers,
        todayOrders,
        activeOrders,
        pendingOrders,
      }}
      permissions={{
        canViewOrders,
        canViewCustomers,
        canViewAnalytics,
        canViewProducts,
      }}
    />
  );
}
