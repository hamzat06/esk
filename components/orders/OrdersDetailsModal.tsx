/* eslint-disable @typescript-eslint/no-explicit-any */
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
} from "lucide-react";

type Order = {
  id: string;
  date: string;
  status: string;
  total: number;
  items: Array<{
    id: string;
    title: string;
    image: string;
    quantity: number;
    price: number;
  }>;
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
    color: "success",
  },
  preparing: {
    label: "Preparing",
    icon: Clock,
    color: "warning",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "destructive",
  },
  pending: {
    label: "Pending",
    icon: Package,
    color: "info",
  },
};

export default function OrderDetailsModal({
  order,
  open,
  onClose,
}: OrderDetailsModalProps) {
  if (!order) return null;

  const status = statusConfig[order.status as keyof typeof statusConfig];
  const StatusIcon = status.icon;
  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const deliveryFee = 2.99;
  const tax = subtotal * 0.08;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-white sticky top-0 z-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-2xl sm:text-3xl font-bold font-playfair mb-2">
                Order {order.id}
              </DialogTitle>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>
                  {new Date(order.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span>•</span>
                <span>{order.items.length} items</span>
              </div>
            </div>
            <Badge
              variant={status.color as any}
              className="gap-1.5 px-3 py-1.5"
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
            <h3 className="text-lg font-semibold mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm sm:text-base line-clamp-1">
                      {item.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg font-playfair">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      ${item.price.toFixed(2)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Delivery Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Delivery Information</h3>
            <div className="space-y-3 bg-gray-50 rounded-xl p-4">
              <div className="flex gap-3">
                <MapPin className="size-5 text-gray-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Delivery Address</p>
                  <p className="text-sm text-gray-600 mt-1">
                    255 South 60th Street
                    <br />
                    Philadelphia, PA 19139
                  </p>
                </div>
              </div>
              <Separator className="bg-gray-200" />
              <div className="flex gap-3">
                <Phone className="size-5 text-gray-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Phone</p>
                  <p className="text-sm text-gray-600 mt-1">
                    +1 (555) 123-4567
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Order Summary */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            <div className="space-y-3 bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-medium">${deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <Separator className="bg-gray-200" />
              <div className="flex justify-between items-center">
                <span className="font-semibold text-base">Total</span>
                <span className="text-2xl font-bold font-playfair">
                  ${order.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={onClose}
            >
              Close
            </Button>
            {order.status === "delivered" && (
              <Button size="lg" className="flex-1">
                Reorder
              </Button>
            )}
            {order.status === "preparing" && (
              <Button size="lg" variant="destructive" className="flex-1">
                Cancel Order
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
