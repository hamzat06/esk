"use client";

import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { isHolidayToday, Holiday } from "@/lib/queries/settings";

const HolidayBanner = () => {
  const [holiday, setHoliday] = useState<Holiday | null>(null);

  useEffect(() => {
    async function checkHoliday() {
      try {
        const todayHoliday = await isHolidayToday();
        setHoliday(todayHoliday);
      } catch (error) {
        console.error("Error checking holiday:", error);
      }
    }

    checkHoliday();
  }, []);

  // Don't show banner if not a holiday
  if (!holiday) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 border-b-2 border-purple-400/30">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.1) 10px, rgba(255, 255, 255, 0.1) 20px)`,
          }}
        />
      </div>

      <div className="relative px-4 py-3 sm:py-3.5 flex items-center justify-center gap-2 sm:gap-3">
        {/* Icon */}
        <div className="shrink-0 w-8 h-8 rounded-full bg-white/30 flex items-center justify-center animate-pulse">
          <Sparkles className="size-4 sm:size-5 text-white" />
        </div>

        {/* Message */}
        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
          <p className="text-white font-bold text-sm sm:text-base">
            Happy {holiday.name}! 🎉
          </p>
          {holiday.message && (
            <>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-white/70" />
              <p className="text-white/90 text-xs sm:text-sm font-semibold">
                {holiday.message}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HolidayBanner;
