import { createClient } from "@/lib/supabase/server";
import CateringClient from "@/components/admin/catering/CateringClient";
import { requirePermission } from "@/lib/auth/permissions";

async function fetchCateringBookings() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("catering_bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching catering bookings:", error);
    return [];
  }

  return data || [];
}

// Cache for faster navigation
export const revalidate = 30;

export default async function CateringBookingsPage() {
  // Require catering permission
  await requirePermission("catering");

  const bookings = await fetchCateringBookings();

  return <CateringClient initialBookings={bookings} />;
}
