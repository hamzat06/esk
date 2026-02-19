import { createClient } from "@/lib/supabase/server";
import CategoriesClient from "@/components/admin/categories/CategoriesClient";
import { requirePermission } from "@/lib/auth/permissions";

// Cache for faster navigation
export const revalidate = 30;

export default async function CategoriesPage() {
  // Require categories permission
  await requirePermission("categories");

  const supabase = await createClient();

  // Fetch categories
  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch categories:", error);
  }

  return <CategoriesClient initialCategories={categories || []} />;
}
