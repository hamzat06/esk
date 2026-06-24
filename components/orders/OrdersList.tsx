"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { CldImage } from "next-cloudinary";
import { isVideoAsset, getPublicId, getVideoThumbnailUrl } from "@/lib/cloudinary";
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
  ChefHat,
  Navigation,
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
import { format } from "date-fns";

type OrdersListProps = { orders: Order[] };

const statusConfig = {
  pending_payment: { label: "Processing", icon: Clock, color: "text-gray-500", bg: "bg-gray-100 border-gray-200" },
  pending:         { label: "Pending",    icon: Clock, color: "text-blue-600",  bg: "bg-blue-50 border-blue-200" },
  confirmed:       { label: "Confirmed",  icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  preparing:       { label: "Preparing",  icon: ChefHat, color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
  ready:           { label: "Ready",      icon: Package, color: "text-green-600", bg: "bg-green-50 border-green-200" },
  out_for_delivery:{ label: "On the way", icon: Navigation, color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200" },
  delivered:       { label: "Delivered",  icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50 border-green-200" },
  cancelled:       { label: "Cancelled",  icon: XCircle, color: "text-red-500", bg: "bg-red-50 border-red-200" },
};

const ACTIVE = ["pending", "confirmed", "preparing", "ready", "out_for_delivery"];

export default function OrdersList({ orders }: OrdersListProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredOrders = useMemo(() =>
    orders.filter((o) => {
      const matchSearch =
        o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.items.some((i) => i.title?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchStatus = statusFilter === "all" || o.status === statusFilter;
      return matchSearch && matchStatus;
    }),
    [orders, searchQuery, statusFilter],
  );

  function openOrder(order: Order) { setSelectedOrder(order); setIsModalOpen(true); }
  function closeModal() { setIsModalOpen(false); setTimeout(() => setSelectedOrder(null), 300); }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5">
          <ShoppingBag className="size-10 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
        <p className="text-sm text-gray-500 max-w-xs mb-7">
          Start exploring our menu and place your first order
        </p>
        <Button size="lg" className="rounded-xl px-8" asChild>
          <Link href="/"><ShoppingBag className="size-4 mr-2" />Start Ordering</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <Input
            placeholder="Search orders or items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 rounded-xl border-gray-300"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44 h-10 rounded-xl border-gray-300">
            <Filter className="size-3.5 mr-2 text-gray-400" />
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="preparing">Preparing</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="out_for_delivery">On the way</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <Search className="size-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-700">No orders found</p>
          <p className="text-xs text-gray-400 mt-1">Try a different search or filter</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const st = statusConfig[order.status] ?? statusConfig.pending_payment;
            const StatusIcon = st.icon;
            const isActive = ACTIVE.includes(order.status);
            const itemSummary = order.items
              .map((i) => `${i.quantity}× ${i.title}`)
              .join(", ");

            return (
              <div
                key={order.id}
                onClick={() => openOrder(order)}
                className="bg-white rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer"
              >
                {/* Active pulse bar */}
                {isActive && (
                  <div className="h-1 rounded-t-2xl bg-primary animate-pulse" />
                )}

                <div className="p-4 sm:p-5">
                  {/* Row 1: order number + status + date */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">
                        Order
                      </p>
                      <p className="text-sm font-bold text-gray-900 leading-tight">
                        #{order.orderNumber}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {format(new Date(order.createdAt), "MMM d, yyyy · h:mm a")}
                      </p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold shrink-0 ${st.bg}`}>
                      <StatusIcon className={`size-3 ${st.color}`} />
                      <span className={st.color}>{st.label}</span>
                    </div>
                  </div>

                  {/* Row 2: item summary */}
                  <p className="text-xs text-gray-500 line-clamp-1 mb-3">{itemSummary}</p>

                  {/* Row 3: item thumbnails */}
                  <div className="flex items-center gap-2 mb-3 overflow-x-auto scrollbar-hide">
                    {order.items.slice(0, 5).map((item) => (
                      <div key={item.id} className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                        {item.image ? (
                          isVideoAsset(item.image) ? (
                            <Image src={getVideoThumbnailUrl(getPublicId(item.image))} alt={item.title} fill className="object-cover" />
                          ) : (
                            <CldImage src={item.image} alt={item.title} fill className="object-cover" crop={{ type: "auto", source: true }} />
                          )
                        ) : (
                          <Image src="/assets/jollof-rice-chicken.jpg" alt={item.title} fill className="object-cover" />
                        )}
                        {item.quantity > 1 && (
                          <div className="absolute bottom-0 right-0 bg-black/70 text-white text-[10px] font-bold px-1 rounded-tl-md">
                            ×{item.quantity}
                          </div>
                        )}
                      </div>
                    ))}
                    {order.items.length > 5 && (
                      <div className="w-12 h-12 shrink-0 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-500">+{order.items.length - 5}</span>
                      </div>
                    )}
                  </div>

                  {/* Row 4: address + total + action */}
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <MapPin className="size-3.5 text-gray-400 shrink-0" />
                      <p className="text-xs text-gray-500 truncate">
                        {order.deliveryAddress?.type === "pickup"
                          ? "Pickup in store"
                          : order.deliveryAddress?.address}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <p className="text-base font-bold text-gray-900">
                        ${(order.total ?? 0).toFixed(2)}
                      </p>
                      <button
                        onClick={(e) => { e.stopPropagation(); openOrder(order); }}
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-primary hover:text-white transition-colors"
                      >
                        <ChevronRight className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <OrderDetailsModal order={selectedOrder} open={isModalOpen} onClose={closeModal} />
    </>
  );
}
