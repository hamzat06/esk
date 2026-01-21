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
          "w-full rounded-2xl px-0 py-4 sm:max-w-1/3",
          props?.contentClassName,
        )}
      >
        <div className="flex items-center px-5 justify-between">
          {typeof props?.title === "string" ? (
            <h2 className="text-2xl font-semibold">{props?.title}</h2>
          ) : (
            props?.title
          )}

          <Button
            className="w-fit size-10 hover:cursor-pointer"
            onClick={props?.onClose}
            variant="ghost"
          >
            <XIcon className="size-6" />
          </Button>
        </div>
        {props?.children}
      </SheetContent>
    </SheetShad>
  );
};

export default Sheet;
