import { createClient } from "@/lib/supabase/server";
import CategoriesManager from "@/components/admin/categories/CategoriesManager";

export default async function CategoriesPage() {
  const supabase = await createClient();

  // Fetch categories
  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch categories:", error);
  }

  return <CategoriesManager initialCategories={categories || []} />;
}
