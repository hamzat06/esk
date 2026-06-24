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

  const customerIds = (data || []).map((c) => c.id);

  // Fetch order stats and saved addresses in parallel for all customers
  const [ordersRes, addressesRes] = await Promise.all([
    supabase.from("orders").select("user_id, total").in("user_id", customerIds),
    supabase
      .from("user_addresses")
      .select("user_id, id, label, address, phone, is_default")
      .in("user_id", customerIds)
      .order("is_default", { ascending: false }),
  ]);

  const ordersByUser = new Map<string, { total: number }[]>();
  for (const o of ordersRes.data ?? []) {
    if (!ordersByUser.has(o.user_id)) ordersByUser.set(o.user_id, []);
    ordersByUser.get(o.user_id)!.push(o);
  }

  const addressesByUser = new Map<string, typeof addressesRes.data>();
  for (const a of addressesRes.data ?? []) {
    if (!addressesByUser.has(a.user_id)) addressesByUser.set(a.user_id, []);
    addressesByUser.get(a.user_id)!.push(a);
  }

  const customersWithStats = (data || []).map((customer) => {
    const orders = ordersByUser.get(customer.id) ?? [];
    const saved_addresses = addressesByUser.get(customer.id) ?? [];
    return {
      ...customer,
      order_count: orders.length,
      total_spent: orders.reduce((sum, o) => sum + Number(o.total), 0),
      saved_addresses,
    };
  });

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
