// lib/queries/categories.ts
import { supabase } from "@/lib/supabase/client";

export type Category = {
  id: string;
  title: string;
  created_at: string;
};

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createCategory(title: string): Promise<Category> {
  const { data, error} = await supabase
    .from("categories")
    .insert({ title })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateCategory(
  id: string,
  title: string,
): Promise<Category> {
  const { data, error } = await supabase
    .from("categories")
    .update({ title })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
