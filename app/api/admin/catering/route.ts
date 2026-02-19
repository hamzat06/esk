import { NextResponse } from "next/server";
import { validateApiPermission } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const { supabase } = await validateApiPermission("catering");

    const { data, error } = await supabase
      .from("catering_bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Catering API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch catering bookings" },
      { status: error instanceof Error && error.message.includes("Permission") ? 403 : 500 }
    );
  }
}
