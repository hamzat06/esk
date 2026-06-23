"use client";

import { useState, useEffect } from "react";
import BusinessHours from "@/components/BusinessHours";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock3, Info } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayH}:${m.toString().padStart(2, "0")} ${period}`;
}

export default function BusinessHoursButton() {
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [timeLabel, setTimeLabel] = useState("");

  useEffect(() => {
    Promise.all([
      supabase.from("shop_settings").select("value").eq("key", "opening_hours").single(),
      supabase.from("shop_settings").select("value").eq("key", "shop_info").single(),
    ]).then(([hoursRes, infoRes]) => {
      const hoursData = hoursRes.data?.value;
      if (!hoursData) return;
      const tz: string = infoRes.data?.value?.timezone ?? "America/New_York";
      const now = new Date(new Date().toLocaleString("en-US", { timeZone: tz }));
      const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      const schedule = hoursData[days[now.getDay()]];
      const cur = now.getHours() * 60 + now.getMinutes();

      if (!schedule || schedule.closed) {
        setIsOpen(false);
        for (let i = 1; i <= 7; i++) {
          const next = hoursData[days[(now.getDay() + i) % 7]];
          if (next && !next.closed) {
            setTimeLabel(`Opens ${i === 1 ? "tomorrow" : days[(now.getDay() + i) % 7]} at ${formatTime(next.open)}`);
            break;
          }
        }
        return;
      }

      const [oh, om] = schedule.open.split(":").map(Number);
      const [ch, cm] = schedule.close.split(":").map(Number);
      const openMin = oh * 60 + om;
      const closeMin = ch * 60 + cm;

      if (cur >= openMin && cur <= closeMin) {
        setIsOpen(true);
        setTimeLabel(`Closes at ${formatTime(schedule.close)}`);
      } else if (cur < openMin) {
        setIsOpen(false);
        setTimeLabel(`Opens at ${formatTime(schedule.open)}`);
      } else {
        setIsOpen(false);
        for (let i = 1; i <= 7; i++) {
          const next = hoursData[days[(now.getDay() + i) % 7]];
          if (next && !next.closed) {
            setTimeLabel(`Opens ${i === 1 ? "tomorrow" : ""} at ${formatTime(next.open)}`);
            break;
          }
        }
      }
    });
  }, []);

  return (
    <BusinessHours>
      <Button
        variant="ghost"
        className="justify-start gap-2 px-4 py-3 h-auto border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        size="lg"
      >
        <Clock3 className="size-5 text-gray-600" />
        {isOpen === null ? (
          <span className="text-sm text-gray-400">Loading...</span>
        ) : isOpen ? (
          <Badge className="bg-green-50 text-green-700 font-semibold border border-green-200 px-2.5 py-0.5">
            Open
          </Badge>
        ) : (
          <Badge className="bg-red-50 text-red-700 font-semibold border border-red-200 px-2.5 py-0.5">
            Closed
          </Badge>
        )}
        {timeLabel && <span className="text-sm text-gray-700">{timeLabel}</span>}
        <Info className="size-4 text-gray-400 ml-auto" />
      </Button>
    </BusinessHours>
  );
}
