import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";
import { sendOrderConfirmationEmail } from "@/lib/notifications/email";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 },
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err: unknown) {
    console.error("Webhook signature verification failed:", err);
    const errorMessage =
      err instanceof Error
        ? err.message
        : "Webhook signature verification failed";
    return NextResponse.json(
      { error: `Webhook Error: ${errorMessage}` },
      { status: 400 },
    );
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;

      try {
        const supabase = await createClient();

        // Update order with payment information
        const { data: order, error } = await supabase
          .from("orders")
          .update({
            payment_intent_id: session.payment_intent as string,
            status: "pending",
            updated_at: new Date().toISOString(),
          })
          .eq("id", session.metadata?.orderId)
          .select(
            `
            *,
            profiles:user_id (full_name, email)
          `,
          )
          .single();

        if (error) {
          console.error("Failed to update order:", error);
          throw error;
        }

        console.log("Order updated successfully:", session.metadata?.orderId);

        // Send order confirmation email
        if (order && order.profiles) {
          try {
            await sendOrderConfirmationEmail({
              orderId: order.id,
              orderNumber: order.order_number,
              customerName: order.profiles.full_name,
              customerEmail: order.profiles.email,
              items: order.items,
              subtotal: order.subtotal,
              deliveryFee: order.delivery_fee,
              tax: order.tax,
              total: order.total,
              deliveryAddress: order.delivery_address,
              status: order.status,
            });

            console.log("Order confirmation email sent:", order.order_number);
          } catch (emailError) {
            console.error("Failed to send confirmation email:", emailError);
            // Don't fail the webhook if email fails
          }
        }
      } catch (error) {
        console.error("Error processing webhook:", error);
        return NextResponse.json(
          { error: "Failed to process payment confirmation" },
          { status: 500 },
        );
      }
      break;
    }

    case "checkout.session.expired": {
      // Handle expired checkout sessions
      const session = event.data.object;

      try {
        const supabase = await createClient();

        // Optionally update order status to cancelled
        await supabase
          .from("orders")
          .update({
            status: "cancelled",
            updated_at: new Date().toISOString(),
          })
          .eq("id", session.metadata?.orderId);

        console.log("Expired session cancelled:", session.metadata?.orderId);
      } catch (error) {
        console.error("Error handling expired session:", error);
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
