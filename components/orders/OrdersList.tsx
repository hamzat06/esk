"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  ShoppingBag,
  Search,
  Filter,
  ChevronDown,
} from "lucide-react";
import OrderDetailsModal from "./OrdersDetailsModal";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data - replace with actual API call
const mockOrders = [
  {
    id: "1",
    orderNumber: "ORD-001",
    userId: "user-1",
    items: [
      {
        id: "1",
        productId: "p1",
        title: "Jollof Rice with Chicken",
        image: "/assets/jollof-rice-chicken.jpg",
        quantity: 2,
        basePrice: 15.99,
        options: {},
        unitPrice: 15.99,
        totalPrice: 31.98,
      },
      {
        id: "2",
        productId: "p2",
        title: "Egusi Soup",
        image: "/assets/jollof-rice-chicken.jpg",
        quantity: 1,
        basePrice: 12.99,
        options: {},
        unitPrice: 12.99,
        totalPrice: 12.99,
      },
    ],
    subtotal: 44.97,
    deliveryFee: 2.99,
    tax: 3.60,
    total: 51.56,
    deliveryAddress: {
      street: "255 South 60th Street",
      city: "Philadelphia",
      state: "PA",
      zipCode: "19139",
      phone: "+1 (555) 123-4567",
    },
    status: "delivered" as const,
    createdAt: "2024-01-20T10:30:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
    notes: null,
  },
  {
    id: "2",
    orderNumber: "ORD-002",
    userId: "user-1",
    items: [
      {
        id: "3",
        productId: "p3",
        title: "Suya Platter",
        image: "/assets/jollof-rice-chicken.jpg",
        quantity: 1,
        basePrice: 29.99,
        options: {},
        unitPrice: 29.99,
        totalPrice: 29.99,
      },
    ],
    subtotal: 29.99,
    deliveryFee: 2.99,
    tax: 2.40,
    total: 35.38,
    deliveryAddress: {
      street: "255 South 60th Street",
      city: "Philadelphia",
      state: "PA",
      zipCode: "19139",
      phone: "+1 (555) 123-4567",
    },
    status: "preparing" as const,
    createdAt: "2024-01-18T15:20:00Z",
    updatedAt: "2024-01-18T15:20:00Z",
    notes: null,
  },
  {
    id: "3",
    orderNumber: "ORD-003",
    userId: "user-1",
    items: [
      {
        id: "4",
        productId: "p4",
        title: "Pounded Yam & Soup",
        image: "/assets/jollof-rice-chicken.jpg",
        quantity: 1,
        basePrice: 22.99,
        options: {},
        unitPrice: 22.99,
        totalPrice: 22.99,
      },
    ],
    subtotal: 22.99,
    deliveryFee: 2.99,
    tax: 1.84,
    total: 27.82,
    deliveryAddress: {
      street: "255 South 60th Street",
      city: "Philadelphia",
      state: "PA",
      zipCode: "19139",
      phone: "+1 (555) 123-4567",
    },
    status: "cancelled" as const,
    createdAt: "2024-01-15T12:00:00Z",
    updatedAt: "2024-01-15T12:30:00Z",
    notes: null,
  },
];

type Order = typeof mockOrders[0];

const statusConfig = {
  delivered: {
    label: "Delivered",
    icon: CheckCircle2,
    variant: "success" as const,
  },
  preparing: {
    label: "Preparing",
    icon: Clock,
    variant: "warning" as const,
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    variant: "destructive" as const,
  },
  pending: {
    label: "Pending",
    icon: Package,
    variant: "info" as const,
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    variant: "info" as const,
  },
  ready: {
    label: "Ready",
    icon: Package,
    variant: "success" as const,
  },
};

export default function OrdersList() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Replace with actual API call
  const orders = mockOrders;

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some((item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  function handleViewOrder(order: Order) {
    setSelectedOrder(order);
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setTimeout(() => setSelectedOrder(null), 300);
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 sm:py-32 text-center">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <ShoppingBag className="size-10 sm:size-12 text-gray-400" />
        </div>
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
          No orders yet
        </h3>
        <p className="text-sm sm:text-base text-gray-500 max-w-sm mb-6">
          When you place an order, it will appear here
        </p>
        <Button size="lg" asChild>
          <Link href="/">Start ordering</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            <Input
              placeholder="Search orders or items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="size-4 mr-2" />
              <SelectValue placeholder="All Orders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="preparing">Preparing</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        {searchQuery || statusFilter !== "all" ? (
          <p className="text-sm text-gray-500 mt-3">
            {filteredOrders.length} {filteredOrders.length === 1 ? "order" : "orders"} found
          </p>
        ) : null}
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="size-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No orders match your search</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredOrders.map((order) => {
            const status = statusConfig[order.status];
            const StatusIcon = status.icon;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group"
                onClick={() => handleViewOrder(order)}
              >
                {/* Header */}
                <div className="p-4 pb-3 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg font-playfair">
                      {order.orderNumber}
                    </h3>
                    <Badge variant={status.variant} className="gap-1">
                      <StatusIcon className="size-3" />
                      {status.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {/* Items Preview */}
                <div className="p-4">
                  <div className="flex gap-2 mb-3">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <div
                        key={item.id}
                        className="relative w-14 h-14 rounded-lg overflow-hidden border-2 border-gray-100 group-hover:border-primary transition-colors"
                        style={{ zIndex: 3 - idx }}
                      >
                        <Image
                          src={item.image || "/assets/jollof-rice-chicken.jpg"}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-14 h-14 rounded-lg bg-gray-100 border-2 border-gray-100 flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-600">
                          +{order.items.length - 3}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {order.items.length} {order.items.length === 1 ? "item" : "items"}
                      </span>
                      <ChevronDown className="size-4 text-gray-400 group-hover:text-primary transition-colors rotate-[-90deg]" />
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-medium text-gray-700">Total</span>
                      <span className="text-xl font-bold font-playfair">
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        open={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}