import { NextRequest, NextResponse } from "next/server";
import { validateApiPermission } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const { supabase } = await validateApiPermission("categories");

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Categories API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch categories" },
      { status: error instanceof Error && error.message.includes("Permission") ? 403 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase } = await validateApiPermission("categories");
    const body = await request.json();

    const { data, error } = await supabase
      .from("categories")
      .insert(body)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create category" },
      { status: 500 }
    );
  }
}
