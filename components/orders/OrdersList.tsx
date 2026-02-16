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
  ChevronRight,
  MapPin,
  Calendar,
  ChefHat,
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
import type { Order } from "@/lib/queries/orders";

type OrdersListProps = {
  orders: Order[];
};

const statusConfig = {
  delivered: {
    label: "Delivered",
    icon: CheckCircle2,
    variant: "success" as const,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  preparing: {
    label: "Preparing",
    icon: ChefHat,
    variant: "warning" as const,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    variant: "destructive" as const,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    variant: "info" as const,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    variant: "info" as const,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  ready: {
    label: "Ready for Pickup",
    icon: Package,
    variant: "success" as const,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
};

export default function OrdersList({ orders }: OrdersListProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some((item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()),
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
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-linear-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-6">
          <ShoppingBag className="size-10 sm:size-12 text-primary" />
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold font-playfair text-gray-900 mb-3">
          No orders yet
        </h3>
        <p className="text-sm sm:text-base text-gray-600 max-w-sm mb-8">
          Start exploring our menu and place your first order to see it here
        </p>
        <Button size="lg" className="px-8 rounded-xl" asChild>
          <Link href="/">
            <ShoppingBag className="size-4 mr-2" />
            Start Ordering
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            <Input
              placeholder="Search by order number or item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-11 rounded-xl border-gray-300 focus:border-primary"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-50 h-11 rounded-xl border-gray-300">
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
        {(searchQuery || statusFilter !== "all") && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">
                {filteredOrders.length}
              </span>{" "}
              {filteredOrders.length === 1 ? "order" : "orders"} found
            </p>
          </div>
        )}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Search className="size-8 text-gray-400" />
          </div>
          <p className="text-lg font-medium text-gray-900 mb-2">
            No orders found
          </p>
          <p className="text-sm text-gray-500">
            Try adjusting your search or filter
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const status = statusConfig[order.status];
            const StatusIcon = status.icon;
            const isActive = [
              "pending",
              "confirmed",
              "preparing",
              "ready",
            ].includes(order.status);

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer group"
                onClick={() => handleViewOrder(order)}
              >
                <div className="p-5 sm:p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-xl font-playfair text-gray-900">
                          {order.orderNumber}
                        </h3>
                        {isActive && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary animate-pulse">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-4" />
                          <span>
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Package className="size-4" />
                          <span>
                            {order.items.length}{" "}
                            {order.items.length === 1 ? "item" : "items"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border ${status.bgColor} ${status.borderColor} shrink-0`}
                    >
                      <StatusIcon className={`size-4 ${status.color}`} />
                      <span className={`font-semibold text-sm ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="flex items-start gap-2.5 mb-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <MapPin className="size-4 text-gray-600 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {order.deliveryAddress.street},{" "}
                        {order.deliveryAddress.city},{" "}
                        {order.deliveryAddress.state}{" "}
                        {order.deliveryAddress.zipCode}
                      </p>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="mb-4">
                    <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2">
                      {order.items.slice(0, 4).map((item) => (
                        <div key={item.id} className="shrink-0 group/item">
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-200 group-hover/item:border-primary transition-colors">
                            <Image
                              src={
                                item.image || "/assets/jollof-rice-chicken.jpg"
                              }
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                            {item.quantity > 1 && (
                              <div className="absolute top-1 right-1 bg-black/75 text-white text-xs font-bold px-1.5 py-0.5 rounded-md">
                                ×{item.quantity}
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1.5 text-center line-clamp-1 max-w-20">
                            {item.title}
                          </p>
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <div className="shrink-0">
                          <div className="w-20 h-20 rounded-xl bg-linear-to-br from-gray-100 to-gray-50 border-2 border-gray-200 flex items-center justify-center">
                            <span className="text-sm font-bold text-gray-600">
                              +{order.items.length - 4}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1.5 text-center">
                            more
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Order Total</p>
                      <p className="text-2xl font-bold font-playfair text-gray-900">
                        ${order.total.toFixed(2)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="gap-2 rounded-xl group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewOrder(order);
                      }}
                    >
                      View Details
                      <ChevronRight className="size-4" />
                    </Button>
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
