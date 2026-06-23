import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOrderConfirmationEmail } from "@/lib/notifications/email";
import { sendPushToAdmins } from "@/lib/notifications/push";

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
      err instanceof Error ? err.message : "Webhook signature verification failed";
    return NextResponse.json(
      { error: `Webhook Error: ${errorMessage}` },
      { status: 400 },
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;

      try {
        const supabaseAdmin = createAdminClient();

        const { data: order, error } = await supabaseAdmin
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

        const customerName =
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (order.profiles as any)?.full_name || order.guest_name || "Customer";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const customerEmail = (order.profiles as any)?.email || order.guest_email;

        if (order && customerEmail) {
          try {
            await sendOrderConfirmationEmail({
              orderId: order.id,
              orderNumber: order.order_number,
              customerName,
              customerEmail,
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
          }

          // Notify admins of new order via push
          sendPushToAdmins({
            title: "New Order! 🛎️",
            body: `Order #${order.order_number} from ${customerName} — $${Number(order.total).toFixed(2)}`,
            url: "/admin/orders",
          }).catch((e) => console.error("Admin push failed:", e));
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
      const session = event.data.object;

      try {
        const supabaseAdmin = createAdminClient();

        await supabaseAdmin
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
