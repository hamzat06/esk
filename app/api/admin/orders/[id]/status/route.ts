import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateApiPermission } from "@/lib/auth/permissions";
import { sendOrderStatusEmail } from "@/lib/notifications/email";
import { sendOrderStatusPush } from "@/lib/notifications/push";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    await validateApiPermission("orders");
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Forbidden" },
      { status: 403 },
    );
  }

  const { status } = (await request.json()) as { status: string };
  if (!status) {
    return NextResponse.json({ error: "Status is required" }, { status: 400 });
  }

  const supabaseAdmin = createAdminClient();
  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*, profile:profiles(full_name, email)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const profile = Array.isArray(order.profile) ? order.profile[0] : order.profile;
  const customerEmail = profile?.email ?? order.guest_email;
  const customerName = profile?.full_name ?? order.guest_name ?? "Customer";

  // Fire and forget — don't block the response
  if (customerEmail) {
    sendOrderStatusEmail(id, status, customerEmail, customerName, order.order_number).catch(
      (e) => console.error("Status email failed:", e),
    );
  }
  if (order.user_id) {
    sendOrderStatusPush(order.user_id, order.order_number, status).catch(
      (e) => console.error("Status push failed:", e),
    );
  }

  return NextResponse.json(order);
}
