import { redirect } from "next/navigation";
import AdminsManager from "@/components/admin/admins/AdminsManager";
import { fetchAdmins } from "@/lib/queries/admin/admins";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export default async function AdminsPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Only super admins (null permissions) can access this page
  if (
    !profile ||
    profile.role !== "admin" ||
    (profile.permissions && profile.permissions.length > 0)
  ) {
    redirect("/admin");
  }

  const admins = await fetchAdmins();

  // Server Action: Update admin permissions
  async function updatePermissions(adminId: string, permissions: string[] | null) {
    "use server";

    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Check if current user is super admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("permissions, role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin" || profile.permissions !== null) {
      throw new Error("Forbidden - Only super admins can manage permissions");
    }

    // Don't allow editing own permissions
    if (adminId === user.id) {
      throw new Error("You cannot edit your own permissions");
    }

    // Update permissions
    const { error } = await supabase
      .from("profiles")
      .update({
        permissions,
        updated_at: new Date().toISOString(),
      })
      .eq("id", adminId);

    if (error) {
      console.error("Error updating permissions:", error);
      throw new Error("Failed to update permissions");
    }

    // Revalidate the page
    revalidatePath("/admin/admins");

    return { success: true };
  }

  // Server Action: Demote admin to customer
  async function demoteToCustomer(adminId: string) {
    "use server";

    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Check if current user is super admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("permissions, role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin" || profile.permissions !== null) {
      throw new Error("Forbidden - Only super admins can demote admins");
    }

    // Don't allow demoting yourself
    if (adminId === user.id) {
      throw new Error("You cannot demote yourself");
    }

    // Demote to customer (remove role and permissions)
    const { error } = await supabase
      .from("profiles")
      .update({
        role: "customer",
        permissions: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", adminId);

    if (error) {
      console.error("Error demoting admin:", error);
      throw new Error("Failed to demote admin");
    }

    // Revalidate both pages
    revalidatePath("/admin/admins");
    revalidatePath("/admin/customers");

    return { success: true };
  }

  return (
    <AdminsManager
      initialAdmins={admins}
      currentUserId={user.id}
      updatePermissions={updatePermissions}
      demoteToCustomer={demoteToCustomer}
    />
  );
}