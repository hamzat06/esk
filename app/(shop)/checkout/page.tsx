// app/checkout/page.tsx

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CheckoutForm from "@/components/checkout/CheckoutForm";

export default async function CheckoutPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin?redirect=/checkout");
  }

  // Get user profile with default address
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch shop info for delivery fee
  const { data: shopInfoData } = await supabase
    .from("shop_settings")
    .select("value")
    .eq("key", "shop_info")
    .single();

  const deliveryFee = shopInfoData?.value?.deliveryFee || 2.99;

  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-5 py-6 sm:py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold font-playfair mb-2">
            Checkout
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Complete your order details
          </p>
        </div>

        <CheckoutForm
          userEmail={user.email || ""}
          defaultAddress={profile?.default_address}
          deliveryFee={deliveryFee}
        />
      </div>
    </main>
  );
}
