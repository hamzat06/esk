"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "./stores/cartStore";

const Cart = () => {
  const items = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <svg
            className="w-10 h-10 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </div>
        <p className="text-gray-800 text-xl font-semibold">Your cart is empty</p>
        <p className="text-gray-400 text-sm mt-2">Add delicious items to get started</p>
      </div>
    );
  }

  const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Header Summary */}
      <div className="px-4 sm:px-6 py-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total items</p>
            <p className="text-2xl font-semibold font-playfair">{itemCount}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Subtotal</p>
            <p className="text-2xl font-semibold font-playfair">
              ${subtotal.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="group relative bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex gap-4">
              {/* Image */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                <Image
                  src={item.image || "/assets/jollof-rice-chicken.jpg"}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-base sm:text-lg line-clamp-2">
                    {item.title}
                  </h4>
                  
                  <button
                    onClick={() => removeItem(item.id)}
                    className="shrink-0 p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="size-4 sm:size-5" />
                  </button>
                </div>

                {/* Options */}
                {Object.values(item.options).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {Object.values(item.options).map((option, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                      >
                        {option.label}
                      </span>
                    ))}
                  </div>
                )}

                {/* Price and Quantity */}
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xl sm:text-2xl font-semibold font-playfair">
                    ${item.totalPrice.toFixed(2)}
                  </p>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5">
                    <button
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="hover:bg-white rounded-full p-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="size-4" />
                    </button>

                    <span className="text-sm font-semibold min-w-[1.5rem] text-center">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                      className="hover:bg-white rounded-full p-1 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                </div>

                {/* Unit price info */}
                {item.quantity > 1 && (
                  <p className="text-xs text-gray-500 mt-1">
                    ${item.unitPrice.toFixed(2)} each
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t bg-white px-4 sm:px-6 py-5 space-y-4 shadow-lg">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Delivery fee</span>
            <span className="font-medium">Calculated at checkout</span>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between items-center">
          <span className="text-base font-semibold">Total</span>
          <span className="text-2xl font-semibold font-playfair">
            ${subtotal.toFixed(2)}
          </span>
        </div>

        <Button size="lg" className="w-full text-base font-semibold rounded-full">
          Proceed to Checkout
        </Button>
      </div>
    </div>
  );
};

export default Cart;