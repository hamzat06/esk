import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth/permissions";

export async function GET() {
  try {
    // Only super admins can view admins
    await requireSuperAdmin();

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "admin")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Admins API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch admins" },
      { status: error instanceof Error && error.message.includes("admin") ? 403 : 500 }
    );
  }
}
