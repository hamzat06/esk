"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Field, FieldLabel } from "@/components/ui/field";
import { useCartStore } from "@/components/cart/stores/cartStore";
import {
  MapPin,
  Phone,
  CreditCard,
  Loader2,
  AlertCircle,
  Truck,
  ShoppingBag,
} from "lucide-react";
import { CldImage } from "next-cloudinary";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { isVideoAsset, getPublicId, getVideoThumbnailUrl } from "@/lib/cloudinary";
import { supabase } from "@/lib/supabase/client";

interface CheckoutFormProps {
  userName: string;
  userEmail: string;
  defaultAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  } | null;
  deliveryFee: number;
  deliveryEnabled: boolean;
  isOpen: boolean;
  nextOpenTime: string | null;
  shopAddress: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export default function CheckoutForm({
  deliveryFee,
  defaultAddress,
  userName,
  userEmail,
  deliveryEnabled,
  isOpen,
  nextOpenTime,
  shopAddress,
}: CheckoutFormProps) {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  const isGuest = !userEmail;

  // If delivery is disabled, force pickup
  const [orderType, setOrderType] = useState<"delivery" | "pickup">(
    deliveryEnabled ? "delivery" : "pickup",
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shopOpen, setShopOpen] = useState(isOpen);

  // Re-check open status client-side using browser local time (avoids server UTC mismatch)
  useEffect(() => {
    supabase
      .from("shop_settings")
      .select("value")
      .eq("key", "opening_hours")
      .single()
      .then(({ data }) => {
        if (!data?.value) return;
        const days = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
        const now = new Date();
        const schedule = data.value[days[now.getDay()]];
        if (!schedule || schedule.closed) { setShopOpen(false); return; }
        const cur = now.getHours() * 60 + now.getMinutes();
        const [oh, om] = schedule.open.split(":").map(Number);
        const [ch, cm] = schedule.close.split(":").map(Number);
        setShopOpen(cur >= oh * 60 + om && cur <= ch * 60 + cm);
      });
  }, []);

  const [formData, setFormData] = useState({
    name: userName || "",
    email: userEmail || "",
    street: defaultAddress?.street || "",
    city: defaultAddress?.city || "",
    state: defaultAddress?.state || "",
    zipCode: defaultAddress?.zipCode || "",
    phone: "",
    notes: "",
  });

  const isPickup = orderType === "pickup";
  const appliedDeliveryFee = isPickup ? 0 : deliveryFee;
  const subtotal = items.reduce((sum, item) => sum + (item.totalPrice ?? 0), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + appliedDeliveryFee + tax;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isGuest) {
      if (!formData.name.trim()) {
        setError("Please provide your full name");
        return;
      }
      if (
        !formData.email.trim() ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
      ) {
        setError("Please provide a valid email address");
        return;
      }
    }

    if (!isPickup) {
      if (
        !formData.street ||
        !formData.city ||
        !formData.state ||
        !formData.zipCode
      ) {
        setError("Please fill in all address fields");
        return;
      }
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
      const deliveryAddress = isPickup
        ? { type: "pickup", phone: formData.phone }
        : {
            type: "delivery",
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            phone: formData.phone,
          };

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          orderType,
          deliveryAddress,
          notes: formData.notes || null,
          ...(isGuest && {
            guestName: formData.name.trim(),
            guestEmail: formData.email.trim(),
          }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (!data.url) throw new Error("No checkout URL returned");

      clearCart();

      window.location.href = data.url;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(
        err.message || "Failed to proceed to payment. Please try again.",
      );
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

  if (!shopOpen) {
    return (
      <div className="rounded-2xl bg-red-50 border border-red-200 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="size-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold font-playfair text-gray-900 mb-2">
          We&apos;re currently closed
        </h2>
        <p className="text-gray-600 mb-1">
          Orders cannot be placed outside of business hours.
        </p>
        {nextOpenTime && (
          <p className="text-sm text-gray-500">
            We open at{" "}
            <span className="font-semibold text-gray-700">
              {(() => {
                const [h, m] = nextOpenTime.split(":").map(Number);
                const period = h >= 12 ? "PM" : "AM";
                const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
                return `${display}:${String(m).padStart(2, "0")} ${period}`;
              })()}
            </span>
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3">
          <AlertCircle className="size-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Delivery / Pickup selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold font-playfair">
                How would you like to receive your order?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!deliveryEnabled && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
                  <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    Delivery is currently unavailable. Please select pickup.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => deliveryEnabled && setOrderType("delivery")}
                  disabled={!deliveryEnabled}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                    orderType === "delivery"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  <Truck className="size-6" />
                  <span className="font-semibold text-sm">Delivery</span>
                  {deliveryEnabled && (
                    <span className="text-xs">${deliveryFee.toFixed(2)} fee</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setOrderType("pickup")}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                    orderType === "pickup"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <ShoppingBag className="size-6" />
                  <span className="font-semibold text-sm">Pickup</span>
                  <span className="text-xs">Free</span>
                </button>
              </div>

              {isPickup && (
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 flex items-start gap-3">
                  <MapPin className="size-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-0.5">Pickup location</p>
                    <p>
                      {shopAddress.address}, {shopAddress.city},{" "}
                      {shopAddress.state} {shopAddress.zipCode}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delivery Address — only for delivery */}
          {!isPickup && (
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
          )}

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
              {isGuest ? (
                <>
                  <Field>
                    <FieldLabel htmlFor="name">Full Name</FieldLabel>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Jane Smith"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={isLoading}
                      required
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="email">Email Address</FieldLabel>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="jane@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isLoading}
                      required
                    />
                  </Field>
                </>
              ) : (
                <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-600">
                  Ordering as{" "}
                  <span className="font-semibold text-gray-800">
                    {formData.name}
                  </span>{" "}
                  &mdash; {formData.email}
                </div>
              )}

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
                        isVideoAsset(item.image) ? (
                          <Image
                            src={getVideoThumbnailUrl(getPublicId(item.image))}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <CldImage
                            alt={item.title}
                            src={item.image}
                            fill
                            className="object-cover"
                            crop={{ type: "auto", source: true }}
                          />
                        )
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
                        ${(item.totalPrice ?? 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                {!isPickup && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-semibold">
                      ${appliedDeliveryFee.toFixed(2)}
                    </span>
                  </div>
                )}
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
