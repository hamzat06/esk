import CustomersManager from "@/components/admin/customers/CustomersManager";
import { fetchCustomers } from "@/lib/queries/admin/customer";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export default async function CustomersPage() {
  const customers = await fetchCustomers();

  // Server Action - promotes customer to admin with selected permissions
  async function promoteToAdmin(
    customerId: string,
    role: "customer" | "admin",
    permissions: string[] | null,
  ) {
    "use server";

    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      throw new Error("Forbidden - Admin access required");
    }

    // Prepare update data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      role,
      updated_at: new Date().toISOString(),
    };

    // Set permissions based on what was selected
    if (role === "admin") {
      // Use the permissions passed from the dialog
      // null = super admin, [] or [...] = normal admin with specific permissions
      updateData.permissions = permissions;
    } else {
      // If demoting back to customer, remove permissions
      updateData.permissions = null;
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", customerId)
      .select()
      .single();

    if (error) {
      console.error("Error updating customer role:", error);
      throw new Error("Failed to update customer role");
    }

    // Revalidate both pages so changes reflect immediately
    revalidatePath("/admin/customers");
    revalidatePath("/admin/admins");

    return { success: true, data };
  }

  // Server Action - update customer details (name, email, phone)
  async function updateCustomerDetails(
    customerId: string,
    details: { full_name: string; email: string; phone: string | null },
  ) {
    "use server";

    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      throw new Error("Forbidden - Admin access required");
    }

    // Update profile details
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: details.full_name,
        phone: details.phone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", customerId);

    if (profileError) {
      console.error("Error updating profile:", profileError);
      throw new Error("Failed to update customer details");
    }

    // If email changed, update auth email
    // Get current email first
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", customerId)
      .single();

    if (currentProfile && currentProfile.email !== details.email) {
      // Note: Updating email in Supabase Auth requires admin privileges
      // This will send a confirmation email to the new address
      const { error: authError } = await supabase.auth.admin.updateUserById(
        customerId,
        { email: details.email },
      );

      if (authError) {
        console.error("Error updating auth email:", authError);
        // Don't throw error - profile was updated successfully
        // Just log the auth update failure
        throw new Error(
          "Profile updated but email change requires verification. Customer will receive a confirmation email.",
        );
      }
    }

    // Revalidate the page
    revalidatePath("/admin/customers");

    return { success: true };
  }

  return (
    <CustomersManager
      initialCustomers={customers}
      promoteToAdmin={promoteToAdmin}
      updateCustomerDetails={updateCustomerDetails}
    />
  );
}
