import { NextResponse } from "next/server";
import { validateApiAuth } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const { profile, supabase } = await validateApiAuth();

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("User orders API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch orders" },
      { status: error instanceof Error && error.message.includes("Unauthorized") ? 401 : 500 }
    );
  }
}
