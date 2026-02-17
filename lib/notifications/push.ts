// lib/notifications/push.ts
import { createClient } from "@/lib/supabase/server";

interface PushNotificationData {
  title: string;
  body: string;
  data?: Record<string, string>;
  userId?: string;
  icon?: string;
  badge?: string;
  image?: string;
}

export async function sendPushNotification(
  notificationData: PushNotificationData,
) {
  const supabase = await createClient();

  try {
    // Get user's FCM tokens from database
    let tokens: string[] = [];

    if (notificationData.userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("fcm_tokens")
        .eq("id", notificationData.userId)
        .single();

      if (profile && profile.fcm_tokens) {
        tokens = Array.isArray(profile.fcm_tokens)
          ? profile.fcm_tokens
          : [profile.fcm_tokens];
      }
    }

    if (tokens.length === 0) {
      console.log("No FCM tokens found for user");
      return { success: false, error: "No tokens found" };
    }

    // Send notification using Firebase Admin SDK
    const response = await fetch(
      "https://fcm.googleapis.com/v1/projects/YOUR_PROJECT_ID/messages:send",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getAccessToken()}`,
        },
        body: JSON.stringify({
          message: {
            token: tokens[0], // Send to first token (can batch for multiple)
            notification: {
              title: notificationData.title,
              body: notificationData.body,
              image: notificationData.image,
            },
            data: notificationData.data || {},
            webpush: {
              fcm_options: {
                link: notificationData.data?.url || "/orders",
              },
              notification: {
                icon: notificationData.icon || "/icons/icon-192x192.png",
                badge: notificationData.badge || "/icons/badge-72x72.png",
                vibrate: [200, 100, 200],
                tag: notificationData.data?.orderId || "order-update",
                requireInteraction: true,
              },
            },
          },
        }),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Failed to send push notification:", error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error("Push notification error:", error);
    return { success: false, error };
  }
}

// Helper to get Firebase access token
async function getAccessToken() {
  // This should use your Firebase service account
  // For production, use @google-cloud/firestore-admin or similar
  return process.env.FCM_SERVER_KEY || "";
}

// Order-specific push notifications
export async function sendOrderPushNotification(
  userId: string,
  orderNumber: string,
  status: string,
  orderId: string,
) {
  const statusMessages: Record<
    string,
    { title: string; body: string; icon: string }
  > = {
    confirmed: {
      title: "Order Confirmed! 🎉",
      body: `Your order #${orderNumber} has been confirmed and is being prepared.`,
      icon: "✅",
    },
    preparing: {
      title: "Order Being Prepared 👨‍🍳",
      body: `Our chefs are preparing your order #${orderNumber}`,
      icon: "🍳",
    },
    ready: {
      title: "Order Ready! 📦",
      body: `Your order #${orderNumber} is ready and will be delivered soon.`,
      icon: "✅",
    },
    out_for_delivery: {
      title: "Out for Delivery 🚗",
      body: `Your order #${orderNumber} is on its way to you!`,
      icon: "🚗",
    },
    delivered: {
      title: "Order Delivered! 🎉",
      body: `Your order #${orderNumber} has been delivered. Enjoy!`,
      icon: "🎉",
    },
    cancelled: {
      title: "Order Cancelled",
      body: `Your order #${orderNumber} has been cancelled.`,
      icon: "❌",
    },
  };

  const message = statusMessages[status] || statusMessages.confirmed;

  return sendPushNotification({
    title: message.title,
    body: message.body,
    userId,
    data: {
      orderId,
      orderNumber,
      status,
      url: `/orders`,
    },
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
  });
}

// Send notification to all admins
export async function sendAdminPushNotification(
  title: string,
  body: string,
  data?: Record<string, string>,
) {
  const supabase = await createClient();

  try {
    // Get all admin FCM tokens
    const { data: admins } = await supabase
      .from("profiles")
      .select("fcm_tokens")
      .eq("role", "admin")
      .not("fcm_tokens", "is", null);

    if (!admins || admins.length === 0) {
      return { success: false, error: "No admin tokens found" };
    }

    // Send to all admins
    const promises = admins.map((admin) => {
      const tokens = Array.isArray(admin.fcm_tokens)
        ? admin.fcm_tokens
        : [admin.fcm_tokens];

      return Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        tokens.map((token) =>
          sendPushNotification({
            title,
            body,
            data,
          }),
        ),
      );
    });

    await Promise.all(promises);

    return { success: true };
  } catch (error) {
    console.error("Admin push notification error:", error);
    return { success: false, error };
  }
}
