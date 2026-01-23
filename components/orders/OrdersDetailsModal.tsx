"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  MapPin,
  Phone,
  Calendar,
} from "lucide-react";

type OrderItem = {
  id: string;
  productId: string;
  title: string;
  image?: string | null;
  quantity: number;
  basePrice: number;
  options: Record<string, { label: string; price: number }>;
  unitPrice: number;
  totalPrice: number;
};

type Order = {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
  notes?: string | null;
};

interface OrderDetailsModalProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
}

const statusConfig = {
  delivered: {
    label: "Delivered",
    icon: CheckCircle2,
    variant: "success" as const,
  },
  preparing: { label: "Preparing", icon: Clock, variant: "warning" as const },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    variant: "destructive" as const,
  },
  pending: { label: "Pending", icon: Package, variant: "info" as const },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    variant: "info" as const,
  },
  ready: { label: "Ready", icon: Package, variant: "success" as const },
};

export default function OrderDetailsModal({
  order,
  open,
  onClose,
}: OrderDetailsModalProps) {
  if (!order) return null;

  const status = statusConfig[order.status as keyof typeof statusConfig];
  const StatusIcon = status.icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-white sticky top-0 z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl sm:text-3xl font-bold font-playfair mb-2">
                {order.orderNumber}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-4" />
                  <span>
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <span>•</span>
                <span>{order.items.length} items</span>
              </div>
            </div>
            <Badge
              variant={status.variant}
              className="gap-1.5 px-3 py-1.5 shrink-0"
            >
              <StatusIcon className="size-4" />
              {status.label}
            </Badge>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Order Items */}
          <div>
            <h3 className="text-lg font-bold mb-3">Items</h3>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-white border border-gray-200">
                    <Image
                      src={item.image || "/assets/jollof-rice-chicken.jpg"}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm line-clamp-1 mb-1">
                      {item.title}
                    </h4>
                    {Object.keys(item.options).length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-1">
                        {Object.values(item.options).map((option, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-white px-2 py-0.5 rounded-full border border-gray-200"
                          >
                            {option.label}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-base font-playfair">
                      ${item.totalPrice.toFixed(2)}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-gray-500">
                        ${item.unitPrice.toFixed(2)} each
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Delivery Information */}
          <div>
            <h3 className="text-lg font-bold mb-3">Delivery</h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex gap-3">
                <MapPin className="size-5 text-gray-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-1">Address</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {order.deliveryAddress.street}
                    <br />
                    {order.deliveryAddress.city}, {order.deliveryAddress.state}{" "}
                    {order.deliveryAddress.zipCode}
                  </p>
                </div>
              </div>
              <Separator className="bg-gray-200" />
              <div className="flex gap-3">
                <Phone className="size-5 text-gray-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-1">Phone</p>
                  <p className="text-sm text-gray-700">
                    {order.deliveryAddress.phone}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {order.notes && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-bold mb-2">Notes</h3>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-4">
                  {order.notes}
                </p>
              </div>
            </>
          )}

          <Separator />

          {/* Order Summary */}
          <div>
            <h3 className="text-lg font-bold mb-3">Summary</h3>
            <div className="space-y-2.5 bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">
                  ${order.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-semibold">
                  ${order.deliveryFee.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="font-semibold">${order.tax.toFixed(2)}</span>
              </div>
              <Separator className="bg-gray-200" />
              <div className="flex justify-between items-center pt-1">
                <span className="font-bold text-base">Total</span>
                <span className="text-2xl font-bold font-playfair text-primary">
                  ${order.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {order.status === "delivered" && (
              <Button size="lg" className="sm:flex-1">
                Reorder
              </Button>
            )}
            {(order.status === "pending" || order.status === "confirmed") && (
              <Button size="lg" variant="destructive" className="sm:flex-1">
                Cancel Order
              </Button>
            )}
            <Button
              variant="outline"
              size="lg"
              className="sm:flex-1"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
