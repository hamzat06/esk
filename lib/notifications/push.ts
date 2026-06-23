import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

webpush.setVapidDetails(
  "mailto:support@eddysylvakitchen.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

type PushSub = { endpoint: string; p256dh: string; auth_key: string };

async function deliverPush(subs: PushSub[], payload: PushPayload) {
  const dead: string[] = [];
  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
          JSON.stringify(payload),
        );
      } catch (err) {
        // 410 Gone means the subscription is no longer valid — clean it up
        if ((err as { statusCode?: number }).statusCode === 410) dead.push(sub.endpoint);
      }
    }),
  );

  if (dead.length > 0) {
    const supabaseAdmin = createAdminClient();
    await supabaseAdmin.from("push_subscriptions").delete().in("endpoint", dead);
  }
}

export async function sendPushToUser(userId: string, payload: PushPayload) {
  const supabaseAdmin = createAdminClient();
  const { data: subs } = await supabaseAdmin
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth_key")
    .eq("user_id", userId);

  if (!subs || subs.length === 0) return;
  await deliverPush(subs, payload);
}

export async function sendPushToAdmins(payload: PushPayload) {
  const supabaseAdmin = createAdminClient();
  const { data: adminProfiles } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("role", "admin");

  if (!adminProfiles || adminProfiles.length === 0) return;

  const adminIds = adminProfiles.map((p) => p.id);
  const { data: subs } = await supabaseAdmin
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth_key")
    .in("user_id", adminIds);

  if (!subs || subs.length === 0) return;
  await deliverPush(subs, payload);
}

const ORDER_STATUS_MESSAGES: Record<string, { title: string; body: string }> = {
  confirmed: { title: "Order Confirmed! 🎉", body: "Your order #{n} has been confirmed." },
  preparing: { title: "Preparing Your Order 👨‍🍳", body: "Our kitchen is now preparing order #{n}." },
  ready: { title: "Order Ready! 📦", body: "Order #{n} is ready for pickup/delivery." },
  out_for_delivery: { title: "On the Way 🚗", body: "Order #{n} is out for delivery!" },
  delivered: { title: "Delivered! 🎉", body: "Order #{n} has arrived. Enjoy your meal!" },
  cancelled: { title: "Order Cancelled", body: "Order #{n} has been cancelled." },
};

export async function sendOrderStatusPush(
  userId: string,
  orderNumber: string,
  status: string,
) {
  const msg = ORDER_STATUS_MESSAGES[status];
  if (!msg) return;
  await sendPushToUser(userId, {
    title: msg.title,
    body: msg.body.replace("{n}", orderNumber),
    url: "/orders",
  });
}
