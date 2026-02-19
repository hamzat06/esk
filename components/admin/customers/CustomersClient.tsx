"use client";

import { useAdminCustomers } from "@/lib/hooks/useAdminCustomers";
import CustomersManager from "./CustomersManager";

interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  permissions: string[] | null;
  created_at: string;
}

interface CustomersClientProps {
  initialCustomers: Customer[];
  promoteToAdmin: (
    customerId: string,
    role: "customer" | "admin",
    permissions: string[] | null
  ) => Promise<{ success: boolean; data?: any }>;
  updateCustomerDetails: (
    customerId: string,
    details: { full_name: string; email: string; phone: string | null }
  ) => Promise<{ success: boolean }>;
}

export default function CustomersClient({
  initialCustomers,
  promoteToAdmin,
  updateCustomerDetails,
}: CustomersClientProps) {
  // Use React Query hook for automatic caching
  const { customers } = useAdminCustomers(initialCustomers as any);

  return (
    <CustomersManager
      initialCustomers={customers as any}
      promoteToAdmin={promoteToAdmin as any}
      updateCustomerDetails={updateCustomerDetails}
    />
  );
}
