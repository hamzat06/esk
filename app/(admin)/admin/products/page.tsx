import { createClient } from "@/lib/supabase/server";
import ProductsManager from "@/components/admin/products/ProductsManager";

export default async function ProductsPage() {
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
    <ProductsManager
      initialProducts={products || []}
      categories={categories || []}
    />
  );
}
