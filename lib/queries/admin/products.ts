import { supabase } from "@/lib/supabase/client";
import { ProductOptions } from "@/components/products/types/product";

export type CreateProductInput = {
  title: string;
  description: string;
  image: string | null;
  amount: number;
  in_stock: boolean;
  category_id: string;
  options: ProductOptions | null;
};

export type UpdateProductInput = Partial<CreateProductInput>;

export async function createProduct(product: CreateProductInput) {
  const { data, error } = await supabase
    .from("products")
    .insert(product)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateProduct(id: string, product: UpdateProductInput) {
  const { data, error } = await supabase
    .from("products")
    .update(product)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function toggleProductStock(id: string, inStock: boolean) {
  const { error } = await supabase
    .from("products")
    .update({ in_stock: inStock })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
