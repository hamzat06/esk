"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Product } from "@/components/products/types/product";

// Fetch products
async function fetchProducts(): Promise<Product[]> {
  const response = await fetch("/api/admin/products");
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch products");
  }
  return response.json();
}

// Create product
async function createProduct(product: Partial<Product>): Promise<Product> {
  const response = await fetch("/api/admin/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create product");
  }
  return response.json();
}

// Update product
async function updateProduct({
  id,
  data,
}: {
  id: string;
  data: Partial<Product>;
}): Promise<Product> {
  const response = await fetch(`/api/admin/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update product");
  }
  return response.json();
}

// Delete product
async function deleteProduct(id: string): Promise<void> {
  const response = await fetch(`/api/admin/products/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete product");
  }
}

// Custom hook
export function useAdminProducts(initialData?: Product[]) {
  const queryClient = useQueryClient();

  // Query
  const query = useQuery({
    queryKey: ["admin", "products"],
    queryFn: fetchProducts,
    initialData,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createProduct,
    onMutate: async (newProduct) => {
      await queryClient.cancelQueries({ queryKey: ["admin", "products"] });
      const previous = queryClient.getQueryData(["admin", "products"]);

      // Optimistically add product
      queryClient.setQueryData(["admin", "products"], (old: Product[] = []) => [
        { ...newProduct, id: `temp-${Date.now()}`, created_at: new Date().toISOString() } as Product,
        ...old,
      ]);

      return { previous };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(["admin", "products"], context?.previous);
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success("Product created successfully!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: updateProduct,
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["admin", "products"] });
      const previous = queryClient.getQueryData(["admin", "products"]);

      // Optimistically update
      queryClient.setQueryData(["admin", "products"], (old: Product[] = []) =>
        old.map((p) => (p.id === id ? { ...p, ...data } : p))
      );

      return { previous };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(["admin", "products"], context?.previous);
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success("Product updated successfully!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["admin", "products"] });
      const previous = queryClient.getQueryData(["admin", "products"]);

      // Optimistically remove
      queryClient.setQueryData(["admin", "products"], (old: Product[] = []) =>
        old.filter((p) => p.id !== id)
      );

      return { previous };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(["admin", "products"], context?.previous);
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success("Product deleted successfully!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });

  return {
    products: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createProduct: createMutation.mutate,
    updateProduct: updateMutation.mutate,
    deleteProduct: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
