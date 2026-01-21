"use client";

import type React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ReactElement } from "react";

export interface TabItem {
  value: string;
  label: string | ReactElement;
  content?: React.ReactNode;
}

interface ContentTabsProps {
  tabs: TabItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  wrapperClassName?: string;
  contentClassName?: string;
  className?: string;
  hasOverflow?: boolean;
  variant?: "default" | "fancy";
}

const ContentTabs: React.FC<ContentTabsProps> = ({
  tabs,
  defaultValue,
  value,
  onValueChange,
  wrapperClassName,
  contentClassName,
  className,
  variant = "default",
}) => {
  if (variant === "fancy") {
    return (
      <Tabs
        defaultValue={defaultValue || tabs[0]?.value}
        value={value}
        onValueChange={onValueChange}
        className={cn("w-full", className)}
      >
        <TabsList className="h-10 sm:h-12 bg-transparent p-0 gap-x-5 mx-auto">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="text-sm sm:text-base font-medium text-muted-foreground data-[state=active]:font-semibold data-[state=active]:bg-[#A62828] bg-gray-200 data-[state=active]:text-white relative h-full rounded-full data-[state=active]:shadow-none px-8 sm:px-10"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-6">
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    );
  }

  return (
    <Tabs
      defaultValue={defaultValue || tabs[0]?.value}
      value={value}
      onValueChange={onValueChange}
      className={cn("w-full", wrapperClassName)}
    >
      <TabsList className="w-full">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent
          key={tab.value}
          value={tab.value}
          className={cn("mt-3", contentClassName)}
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default ContentTabs;
