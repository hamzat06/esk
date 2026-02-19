/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase/server";
import OpeningHours from "@/components/admin/settings/OpeningHours";
import HolidayManager from "@/components/admin/settings/HolidayManager";
import BannerManager from "@/components/admin/settings/BannerManager";
import ShopInfoManager from "@/components/admin/settings/ShopInfoManager";
import { requirePermission, validateApiPermission } from "@/lib/auth/permissions";

// Server action to update banners
async function updateBannersAction(banners: any) {
  "use server";

  // Require settings permission
  await validateApiPermission("settings");

  const supabase = await createClient();

  // Check if the setting exists
  const { data: existing } = await supabase
    .from("shop_settings")
    .select("id")
    .eq("key", "shop_banners")
    .single();

  if (existing) {
    // Update existing
    const { error } = await supabase
      .from("shop_settings")
      .update({ value: banners, updated_at: new Date().toISOString() })
      .eq("key", "shop_banners");

    if (error) {
      console.error("Error updating banners:", error);
      return { success: false };
    }
  } else {
    // Insert new
    const { error } = await supabase.from("shop_settings").insert({
      key: "shop_banners",
      value: banners,
    });

    if (error) {
      console.error("Error inserting banners:", error);
      return { success: false };
    }
  }

  return { success: true };
}

// Server action to update shop info
async function updateShopInfoAction(shopInfo: any) {
  "use server";

  // Require settings permission
  await validateApiPermission("settings");

  const supabase = await createClient();

  // Check if the setting exists
  const { data: existing } = await supabase
    .from("shop_settings")
    .select("id")
    .eq("key", "shop_info")
    .single();

  if (existing) {
    // Update existing
    const { error } = await supabase
      .from("shop_settings")
      .update({ value: shopInfo, updated_at: new Date().toISOString() })
      .eq("key", "shop_info");

    if (error) {
      console.error("Error updating shop info:", error);
      return { success: false };
    }
  } else {
    // Insert new
    const { error } = await supabase.from("shop_settings").insert({
      key: "shop_info",
      value: shopInfo,
    });

    if (error) {
      console.error("Error inserting shop info:", error);
      return { success: false };
    }
  }

  return { success: true };
}

// Cache for faster navigation
export const revalidate = 30;

export default async function SettingsPage() {
  // Require settings permission
  await requirePermission("settings");

  const supabase = await createClient();

  // Fetch opening hours
  const { data: openingHoursData } = await supabase
    .from("shop_settings")
    .select("value")
    .eq("key", "opening_hours")
    .single();

  // Fetch holidays
  const { data: holidaysData } = await supabase
    .from("shop_settings")
    .select("value")
    .eq("key", "holidays")
    .single();

  // Fetch banners
  const { data: bannersData } = await supabase
    .from("shop_settings")
    .select("value")
    .eq("key", "shop_banners")
    .single();

  // Fetch shop info
  const { data: shopInfoData } = await supabase
    .from("shop_settings")
    .select("value")
    .eq("key", "shop_info")
    .single();

  return (
    <div className="container mx-auto px-4 sm:px-5 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold font-playfair mb-2">
          Settings
        </h1>
        <p className="text-gray-600">
          Manage shop information, banners, hours, and holidays
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Shop Information */}
        <ShopInfoManager
          initialInfo={
            shopInfoData?.value || {
              name: "EddySylva Kitchen",
              cuisine: "African Cuisine",
              address: "255 South 60th Street",
              city: "Philadelphia",
              state: "PA",
              zipCode: "19139",
              phone: "",
              email: "",
              deliveryTimeMin: 30,
              deliveryTimeMax: 45,
              deliveryFee: 2.99,
              minimumOrder: 10.0,
              description: "",
              logo: "/assets/esk-logo.png",
            }
          }
          updateShopInfo={updateShopInfoAction}
        />

        {/* Banner Manager */}
        <BannerManager
          initialBanners={bannersData?.value || []}
          updateBanners={updateBannersAction}
        />

        {/* Opening Hours */}
        <OpeningHours
          initialHours={
            openingHoursData?.value || {
              monday: { open: "11:00", close: "20:00", closed: false },
              tuesday: { open: "11:00", close: "20:00", closed: false },
              wednesday: { open: "11:00", close: "20:00", closed: false },
              thursday: { open: "11:00", close: "20:00", closed: false },
              friday: { open: "11:00", close: "22:00", closed: false },
              saturday: { open: "11:00", close: "22:00", closed: false },
              sunday: { open: "12:00", close: "20:00", closed: false },
            }
          }
        />

        {/* Holiday Manager */}
        <HolidayManager initialHolidays={holidaysData?.value || []} />
      </div>
    </div>
  );
}
