"use client";

import { useAdminAdmins } from "@/lib/hooks/useAdminAdmins";
import AdminsManager from "./AdminsManager";

interface Admin {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  permissions: string[] | null;
  created_at: string;
  updated_at: string;
}

interface AdminsClientProps {
  initialAdmins: Admin[];
  currentUserId: string;
  updatePermissions: (
    adminId: string,
    permissions: string[] | null
  ) => Promise<{ success: boolean }>;
  demoteToCustomer: (adminId: string) => Promise<{ success: boolean }>;
}

export default function AdminsClient({
  initialAdmins,
  currentUserId,
  updatePermissions,
  demoteToCustomer,
}: AdminsClientProps) {
  // Use React Query hook for automatic caching
  const { admins } = useAdminAdmins(initialAdmins as any);

  return (
    <AdminsManager
      initialAdmins={admins as any}
      currentUserId={currentUserId}
      updatePermissions={updatePermissions}
      demoteToCustomer={demoteToCustomer}
    />
  );
}
