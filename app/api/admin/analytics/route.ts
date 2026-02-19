import { NextResponse } from "next/server";
import { validateApiPermission } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const { supabase } = await validateApiPermission("analytics");

    // Fetch all analytics data in parallel
    const [ordersResult, productsResult, customersResult, pageViewsResult] =
      await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("products").select("*, category:categories(title)"),
        supabase.from("profiles").select("id, role"),
        supabase.from("page_views").select("*").order("timestamp", { ascending: false }),
      ]);

    if (ordersResult.error) throw ordersResult.error;
    if (productsResult.error) throw productsResult.error;
    if (customersResult.error) throw customersResult.error;
    if (pageViewsResult.error) throw pageViewsResult.error;

    return NextResponse.json({
      orders: ordersResult.data || [],
      products: productsResult.data || [],
      customers: customersResult.data || [],
      pageViews: pageViewsResult.data || [],
    });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch analytics" },
      { status: error instanceof Error && error.message.includes("Permission") ? 403 : 500 }
    );
  }
}
