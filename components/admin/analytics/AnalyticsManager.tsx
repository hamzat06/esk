/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Calendar,
  DollarSign,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
  Eye,
  BarChart3,
} from "lucide-react";
import {
  format,
  subDays,
  isAfter,
  isBefore,
  startOfDay,
  endOfDay,
} from "date-fns";
import VisitorAnalytics from "./VisitorAnalytics";

interface Order {
  id: string;
  total: number;
  status: string;
  created_at: string;
  items: any[];
}

interface Product {
  id: string;
  title: string;
  category: { title: string };
}

interface Customer {
  id: string;
  role: string;
}

interface PageView {
  id: string;
  page: string;
  timestamp: string;
  referrer: string | null;
  user_agent: string;
  ip_address: string;
}

interface AnalyticsManagerProps {
  orders: Order[];
  products: Product[];
  customers: Customer[];
  pageViews: PageView[];
}

const COLORS = [
  "#A62828",
  "#E63946",
  "#F77F00",
  "#FCBF49",
  "#06D6A0",
  "#118AB2",
  "#8B5CF6",
  "#EC4899",
];

const STATUS_COLORS: Record<string, string> = {
  pending: "#F59E0B",
  confirmed: "#3B82F6",
  preparing: "#8B5CF6",
  ready: "#10B981",
  delivered: "#6B7280",
  cancelled: "#EF4444",
};

