"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  OpeningHours as OpeningHoursType,
  updateOpeningHours,
} from "@/lib/queries/settings";

interface OpeningHoursProps {
  initialHours: OpeningHoursType;
}

const days = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
] as const;

// Helper functions to convert between 24h and 12h format
function convertTo24Hour(time12h: string, period: string): string {
  const [hours, minutes] = time12h.split(":");
  let hour = parseInt(hours);

  if (period === "PM" && hour !== 12) {
    hour += 12;
  } else if (period === "AM" && hour === 12) {
    hour = 0;
  }

  return `${hour.toString().padStart(2, "0")}:${minutes}`;
}

function convertTo12Hour(time24h: string): { time: string; period: string } {
  const [hours, minutes] = time24h.split(":");
  let hour = parseInt(hours);
  const period = hour >= 12 ? "PM" : "AM";

  if (hour === 0) {
    hour = 12;
  } else if (hour > 12) {
    hour -= 12;
  }

  return {
    time: `${hour.toString().padStart(2, "0")}:${minutes}`,
    period,
  };
}

export default function OpeningHours({ initialHours }: OpeningHoursProps) {
  const [hours, setHours] = useState<OpeningHoursType>(initialHours);
  const [isLoading, setIsLoading] = useState(false);

  const handleTimeChange = (
    day: keyof OpeningHoursType,
    field: "open" | "close",
    time12h: string,
    period: string,
  ) => {
    const time24h = convertTo24Hour(time12h, period);
    setHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: time24h,
      },
    }));
  };

  const handlePeriodChange = (
    day: keyof OpeningHoursType,
    field: "open" | "close",
    newPeriod: string,
  ) => {
    const currentTime24h = hours[day][field];
    const { time } = convertTo12Hour(currentTime24h);
    const newTime24h = convertTo24Hour(time, newPeriod);

    setHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: newTime24h,
      },
    }));
  };

  const handleClosedChange = (day: keyof OpeningHoursType, closed: boolean) => {
    setHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        closed,
      },
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      await updateOpeningHours(hours);
      toast.success("Opening hours updated successfully");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to update opening hours");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-playfair">Opening Hours</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {days.map(({ key, label }) => {
          const openTime = convertTo12Hour(hours[key].open);
          const closeTime = convertTo12Hour(hours[key].close);

          return (
            <div
              key={key}
              className="grid grid-cols-1 lg:grid-cols-[120px_1fr_1fr_100px] gap-4 items-start pb-4 border-b last:border-0"
            >
              <div className="font-semibold pt-2">{label}</div>

              {/* Open Time */}
              <div className="space-y-2">
                <label className="text-sm text-gray-600">Open</label>
                <div className="flex gap-2">
                  <Input
                    type="time"
                    value={openTime.time}
                    onChange={(e) =>
                      handleTimeChange(
                        key,
                        "open",
                        e.target.value,
                        openTime.period,
                      )
                    }
                    disabled={hours[key].closed || isLoading}
                    className="flex-1"
                  />
                  <Select
                    value={openTime.period}
                    onValueChange={(value) =>
                      handlePeriodChange(key, "open", value)
                    }
                    disabled={hours[key].closed || isLoading}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Close Time */}
              <div className="space-y-2">
                <label className="text-sm text-gray-600">Close</label>
                <div className="flex gap-2">
                  <Input
                    type="time"
                    value={closeTime.time}
                    onChange={(e) =>
                      handleTimeChange(
                        key,
                        "close",
                        e.target.value,
                        closeTime.period,
                      )
                    }
                    disabled={hours[key].closed || isLoading}
                    className="flex-1"
                  />
                  <Select
                    value={closeTime.period}
                    onValueChange={(value) =>
                      handlePeriodChange(key, "close", value)
                    }
                    disabled={hours[key].closed || isLoading}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Closed Toggle */}
              <div className="flex items-center gap-2 pt-8">
                <Switch
                  checked={hours[key].closed}
                  onCheckedChange={(checked) =>
                    handleClosedChange(key, checked)
                  }
                  disabled={isLoading}
                />
                <label className="text-sm text-gray-600">Closed</label>
              </div>
            </div>
          );
        })}

        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
