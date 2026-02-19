"use client";

import { useAdminProducts } from "@/lib/hooks/useAdminProducts";
import { useAdminCategories } from "@/lib/hooks/useAdminCategories";
import ProductsManager from "./ProductsManager";
import { Product } from "@/components/products/types/product";
import { Category } from "@/lib/queries/categories";

interface ProductsClientProps {
  initialProducts: Product[];
  initialCategories: Category[];
}

export default function ProductsClient({
  initialProducts,
  initialCategories,
}: ProductsClientProps) {
  // Use React Query hooks for automatic caching and revalidation
  const { products } = useAdminProducts(initialProducts as any);
  const { categories } = useAdminCategories(initialCategories);

  // ProductsManager already handles mutations internally
  // React Query will automatically refetch when mutations complete
  return <ProductsManager initialProducts={products as any} categories={categories} />;
}
