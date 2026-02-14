import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";

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
    const errorMessage = err instanceof Error ? err.message : "Webhook signature verification failed";
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
        const { error } = await supabase
          .from("orders")
          .update({
            payment_intent_id: session.payment_intent as string,
            status: "pending", // Changed from pending_payment to pending (awaiting restaurant confirmation)
            updated_at: new Date().toISOString(),
          })
          .eq("id", session.metadata?.orderId);

        if (error) {
          console.error("Failed to update order:", error);
          throw error;
        }

        console.log("Order updated successfully:", session.metadata?.orderId);
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
