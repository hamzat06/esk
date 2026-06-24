import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth/permissions";
import { Suspense } from "react";
import OrdersFilters from "@/components/admin/orders/OrdersFilters";
import OrdersTable from "@/components/admin/orders/OrdersTable";
import OrdersPagination from "@/components/admin/orders/OrdersPagination";
import OrdersRealtimeNotifier from "@/components/admin/orders/OrdersRealtimeNotifier";

const PAGE_SIZE = 15;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>;
}) {
  await requirePermission("orders");

  const { page: pageParam, status = "", search = "" } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select("*, profile:profiles(full_name, email, phone)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status && status !== "all") query = query.eq("status", status);
  if (search) {
    query = query.or(
      `order_number.ilike.%${search}%,guest_name.ilike.%${search}%,guest_email.ilike.%${search}%`,
    );
  }

  const { data: orders, count } = await query;
  const totalCount = count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="w-full max-w-full px-4 sm:px-6 py-6 sm:py-8 min-w-0 overflow-hidden">
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold font-playfair mb-1">Orders</h1>
        <p className="text-gray-500 text-sm">{totalCount} total orders</p>
      </div>

      <Suspense>
        <OrdersFilters status={status} search={search} />
      </Suspense>

      <OrdersTable orders={orders ?? []} />

      <Suspense>
        <OrdersPagination
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={PAGE_SIZE}
        />
      </Suspense>

      <OrdersRealtimeNotifier />
    </div>
  );
}
