import { Product } from "@/components/products/types/product";
import { supabase } from "@/lib/supabase/client";

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      title,
      description,
      image,
      amount,
      in_stock,
      options,
      category:categories (
        id,
        title
      )
    `,
    )
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products: Product[] = data.map((p: any) => ({
    ...p,
  }));

  return products;
}
