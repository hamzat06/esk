import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  if (!session_id) {
    redirect("/");
  }

  const supabase = await createClient();

  // Fetch order using stripe_session_id
  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("stripe_session_id", session_id)
    .single();

  if (error || !order) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 sm:px-5">
        <div className="max-w-2xl mx-auto">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
              <CheckCircle2 className="size-10 text-green-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-playfair mb-2">
              Order Confirmed!
            </h1>
            <p className="text-gray-600">
              Thank you for your order. We&apos;ve received your payment.
            </p>
          </div>

          {/* Order Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold font-playfair">
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Order Number</span>
                <span className="font-bold font-playfair">
                  #{order.order_number}
                </span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Total Amount</span>
                <span className="text-2xl font-bold font-playfair text-primary">
                  ${Number(order.total).toFixed(2)}
                </span>
              </div>

              <div className="pb-3 border-b">
                <p className="text-gray-600 mb-2">Delivery Address</p>
                <p className="font-semibold">
                  {order.delivery_address.street}
                </p>
                <p className="text-gray-600">
                  {order.delivery_address.city}, {order.delivery_address.state}{" "}
                  {order.delivery_address.zipCode}
                </p>
                <p className="text-gray-600 mt-1">
                  {order.delivery_address.phone}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  <strong>What&apos;s next?</strong>
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  We&apos;re preparing your order. You&apos;ll receive updates
                  on your order status. Estimated delivery time is 30-45
                  minutes.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link href="/orders" className="flex-1">
              <Button variant="outline" size="lg" className="w-full">
                View Order Status
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button size="lg" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
