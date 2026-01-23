import { CartItem } from "@/components/cart/types/cart";
import { supabase } from "./supabase/client";

export async function syncCartToServer(items: CartItem[], userId: string) {
  const payload = items.map((item) => ({
    user_id: userId,
    product_id: item.productId,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    total_price: item.totalPrice,
    options: item.options,
  }));

  await supabase.from("cart_items").upsert(payload, {
    onConflict: "user_id,product_id",
  });
}
