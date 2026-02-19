import { NextResponse } from "next/server";
import { requireAdmin, hasPermission, getCurrentUserWithProfile } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const profile = await requireAdmin();
    const supabase = await createClient();

    // Check permissions
    const canViewOrders = hasPermission(profile, "orders");
    const canViewCustomers = hasPermission(profile, "customers");
    const canViewAnalytics = hasPermission(profile, "analytics");

    // Initialize stats
    let stats = {
      totalOrders: 0,
      totalRevenue: 0,
      todayOrders: 0,
      activeOrders: 0,
      pendingOrders: 0,
      totalCustomers: 0,
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch stats based on permissions
    if (canViewOrders || canViewAnalytics) {
      const [totalCount, recentOrders, todayCount, activeCount, pendingCount] =
        await Promise.all([
          supabase.from("orders").select("*", { count: "exact", head: true }),
          supabase.from("orders").select("total").order("created_at", { ascending: false }).limit(100),
          supabase.from("orders").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
          supabase.from("orders").select("*", { count: "exact", head: true }).in("status", ["confirmed", "preparing", "ready"]),
          supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
        ]);

      stats.totalOrders = totalCount?.count || 0;
      stats.totalRevenue = recentOrders?.data?.reduce((sum, order) => sum + Number(order.total), 0) || 0;
      stats.todayOrders = todayCount?.count || 0;
      stats.activeOrders = activeCount?.count || 0;
      stats.pendingOrders = pendingCount?.count || 0;
    }

    if (canViewCustomers) {
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "customer");
      stats.totalCustomers = count || 0;
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
