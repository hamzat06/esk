"use client";

import React, { useMemo, useState } from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import Image from "next/image";
import { Button } from "../ui/button";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { Badge } from "../ui/badge";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Product, ProductOptionItem } from "./types/product";
import { cn } from "@/lib/utils";
import { useCartStore } from "../cart/stores/cartStore";
import { calculateCartPricing } from "@/lib/calculateCartPricing";
import { CartItem } from "../cart/types/cart";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-hot-toast";

interface ProductDetailsModalProps {
  product?: Product;
  open?: boolean;
  onClose?: () => void;
}

type SelectedOptions = Record<
  string,
  {
    label: string;
    price: number;
  }
>;

const ProductDetailsModal = ({
  product,
  open,
  onClose,
}: ProductDetailsModalProps) => {
  const addToCart = useCartStore((s) => s.addItem);

  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({});

  const hasRequiredOptions =
    product?.options?.groups?.every(
      (group) => !group.required || selectedOptions[group.key],
    ) ?? true;

  const pricing = useMemo(() => {
    if (!product) return { unitPrice: 0, totalPrice: 0 };

    return calculateCartPricing(product.amount, selectedOptions, quantity);
  }, [product, selectedOptions, quantity]);

  function handleOptionChange(groupKey: string, option: ProductOptionItem) {
    setSelectedOptions((prev) => ({
      ...prev,
      [groupKey]: {
        label: option.label,
        price: option.price,
      },
    }));
  }

  function handleAddToCart() {
    if (!product) return;

    const cartItem: CartItem = {
      id: uuidv4(),
      productId: product.id,
      title: product.title,
      image: product.image,

      quantity,
      basePrice: product.amount,
      options: selectedOptions,

      unitPrice: pricing.unitPrice,
      totalPrice: pricing.totalPrice,
    };

    addToCart(cartItem);
    setQuantity(1);
    toast.success("Item added to cart!");
    setSelectedOptions({});
    onClose?.();
  }

  function handleClose() {
    setQuantity(1);
    setSelectedOptions({});
    onClose?.();
  }

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 max-h-[85vh] overflow-y-auto">
        {/* Product Image */}
        <div className="relative w-full h-72 sm:h-96">
          <Image
            alt={product?.title || ""}
            src={product?.image || "/assets/jollof-rice-chicken.jpg"}
            fill
            className={cn("object-cover", !product?.in_stock && "grayscale")}
          />

          {!product?.in_stock && (
            <Badge className="absolute right-4 top-4 bg-white text-red-500 font-semibold px-3 py-1.5 text-sm shadow-md">
              Out of stock
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title & Description */}
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold font-playfair mb-2">
              {product.title}
            </h3>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              {product.description}
            </p>
            <p className="text-3xl sm:text-4xl font-bold font-playfair mt-4">
              ${pricing.unitPrice.toFixed(2)}
            </p>
          </div>

          {/* Options */}
          {product.options?.groups?.map((group) => (
            <div key={group.key} className="space-y-3">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-base sm:text-lg">
                  {group.label}
                </p>
                {group.required && (
                  <Badge
                    variant="outline"
                    className="text-xs text-red-600 border-red-200 bg-red-50"
                  >
                    Required
                  </Badge>
                )}
              </div>

              <RadioGroup className="flex flex-wrap gap-2">
                {group.options.map((option) => {
                  const isSelected =
                    selectedOptions[group.key]?.label === option.label;

                  return (
                    <div key={option.label}>
                      <RadioGroupItem
                        value={option.label}
                        id={`${group.key}-${option.label}`}
                        className="peer sr-only"
                        onClick={() => handleOptionChange(group.key, option)}
                      />

                      <Label
                        htmlFor={`${group.key}-${option.label}`}
                        className={cn(
                          "inline-flex items-center px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all duration-200 text-sm sm:text-base font-medium",
                          isSelected
                            ? "bg-primary text-white border-primary shadow-md"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                        )}
                      >
                        {option.label}
                        {option.price > 0 && (
                          <span
                            className={cn(
                              "ml-1",
                              isSelected ? "text-white/90" : "text-gray-500",
                            )}
                          >
                            (+${option.price})
                          </span>
                        )}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>
          ))}

          {/* Quantity Selector */}
          <div className="space-y-3">
            <p className="font-semibold text-base sm:text-lg">Quantity</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="hover:bg-white rounded-lg p-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Decrease quantity"
                >
                  <Minus className="size-5" />
                </button>

                <span className="text-lg font-semibold min-w-[2rem] text-center">
                  {quantity}
                </span>

                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="hover:bg-white rounded-lg p-2 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="size-5" />
                </button>
              </div>

              <div className="text-sm text-gray-600">
                <span className="font-medium">Total: </span>
                <span className="text-xl font-bold font-playfair text-gray-900">
                  ${pricing.totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            size="lg"
            className="w-full text-base font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
            disabled={!product.in_stock || !hasRequiredOptions}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="mr-2 size-5" />
            Add to cart • ${pricing.totalPrice.toFixed(2)}
          </Button>

          {!hasRequiredOptions && (
            <p className="text-sm text-red-600 text-center">
              Please select all required options
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailsModal;
