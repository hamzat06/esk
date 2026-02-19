"use client";

import { useAdminCategories } from "@/lib/hooks/useAdminCategories";
import CategoriesManager from "./CategoriesManager";

interface Category {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface CategoriesClientProps {
  initialCategories: Category[];
}

export default function CategoriesClient({
  initialCategories,
}: CategoriesClientProps) {
  // Use React Query hook for automatic caching
  const { categories } = useAdminCategories(initialCategories);

  return <CategoriesManager initialCategories={categories} />;
}
