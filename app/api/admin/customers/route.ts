import { NextResponse } from "next/server";
import { validateApiPermission } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const { supabase } = await validateApiPermission("customers");

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "customer")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Customers API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch customers" },
      { status: error instanceof Error && error.message.includes("Permission") ? 403 : 500 }
    );
  }
}
