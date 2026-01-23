"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Clock } from "lucide-react";

interface BusinessHours {
  children?: React.ReactNode;
}

const businessHours = [
  { day: "Monday", hours: "11:00 AM - 09:00 PM", isToday: false },
  { day: "Tuesday", hours: "11:00 AM - 09:00 PM", isToday: false },
  { day: "Wednesday", hours: "11:00 AM - 09:00 PM", isToday: true },
  { day: "Thursday", hours: "11:00 AM - 09:00 PM", isToday: false },
  { day: "Friday", hours: "11:00 AM - 09:00 PM", isToday: false },
  { day: "Saturday", hours: "11:00 AM - 09:00 PM", isToday: false },
  { day: "Sunday", hours: "Closed", isToday: false },
];

const BusinessHours = (props: BusinessHours) => {
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

        <div className="space-y-1 mt-4">
          {businessHours.map((schedule, index) => (
            <div
              key={schedule.day}
              className={`flex items-center justify-between px-3 py-3.5 rounded-xl transition-colors ${
                schedule.isToday
                  ? "bg-primary/10 border-2 border-primary/20"
                  : "hover:bg-gray-50"
              } ${index !== businessHours.length - 1 ? "" : ""}`}
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
                  schedule.hours === "Closed"
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
      </DialogContent>
    </Dialog>
  );
};

export default BusinessHours;