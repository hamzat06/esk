export const DEFAULT_TIMEZONE = "America/New_York";

/** Returns the current moment expressed in the shop's local timezone */
export function shopLocalNow(timezone: string = DEFAULT_TIMEZONE): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: timezone }));
}

/** True if the schedule is currently active in the given timezone */
export function isScheduleOpen(
  schedule: { open: string; close: string; closed: boolean },
  timezone: string = DEFAULT_TIMEZONE,
): boolean {
  if (schedule.closed) return false;
  const now = shopLocalNow(timezone);
  const cur = now.getHours() * 60 + now.getMinutes();
  const [oh, om] = schedule.open.split(":").map(Number);
  const [ch, cm] = schedule.close.split(":").map(Number);
  return cur >= oh * 60 + om && cur <= ch * 60 + cm;
}

/** Day key for the current day in the shop's timezone (e.g. "monday") */
export function shopDayKey(timezone: string = DEFAULT_TIMEZONE): string {
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  return days[shopLocalNow(timezone).getDay()];
}
