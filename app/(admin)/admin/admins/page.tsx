import AdminsClient from "@/components/admin/admins/AdminsClient";
import { fetchAdmins } from "@/lib/queries/admin/admins";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth/permissions";

// Cache for faster navigation
export const revalidate = 30;

export default async function AdminsPage() {
  // Require super admin access
  const profile = await requireSuperAdmin();

  const admins = await fetchAdmins();

  // Server Action: Update admin permissions
  async function updatePermissions(adminId: string, permissions: string[] | null) {
    "use server";

    // Require super admin
    const currentProfile = await requireSuperAdmin();
    const supabase = await createClient();

    // Don't allow editing own permissions
    if (adminId === currentProfile.id) {
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

    // Require super admin
    const currentProfile = await requireSuperAdmin();
    const supabase = await createClient();

    // Don't allow demoting yourself
    if (adminId === currentProfile.id) {
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
    <AdminsClient
      initialAdmins={admins}
      currentUserId={profile.id}
      updatePermissions={updatePermissions}
      demoteToCustomer={demoteToCustomer}
    />
  );
}