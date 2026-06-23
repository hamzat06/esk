import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await request.json();
    const { items, orderType, deliveryAddress, notes, guestName, guestEmail } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!deliveryAddress) {
      return NextResponse.json(
        { error: "Delivery address is required" },
        { status: 400 },
      );
    }

    if (!user) {
      if (!guestName || !guestEmail) {
        return NextResponse.json(
          { error: "Name and email are required" },
          { status: 400 },
        );
      }
    }

    const isPickup = orderType === "pickup";

    const { data: shopInfoData } = await supabaseAdmin
      .from("shop_settings")
      .select("value")
      .eq("key", "shop_info")
      .single();

    const deliveryFee = isPickup ? 0 : (shopInfoData?.value?.deliveryFee || 2.99);

    const subtotal = items.reduce(
      (sum: number, item: { totalPrice: number }) => sum + item.totalPrice,
      0,
    );
    const tax = subtotal * 0.08;
    const total = subtotal + deliveryFee + tax;

    const { data: orderNumberData, error: orderNumberError } =
      await supabaseAdmin.rpc("generate_order_number");

    if (orderNumberError) throw orderNumberError;

    const orderNumber = orderNumberData as string;

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: user?.id || null,
        guest_name: user ? null : guestName,
        guest_email: user ? null : guestEmail,
        items,
        subtotal,
        delivery_fee: deliveryFee,
        tax,
        total,
        delivery_address: deliveryAddress,
        status: "pending_payment",
        notes: notes || null,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const lineItems = items.map(
      (item: {
        title: string;
        image?: string;
        totalPrice: number;
        quantity: number;
      }) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.title,
            images: item.image
              ? [
                  `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${item.image}`,
                ]
              : [],
          },
          unit_amount: Math.round((item.totalPrice / item.quantity) * 100),
        },
        quantity: item.quantity,
      }),
    );

    if (!isPickup) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Delivery Fee" },
          unit_amount: Math.round(deliveryFee * 100),
        },
        quantity: 1,
      });
    }

    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: { name: "Tax (8%)" },
        unit_amount: Math.round(tax * 100),
      },
      quantity: 1,
    });

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/checkout/cancel`,
      metadata: {
        orderId: order.id,
        userId: user?.id || "",
      },
      customer_email: user?.email || guestEmail,
    });

    await supabaseAdmin
      .from("orders")
      .update({ stripe_session_id: stripeSession.id })
      .eq("id", order.id);

    return NextResponse.json({
      sessionId: stripeSession.id,
      url: stripeSession.url,
      orderId: order.id,
    });
  } catch (error: unknown) {
    console.error("Checkout error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create checkout session";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
