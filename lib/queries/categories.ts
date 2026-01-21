// lib/queries/categories.ts
import { supabase } from "@/lib/supabase/client";

export async function fetchCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("id, title")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
