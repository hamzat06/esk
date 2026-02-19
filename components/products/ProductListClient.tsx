"use client";

import { useShopProducts } from "@/lib/hooks/useShopProducts";
import { useShopCategories } from "@/lib/hooks/useShopCategories";
import ProductList from "./ProductList";
import { Product } from "./types/product";
import { Category } from "../categories/types/category";

interface ProductListClientProps {
  initialProducts: Product[];
  initialCategories: Category[];
}

export default function ProductListClient({
  initialProducts,
  initialCategories,
}: ProductListClientProps) {
  // Use React Query hooks for automatic caching (60s for products, 5min for categories)
  const { products } = useShopProducts(initialProducts as any);
  const { categories } = useShopCategories(initialCategories as any);

  return <ProductList products={products as any} categories={categories as any} />;
}
