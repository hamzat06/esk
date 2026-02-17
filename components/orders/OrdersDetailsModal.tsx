/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Receipt,
  ChefHat,
  Truck,
  AlertCircle,
  Copy,
  CheckCheck,
} from "lucide-react";
import type { Order } from "@/lib/queries/orders";
import { useState } from "react";
import toast from "react-hot-toast";

interface OrderDetailsModalProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
}

const statusConfig: any = {
  delivered: {
    label: "Delivered",
    icon: CheckCircle2,
    variant: "success" as const,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    description: "Your order has been successfully delivered",
  },
  preparing: {
    label: "Preparing",
    icon: ChefHat,
    variant: "warning" as const,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    description: "Our kitchen is preparing your order",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    variant: "destructive" as const,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    description: "This order has been cancelled",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    variant: "info" as const,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    description: "Waiting for confirmation",
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    variant: "info" as const,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    description: "Your order has been confirmed",
  },
  ready: {
    label: "Ready for Pickup",
    icon: Package,
    variant: "success" as const,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    description: "Your order is ready for pickup",
  },
};

export default function OrderDetailsModal({
  order,
  open,
  onClose,
}: OrderDetailsModalProps) {
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const status = statusConfig[order.status];
  const StatusIcon = status.icon;
  const isActive = ["pending", "confirmed", "preparing", "ready"].includes(
    order.status,
  );

  const handleCopyOrderNumber = async () => {
    try {
      await navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      toast.success("Order number copied!");
      setTimeout(() => setCopied(false), 2000);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const handleReorder = () => {
    toast.success("Items added to cart!");
    onClose();
  };

  const handleCancelOrder = () => {
    if (
      confirm(
        "Are you sure you want to cancel this order? This action cannot be undone.",
      )
    ) {
      toast.success("Order cancelled successfully");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden p-0 gap-0">
        {/* Header with Status Banner */}
        <div
          className={`${status.bgColor} border-b ${status.borderColor} px-6 pt-6 pb-5`}
        >
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <DialogTitle className="text-2xl sm:text-3xl font-bold font-playfair text-gray-900">
                    {order.orderNumber}
                  </DialogTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={handleCopyOrderNumber}
                  >
                    {copied ? (
                      <CheckCheck className="size-4 text-green-600" />
                    ) : (
                      <Copy className="size-4 text-gray-600" />
                    )}
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-4" />
                    <span>
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <span>•</span>
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
                className={`flex flex-col items-end gap-2 shrink-0 p-4 rounded-xl border-2 ${status.borderColor} bg-white shadow-sm`}
              >
                <div className="flex items-center gap-2">
                  <StatusIcon className={`size-5 ${status.color}`} />
                  <span className={`font-bold text-base ${status.color}`}>
                    {status.label}
                  </span>
                </div>
                {isActive && (
                  <span className="text-xs text-gray-600 font-medium">
                    Estimated: 30-45 min
                  </span>
                )}
              </div>
            </div>
          </DialogHeader>

          {/* Status Description */}
          <div className="mt-4 flex items-start gap-2 text-sm text-gray-700">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <p>{status.description}</p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-6 space-y-6">
            {/* Order Items */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Receipt className="size-5 text-gray-700" />
                <h3 className="text-lg font-bold text-gray-900">Order Items</h3>
              </div>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 transition-colors"
                  >
                    <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-white border-2 border-gray-200">
                      <Image
                        src={item.image || "/assets/jollof-rice-chicken.jpg"}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-base line-clamp-1 mb-2 text-gray-900">
                        {item.title}
                      </h4>
                      {Object.keys(item.options).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {Object.values(item.options).map((option, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-white px-2.5 py-1 rounded-full border border-gray-300 text-gray-700 font-medium"
                            >
                              {option.label}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-gray-600">
                        Quantity:{" "}
                        <span className="font-semibold">{item.quantity}</span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-lg font-playfair text-gray-900">
                        ${item.totalPrice.toFixed(2)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-gray-500 mt-1">
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
              <div className="flex items-center gap-2 mb-4">
                <Truck className="size-5 text-gray-700" />
                <h3 className="text-lg font-bold text-gray-900">
                  Delivery Information
                </h3>
              </div>
              <div className="bg-linear-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-200 space-y-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="size-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-900 mb-1.5">
                      Delivery Address
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {order.deliveryAddress.street}
                      <br />
                      {order.deliveryAddress.city},{" "}
                      {order.deliveryAddress.state}{" "}
                      {order.deliveryAddress.zipCode}
                    </p>
                  </div>
                </div>
                <Separator className="bg-gray-200" />
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="size-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-900 mb-1.5">
                      Contact Number
                    </p>
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
                  <h3 className="text-lg font-bold mb-3 text-gray-900">
                    Special Instructions
                  </h3>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-sm text-gray-800 leading-relaxed">
                      {order.notes}
                    </p>
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Order Summary */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-900">
                Payment Summary
              </h3>
              <div className="bg-linear-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-200 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    ${order.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Delivery Fee</span>
                  <span className="font-semibold text-gray-900">
                    ${order.deliveryFee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Tax</span>
                  <span className="font-semibold text-gray-900">
                    ${order.tax.toFixed(2)}
                  </span>
                </div>
                <Separator className="bg-gray-200" />
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-lg text-gray-900">
                    Total Paid
                  </span>
                  <span className="text-3xl font-bold font-playfair text-primary">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3">
            {order.status === "delivered" && (
              <Button
                size="lg"
                className="sm:flex-1 rounded-xl"
                onClick={handleReorder}
              >
                <Package className="size-4 mr-2" />
                Order Again
              </Button>
            )}
            {(order.status === "pending" || order.status === "confirmed") && (
              <Button
                size="lg"
                variant="destructive"
                className="sm:flex-1 rounded-xl"
                onClick={handleCancelOrder}
              >
                <XCircle className="size-4 mr-2" />
                Cancel Order
              </Button>
            )}
            <Button
              variant="outline"
              size="lg"
              className="sm:flex-1 rounded-xl"
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
