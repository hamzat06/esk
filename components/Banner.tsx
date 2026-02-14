"use client";

import { AlertTriangle, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { isShopOpen, getNextOpeningTime } from "@/lib/queries/settings";

const Banner = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [nextOpenTime, setNextOpenTime] = useState<string | null>(null);

  useEffect(() => {
    async function checkStatus() {
      try {
        const open = await isShopOpen();
        setIsOpen(open);

        if (!open) {
          const next = await getNextOpeningTime();
          setNextOpenTime(next);
        }
      } catch (error) {
        console.error("Error checking shop status:", error);
        setIsOpen(true); // Default to open on error
      }
    }

    checkStatus();

    // Check every minute
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  // Don't show banner if shop is open
  if (isOpen) return null;

  return (
    <div className="relative overflow-hidden bg-linear-to-r from-amber-400 via-yellow-400 to-amber-400 border-b-2 border-amber-500/30">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(166, 40, 40, 0.1) 10px, rgba(166, 40, 40, 0.1) 20px)`,
          }}
        />
      </div>

      <div className="relative px-4 py-3 sm:py-3.5 flex items-center justify-center gap-2 sm:gap-3">
        {/* Icon */}
        <div className="shrink-0 w-8 h-8 rounded-full bg-red-600/20 flex items-center justify-center animate-pulse">
          <AlertTriangle className="size-4 sm:size-5 text-red-700" />
        </div>

        {/* Message */}
        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
          <p className="text-red-800 font-bold text-sm sm:text-base">
            This outlet is currently closed
          </p>
          <div className="hidden sm:block w-1 h-1 rounded-full bg-red-700" />
          <div className="flex items-center gap-1.5 text-red-700">
            <Clock className="size-3.5 sm:size-4" />
            <p className="text-xs sm:text-sm font-semibold">
              Opens at {nextOpenTime || "11:00 AM"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;