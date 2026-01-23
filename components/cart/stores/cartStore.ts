import { create } from "zustand";
import { CartItem } from "../types/cart";

type CartStore = {
  items: CartItem[];

  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartStore>((set) => ({
  items: [],

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find(
        (i) =>
          i.productId === item.productId &&
          JSON.stringify(i.options) === JSON.stringify(item.options),
      );

      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === existing.id
              ? {
                  ...i,
                  quantity: i.quantity + item.quantity,
                  totalPrice: i.unitPrice * (i.quantity + item.quantity),
                }
              : i,
          ),
        };
      }

      return { items: [...state.items, item] };
    }),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    })),

  updateQuantity: (id, quantity) =>
    set((state) => {
      if (quantity < 1) return state;

      return {
        items: state.items.map((item) =>
          item.id === id
            ? {
                ...item,
                quantity,
                totalPrice: item.unitPrice * quantity,
              }
            : item,
        ),
      };
    }),

  clearCart: () => ({ items: [] }),
}));
