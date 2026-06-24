import { NextRequest, NextResponse } from "next/server";
import { validateApiPermission } from "@/lib/auth/permissions";

export const PAGE_SIZE = 15;

export async function GET(request: NextRequest) {
  try {
    const { supabase } = await validateApiPermission("orders");
    const { searchParams } = request.nextUrl;

    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const status = searchParams.get("status") ?? "";
    const search = searchParams.get("search") ?? "";
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("orders")
      .select("*, profile:profiles(full_name, email, phone)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (status && status !== "all") query = query.eq("status", status);
    if (search) {
      query = query.or(
        `order_number.ilike.%${search}%,guest_name.ilike.%${search}%,guest_email.ilike.%${search}%`,
      );
    }

    const { data, count, error } = await query;
    if (error) throw error;

    return NextResponse.json({ orders: data ?? [], totalCount: count ?? 0 });
  } catch (error) {
    console.error("Orders API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch orders" },
      { status: error instanceof Error && error.message.includes("Permission") ? 403 : 500 },
    );
  }
}
