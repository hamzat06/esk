import { createClient } from "@/lib/supabase/server";
import ProductsClient from "@/components/admin/products/ProductsClient";
import { requirePermission } from "@/lib/auth/permissions";

// Cache for faster navigation
export const revalidate = 30;

export default async function ProductsPage() {
  // Require products permission
  await requirePermission("products");

  const supabase = await createClient();

  // Fetch products with categories
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories(id, title)
    `,
    )
    .order("created_at", { ascending: false });

  // Fetch all categories for the dialog
  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("*")
    .order("title", { ascending: true });

  if (productsError || categoriesError) {
    console.error("Failed to fetch data:", productsError || categoriesError);
  }

  return (
    <ProductsClient
      initialProducts={products || []}
      initialCategories={categories || []}
    />
  );
}
