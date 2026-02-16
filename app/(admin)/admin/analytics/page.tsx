import AnalyticsManager from "@/components/admin/analytics/AnalyticsManager";
import { createClient } from "@/lib/supabase/server";

async function fetchAnalyticsData() {
  const supabase = await createClient();

  // Fetch orders with items
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (ordersError) {
    console.error("Orders fetch error:", ordersError);
  }

  // Fetch products with categories
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*, category:categories(title)");

  if (productsError) {
    console.error("Products fetch error:", productsError);
  }

  // Fetch customers
  const { data: customers, error: customersError } = await supabase
    .from("profiles")
    .select("id, role");

  if (customersError) {
    console.error("Customers fetch error:", customersError);
  }

  // Fetch page views
  const { data: pageViews, error: pageViewsError } = await supabase
    .from("page_views")
    .select("*")
    .order("timestamp", { ascending: false });

  if (pageViewsError) {
    console.error("Page views fetch error:", pageViewsError);
  }

  return {
    orders: orders || [],
    products: products || [],
    customers: customers || [],
    pageViews: pageViews || [],
  };
}

export default async function AnalyticsPage() {
  const { orders, products, customers, pageViews } = await fetchAnalyticsData();

  return (
    <AnalyticsManager
      orders={orders}
      products={products}
      customers={customers}
      pageViews={pageViews}
    />
  );
}
