"use client";

import { useQuery } from "@tanstack/react-query";
import { Product } from "@/components/products/types/product";

// Fetch products
async function fetchShopProducts(): Promise<Product[]> {
  const response = await fetch("/api/shop/products");
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }
  return response.json();
}

// Custom hook for shop (public) products
export function useShopProducts(initialData?: Product[]) {
  const query = useQuery({
    queryKey: ["shop", "products"],
    queryFn: fetchShopProducts,
    initialData,
    staleTime: 60 * 1000, // 60 seconds (products don't change as often)
  });

  return {
    products: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
