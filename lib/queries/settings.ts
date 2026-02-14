import { supabase } from "@/lib/supabase/client";

export type DaySchedule = {
  open: string; // "HH:MM" format
  close: string;
  closed: boolean;
};

export type OpeningHours = {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
};

export type Holiday = {
  date: string; // YYYY-MM-DD format
  name: string;
  message?: string;
};

export async function getOpeningHours(): Promise<OpeningHours> {
  const { data, error } = await supabase
    .from("shop_settings")
    .select("value")
    .eq("key", "opening_hours")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data.value as OpeningHours;
}

export async function updateOpeningHours(hours: OpeningHours): Promise<void> {
  const { error } = await supabase
    .from("shop_settings")
    .update({ value: hours, updated_at: new Date().toISOString() })
    .eq("key", "opening_hours");

  if (error) {
    throw new Error(error.message);
  }
}

export async function isShopOpen(): Promise<boolean> {
  try {
    const hours = await getOpeningHours();
    const now = new Date();
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const dayName = days[now.getDay()] as keyof OpeningHours;
    const daySchedule = hours[dayName];

    if (daySchedule.closed) return false;

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [openHour, openMin] = daySchedule.open.split(":").map(Number);
    const [closeHour, closeMin] = daySchedule.close.split(":").map(Number);
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;

    return currentMinutes >= openTime && currentMinutes <= closeTime;
  } catch (error) {
    console.error("Error checking shop hours:", error);
    return true; // Default to open if error
  }
}

export async function getNextOpeningTime(): Promise<string | null> {
  try {
    const hours = await getOpeningHours();
    const now = new Date();
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const dayName = days[now.getDay()] as keyof OpeningHours;
    const todaySchedule = hours[dayName];

    // If closed today, return tomorrow's opening time
    if (todaySchedule.closed) {
      const tomorrow = days[(now.getDay() + 1) % 7] as keyof OpeningHours;
      const tomorrowSchedule = hours[tomorrow];
      return tomorrowSchedule.closed ? null : tomorrowSchedule.open;
    }

    return todaySchedule.open;
  } catch (error) {
    console.error("Error getting next opening time:", error);
    return null;
  }
}

// Holiday functions
export async function getHolidays(): Promise<Holiday[]> {
  const { data, error } = await supabase
    .from("shop_settings")
    .select("value")
    .eq("key", "holidays")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return (data.value as Holiday[]) || [];
}

export async function updateHolidays(holidays: Holiday[]): Promise<void> {
  const { error } = await supabase
    .from("shop_settings")
    .update({ value: holidays, updated_at: new Date().toISOString() })
    .eq("key", "holidays");

  if (error) {
    throw new Error(error.message);
  }
}

export async function isHolidayToday(): Promise<Holiday | null> {
  try {
    const holidays = await getHolidays();
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const todayHoliday = holidays.find((h) => h.date === today);
    return todayHoliday || null;
  } catch (error) {
    console.error("Error checking holidays:", error);
    return null;
  }
}

export async function addHoliday(holiday: Holiday): Promise<void> {
  const holidays = await getHolidays();
  holidays.push(holiday);
  await updateHolidays(holidays);
}

export async function removeHoliday(date: string): Promise<void> {
  const holidays = await getHolidays();
  const filtered = holidays.filter((h) => h.date !== date);
  await updateHolidays(filtered);
}
