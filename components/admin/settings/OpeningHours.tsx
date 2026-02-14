"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { OpeningHours as OpeningHoursType, updateOpeningHours } from "@/lib/queries/settings";

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

export default function OpeningHours({ initialHours }: OpeningHoursProps) {
  const [hours, setHours] = useState<OpeningHoursType>(initialHours);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    day: keyof OpeningHoursType,
    field: "open" | "close" | "closed",
    value: string | boolean,
  ) => {
    setHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
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
        {days.map(({ key, label }) => (
          <div
            key={key}
            className="grid grid-cols-1 sm:grid-cols-[120px_1fr_1fr_100px] gap-4 items-center pb-4 border-b last:border-0"
          >
            <div className="font-semibold">{label}</div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-12">Open:</label>
              <Input
                type="time"
                value={hours[key].open}
                onChange={(e) => handleChange(key, "open", e.target.value)}
                disabled={hours[key].closed || isLoading}
                className="flex-1"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-12">Close:</label>
              <Input
                type="time"
                value={hours[key].close}
                onChange={(e) => handleChange(key, "close", e.target.value)}
                disabled={hours[key].closed || isLoading}
                className="flex-1"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Closed</label>
              <Switch
                checked={hours[key].closed}
                onCheckedChange={(checked) =>
                  handleChange(key, "closed", checked)
                }
                disabled={isLoading}
              />
            </div>
          </div>
        ))}

        <Button onClick={handleSave} disabled={isLoading} className="w-full sm:w-auto">
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
