import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateApiPermission } from "@/lib/auth/permissions";
import {
  sendCateringStatusEmail,
  sendCateringStatusAdminEmail,
} from "@/lib/notifications/email";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    await validateApiPermission("catering");
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Forbidden" },
      { status: 403 },
    );
  }

  const body = (await request.json()) as {
    status?: string;
    quote_amount?: number | null;
    admin_notes?: string | null;
  };

  if (
    body.status === undefined &&
    body.quote_amount === undefined &&
    body.admin_notes === undefined
  ) {
    return NextResponse.json({ error: "No changes provided" }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.status !== undefined) updates.status = body.status;
  if (body.quote_amount !== undefined) updates.quote_amount = body.quote_amount;
  if (body.admin_notes !== undefined) updates.admin_notes = body.admin_notes;

  const supabaseAdmin = createAdminClient();
  const { data: booking, error } = await supabaseAdmin
    .from("catering_bookings")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fire and forget — don't block the response
  if (body.status !== undefined) {
    const statusData = {
      full_name: booking.full_name,
      email: booking.email,
      event_type: booking.event_type,
      event_date: booking.event_date,
      event_time: booking.event_time,
      status: booking.status,
      quote_amount: booking.quote_amount,
    };

    sendCateringStatusEmail(statusData).catch((e) =>
      console.error("Catering status email failed:", e),
    );
    sendCateringStatusAdminEmail(statusData).catch((e) =>
      console.error("Catering admin status email failed:", e),
    );
  }

  return NextResponse.json(booking);
}
