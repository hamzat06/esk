import { createClient } from "@/lib/supabase/server";
import OpeningHours from "@/components/admin/settings/OpeningHours";
import HolidayManager from "@/components/admin/settings/HolidayManager";

export default async function SettingsPage() {
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

  return (
    <div className="container mx-auto px-4 sm:px-5 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold font-playfair mb-2">
          Settings
        </h1>
        <p className="text-gray-600">Manage shop hours and holidays</p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
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

        <HolidayManager initialHolidays={holidaysData?.value || []} />
      </div>
    </div>
  );
}
