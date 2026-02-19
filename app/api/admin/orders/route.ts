import { NextResponse } from "next/server";
import { validateApiPermission } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const { supabase } = await validateApiPermission("orders");

    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        profile:profiles(full_name, email, phone)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Orders API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch orders" },
      { status: error instanceof Error && error.message.includes("Permission") ? 403 : 500 }
    );
  }
}
