/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { CldImage } from "next-cloudinary";
import { isVideoAsset, getPublicId, getVideoThumbnailUrl } from "@/lib/cloudinary";
import {
  Clock, CheckCircle2, XCircle, Package, MapPin, Phone,
  Receipt, ChefHat, Truck, ShoppingBag, Copy, CheckCheck, Navigation,
} from "lucide-react";
import type { Order } from "@/lib/queries/orders";
import { useState } from "react";
import toast from "react-hot-toast";
import { useCartStore } from "@/components/cart/stores/cartStore";
import { format } from "date-fns";

interface OrderDetailsModalProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
}

const statusConfig: any = {
  pending_payment: { label: "Processing Payment", icon: Clock,        color: "text-gray-500",   bg: "bg-gray-50 border-gray-200",    desc: "Your payment is being processed" },
  pending:         { label: "Pending",            icon: Clock,        color: "text-blue-600",   bg: "bg-blue-50 border-blue-200",    desc: "Waiting for confirmation" },
  confirmed:       { label: "Confirmed",          icon: CheckCircle2, color: "text-blue-600",   bg: "bg-blue-50 border-blue-200",    desc: "Your order has been confirmed" },
  preparing:       { label: "Preparing",          icon: ChefHat,      color: "text-orange-600", bg: "bg-orange-50 border-orange-200",desc: "Our kitchen is preparing your order" },
  ready:           { label: "Ready for Pickup",   icon: Package,      color: "text-green-600",  bg: "bg-green-50 border-green-200",  desc: "Your order is ready" },
  out_for_delivery:{ label: "Out for Delivery",   icon: Navigation,   color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200",desc: "Your order is on its way!" },
  delivered:       { label: "Delivered",          icon: CheckCircle2, color: "text-green-600",  bg: "bg-green-50 border-green-200",  desc: "Your order has been delivered" },
  cancelled:       { label: "Cancelled",          icon: XCircle,      color: "text-red-500",    bg: "bg-red-50 border-red-200",      desc: "This order has been cancelled" },
};

export default function OrderDetailsModal({ order, open, onClose }: OrderDetailsModalProps) {
  const [copied, setCopied] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  if (!order) return null;

  const st = statusConfig[order.status] ?? statusConfig.pending_payment;
  const StatusIcon = st.icon;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      toast.success("Copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch { toast.error("Failed to copy"); }
  };

  const handleReorder = () => {
    order.items.forEach((item) => addItem({ ...item }));
    toast.success("Items added to cart!");
    onClose();
  };

  const handleCancel = async () => {
    if (!confirm("Cancel this order? This cannot be undone.")) return;
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/user/orders/${order.id}/cancel`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success("Order cancelled");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/*
        Inline style forces flex-col + overflow-hidden on the dialog box,
        overriding the base grid + overflow-y-auto which breaks sticky on iOS Safari.
        The body div then owns the scroll with flex-1 min-h-0 overflow-y-auto.
      */}
      <DialogContent
        className="sm:max-w-2xl p-0 gap-0"
        style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}
      >

        {/* ── Fixed header ── */}
        <div className={`shrink-0 ${st.bg} border-b px-4 sm:px-6 pt-5 pb-4`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-base sm:text-lg font-bold text-gray-900">
                  #{order.orderNumber}
                </p>
                <button
                  onClick={handleCopy}
                  className="p-1 rounded hover:bg-black/10 transition-colors"
                  aria-label="Copy order number"
                >
                  {copied
                    ? <CheckCheck className="size-3.5 text-green-600" />
                    : <Copy className="size-3.5 text-gray-500" />}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                {format(new Date(order.createdAt), "MMM d, yyyy · h:mm a")}
                {" · "}
                {order.items.length} {order.items.length === 1 ? "item" : "items"}
              </p>
            </div>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold shrink-0 ${st.bg}`}>
              <StatusIcon className={`size-3 ${st.color}`} />
              <span className={st.color}>{st.label}</span>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-3">{st.desc}</p>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-5">

          {/* Items */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Receipt className="size-4 text-gray-600" />
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Order Items</h3>
            </div>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-white">
                    {item.image ? (
                      isVideoAsset(item.image) ? (
                        <Image src={getVideoThumbnailUrl(getPublicId(item.image))} alt={item.title} fill className="object-cover" />
                      ) : (
                        <CldImage src={item.image} alt={item.title} fill className="object-cover" crop={{ type: "auto", source: true }} />
                      )
                    ) : (
                      <Image src="/assets/jollof-rice-chicken.jpg" alt={item.title} fill className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 leading-snug line-clamp-1">{item.title}</p>
                    {Object.keys(item.options).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.values(item.options).map((opt, i) => (
                          <span key={i} className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-gray-300 text-gray-600">
                            {opt.label}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm text-gray-900">${item.totalPrice.toFixed(2)}</p>
                    {item.quantity > 1 && (
                      <p className="text-[10px] text-gray-400">${item.unitPrice.toFixed(2)} ea</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Delivery info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              {order.deliveryAddress?.type === "pickup"
                ? <ShoppingBag className="size-4 text-gray-600" />
                : <Truck className="size-4 text-gray-600" />}
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                {order.deliveryAddress?.type === "pickup" ? "Pickup" : "Delivery"}
              </h3>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 divide-y divide-gray-200">
              <div className="flex items-start gap-3 p-3.5">
                <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-0.5">Address</p>
                  {order.deliveryAddress?.type === "pickup"
                    ? <p className="text-sm text-gray-700">Customer will collect in store</p>
                    : <p className="text-sm text-gray-700 leading-relaxed">{order.deliveryAddress?.address}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3 p-3.5">
                <Phone className="size-4 text-primary shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-0.5">Contact</p>
                  <p className="text-sm text-gray-700">{order.deliveryAddress?.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {order.notes && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Special Instructions</h3>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
                  <p className="text-sm text-gray-800 leading-relaxed">{order.notes}</p>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Payment summary */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Payment Summary</h3>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">${(order.subtotal ?? 0).toFixed(2)}</span>
              </div>
              {(order.deliveryFee ?? 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium text-gray-900">${(order.deliveryFee ?? 0).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium text-gray-900">${(order.tax ?? 0).toFixed(2)}</span>
              </div>
              <Separator className="bg-gray-200" />
              <div className="flex justify-between items-center pt-1">
                <span className="font-bold text-gray-900">Total Paid</span>
                <span className="text-xl font-bold text-primary">${(order.total ?? 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>

        {/* ── Fixed footer ── */}
        <div className="shrink-0 px-4 sm:px-6 py-4 bg-white border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-2">
            {order.status === "delivered" && (
              <Button size="sm" className="sm:flex-1 rounded-xl h-10" onClick={handleReorder}>
                <Package className="size-4 mr-2" />Order Again
              </Button>
            )}
            {(order.status === "pending" || order.status === "confirmed") && (
              <Button size="sm" variant="destructive" className="sm:flex-1 rounded-xl h-10" onClick={handleCancel} disabled={isCancelling}>
                <XCircle className="size-4 mr-2" />
                {isCancelling ? "Cancelling…" : "Cancel Order"}
              </Button>
            )}
            <Button variant="outline" size="sm" className="sm:flex-1 rounded-xl h-10" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
