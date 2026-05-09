import { CartItem } from "@/components/cart/types/cart";
import { supabase } from "./supabase/client";

export async function syncCartToServer(items: CartItem[], userId: string) {
  if (items.length === 0) return;

  const { data: existingCart, error: cartFetchError } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (cartFetchError) {
    throw cartFetchError;
  }

  let cartId = existingCart?.id;

  if (!cartId) {
    const { data: createdCart, error: createCartError } = await supabase
      .from("carts")
      .insert({
        user_id: userId,
        status: "active",
      })
      .select("id")
      .single();

    if (createCartError) {
      throw createCartError;
    }

    cartId = createdCart.id;
  }

  const { data: existingItems, error: existingItemsError } = await supabase
    .from("cart_items")
    .select(
      "id, product_id, title, image, quantity, base_price, options, unit_price, total_price",
    )
    .eq("cart_id", cartId);

  if (existingItemsError) {
    throw existingItemsError;
  }

  for (const item of items) {
    const matchingItem = existingItems?.find(
      (existing) =>
        existing.product_id === item.productId &&
        JSON.stringify(existing.options ?? {}) === JSON.stringify(item.options),
    );

    if (matchingItem) {
      const newQuantity = matchingItem.quantity + item.quantity;

      const { error: updateError } = await supabase
        .from("cart_items")
        .update({
          title: item.title,
          image: item.image ?? null,
          quantity: newQuantity,
          base_price: item.basePrice,
          options: item.options,
          unit_price: item.unitPrice,
          total_price: item.unitPrice * newQuantity,
        })
        .eq("id", matchingItem.id);

      if (updateError) {
        throw updateError;
      }
    } else {
      const { error: insertError } = await supabase.from("cart_items").insert({
        cart_id: cartId,
        product_id: item.productId,
        title: item.title,
        image: item.image ?? null,
        quantity: item.quantity,
        base_price: item.basePrice,
        options: item.options,
        unit_price: item.unitPrice,
        total_price: item.totalPrice,
      });

      if (insertError) {
        throw insertError;
      }
    }
  }
}
