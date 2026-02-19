import { NextRequest, NextResponse } from "next/server";
import { validateApiPermission } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    // Validate admin has products permission
    const { supabase } = await validateApiPermission("products");

    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        category:categories(id, title)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch products" },
      { status: error instanceof Error && error.message.includes("Permission") ? 403 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase } = await validateApiPermission("products");
    const body = await request.json();

    const { data, error } = await supabase
      .from("products")
      .insert(body)
      .select(`
        *,
        category:categories(id, title)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create product" },
      { status: 500 }
    );
  }
}
