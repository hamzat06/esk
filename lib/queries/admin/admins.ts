import { createClient } from "@/lib/supabase/server";

export async function fetchAdmins() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select(`*`)
    .eq("role", "admin")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching admins:", error);
    throw new Error(error.message);
  }

  return data || [];
}

export async function updateAdminPermissions(
  id: string,
  permissions: string[] | null,
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .update({
      permissions,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating admin permissions:", error);
    throw new Error(error.message);
  }

  return data;
}
