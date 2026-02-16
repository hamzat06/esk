import { createClient } from "@/lib/supabase/server";

export type UserRole = "customer" | "admin";

export async function fetchCustomers(role?: UserRole) {
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select(
      `
      *
    `,
    )
    .order("created_at", { ascending: false });

  if (role) {
    query = query.eq("role", role);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching customers:", error);
    throw new Error(error.message);
  }

  // Fetch order stats for each customer
  const customersWithStats = await Promise.all(
    (data || []).map(async (customer) => {
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("total")
        .eq("user_id", customer.id);

      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
        return {
          ...customer,
          order_count: 0,
          total_spent: 0,
        };
      }

      const order_count = orders?.length || 0;
      const total_spent =
        orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;

      return {
        ...customer,
        order_count,
        total_spent,
      };
    }),
  );

  return customersWithStats;
}

export async function fetchCustomerById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      *
    `,
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching customer:", error);
    throw new Error(error.message);
  }

  // Fetch order stats
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("total")
    .eq("user_id", id);

  if (ordersError) {
    console.error("Error fetching orders:", ordersError);
    return {
      ...data,
      order_count: 0,
      total_spent: 0,
    };
  }

  const order_count = orders?.length || 0;
  const total_spent =
    orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;

  return {
    ...data,
    order_count,
    total_spent,
  };
}

export async function updateCustomerRole(id: string, role: UserRole) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating customer role:", error);
    throw new Error(error.message);
  }

  return data;
}
