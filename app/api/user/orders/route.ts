import { NextResponse } from "next/server";
import { validateApiAuth } from "@/lib/auth/permissions";

export async function GET() {
  try {
    const { profile, supabase } = await validateApiAuth();

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const transformed = (data || []).map((order) => ({
      id: order.id,
      orderNumber: order.order_number,
      userId: order.user_id,
      items: order.items,
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.delivery_fee),
      tax: Number(order.tax),
      total: Number(order.total),
      deliveryAddress: order.delivery_address,
      status: order.status,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      notes: order.notes,
      paymentIntentId: order.payment_intent_id,
      stripeSessionId: order.stripe_session_id,
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("User orders API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch orders" },
      { status: error instanceof Error && error.message.includes("Unauthorized") ? 401 : 500 }
    );
  }
}
