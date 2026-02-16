/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from "@/lib/supabase/client";
import { subDays, format } from "date-fns";

export async function fetchAnalyticsData(days: number = 7) {
  const startDate = subDays(new Date(), days);

  // Fetch orders
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*")
    .gte("created_at", startDate.toISOString());

  if (ordersError) {
    throw new Error(ordersError.message);
  }

  // Fetch previous period orders for growth calculation
  const prevStartDate = subDays(startDate, days);
  const { data: prevOrders, error: prevOrdersError } = await supabase
    .from("orders")
    .select("*")
    .gte("created_at", prevStartDate.toISOString())
    .lt("created_at", startDate.toISOString());

  if (prevOrdersError) {
    throw new Error(prevOrdersError.message);
  }

  // Fetch customers
  const { data: customers, error: customersError } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "customer");

  if (customersError) {
    throw new Error(customersError.message);
  }

  // Fetch products
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*, category:categories(title)");

  if (productsError) {
    throw new Error(productsError.message);
  }

  // Calculate metrics
  const totalRevenue = orders.reduce(
    (sum, order) => sum + Number(order.total),
    0,
  );
  const prevRevenue = prevOrders.reduce(
    (sum, order) => sum + Number(order.total),
    0,
  );
  const revenueGrowth =
    prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

  const totalOrders = orders.length;
  const prevTotalOrders = prevOrders.length;
  const ordersGrowth =
    prevTotalOrders > 0
      ? ((totalOrders - prevTotalOrders) / prevTotalOrders) * 100
      : 0;

  // Revenue by day
  const revenueByDay: { [key: string]: { revenue: number; orders: number } } =
    {};

  for (let i = 0; i < days; i++) {
    const date = format(subDays(new Date(), days - i - 1), "yyyy-MM-dd");
    revenueByDay[date] = { revenue: 0, orders: 0 };
  }

  orders.forEach((order) => {
    const date = format(new Date(order.created_at), "yyyy-MM-dd");
    if (revenueByDay[date]) {
      revenueByDay[date].revenue += Number(order.total);
      revenueByDay[date].orders += 1;
    }
  });

  const revenueByDayArray = Object.entries(revenueByDay).map(
    ([date, data]) => ({
      date,
      ...data,
    }),
  );

  // Top products
  const productSales: {
    [key: string]: { name: string; sales: number; revenue: number };
  } = {};

  orders.forEach((order) => {
    const items = order.items as any[];
    items.forEach((item) => {
      if (!productSales[item.title]) {
        productSales[item.title] = { name: item.title, sales: 0, revenue: 0 };
      }
      productSales[item.title].sales += item.quantity;
      productSales[item.title].revenue += Number(
        item.totalPrice || item.total_price || 0,
      );
    });
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Orders by status
  const statusCount: { [key: string]: number } = {};
  orders.forEach((order) => {
    statusCount[order.status] = (statusCount[order.status] || 0) + 1;
  });

  const ordersByStatus = Object.entries(statusCount).map(([status, count]) => ({
    status,
    count,
  }));

  // Category revenue
  const categoryRevenue: { [key: string]: number } = {};

  orders.forEach((order) => {
    const items = order.items as any[];
    items.forEach((item) => {
      const product = products.find((p) => p.title === item.title);
      if (product && product.category) {
        const categoryName = product.category.title;
        categoryRevenue[categoryName] =
          (categoryRevenue[categoryName] || 0) +
          Number(item.totalPrice || item.total_price || 0);
      }
    });
  });

  const categoryRevenueArray = Object.entries(categoryRevenue)
    .map(([category, revenue]) => ({
      category,
      revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  return {
    totalRevenue,
    totalOrders,
    totalCustomers: customers.length,
    totalProducts: products.length,
    revenueGrowth,
    ordersGrowth,
    revenueByDay: revenueByDayArray,
    topProducts,
    ordersByStatus,
    categoryRevenue: categoryRevenueArray,
  };
}
