"use client";

import React from "react";
import { SheetContent, Sheet as SheetShad } from "./ui/sheet";
import { Button } from "./ui/button";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ClassNameValue } from "tailwind-merge";

interface SheetProps {
  children?: React.ReactNode;
  onClose?: PureFunc;
  open?: boolean;
  title?: string | React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  contentClassName?: ClassNameValue;
}

const Sheet = (props: SheetProps) => {
  return (
    <SheetShad open={props?.open} onOpenChange={props?.onClose}>
      <SheetContent
        side={props?.side}
        className={cn(
          "w-full sm:max-w-md px-0 py-0 flex flex-col",
          props?.contentClassName,
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-white sticky top-0 z-10">
          {typeof props?.title === "string" ? (
            <h2 className="text-xl sm:text-2xl font-bold font-playfair">
              {props?.title}
            </h2>
          ) : (
            props?.title
          )}

          <Button
            className="size-10 hover:bg-gray-100 rounded-full transition-colors"
            onClick={props?.onClose}
            variant="ghost"
            size="icon"
          >
            <XIcon className="size-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {props?.children}
        </div>
      </SheetContent>
    </SheetShad>
  );
};

export default Sheet;