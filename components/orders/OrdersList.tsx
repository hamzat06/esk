/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";
import OrderDetailsModal from "./OrdersDetailsModal";
import Link from "next/link";

// Mock data - replace with actual API call
const mockOrders = [
  {
    id: "ORD-001",
    date: "2024-01-20",
    status: "delivered",
    total: 45.99,
    items: [
      {
        id: "1",
        title: "Jollof Rice with Chicken",
        image: "/assets/jollof-rice-chicken.jpg",
        quantity: 2,
        price: 18.99,
      },
      {
        id: "2",
        title: "Egusi Soup",
        image: "/assets/jollof-rice-chicken.jpg",
        quantity: 1,
        price: 8.01,
      },
    ],
  },
  {
    id: "ORD-002",
    date: "2024-01-18",
    status: "preparing",
    total: 32.5,
    items: [
      {
        id: "3",
        title: "Suya Platter",
        image: "/assets/jollof-rice-chicken.jpg",
        quantity: 1,
        price: 32.5,
      },
    ],
  },
  {
    id: "ORD-003",
    date: "2024-01-15",
    status: "cancelled",
    total: 25.0,
    items: [
      {
        id: "4",
        title: "Pounded Yam & Soup",
        image: "/assets/jollof-rice-chicken.jpg",
        quantity: 1,
        price: 25.0,
      },
    ],
  },
];

type Order = (typeof mockOrders)[0];

const statusConfig = {
  delivered: {
    label: "Delivered",
    icon: CheckCircle2,
    color: "success",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
  },
  preparing: {
    label: "Preparing",
    icon: Clock,
    color: "warning",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "destructive",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
  },
  pending: {
    label: "Pending",
    icon: Package,
    color: "info",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
  },
};

export default function OrdersList() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Replace with actual API call
  const orders = mockOrders;

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
      <div className="space-y-4">
        {orders.map((order) => {
          const status =
            statusConfig[order.status as keyof typeof statusConfig];
          const StatusIcon = status.icon;

          return (
            <Card
              key={order.id}
              className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              onClick={() => handleViewOrder(order)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg sm:text-xl">
                        Order {order.id}
                      </CardTitle>
                      <Badge variant={status.color as any} className="gap-1">
                        <StatusIcon className="size-3" />
                        {status.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(order.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <ChevronRight className="size-5 text-gray-400 shrink-0" />
                </div>
              </CardHeader>

              <CardContent>
                {/* Order Items Preview */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {order.items.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200"
                    >
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="w-16 h-16 rounded-lg bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-600">
                        +{order.items.length - 3}
                      </span>
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-500">
                      {order.items.length}{" "}
                      {order.items.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-xl font-bold font-playfair">
                      ${order.total.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        open={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
