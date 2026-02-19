"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Category } from "@/lib/queries/categories";

async function fetchCategories(): Promise<Category[]> {
  const response = await fetch("/api/admin/categories");
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch categories");
  }
  return response.json();
}

async function createCategory(category: Omit<Category, "id" | "created_at" | "updated_at">): Promise<Category> {
  const response = await fetch("/api/admin/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(category),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create category");
  }
  return response.json();
}

export function useAdminCategories(initialData?: Category[]) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: fetchCategories,
    initialData,
    staleTime: 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      toast.success("Category created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    categories: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createCategory: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
}
