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
  Plus,
  Check,
} from "lucide-react";
import { CldImage } from "next-cloudinary";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { isVideoAsset, getPublicId, getVideoThumbnailUrl } from "@/lib/cloudinary";
import { supabase } from "@/lib/supabase/client";

interface SavedAddress {
  id: string;
  label: string;
  address: string;
  phone: string;
  is_default: boolean;
}

interface CheckoutFormProps {
  userName: string;
  userEmail: string;
  savedAddresses: SavedAddress[];
  deliveryFee: number;
  deliveryEnabled: boolean;
  minimumOrder: number;
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
  savedAddresses,
  userName,
  userEmail,
  deliveryEnabled,
  minimumOrder,
  isOpen,
  nextOpenTime,
  shopAddress,
}: CheckoutFormProps) {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  const isGuest = !userEmail;

  const [orderType, setOrderType] = useState<"delivery" | "pickup">(
    deliveryEnabled ? "delivery" : "pickup",
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shopOpen, setShopOpen] = useState(isOpen);

  const defaultSaved = savedAddresses.find((a) => a.is_default) ?? savedAddresses[0] ?? null;
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    defaultSaved?.id ?? null,
  );
  const [showNewAddress, setShowNewAddress] = useState(savedAddresses.length === 0);
  const [saveAddress, setSaveAddress] = useState(false);
  const [saveLabel, setSaveLabel] = useState("Home");

  const selectedSaved = savedAddresses.find((a) => a.id === selectedAddressId) ?? null;

  useEffect(() => {
    Promise.all([
      supabase.from("shop_settings").select("value").eq("key", "opening_hours").single(),
      supabase.from("shop_settings").select("value").eq("key", "shop_info").single(),
    ]).then(([hoursRes, infoRes]) => {
      const hours = hoursRes.data?.value;
      if (!hours) return;
      const tz: string = infoRes.data?.value?.timezone ?? "America/New_York";
      const now = new Date(new Date().toLocaleString("en-US", { timeZone: tz }));
      const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      const schedule = hours[days[now.getDay()]];
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
    address: "",
    phone: "",
    notes: "",
  });

  const isPickup = orderType === "pickup";
  const appliedDeliveryFee = isPickup ? 0 : deliveryFee;
  const subtotal = items.reduce((sum, item) => sum + (item.totalPrice ?? 0), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + appliedDeliveryFee + tax;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const isBelowMinimum = orderType === "delivery" && minimumOrder > 0 && subtotal < minimumOrder;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isBelowMinimum) {
      setError(
        `Minimum order for delivery is $${minimumOrder.toFixed(2)}. Add $${(minimumOrder - subtotal).toFixed(2)} more to proceed.`,
      );
      return;
    }

    if (isGuest) {
      if (!formData.name.trim()) { setError("Please provide your full name"); return; }
      if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError("Please provide a valid email address"); return;
      }
    }

    let resolvedAddress = "";
    let resolvedPhone = "";

    if (!isPickup) {
      if (selectedSaved && !showNewAddress) {
        resolvedAddress = selectedSaved.address;
        resolvedPhone = selectedSaved.phone;
      } else {
        if (!formData.address.trim()) { setError("Please enter your delivery address"); return; }
        resolvedAddress = formData.address.trim();
        resolvedPhone = formData.phone.trim();
      }
    } else {
      resolvedPhone = formData.phone.trim();
    }

    if (!resolvedPhone) { setError("Please provide a phone number"); return; }
    if (items.length === 0) { setError("Your cart is empty"); return; }

    setIsLoading(true);

    try {
      if (!isPickup && showNewAddress && saveAddress && !isGuest) {
        await fetch("/api/user/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label: saveLabel || "Home",
            address: resolvedAddress,
            phone: resolvedPhone,
            is_default: savedAddresses.length === 0,
          }),
        });
      }

      const deliveryAddress = isPickup
        ? { type: "pickup", phone: resolvedPhone }
        : { type: "delivery", address: resolvedAddress, phone: resolvedPhone };

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
      if (!response.ok) throw new Error(data.error || "Failed to create checkout session");
      if (!data.url) throw new Error("No checkout URL returned");

      clearCart();
      window.location.href = data.url;
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
          <p className="text-gray-600 mb-6">Add items to your cart to checkout</p>
          <Button onClick={() => router.push("/")}>Continue Shopping</Button>
        </CardContent>
      </Card>
    );
  }

  if (!shopOpen) {
    return (
      <div className="rounded-2xl bg-red-50 border border-red-200 p-4 sm:p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="size-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold font-playfair text-gray-900 mb-2">
          We&apos;re currently closed
        </h2>
        <p className="text-gray-600 mb-1">Orders cannot be placed outside of business hours.</p>
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

          {/* Delivery Address */}
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
              <CardContent className="space-y-3">
                {savedAddresses.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => { setSelectedAddressId(a.id); setShowNewAddress(false); }}
                    className={`w-full text-left flex items-start gap-3 rounded-xl border-2 p-3 transition-all ${
                      selectedAddressId === a.id && !showNewAddress
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className={`mt-0.5 size-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                      selectedAddressId === a.id && !showNewAddress
                        ? "border-primary bg-primary"
                        : "border-gray-300"
                    }`}>
                      {selectedAddressId === a.id && !showNewAddress && (
                        <Check className="size-2.5 text-white" strokeWidth={3} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{a.label}</p>
                      <p className="text-sm text-gray-600 truncate">{a.address}</p>
                      <p className="text-xs text-gray-400">{a.phone}</p>
                    </div>
                  </button>
                ))}

                {savedAddresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => { setShowNewAddress(true); setSelectedAddressId(null); }}
                    className={`w-full text-left flex items-center gap-3 rounded-xl border-2 p-3 transition-all ${
                      showNewAddress
                        ? "border-primary bg-primary/5"
                        : "border-dashed border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <Plus className="size-4 text-gray-500 shrink-0" />
                    <span className="text-sm text-gray-600 font-medium">Use a different address</span>
                  </button>
                )}

                {showNewAddress && (
                  <div className="space-y-3 pt-1">
                    <Field>
                      <FieldLabel htmlFor="address">Full Address</FieldLabel>
                      <Input
                        id="address"
                        name="address"
                        placeholder="e.g. 255 South 60th Street, Philadelphia, PA 19139"
                        value={formData.address}
                        onChange={handleChange}
                        disabled={isLoading}
                        required
                      />
                    </Field>

                    {!isGuest && (
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={saveAddress}
                            onChange={(e) => setSaveAddress(e.target.checked)}
                            className="rounded border-gray-300 text-primary"
                          />
                          <span className="text-sm text-gray-700">Save this address for next time</span>
                        </label>
                        {saveAddress && (
                          <div className="flex gap-2 pl-6">
                            {["Home", "Work", "Other"].map((l) => (
                              <button
                                key={l}
                                type="button"
                                onClick={() => setSaveLabel(l)}
                                className={`text-xs px-3 py-1 rounded-full border transition-all ${
                                  saveLabel === l
                                    ? "border-primary bg-primary text-white"
                                    : "border-gray-300 text-gray-600 hover:border-gray-400"
                                }`}
                              >
                                {l}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
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
                  <span className="font-semibold text-gray-800">{formData.name}</span>{" "}
                  &mdash; {formData.email}
                </div>
              )}

              {/* Phone shown when no saved address will supply it */}
              {(isPickup || showNewAddress || savedAddresses.length === 0) && (
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
              )}

              <Field>
                <FieldLabel htmlFor="notes">Special Instructions (Optional)</FieldLabel>
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
                <CardTitle className="text-xl font-bold font-playfair">Order Summary</CardTitle>
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
                      <h4 className="font-semibold text-sm line-clamp-1">{item.title}</h4>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold mt-1">
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
                    <span className="font-semibold">${appliedDeliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (8%)</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>

                <Separator />

                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-base">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    ${total.toFixed(2)}
                  </span>
                </div>

                {isBelowMinimum && (
                  <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 mt-2">
                    <AlertCircle className="size-4 shrink-0 mt-0.5" />
                    <span>
                      Minimum order for delivery is <strong>${minimumOrder.toFixed(2)}</strong>.
                      Add <strong>${(minimumOrder - subtotal).toFixed(2)}</strong> more to your cart.
                    </span>
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full mt-4"
                  disabled={isLoading || isBelowMinimum}
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
