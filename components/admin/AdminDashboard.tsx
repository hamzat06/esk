// components/admin/AdminDashboard.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingBag,
  Users,
  DollarSign,
  Package,
  TrendingUp,
  Clock,
} from "lucide-react";

interface AdminDashboardProps {
  stats: {
    totalOrders: number;
    totalRevenue: number;
    totalCustomers: number;
    todayOrders: number;
    activeOrders: number;
    pendingOrders: number;
  };
}

export default function AdminDashboard({ stats }: AdminDashboardProps) {
  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-5 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold font-playfair mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Welcome back! Here&apos;s what&apos;s happening today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {/* Total Orders */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-gray-600">
                  Total Orders
                </CardTitle>
                <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <ShoppingBag className="size-5 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold font-playfair">
                {stats.totalOrders}
              </p>
              <p className="text-sm text-gray-500 mt-1">All time orders</p>
            </CardContent>
          </Card>

          {/* Total Revenue */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-gray-600">
                  Total Revenue
                </CardTitle>
                <div className="size-10 rounded-full bg-green-100 flex items-center justify-center">
                  <DollarSign className="size-5 text-green-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold font-playfair">
                ${stats.totalRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">Last 100 orders</p>
            </CardContent>
          </Card>

          {/* Total Customers */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-gray-600">
                  Total Customers
                </CardTitle>
                <div className="size-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Users className="size-5 text-purple-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold font-playfair">
                {stats.totalCustomers}
              </p>
              <p className="text-sm text-gray-500 mt-1">Registered users</p>
            </CardContent>
          </Card>

          {/* Today's Orders */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-gray-600">
                  Today&apos;s Orders
                </CardTitle>
                <div className="size-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Clock className="size-5 text-orange-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold font-playfair">
                {stats.todayOrders}
              </p>
              <p className="text-sm text-gray-500 mt-1">Orders placed today</p>
            </CardContent>
          </Card>

          {/* Active Orders */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-gray-600">
                  Active Orders
                </CardTitle>
                <div className="size-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Package className="size-5 text-amber-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold font-playfair">
                {stats.activeOrders}
              </p>
              <p className="text-sm text-amber-600 mt-1">In progress</p>
            </CardContent>
          </Card>

          {/* Pending Orders */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-gray-600">
                  Pending Orders
                </CardTitle>
                <div className="size-10 rounded-full bg-red-100 flex items-center justify-center">
                  <Clock className="size-5 text-red-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold font-playfair">
                {stats.pendingOrders}
              </p>
              <p className="text-sm text-red-600 mt-1">Needs attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold font-playfair">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <a
                href="/admin/orders"
                className="p-4 rounded-xl border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all text-center group"
              >
                <ShoppingBag className="size-8 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
                <p className="font-semibold">Manage Orders</p>
              </a>
              <a
                href="/admin/products"
                className="p-4 rounded-xl border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all text-center group"
              >
                <Package className="size-8 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
                <p className="font-semibold">Manage Products</p>
              </a>
              <a
                href="/admin/customers"
                className="p-4 rounded-xl border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all text-center group"
              >
                <Users className="size-8 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
                <p className="font-semibold">View Customers</p>
              </a>
              <a
                href="/admin/analytics"
                className="p-4 rounded-xl border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all text-center group"
              >
                <TrendingUp className="size-8 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
                <p className="font-semibold">Analytics</p>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
