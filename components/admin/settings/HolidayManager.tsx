"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Holiday, addHoliday, removeHoliday } from "@/lib/queries/settings";
import { format } from "date-fns";

interface HolidayManagerProps {
  initialHolidays: Holiday[];
}

export default function HolidayManager({
  initialHolidays,
}: HolidayManagerProps) {
  const [holidays, setHolidays] = useState<Holiday[]>(initialHolidays);
  const [newHoliday, setNewHoliday] = useState({ date: "", name: "" });
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    if (!newHoliday.date || !newHoliday.name.trim()) {
      toast.error("Please enter both date and name");
      return;
    }

    setIsAdding(true);

    try {
      await addHoliday({
        date: newHoliday.date,
        name: newHoliday.name.trim(),
      });

      setHolidays((prev) => [
        ...prev,
        { date: newHoliday.date, name: newHoliday.name.trim() },
      ]);

      setNewHoliday({ date: "", name: "" });
      toast.success("Holiday added successfully");
    } catch (error) {
      console.error("Add holiday error:", error);
      toast.error("Failed to add holiday");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async (date: string) => {
    try {
      await removeHoliday(date);
      setHolidays((prev) => prev.filter((h) => h.date !== date));
      toast.success("Holiday removed successfully");
    } catch (error) {
      console.error("Remove holiday error:", error);
      toast.error("Failed to remove holiday");
    }
  };

  // Sort holidays by date
  const sortedHolidays = [...holidays].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-playfair">US Holidays</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Holiday */}
        <div className="p-4 bg-gray-50 rounded-xl space-y-3">
          <h3 className="font-semibold">Add New Holiday</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="holiday-date">Date</FieldLabel>
              <Input
                id="holiday-date"
                type="date"
                value={newHoliday.date}
                onChange={(e) =>
                  setNewHoliday((prev) => ({ ...prev, date: e.target.value }))
                }
                disabled={isAdding}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="holiday-name">Holiday Name</FieldLabel>
              <Input
                id="holiday-name"
                value={newHoliday.name}
                onChange={(e) =>
                  setNewHoliday((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Independence Day"
                disabled={isAdding}
              />
            </Field>
          </div>

          <Button onClick={handleAdd} disabled={isAdding} className="w-full sm:w-auto">
            {isAdding ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="size-4" />
                Add Holiday
              </>
            )}
          </Button>
        </div>

        {/* Holidays List */}
        <div className="space-y-2">
          <h3 className="font-semibold">Scheduled Holidays</h3>

          {sortedHolidays.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">
              No holidays scheduled. Add one above.
            </p>
          ) : (
            <div className="divide-y border rounded-xl">
              {sortedHolidays.map((holiday) => (
                <div
                  key={holiday.date}
                  className="flex items-center justify-between p-3"
                >
                  <div>
                    <p className="font-semibold">{holiday.name}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(holiday.date), "MMMM d, yyyy")}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemove(holiday.date)}
                  >
                    <Trash2 className="size-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Suggested Holidays */}
        <div className="p-4 bg-blue-50 rounded-xl">
          <h4 className="font-semibold text-sm mb-2">Suggested US Holidays:</h4>
          <p className="text-xs text-gray-600">
            New Year&apos;s Day • Martin Luther King Jr. Day • Presidents&apos;
            Day • Memorial Day • Independence Day • Labor Day • Thanksgiving •
            Christmas Day
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
