"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrdersPaginationProps {
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
}

export default function OrdersPagination({
  page,
  totalPages,
  totalCount,
  pageSize,
}: OrdersPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function goToPage(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (p === 1) {
      params.delete("page");
    } else {
      params.set("page", String(p));
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);

  // Build page numbers to show: always first, last, current ±1
  const pages = new Set([1, totalPages, page, page - 1, page + 1].filter((p) => p >= 1 && p <= totalPages));
  const pageList = Array.from(pages).sort((a, b) => a - b);

  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t">
      <p className="text-sm text-gray-500">
        Showing {from}–{to} of {totalCount} orders
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(page - 1)}
          disabled={page === 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="size-4" />
        </Button>

        {pageList.map((p, i) => {
          const prev = pageList[i - 1];
          return (
            <div key={p} className="flex items-center gap-1">
              {prev && p - prev > 1 && (
                <span className="text-gray-400 px-1 text-sm">…</span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(p)}
                className={cn(
                  "h-8 w-8 p-0 text-sm",
                  p === page && "bg-primary text-white border-primary hover:bg-primary/90 hover:text-white",
                )}
              >
                {p}
              </Button>
            </div>
          );
        })}

        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(page + 1)}
          disabled={page === totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
