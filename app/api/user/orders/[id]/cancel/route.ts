import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOrderStatusEmail } from "@/lib/notifications/email";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch the order to verify ownership and current status
  const { data: order, error: fetchError } = await supabaseAdmin
    .from("orders")
    .select("id, user_id, status, order_number, guest_name, guest_email, profile:profiles(full_name, email)")
    .eq("id", id)
    .single();

  if (fetchError || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!["pending", "confirmed"].includes(order.status)) {
    return NextResponse.json(
      { error: "Only pending or confirmed orders can be cancelled" },
      { status: 400 },
    );
  }

  const { error: updateError } = await supabaseAdmin
    .from("orders")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Send cancellation email (fire and forget)
  const profile = Array.isArray(order.profile) ? order.profile[0] : order.profile;
  const customerEmail = profile?.email ?? order.guest_email;
  const customerName = profile?.full_name ?? order.guest_name ?? "Customer";
  if (customerEmail) {
    sendOrderStatusEmail(id, "cancelled", customerEmail, customerName, order.order_number).catch(
      (e) => console.error("Cancel email failed:", e),
    );
  }

  return NextResponse.json({ success: true });
}
