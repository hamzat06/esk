import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { page, timestamp, referrer, userAgent } = body;

    // Get IP address (for unique visitor tracking)
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Insert page view
    const { error } = await supabase.from("page_views").insert({
      page,
      timestamp,
      referrer,
      user_agent: userAgent,
      ip_address: ip,
    });

    if (error) {
      console.error("Error tracking page view:", error);
      return NextResponse.json({ success: false }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in track API:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
