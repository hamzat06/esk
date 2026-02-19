"use client";

import { useQuery } from "@tanstack/react-query";

export interface Admin {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  permissions: string[] | null;
  created_at: string;
  updated_at: string;
}

async function fetchAdmins(): Promise<Admin[]> {
  const response = await fetch("/api/admin/admins");
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch admins");
  }
  return response.json();
}

export function useAdminAdmins(initialData?: Admin[]) {
  const query = useQuery({
    queryKey: ["admin", "admins"],
    queryFn: fetchAdmins,
    initialData,
    staleTime: 30 * 1000, // 30 seconds
  });

  return {
    admins: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
