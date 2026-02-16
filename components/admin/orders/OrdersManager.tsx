"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ContentTabs, { TabItem } from "@/components/ContentTabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-hot-toast";
import { updateOrderStatus, OrderStatus } from "@/lib/queries/admin/orders";
import { format } from "date-fns";
import {
  Eye,
  Search,
  Clock,
  CheckCircle,
  ChefHat,
  PackageCheck,
  Truck,
  XCircle,
  DollarSign,
  ShoppingBag,
} from "lucide-react";

interface Order {
  id: string;
  order_number: string;
  total: number;
  status: OrderStatus;
  created_at: string;
  items: {
    title: string;
    quantity: number;
    totalPrice: number;
  }[];
  delivery_address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  };
  notes: string | null;
  profile: {
    full_name: string;
    email: string;
    phone: string | null;
  };
}

interface OrdersManagerProps {
  initialOrders: Order[];
}

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-purple-100 text-purple-800",
  ready: "bg-green-100 text-green-800",
  delivered: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const statusIcons: Record<OrderStatus, any> = {
  pending: Clock,
  confirmed: CheckCircle,
  preparing: ChefHat,
  ready: PackageCheck,
  delivered: Truck,
  cancelled: XCircle,
};

export default function OrdersManager({ initialOrders }: OrdersManagerProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderStatus,
  ) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order,
        ),
      );
      toast.success("Order status updated");
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Failed to update status");
    }
  };

  const orderTabs: TabItem[] = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "preparing", label: "Preparing" },
    { value: "ready", label: "Ready" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  // Filter orders by tab and search
  const filteredOrders = orders.filter((order) => {
    const matchesTab = selectedTab === "all" || order.status === selectedTab;
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.profile.full_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      order.profile.email.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  // Calculate stats
  const stats = {
    total: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + Number(order.total), 0),
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    ready: orders.filter((o) => o.status === "ready").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  return (
    <div className="container mx-auto px-4 sm:px-5 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold font-playfair mb-2">
          Orders
        </h1>
        <p className="text-gray-600">Manage customer orders</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Orders</p>
                <p className="text-2xl font-bold font-playfair">
                  {stats.total}
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl">
                <ShoppingBag className="size-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold font-playfair text-green-600">
                  ${stats.totalRevenue.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <DollarSign className="size-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Pending</p>
                <p className="text-2xl font-bold font-playfair text-yellow-600">
                  {stats.pending}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Clock className="size-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Completed</p>
                <p className="text-2xl font-bold font-playfair text-gray-600">
                  {stats.delivered}
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded-xl">
                <Truck className="size-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              placeholder="Search by order number or customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <ContentTabs
        tabs={orderTabs}
        value={selectedTab}
        onValueChange={setSelectedTab}
        wrapperClassName="mb-6"
      />

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">
              {searchQuery
                ? "No orders found matching your search"
                : "No orders found"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map((order) => {
            const StatusIcon = statusIcons[order.status];
            return (
              <Card
                key={order.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Order Info */}
                    <div>
                      <p className="text-sm text-gray-500">Order #</p>
                      <p className="font-bold font-playfair">
                        {order.order_number}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(order.created_at), "MMM d, h:mm a")}
                      </p>
                    </div>

                    {/* Customer */}
                    <div>
                      <p className="text-sm text-gray-500">Customer</p>
                      <p className="font-semibold">{order.profile.full_name}</p>
                      <p className="text-xs text-gray-600">
                        {order.profile.email}
                      </p>
                    </div>

                    {/* Total */}
                    <div>
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="text-2xl font-bold font-playfair text-primary">
                        ${Number(order.total).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-600">
                        {order.items.length} items
                      </p>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex flex-col gap-2">
                      <Badge
                        className={`${statusColors[order.status]} flex items-center gap-1.5 w-fit`}
                      >
                        <StatusIcon className="size-3.5" />
                        {order.status}
                      </Badge>
                      <Select
                        value={order.status}
                        onValueChange={(value) =>
                          handleStatusChange(order.id, value as OrderStatus)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="preparing">Preparing</SelectItem>
                          <SelectItem value="ready">Ready</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="size-4" />
                        View Details
                      </Button>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-semibold mb-2">Items:</p>
                    <div className="text-sm text-gray-600">
                      {order.items.map((item, idx) => (
                        <span key={idx}>
                          {item.quantity}x {item.title}
                          {idx < order.items.length - 1 && ", "}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Order Details Modal */}
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
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Customer</h3>
                <p>{selectedOrder.profile.full_name}</p>
                <p className="text-sm text-gray-600">
                  {selectedOrder.profile.email}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedOrder.profile.phone}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Delivery Address</h3>
                <p>{selectedOrder.delivery_address.street}</p>
                <p>
                  {selectedOrder.delivery_address.city},{" "}
                  {selectedOrder.delivery_address.state}{" "}
                  {selectedOrder.delivery_address.zipCode}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedOrder.delivery_address.phone}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>
                        {item.quantity}x {item.title}
                      </span>
                      <span className="font-semibold">
                        ${item.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-sm text-gray-600">{selectedOrder.notes}</p>
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">
                    ${Number(selectedOrder.total).toFixed(2)}
                  </span>
                </div>
              </div>

              <Button onClick={() => setSelectedOrder(null)} className="w-full">
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
