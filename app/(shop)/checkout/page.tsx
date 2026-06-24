import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import { isShopOpen, getNextOpeningTime } from "@/lib/queries/settings";

export const metadata: Metadata = {
  title: "Checkout | EddySylva Kitchen",
};

export default async function CheckoutPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  let savedAddresses: { id: string; label: string; address: string; phone: string; is_default: boolean }[] = [];
  if (user) {
    const [profileRes, addressesRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase
        .from("user_addresses")
        .select("id, label, address, phone, is_default")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false }),
    ]);
    profile = profileRes.data;
    savedAddresses = addressesRes.data ?? [];
  }

  const { data: shopInfoData } = await supabase
    .from("shop_settings")
    .select("value")
    .eq("key", "shop_info")
    .single();

  const shopInfo = shopInfoData?.value || {};
  const deliveryFee = shopInfo.deliveryFee || 2.99;
  const deliveryEnabled = shopInfo.deliveryEnabled !== false;
  const minimumOrder = shopInfo.minimumOrder || 0;

  const [shopOpen, nextOpenTime] = await Promise.all([
    isShopOpen(),
    getNextOpeningTime(),
  ]);

  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-5 py-6 sm:py-8 max-w-4xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold font-playfair mb-2">
            Checkout
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Complete your order details
          </p>
        </div>

        <CheckoutForm
          userName={profile?.full_name || ""}
          userEmail={user?.email || ""}
          savedAddresses={savedAddresses}
          deliveryFee={deliveryFee}
          deliveryEnabled={deliveryEnabled}
          minimumOrder={minimumOrder}
          isOpen={shopOpen}
          nextOpenTime={nextOpenTime}
          shopAddress={{
            address: shopInfo.address || "255 South 60th Street",
            city: shopInfo.city || "Philadelphia",
            state: shopInfo.state || "PA",
            zipCode: shopInfo.zipCode || "19139",
          }}
        />
      </div>
    </main>
  );
}
