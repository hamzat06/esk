import { createClient } from "@/lib/supabase/server";
import CateringBookingsManager from "@/components/admin/catering/CateringBookingsManager";

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

export default async function CateringBookingsPage() {
  const bookings = await fetchCateringBookings();

  return <CateringBookingsManager initialBookings={bookings} />;
}
