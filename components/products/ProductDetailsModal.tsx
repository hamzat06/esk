"use client";

import React, { useState } from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import Image from "next/image";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { Badge } from "../ui/badge";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import {
  Product,
  ProductOptionGroup,
  ProductOptionItem,
} from "./types/product";
import { cn } from "@/lib/utils";

interface ProductDetailsModalProps {
  product?: Product;
  open?: boolean;
  onClose?: () => void;
}

const ProductDetailsModal = ({
  product,
  open,
  onClose,
}: ProductDetailsModalProps) => {
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});

  const hasRequiredOptions =
    product?.options?.groups?.every(
      (group: ProductOptionGroup) =>
        !group.required || selectedOptions[group.key],
    ) ?? true;

  const handleOptionChange = (groupKey: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [groupKey]: value,
    }));
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setSelectedOptions({});
        }
        onClose?.();
      }}
    >
      <DialogContent className="sm:max-w-md translate-y-[-50%] sm:translate-y-[-60%] px-0 py-5">
        {/* IMAGE */}
        <div className="w-full h-80 px-4 sm:px-5 mt-10 relative">
          <Image
            alt={product?.title || ""}
            src={product?.image || "/assets/jollof-rice-chicken.jpg"}
            width={500}
            height={500}
            className={cn(
              "size-full rounded-lg object-cover",
              !product?.in_stock && "grayscale",
            )}
          />

          {!product?.in_stock && (
            <Badge className="absolute right-8 top-4 bg-white text-red-500 font-semibold p-1.5 rounded-sm text-sm">
              Out of stock
            </Badge>
          )}
        </div>

        {/* PRODUCT INFO */}
        <div className="flex flex-col gap-1 px-4 sm:px-5">
          <h3 className="text-lg sm:text-xl font-semibold">{product?.title}</h3>
          <p className="text-sm sm:text-base text-gray-500">
            {product?.description}
          </p>
          <span className="text-xl sm:text-3xl font-semibold font-playfair">
            ${product?.amount}
          </span>
        </div>

        {/* OPTIONS */}
        {product?.options?.groups?.map((group: ProductOptionGroup) => (
          <div key={group.key} className="px-4 sm:px-5 pt-5">
            <p className="text-sm font-semibold mb-3">
              {group.label}
              {group.required && <span className="text-red-500 ml-1">*</span>}
            </p>

            <RadioGroup
              value={selectedOptions[group.key]}
              onValueChange={(value) => handleOptionChange(group.key, value)}
              className="flex flex-wrap gap-3"
            >
              {group.options.map((option: ProductOptionItem) => {
                const isSelected = selectedOptions[group.key] === option.label;

                return (
                  <div key={option.label}>
                    <RadioGroupItem
                      value={option.label}
                      id={`${group.key}-${option.label}`}
                      className="peer sr-only"
                    />

                    <Label
                      htmlFor={`${group.key}-${option.label}`}
                      className={cn(
                        "flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm cursor-pointer transition-all",
                        "hover:border-[#A62828]",
                        isSelected
                          ? "bg-[#A62828] text-white border-[#A62828]"
                          : "bg-white text-gray-700 border-gray-300",
                      )}
                    >
                      {option.label}

                      {option.price > 0 && (
                        <span
                          className={cn(
                            "text-xs",
                            isSelected ? "text-white/90" : "text-gray-500",
                          )}
                        >
                          +${option.price}
                        </span>
                      )}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>
        ))}

        {/* CTA */}
        <div className="px-4 sm:px-5 pt-6">
          <Button
            size="lg"
            className="w-full"
            disabled={!product?.in_stock || !hasRequiredOptions}
          >
            <Plus className="size-6" />
            Add to cart
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailsModal;
