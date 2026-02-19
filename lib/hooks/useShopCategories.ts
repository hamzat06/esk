"use client";

import { useQuery } from "@tanstack/react-query";
import { Category } from "@/components/categories/types/category";

// Fetch categories
async function fetchCategories(): Promise<Category[]> {
  const response = await fetch("/api/shop/categories");
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  return response.json();
}

// Custom hook for shop categories
export function useShopCategories(initialData?: Category[]) {
  const query = useQuery({
    queryKey: ["shop", "categories"],
    queryFn: fetchCategories,
    initialData,
    staleTime: 5 * 60 * 1000, // 5 minutes (categories change rarely)
  });

  return {
    categories: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
