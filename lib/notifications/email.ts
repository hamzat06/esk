interface OrderEmailData {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    title: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  deliveryAddress: {
    type?: "delivery" | "pickup";
    address?: string;
  };
  status: string;
}

const FROM = "EddySylva Kitchen <orders@eddysylvakitchen.us>";
const SUPPORT_EMAIL = "info.eddysylvakitchen@gmail.com";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.eddysylvakitchen.us";

const FOOTER = `
  <tr>
    <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #9ca3af; margin: 0 0 4px; font-size: 12px;">
        © ${new Date().getFullYear()} EddySylva Kitchen. All rights reserved.
      </p>
      <p style="color: #9ca3af; margin: 0; font-size: 12px;">
        255 South 60th Street, Philadelphia, PA 19139
      </p>
    </td>
  </tr>
`;

async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — email not sent");
    return { success: false, error: "No email service configured" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", err);
      return { success: false, error: err };
    }

    return { success: true };
  } catch (error) {
    console.error("Email error:", error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail(customerName: string, customerEmail: string) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to EddySylva Kitchen</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 600px;">
          <tr>
            <td style="background-color: #A62828; padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; font-family: Georgia, serif;">
                EddySylva Kitchen
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; background-color: #A62828; border-radius: 50%; padding: 20px;">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                    <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" stroke="white" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </div>
              </div>

              <h2 style="color: #1f2937; margin: 0 0 8px; font-size: 24px; font-weight: 600; text-align: center;">
                Welcome, ${customerName}! 🎉
              </h2>
              <p style="text-align: center; color: #6b7280; margin: 0 0 30px;">
                Your account has been created successfully
              </p>

              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px;">
                Thank you for joining EddySylva Kitchen! We're excited to have you.
                You can now order your favourite meals, track your orders, and save your delivery addresses for faster checkout.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${SITE_URL}" style="display: inline-block; background-color: #A62828; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Start Ordering
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
                Questions? Contact us at
                <a href="mailto:${SUPPORT_EMAIL}" style="color: #A62828;">${SUPPORT_EMAIL}</a>
              </p>
            </td>
          </tr>
          ${FOOTER}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return sendEmail(customerEmail, "Welcome to EddySylva Kitchen!", html);
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  const itemsHtml = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <strong>${item.title}</strong>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        $${item.totalPrice.toFixed(2)}
      </td>
    </tr>
  `,
    )
    .join("");

  const addressHtml =
    data.deliveryAddress.type === "pickup"
      ? `<p style="margin: 0; color: #4b5563;">Pickup — please collect your order in store.</p>`
      : `<p style="margin: 0; color: #4b5563; line-height: 1.6;">${data.deliveryAddress.address ?? ""}</p>`;

  const deliveryFeeRow =
    data.deliveryFee > 0
      ? `<tr>
          <td colspan="2" style="padding: 12px; text-align: right; color: #6b7280;">Delivery Fee:</td>
          <td style="padding: 12px; text-align: right; font-weight: 600;">$${data.deliveryFee.toFixed(2)}</td>
        </tr>`
      : "";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 600px;">
          <tr>
            <td style="background-color: #A62828; padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; font-family: Georgia, serif;">
                EddySylva Kitchen
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; background-color: #10b981; border-radius: 50%; padding: 20px;">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>

              <h2 style="color: #1f2937; margin: 0 0 8px; font-size: 24px; font-weight: 600; text-align: center;">
                Order Confirmed! 🎉
              </h2>
              <p style="text-align: center; color: #6b7280; margin: 0 0 30px;">
                Order #${data.orderNumber}
              </p>

              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 10px;">Hi ${data.customerName},</p>
              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px;">
                Thank you for your order! We've received it and our kitchen is getting started.
                You'll receive another email when your order status changes.
              </p>

              <!-- Order Items -->
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; margin: 0 0 30px; border-radius: 8px;">
                <h3 style="margin: 0 0 15px; font-size: 16px; font-weight: 600; color: #1f2937;">Order Details</h3>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <thead>
                    <tr style="background-color: #f3f4f6;">
                      <th style="padding: 12px; text-align: left; font-size: 14px; color: #6b7280;">Item</th>
                      <th style="padding: 12px; text-align: center; font-size: 14px; color: #6b7280;">Qty</th>
                      <th style="padding: 12px; text-align: right; font-size: 14px; color: #6b7280;">Price</th>
                    </tr>
                  </thead>
                  <tbody>${itemsHtml}</tbody>
                  <tfoot>
                    <tr>
                      <td colspan="2" style="padding: 12px; text-align: right; color: #6b7280;">Subtotal:</td>
                      <td style="padding: 12px; text-align: right; font-weight: 600;">$${data.subtotal.toFixed(2)}</td>
                    </tr>
                    ${deliveryFeeRow}
                    <tr>
                      <td colspan="2" style="padding: 12px; text-align: right; color: #6b7280;">Tax:</td>
                      <td style="padding: 12px; text-align: right; font-weight: 600;">$${data.tax.toFixed(2)}</td>
                    </tr>
                    <tr style="border-top: 2px solid #e5e7eb;">
                      <td colspan="2" style="padding: 12px; text-align: right; font-size: 18px; font-weight: 600; color: #1f2937;">Total:</td>
                      <td style="padding: 12px; text-align: right; font-size: 18px; font-weight: 600; color: #A62828;">$${data.total.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <!-- Address -->
              <div style="margin: 0 0 30px;">
                <h3 style="margin: 0 0 10px; font-size: 16px; font-weight: 600; color: #1f2937;">
                  ${data.deliveryAddress.type === "pickup" ? "Pickup" : "Delivery Address"}
                </h3>
                ${addressHtml}
              </div>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${SITE_URL}/orders" style="display: inline-block; background-color: #A62828; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Track Your Order
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
                Questions? Reply to this email or contact us at
                <a href="mailto:${SUPPORT_EMAIL}" style="color: #A62828;">${SUPPORT_EMAIL}</a>
              </p>
            </td>
          </tr>
          ${FOOTER}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return sendEmail(data.customerEmail, `Order Confirmation - #${data.orderNumber}`, html);
}

export interface CateringBookingData {
  full_name: string;
  email: string;
  phone: string;
  event_type: string;
  event_date: string;
  event_time?: string;
  guest_count: number;
  venue_address: string;
  service_type: string;
  menu_preferences?: string;
  budget_range?: string;
  special_requests?: string;
}

export async function sendCateringCustomerEmail(data: CateringBookingData) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Catering Booking Received</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 600px;">
          <tr>
            <td style="background-color: #A62828; padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; font-family: Georgia, serif;">EddySylva Kitchen</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; background-color: #10b981; border-radius: 50%; padding: 20px;">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
              <h2 style="color: #1f2937; margin: 0 0 8px; font-size: 24px; font-weight: 600; text-align: center;">Booking Request Received!</h2>
              <p style="text-align: center; color: #6b7280; margin: 0 0 30px;">We'll be in touch with you shortly</p>

              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 10px;">Hi ${data.full_name},</p>
              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px;">
                Thank you for your catering inquiry! We've received your booking request and our team will review it and get back to you as soon as possible.
              </p>

              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 0 0 30px;">
                <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #1f2937;">Your Booking Details</h3>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px; width: 40%;">Event Type</td><td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${data.event_type}</td></tr>
                  <tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Event Date</td><td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${data.event_date}${data.event_time ? " at " + data.event_time : ""}</td></tr>
                  <tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Guest Count</td><td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${data.guest_count} guests</td></tr>
                  <tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Venue</td><td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${data.venue_address}</td></tr>
                  <tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Service Type</td><td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${data.service_type}</td></tr>
                  ${data.budget_range ? `<tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Budget Range</td><td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${data.budget_range}</td></tr>` : ""}
                  ${data.menu_preferences ? `<tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Menu Preferences</td><td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${data.menu_preferences}</td></tr>` : ""}
                  ${data.special_requests ? `<tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Special Requests</td><td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${data.special_requests}</td></tr>` : ""}
                </table>
              </div>

              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
                Have questions? Contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color: #A62828;">${SUPPORT_EMAIL}</a>
              </p>
            </td>
          </tr>
          ${FOOTER}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return sendEmail(data.email, "Catering Booking Request Received — EddySylva Kitchen", html);
}

