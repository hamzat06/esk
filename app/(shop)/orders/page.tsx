import OrdersList from "@/components/orders/OrdersList";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function OrdersPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin?redirect=/orders");
  }

  // Fetch user's orders
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
  }

  // Transform orders data to match the Order type
  const transformedOrders =
    orders?.map((order) => ({
      id: order.id,
      orderNumber: order.order_number,
      userId: order.user_id,
      items: order.items,
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.delivery_fee),
      tax: Number(order.tax),
      total: Number(order.total),
      deliveryAddress: order.delivery_address,
      status: order.status,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      notes: order.notes,
      paymentIntentId: order.payment_intent_id,
      stripeSessionId: order.stripe_session_id,
    })) || [];

  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-5 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl sm:text-4xl font-bold font-playfair text-gray-900">
              My Orders
            </h1>
            {transformedOrders.length > 0 && (
              <Button
                variant="outline"
                size="lg"
                className="rounded-xl"
                asChild
              >
                <Link href="/">
                  <ShoppingBag className="size-4 mr-2" />
                  Shop More
                </Link>
              </Button>
            )}
          </div>
          <p className="text-gray-600 text-sm sm:text-base">
            Track and manage all your orders in one place
          </p>
        </div>

        {/* Orders List */}
        <OrdersList orders={transformedOrders} />
      </div>
    </main>
  );
}
