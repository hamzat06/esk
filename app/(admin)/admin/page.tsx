// app/admin/page.tsx

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin?redirect=/admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/?error=unauthorized");
  }

  // Fetch dashboard stats
  const { count: totalOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true });

  const { count: totalCustomers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "customer");

  const { data: recentOrders } = await supabase
    .from("orders")
    .select("total")
    .order("created_at", { ascending: false })
    .limit(100);

  const totalRevenue =
    recentOrders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count: todayOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .gte("created_at", today.toISOString());

  const { count: activeOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .in("status", ["confirmed", "preparing", "ready"]);

  const { count: pendingOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  return (
    <AdminDashboard
      stats={{
        totalOrders: totalOrders || 0,
        totalRevenue,
        totalCustomers: totalCustomers || 0,
        todayOrders: todayOrders || 0,
        activeOrders: activeOrders || 0,
        pendingOrders: pendingOrders || 0,
      }}
    />
  );
}