export async function sendCateringAdminEmail(data: CateringBookingData) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Catering Booking</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 600px;">
          <tr>
            <td style="background-color: #A62828; padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; font-family: Georgia, serif;">EddySylva Kitchen</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #1f2937; margin: 0 0 8px; font-size: 24px; font-weight: 600;">New Catering Booking Request</h2>
              <p style="color: #6b7280; margin: 0 0 30px;">A customer has submitted a catering inquiry.</p>

              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 0 0 24px;">
                <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #1f2937;">Contact Information</h3>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px; width: 35%;">Name</td><td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${data.full_name}</td></tr>
                  <tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Email</td><td style="padding: 6px 0; font-size: 14px;"><a href="mailto:${data.email}" style="color: #A62828;">${data.email}</a></td></tr>
                  <tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Phone</td><td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${data.phone}</td></tr>
                </table>
              </div>

              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 0 0 30px;">
                <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #1f2937;">Event Details</h3>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px; width: 35%;">Event Type</td><td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${data.event_type}</td></tr>
                  <tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Date</td><td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${data.event_date}${data.event_time ? " at " + data.event_time : ""}</td></tr>
                  <tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Guests</td><td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${data.guest_count}</td></tr>
                  <tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Venue</td><td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${data.venue_address}</td></tr>
                  <tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Service Type</td><td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${data.service_type}</td></tr>
                  ${data.budget_range ? `<tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Budget</td><td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${data.budget_range}</td></tr>` : ""}
                  ${data.menu_preferences ? `<tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Menu Preferences</td><td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${data.menu_preferences}</td></tr>` : ""}
                  ${data.special_requests ? `<tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Special Requests</td><td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${data.special_requests}</td></tr>` : ""}
                </table>
              </div>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="${SITE_URL}/admin/catering" style="display: inline-block; background-color: #A62828; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      View in Admin Panel
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ${FOOTER}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return sendEmail(SUPPORT_EMAIL, `New Catering Booking — ${data.full_name} (${data.event_date})`, html);
}

