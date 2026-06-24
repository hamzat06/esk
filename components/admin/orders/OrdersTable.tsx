"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  CheckCircle,
  ChefHat,
  PackageCheck,
  Truck,
  XCircle,
  Navigation,
  Eye,
  ShoppingBag,
} from "lucide-react";
import { OrderStatus } from "@/lib/queries/admin/orders";

interface Order {
  id: string;
  order_number: string;
  subtotal: number;
  delivery_fee: number;
  tax: number;
  total: number;
  status: OrderStatus;
  created_at: string;
  items: { title: string; quantity: number; totalPrice: number }[];
  delivery_address: {
    type?: "delivery" | "pickup";
    address?: string;
    phone: string;
  };
  notes: string | null;
  guest_name: string | null;
  guest_email: string | null;
  profile: { full_name: string; email: string; phone: string | null } | null;
}

const statusColors: Record<OrderStatus, string> = {
  pending_payment: "bg-gray-100 text-gray-600",
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-purple-100 text-purple-800",
  ready: "bg-green-100 text-green-800",
  out_for_delivery: "bg-indigo-100 text-indigo-800",
  delivered: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const statusIcons: Record<OrderStatus, any> = {
  pending_payment: Clock,
  pending: Clock,
  confirmed: CheckCircle,
  preparing: ChefHat,
  ready: PackageCheck,
  out_for_delivery: Navigation,
  delivered: Truck,
  cancelled: XCircle,
};

export default function OrdersTable({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function handleStatusChange(orderId: string, newStatus: OrderStatus) {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success("Status updated");
      router.refresh();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-gray-500">
          No orders found
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="rounded-xl border bg-white overflow-hidden w-full max-w-full">
        <div className="overflow-x-auto w-full max-w-full">
          <Table className="min-w-160">
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-700">Order</TableHead>
                <TableHead className="font-semibold text-gray-700">Customer</TableHead>
                <TableHead className="font-semibold text-gray-700 hidden lg:table-cell">Items</TableHead>
                <TableHead className="font-semibold text-gray-700 hidden md:table-cell">Type</TableHead>
                <TableHead className="font-semibold text-gray-700">Total</TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="font-semibold text-gray-700">Update</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const StatusIcon = statusIcons[order.status];
                const isNew = Date.now() - new Date(order.created_at).getTime() < 10 * 60 * 1000;
                const customer = order.profile?.full_name || order.guest_name || "Guest";
                const email = order.profile?.email || order.guest_email || "—";

                return (
                  <TableRow
                    key={order.id}
                    className={isNew ? "bg-primary/5 border-l-4 border-l-primary" : ""}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-bold text-sm">
                            #{order.order_number}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(order.created_at), "MMM d, h:mm a")}
                          </p>
                        </div>
                        {isNew && (
                          <Badge className="bg-primary text-white text-xs px-1.5 py-0.5 animate-pulse">
                            NEW
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <p className="font-medium text-sm">{customer}</p>
                      <p className="text-xs text-gray-500 truncate max-w-36">{email}</p>
                    </TableCell>

                    <TableCell className="hidden lg:table-cell">
                      <p className="text-sm text-gray-700 max-w-48 truncate">
                        {order.items.map((i) => `${i.quantity}× ${i.title}`).join(", ")}
                      </p>
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      <Badge
                        className={
                          order.delivery_address?.type === "pickup"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-sky-100 text-sky-800"
                        }
                      >
                        {order.delivery_address?.type === "pickup" ? (
                          <><ShoppingBag className="size-3 mr-1" />Pickup</>
                        ) : (
                          <><Truck className="size-3 mr-1" />Delivery</>
                        )}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <p className="font-bold text-primary">
                        ${Number(order.total).toFixed(2)}
                      </p>
                    </TableCell>

                    <TableCell>
                      <Badge className={`${statusColors[order.status]} flex items-center gap-1 w-fit`}>
                        <StatusIcon className="size-3" />
                        {order.status.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(v) => handleStatusChange(order.id, v as OrderStatus)}
                        disabled={updatingId === order.id}
                      >
                        <SelectTrigger className="h-8 w-36 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="preparing">Preparing</SelectItem>
                          <SelectItem value="ready">Ready</SelectItem>
                          <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>

                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <Card
            className="max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle className="font-playfair">
                Order #{selectedOrder.order_number}
              </CardTitle>
              <p className="text-sm text-gray-500">
                {format(new Date(selectedOrder.created_at), "MMM d, yyyy · h:mm a")}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1">Customer</h3>
                <p>{selectedOrder.profile?.full_name || selectedOrder.guest_name || "Guest"}</p>
                <p className="text-sm text-gray-600">{selectedOrder.profile?.email || selectedOrder.guest_email || "—"}</p>
                {(selectedOrder.profile?.phone || selectedOrder.delivery_address?.phone) && (
                  <p className="text-sm text-gray-600">
                    {selectedOrder.profile?.phone || selectedOrder.delivery_address?.phone}
                  </p>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-1">
                  {selectedOrder.delivery_address?.type === "pickup" ? "Fulfillment" : "Delivery Address"}
                </h3>
                {selectedOrder.delivery_address?.type === "pickup" ? (
                  <p className="font-medium text-primary">Pickup — customer will collect in store</p>
                ) : (
                  <p>{selectedOrder.delivery_address?.address}</p>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-2">Items</h3>
                <div className="space-y-1.5">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.quantity}× {item.title}</span>
                      <span className="font-semibold">${item.totalPrice.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <h3 className="font-semibold mb-1">Notes</h3>
                  <p className="text-sm text-gray-600">{selectedOrder.notes}</p>
                </div>
              )}

              <div className="pt-4 border-t space-y-1.5">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>${Number(selectedOrder.subtotal).toFixed(2)}</span>
                </div>
                {Number(selectedOrder.delivery_fee) > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Delivery Fee</span>
                    <span>${Number(selectedOrder.delivery_fee).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax</span>
                  <span>${Number(selectedOrder.tax).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-1.5 border-t">
                  <span>Total</span>
                  <span className="text-primary">${Number(selectedOrder.total).toFixed(2)}</span>
                </div>
              </div>

              <Button onClick={() => setSelectedOrder(null)} className="w-full">Close</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
