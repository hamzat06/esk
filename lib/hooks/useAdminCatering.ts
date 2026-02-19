"use client";

import { useQuery } from "@tanstack/react-query";

export interface CateringBooking {
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

async function fetchCateringBookings(): Promise<CateringBooking[]> {
  const response = await fetch("/api/admin/catering");
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch catering bookings");
  }
  return response.json();
}

export function useAdminCatering(initialData?: CateringBooking[]) {
  const query = useQuery({
    queryKey: ["admin", "catering"],
    queryFn: fetchCateringBookings,
    initialData,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 120 * 1000, // Auto-refetch every 2 minutes
  });

  return {
    bookings: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
