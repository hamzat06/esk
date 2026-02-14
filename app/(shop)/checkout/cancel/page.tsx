import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 sm:px-5">
        <div className="max-w-2xl mx-auto">
          {/* Cancel Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-4">
              <XCircle className="size-10 text-red-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-playfair mb-2">
              Payment Cancelled
            </h1>
            <p className="text-gray-600">
              Your payment was cancelled. No charges were made.
            </p>
          </div>

          {/* Info Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-gray-700">
                  Your order has not been placed. If you experienced any issues
                  during checkout, please try again or contact our support team.
                </p>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-sm text-amber-800">
                    Your cart items are still saved. You can return to checkout
                    anytime.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link href="/checkout" className="flex-1">
              <Button size="lg" className="w-full">
                Return to Checkout
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button variant="outline" size="lg" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