export default function AnalyticsManager({
  orders: initialOrders,
  products,
  customers,
  pageViews: initialPageViews,
}: AnalyticsManagerProps) {
  const [dateRange, setDateRange] = useState("30");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Filter orders based on date range
  const filteredOrders = useMemo(() => {
    let filtered = initialOrders;

    if (dateRange === "custom" && (startDate || endDate)) {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.created_at);
        const matchesStart =
          !startDate ||
          isAfter(orderDate, startOfDay(new Date(startDate))) ||
          orderDate.getTime() === startOfDay(new Date(startDate)).getTime();
        const matchesEnd =
          !endDate ||
          isBefore(orderDate, endOfDay(new Date(endDate))) ||
          orderDate.getTime() === endOfDay(new Date(endDate)).getTime();
        return matchesStart && matchesEnd;
      });
    } else if (dateRange !== "custom" && dateRange !== "all") {
      const days = parseInt(dateRange);
      const cutoffDate = subDays(new Date(), days);
      filtered = filtered.filter((order) =>
        isAfter(new Date(order.created_at), cutoffDate),
      );
    }

    return filtered;
  }, [dateRange, startDate, endDate, initialOrders]);

  // Filter page views based on date range
  const filteredPageViews = useMemo(() => {
    let filtered = initialPageViews;

    if (dateRange === "custom" && (startDate || endDate)) {
      filtered = filtered.filter((pv) => {
        const pvDate = new Date(pv.timestamp);
        const matchesStart =
          !startDate ||
          isAfter(pvDate, startOfDay(new Date(startDate))) ||
          pvDate.getTime() === startOfDay(new Date(startDate)).getTime();
        const matchesEnd =
          !endDate ||
          isBefore(pvDate, endOfDay(new Date(endDate))) ||
          pvDate.getTime() === endOfDay(new Date(endDate)).getTime();
        return matchesStart && matchesEnd;
      });
    } else if (dateRange !== "custom" && dateRange !== "all") {
      const days = parseInt(dateRange);
      const cutoffDate = subDays(new Date(), days);
      filtered = filtered.filter((pv) =>
        isAfter(new Date(pv.timestamp), cutoffDate),
      );
    }

    return filtered;
  }, [dateRange, startDate, endDate, initialPageViews]);

  // Calculate metrics
  const totalRevenue = filteredOrders.reduce(
    (sum, order) => sum + Number(order.total),
    0,
  );
  const totalOrders = filteredOrders.length;
  const totalCustomers = customers.filter((c) => c.role === "customer").length;
  const totalProducts = products.length;

  // Calculate growth (compare to previous period)
  const previousPeriodOrders = initialOrders.filter((order) => {
    if (dateRange === "all") return false;
    const days = dateRange === "custom" ? 30 : parseInt(dateRange);
    const cutoffDate = subDays(new Date(), days * 2);
    const periodStart = subDays(new Date(), days);
    const orderDate = new Date(order.created_at);
    return isAfter(orderDate, cutoffDate) && isBefore(orderDate, periodStart);
  });

  const prevRevenue = previousPeriodOrders.reduce(
    (sum, order) => sum + Number(order.total),
    0,
  );
  const revGrowth =
    prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
  const ordersGrowth =
    previousPeriodOrders.length > 0
      ? ((totalOrders - previousPeriodOrders.length) /
          previousPeriodOrders.length) *
        100
      : 0;

  // Revenue by day
  const revenueByDay: Record<string, { revenue: number; orders: number }> = {};
  const days =
    dateRange === "custom"
      ? 30
      : dateRange === "all"
        ? 30
        : parseInt(dateRange);

  for (let i = 0; i < days; i++) {
    const date = format(subDays(new Date(), days - i - 1), "yyyy-MM-dd");
    revenueByDay[date] = { revenue: 0, orders: 0 };
  }

  filteredOrders.forEach((order) => {
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
  const productSales: Record<
    string,
    { name: string; sales: number; revenue: number }
  > = {};

  filteredOrders.forEach((order) => {
    const items = order.items || [];
    items.forEach((item: any) => {
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
  const statusCount: Record<string, number> = {};
  filteredOrders.forEach((order) => {
    statusCount[order.status] = (statusCount[order.status] || 0) + 1;
  });

  const ordersByStatus = Object.entries(statusCount).map(([status, count]) => ({
    status,
    count,
  }));

  // Category revenue
  const categoryRevenue: Record<string, number> = {};

  filteredOrders.forEach((order) => {
    const items = order.items || [];
    items.forEach((item: any) => {
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

  return (
    <div className="container mx-auto px-4 sm:px-5 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold font-playfair mb-2">
          Analytics
        </h1>
        <p className="text-gray-600">
          Track your business and website performance
        </p>
      </div>

      {/* Date Range Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex-1 w-full sm:w-auto">
              <label className="text-sm font-medium mb-2 block">
                Date Range
              </label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="custom">Custom range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateRange === "custom" && (
              <>
                <div className="flex-1 w-full sm:w-auto">
                  <label className="text-sm font-medium mb-2 block">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="flex-1 w-full sm:w-auto">
                  <label className="text-sm font-medium mb-2 block">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                    }}
                    className="w-full"
                  >
                    Clear
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different analytics views */}
      <Tabs defaultValue="visitors" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="visitors" className="flex items-center gap-2">
            <Eye className="size-4" />
            <span className="hidden sm:inline">Visitor Analytics</span>
            <span className="sm:hidden">Visitors</span>
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <BarChart3 className="size-4" />
            <span className="hidden sm:inline">Sales Analytics</span>
            <span className="sm:hidden">Sales</span>
          </TabsTrigger>
        </TabsList>

        {/* Visitor Analytics Tab */}
        <TabsContent value="visitors">
          <VisitorAnalytics
            pageViews={filteredPageViews}
            dateRange={
              dateRange === "all"
                ? "All time"
                : dateRange === "custom"
                  ? "Custom"
                  : dateRange
            }
          />
        </TabsContent>

        {/* Sales Analytics Tab */}
        <TabsContent value="sales" className="space-y-6">
          {/* Stats Overview */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold font-playfair">
                      ${totalRevenue.toFixed(2)}
                    </p>
                    {dateRange !== "all" && (
                      <p
                        className={`text-xs mt-1 ${revGrowth >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {revGrowth >= 0 ? "+" : ""}
                        {revGrowth.toFixed(1)}% vs previous
                      </p>
                    )}
                  </div>
                  <div className="p-3 bg-green-100 rounded-xl">
                    <DollarSign className="size-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Orders</p>
                    <p className="text-2xl font-bold font-playfair">
                      {totalOrders}
                    </p>
                    {dateRange !== "all" && (
                      <p
                        className={`text-xs mt-1 ${ordersGrowth >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {ordersGrowth >= 0 ? "+" : ""}
                        {ordersGrowth.toFixed(1)}% vs previous
                      </p>
                    )}
                  </div>
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <ShoppingBag className="size-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Customers</p>
                    <p className="text-2xl font-bold font-playfair">
                      {totalCustomers}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Total registered
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Users className="size-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Products</p>
                    <p className="text-2xl font-bold font-playfair">
                      {totalProducts}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">In catalog</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Package className="size-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid gap-6">
            {/* Revenue Over Time */}
            <Card>
              <CardHeader>
                <CardTitle className="font-playfair flex items-center gap-2">
                  <TrendingUp className="size-5" />
                  Revenue Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueByDayArray}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) =>
                        format(new Date(value), "MMM d")
                      }
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: any, name: any) => [
                        name === "revenue"
                          ? `$${Number(value).toFixed(2)}`
                          : value,
                        name === "revenue" ? "Revenue" : "Orders",
                      ]}
                      labelFormatter={(label) =>
                        format(new Date(label), "MMM d, yyyy")
                      }
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#A62828"
                      strokeWidth={2}
                      name="Revenue"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Top Products */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-playfair flex items-center gap-2">
                    <Package className="size-5" />
                    Top Products by Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {topProducts.length === 0 ? (
                    <p className="text-center text-gray-500 py-12">
                      No data available
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={topProducts} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tick={{ fontSize: 12 }} />
                        <YAxis
                          dataKey="name"
                          type="category"
                          tick={{ fontSize: 10 }}
                          width={100}
                        />
                        <Tooltip
                          formatter={(value: any) => [
                            `$${Number(value).toFixed(2)}`,
                            "Revenue",
                          ]}
                        />
                        <Bar dataKey="revenue" fill="#A62828" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Orders by Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-playfair flex items-center gap-2">
                    <ShoppingBag className="size-5" />
                    Orders by Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {ordersByStatus.length === 0 ? (
                    <p className="text-center text-gray-500 py-12">
                      No data available
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={ordersByStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ status, count }: any) =>
                            `${status}: ${count}`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {ordersByStatus.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                STATUS_COLORS[entry.status] ||
                                COLORS[index % COLORS.length]
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Category Revenue */}
              {categoryRevenueArray.length > 0 && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="font-playfair flex items-center gap-2">
                      <DollarSign className="size-5" />
                      Revenue by Category
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={categoryRevenueArray}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="category"
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={(value: any) => [
                            `$${Number(value).toFixed(2)}`,
                            "Revenue",
                          ]}
                        />
                        <Bar dataKey="revenue" fill="#06D6A0" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
