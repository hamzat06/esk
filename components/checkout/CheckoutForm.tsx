"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Field, FieldLabel } from "@/components/ui/field";
import { useCartStore } from "@/components/cart/stores/cartStore";
import { MapPin, Phone, CreditCard, Loader2, AlertCircle } from "lucide-react";
import { CldImage } from "next-cloudinary";
import Image from "next/image";
import { toast } from "react-hot-toast";

interface CheckoutFormProps {
  userEmail: string;
  defaultAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  } | null;
}

export default function CheckoutForm({
  userEmail,
  defaultAddress,
}: CheckoutFormProps) {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    street: defaultAddress?.street || "",
    city: defaultAddress?.city || "",
    state: defaultAddress?.state || "",
    zipCode: defaultAddress?.zipCode || "",
    phone: "",
    notes: "",
  });

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const deliveryFee = 2.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + deliveryFee + tax;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (
      !formData.street ||
      !formData.city ||
      !formData.state ||
      !formData.zipCode
    ) {
      setError("Please fill in all address fields");
      return;
    }

    if (!formData.phone) {
      setError("Please provide a phone number");
      return;
    }

    if (items.length === 0) {
      setError("Your cart is empty");
      return;
    }

    setIsLoading(true);

    try {
      // Create checkout session via API
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items,
          deliveryAddress: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            phone: formData.phone,
          },
          notes: formData.notes || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      const { getStripe } = await import("@/lib/stripe/client");
      const stripe = await getStripe();

      if (!stripe) {
        throw new Error("Failed to load Stripe");
      }

      // Clear cart before redirecting
      clearCart();

      // Redirect to Stripe checkout
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (stripe as any).redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (result?.error) {
        throw new Error(result.error.message);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.message || "Failed to proceed to payment. Please try again.");
      toast.error("Failed to proceed to payment");
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="size-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
          <p className="text-gray-600 mb-6">
            Add items to your cart to checkout
          </p>
          <Button onClick={() => router.push("/")}>Continue Shopping</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3">
          <AlertCircle className="size-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="size-5 text-primary" />
                <CardTitle className="text-xl font-bold font-playfair">
                  Delivery Address
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field>
                <FieldLabel htmlFor="street">Street Address</FieldLabel>
                <Input
                  id="street"
                  name="street"
                  placeholder="123 Main Street"
                  value={formData.street}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="city">City</FieldLabel>
                  <Input
                    id="city"
                    name="city"
                    placeholder="Philadelphia"
                    value={formData.city}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="state">State</FieldLabel>
                  <Input
                    id="state"
                    name="state"
                    placeholder="PA"
                    maxLength={2}
                    value={formData.state}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="zipCode">ZIP Code</FieldLabel>
                <Input
                  id="zipCode"
                  name="zipCode"
                  placeholder="19139"
                  maxLength={5}
                  value={formData.zipCode}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </Field>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Phone className="size-5 text-primary" />
                <CardTitle className="text-xl font-bold font-playfair">
                  Contact Information
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field>
                <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="notes">
                  Special Instructions (Optional)
                </FieldLabel>
                <textarea
                  id="notes"
                  name="notes"
                  placeholder="E.g., Ring doorbell, leave at door..."
                  value={formData.notes}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full min-h-24 px-4 py-2 rounded-xl border-2 border-gray-300 focus:border-primary focus:ring-primary/20 focus:ring-[3px] outline-none transition-all resize-none"
                />
              </Field>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold font-playfair">
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      {item.image ? (
                        <CldImage
                          alt={item.title}
                          src={item.image}
                          fill
                          className="object-cover"
                          crop={{
                            type: "auto",
                            source: true,
                          }}
                        />
                      ) : (
                        <Image
                          src="/assets/mustard-back.jpg"
                          alt="Mockup"
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-sm font-semibold font-playfair mt-1">
                        ${item.totalPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Price Breakdown */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-semibold">
                    ${deliveryFee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (8%)</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>

                <Separator />

                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-base">Total</span>
                  <span className="text-2xl font-bold font-playfair text-primary">
                    ${total.toFixed(2)}
                  </span>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Placing order...
                    </>
                  ) : (
                    <>
                      <CreditCard className="size-4" />
                      Place Order
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </form>
  );
}
