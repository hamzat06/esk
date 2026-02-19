"use client";

import { useAdminCatering } from "@/lib/hooks/useAdminCatering";
import CateringBookingsManager from "./CateringBookingsManager";

interface CateringBooking {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string;
  event_type: string;
  event_date: string;
  event_time: string | null;
  guest_count: number;
  venue_address: string;
  service_type: string;
  menu_preferences: string | null;
  budget_range: string | null;
  special_requests: string | null;
  heard_from: string | null;
  status: string;
  admin_notes: string | null;
  quote_amount: number | null;
  created_at: string;
  updated_at: string;
}

interface CateringClientProps {
  initialBookings: CateringBooking[];
}

export default function CateringClient({
  initialBookings,
}: CateringClientProps) {
  // Use React Query hook for automatic caching and auto-refresh every 2min
  const { bookings } = useAdminCatering(initialBookings);

  return <CateringBookingsManager initialBookings={bookings} />;
}
