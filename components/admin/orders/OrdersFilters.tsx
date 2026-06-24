"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, CalendarX } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const STATUSES = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "preparing", label: "Preparing" },
  { value: "ready", label: "Ready" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

interface OrdersFiltersProps {
  status: string;
  search: string;
  dateFrom: string;
  dateTo: string;
}

export default function OrdersFilters({ status, search, dateFrom, dateTo }: OrdersFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [inputValue, setInputValue] = useState(search);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  const handleSearch = useDebouncedCallback((value: string) => {
    updateParam("search", value);
  }, 400);

  function handleClear() {
    setInputValue("");
    updateParam("search", "");
  }

  function clearDates() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("dateFrom");
    params.delete("dateTo");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  const activeStatus = status || "all";
  const hasDateFilter = dateFrom || dateTo;

  return (
    <div className="space-y-4 mb-6">
      {/* Search + Date Row */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <Input
            placeholder="Search order # or customer..."
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              handleSearch(e.target.value);
            }}
            className="pl-9 pr-9 h-10"
          />
          {inputValue && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => updateParam("dateFrom", e.target.value)}
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-primary focus:outline-none"
          />
          <span className="text-gray-400 text-sm">to</span>
          <input
            type="date"
            value={dateTo}
            min={dateFrom}
            onChange={(e) => updateParam("dateTo", e.target.value)}
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-primary focus:outline-none"
          />
          {hasDateFilter && (
            <button
              onClick={clearDates}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear date filter"
            >
              <CalendarX className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {STATUSES.map((s) => (
          <Button
            key={s.value}
            variant="ghost"
            size="sm"
            onClick={() => updateParam("status", s.value)}
            className={cn(
              "h-8 rounded-lg text-sm font-medium transition-colors",
              activeStatus === s.value
                ? "bg-primary text-white hover:bg-primary/90 hover:text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200",
            )}
          >
            {s.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
