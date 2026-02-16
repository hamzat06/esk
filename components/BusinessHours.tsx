"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Clock, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface BusinessHoursProps {
  children?: React.ReactNode;
}

type DaySchedule = {
  open: string;
  close: string;
  closed: boolean;
};

type OpeningHours = {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
};

const BusinessHours = (props: BusinessHoursProps) => {
  const [openingHours, setOpeningHours] = useState<OpeningHours | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get current day index (0 = Sunday, 1 = Monday, etc.)
  const getCurrentDayIndex = () => {
    return new Date().getDay();
  };

  const currentDayIndex = getCurrentDayIndex();

  useEffect(() => {
    const fetchHours = async () => {
      try {
        const { data, error } = await supabase
          .from("shop_settings")
          .select("value")
          .eq("key", "opening_hours")
          .single();

        if (!error && data) {
          setOpeningHours(data.value as OpeningHours);
        }
      } catch (error) {
        console.error("Error fetching opening hours:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHours();
  }, []);

  // Format time from "HH:MM" to "HH:MM AM/PM"
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  // Convert opening hours to display format
  const getBusinessHours = () => {
    if (!openingHours) return [];

    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];

    const dayNames = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    return days.map((day, index) => {
      const schedule = openingHours[day as keyof OpeningHours];
      const isToday = index === currentDayIndex;

      return {
        day: dayNames[index],
        hours: schedule.closed
          ? "Closed"
          : `${formatTime(schedule.open)} - ${formatTime(schedule.close)}`,
        isToday,
        isClosed: schedule.closed,
      };
    });
  };

  const businessHours = getBusinessHours();

  return (
    <Dialog>
      <DialogTrigger asChild>{props?.children}</DialogTrigger>
      <DialogContent className="sm:max-w-md px-4">
        <DialogHeader>
          <div className="flex flex-col items-center gap-3 mb-2">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="size-7 text-primary" />
            </div>
            <DialogTitle className="text-2xl sm:text-3xl font-bold font-playfair text-center">
              Business Hours
            </DialogTitle>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="space-y-1 mt-4">
              {businessHours.map((schedule) => (
                <div
                  key={schedule.day}
                  className={`flex items-center justify-between px-3 py-3.5 rounded-xl transition-colors ${
                    schedule.isToday
                      ? "bg-primary/10 border-2 border-primary/20"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <p
                      className={`font-semibold text-base ${
                        schedule.isToday ? "text-primary" : "text-gray-900"
                      }`}
                    >
                      {schedule.day}
                    </p>
                    {schedule.isToday && (
                      <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full font-medium">
                        Today
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-sm sm:text-base ${
                      schedule.isClosed
                        ? "text-red-600 font-semibold"
                        : schedule.isToday
                          ? "text-primary font-semibold"
                          : "text-gray-600 font-medium"
                    }`}
                  >
                    {schedule.hours}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600 text-center">
                Hours may vary on holidays. Please call ahead to confirm.
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BusinessHours;