export async function sendOrderStatusEmail(
  _orderId: string,
  newStatus: string,
  customerEmail: string,
  customerName: string,
  orderNumber: string,
) {
  const statusMessages: Record<string, { title: string; message: string; color: string }> = {
    confirmed: {
      title: "Order Confirmed",
      message: "Your order has been confirmed and our kitchen is preparing it!",
      color: "#3b82f6",
    },
    preparing: {
      title: "Order Being Prepared",
      message: "Our chefs are hard at work preparing your delicious meal!",
      color: "#f59e0b",
    },
    ready: {
      title: "Order Ready",
      message: "Your order is ready and will be delivered shortly!",
      color: "#10b981",
    },
    out_for_delivery: {
      title: "Out for Delivery",
      message: "Your order is on its way to you!",
      color: "#8b5cf6",
    },
    delivered: {
      title: "Order Delivered",
      message: "Your order has been delivered. Enjoy your meal! 🍽️",
      color: "#10b981",
    },
    cancelled: {
      title: "Order Cancelled",
      message: "Your order has been cancelled. If you have any questions, please contact us.",
      color: "#ef4444",
    },
  };

  const statusInfo = statusMessages[newStatus];
  if (!statusInfo) return { success: false, error: "Unknown status" };

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 600px;">
          <tr>
            <td style="background-color: #A62828; padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; font-family: Georgia, serif;">
                EddySylva Kitchen
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; background-color: ${statusInfo.color}; border-radius: 50%; padding: 20px;">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>

              <h2 style="color: #1f2937; margin: 0 0 8px; font-size: 24px; font-weight: 600; text-align: center;">
                ${statusInfo.title}
              </h2>
              <p style="text-align: center; color: #6b7280; margin: 0 0 30px;">Order #${orderNumber}</p>

              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 10px;">Hi ${customerName},</p>
              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px;">${statusInfo.message}</p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${SITE_URL}/orders" style="display: inline-block; background-color: #A62828; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      View Order Status
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
                Questions? Contact us at
                <a href="mailto:${SUPPORT_EMAIL}" style="color: #A62828;">${SUPPORT_EMAIL}</a>
              </p>
            </td>
          </tr>
          ${FOOTER}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return sendEmail(customerEmail, `${statusInfo.title} - Order #${orderNumber}`, html);
}
