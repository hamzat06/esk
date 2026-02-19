"use client";

import { useQuery } from "@tanstack/react-query";

export interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  permissions: string[] | null;
  default_address: any;
  created_at: string;
  updated_at: string;
}

async function fetchCustomers(): Promise<Customer[]> {
  const response = await fetch("/api/admin/customers");
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch customers");
  }
  return response.json();
}

export function useAdminCustomers(initialData?: Customer[]) {
  const query = useQuery({
    queryKey: ["admin", "customers"],
    queryFn: fetchCustomers,
    initialData,
    staleTime: 30 * 1000, // 30 seconds
  });

  return {
    customers: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
