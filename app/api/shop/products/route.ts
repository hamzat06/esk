import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Public API - no auth required
export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        category:categories(id, title)
      `)
      .eq("in_stock", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Shop products API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
