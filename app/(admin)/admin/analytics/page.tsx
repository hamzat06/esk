import AnalyticsClient from "@/components/admin/analytics/AnalyticsClient";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth/permissions";

async function fetchAnalyticsData() {
  const supabase = await createClient();

  // Fetch all data in parallel for better performance
  const [ordersResult, productsResult, customersResult, pageViewsResult] =
    await Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("products").select("*, category:categories(title)"),
      supabase.from("profiles").select("id, role"),
      supabase.from("page_views").select("*").order("timestamp", { ascending: false }),
    ]);

  // Log errors if any
  if (ordersResult.error) console.error("Orders fetch error:", ordersResult.error);
  if (productsResult.error) console.error("Products fetch error:", productsResult.error);
  if (customersResult.error) console.error("Customers fetch error:", customersResult.error);
  if (pageViewsResult.error) console.error("Page views fetch error:", pageViewsResult.error);

  return {
    orders: ordersResult.data || [],
    products: productsResult.data || [],
    customers: customersResult.data || [],
    pageViews: pageViewsResult.data || [],
  };
}

// Cache for faster navigation
export const revalidate = 30;

export default async function AnalyticsPage() {
  // Require analytics permission
  await requirePermission("analytics");

  const { orders, products, customers, pageViews } = await fetchAnalyticsData();

  return (
    <AnalyticsClient
      initialData={{ orders, products, customers, pageViews }}
    />
  );
}
