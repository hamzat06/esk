import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendCateringCustomerEmail, sendCateringAdminEmail } from "@/lib/notifications/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("catering_bookings").insert({
      user_id: user?.id || null,
      full_name: body.full_name,
      email: body.email,
      phone: body.phone,
      event_type: body.event_type,
      event_date: body.event_date,
      event_time: body.event_time || null,
      guest_count: parseInt(body.guest_count),
      venue_address: body.venue_address,
      service_type: body.service_type,
      menu_preferences: body.menu_preferences || null,
      budget_range: body.budget_range || null,
      special_requests: body.special_requests || null,
      heard_from: body.heard_from || null,
      status: "pending",
    });

    if (error) throw error;

    await Promise.allSettled([
      sendCateringCustomerEmail(body),
      sendCateringAdminEmail(body),
    ]);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Catering booking error:", error);
    const message = error instanceof Error ? error.message : "Failed to submit booking";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
