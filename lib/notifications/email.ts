// lib/notifications/email.ts
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
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  status: string;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  // Format items for email
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

  const emailHtml = `
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
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #A62828; padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; font-family: 'Playfair Display', Georgia, serif;">
                EddySylva Kitchen
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; background-color: #10b981; border-radius: 50%; padding: 20px;">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
              
              <h2 style="color: #1f2937; margin: 0 0 10px; font-size: 24px; font-weight: 600; text-align: center;">
                Order Confirmed! 🎉
              </h2>
              <p style="text-align: center; color: #6b7280; margin: 0 0 30px;">
                Order #${data.orderNumber}
              </p>
              
              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px;">
                Hi ${data.customerName},
              </p>
              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px;">
                Thank you for your order! We've received it and our kitchen is getting started. You'll receive another email when your order is ready for delivery.
              </p>
              
              <!-- Order Details -->
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; margin: 30px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 15px; font-size: 16px; font-weight: 600; color: #1f2937;">
                  Order Details
                </h3>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <thead>
                    <tr style="background-color: #f3f4f6;">
                      <th style="padding: 12px; text-align: left; font-size: 14px; color: #6b7280;">Item</th>
                      <th style="padding: 12px; text-align: center; font-size: 14px; color: #6b7280;">Qty</th>
                      <th style="padding: 12px; text-align: right; font-size: 14px; color: #6b7280;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="2" style="padding: 12px; text-align: right; color: #6b7280;">Subtotal:</td>
                      <td style="padding: 12px; text-align: right; font-weight: 600;">$${data.subtotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td colspan="2" style="padding: 12px; text-align: right; color: #6b7280;">Delivery Fee:</td>
                      <td style="padding: 12px; text-align: right; font-weight: 600;">$${data.deliveryFee.toFixed(2)}</td>
                    </tr>
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
              
              <!-- Delivery Address -->
              <div style="margin: 30px 0;">
                <h3 style="margin: 0 0 10px; font-size: 16px; font-weight: 600; color: #1f2937;">
                  Delivery Address
                </h3>
                <p style="margin: 0; color: #4b5563; line-height: 1.6;">
                  ${data.deliveryAddress.street}<br>
                  ${data.deliveryAddress.city}, ${data.deliveryAddress.state} ${data.deliveryAddress.zipCode}
                </p>
              </div>
              
              <!-- Track Order Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/orders" style="display: inline-block; background-color: #A62828; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Track Your Order
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0;">
                Questions about your order? Reply to this email or contact us at <a href="mailto:support@eddysylvakitchen.com" style="color: #A62828;">support@eddysylvakitchen.com</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                © 2024 EddySylva Kitchen. All rights reserved.<br>
                255 South 60th Street, Philadelphia, PA 19139
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  // Send email using Supabase Edge Function or external service
  // Option 1: Using Resend (recommended)
  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "EddySylva Kitchen <orders@eddysylvakitchen.com>",
          to: data.customerEmail,
          subject: `Order Confirmation - #${data.orderNumber}`,
          html: emailHtml,
        }),
      });

      if (!response.ok) {
        console.error("Failed to send email:", await response.text());
        return { success: false, error: "Failed to send email" };
      }

      return { success: true };
    } catch (error) {
      console.error("Email error:", error);
      return { success: false, error };
    }
  }

  console.warn(
    "No email service configured. Please set RESEND_API_KEY or SENDGRID_API_KEY",
  );
  return { success: false, error: "No email service configured" };
}

// Send order status update email
export async function sendOrderStatusEmail(
  orderId: string,
  newStatus: string,
  customerEmail: string,
  customerName: string,
  orderNumber: string,
) {
  const statusMessages: Record<
    string,
    { title: string; message: string; color: string }
  > = {
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
      message: "Your order has been delivered. Enjoy your meal!",
      color: "#10b981",
    },
    cancelled: {
      title: "Order Cancelled",
      message:
        "Your order has been cancelled. If you have questions, please contact us.",
      color: "#ef4444",
    },
  };

  const statusInfo = statusMessages[newStatus] || statusMessages.confirmed;

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Order Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="background-color: #A62828; padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
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
              
              <h2 style="color: #1f2937; margin: 0 0 10px; text-align: center;">
                ${statusInfo.title}
              </h2>
              <p style="text-align: center; color: #6b7280; margin: 0 0 30px;">
                Order #${orderNumber}
              </p>
              
              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px;">
                Hi ${customerName},
              </p>
              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px;">
                ${statusInfo.message}
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/orders" style="display: inline-block; background-color: #A62828; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600;">
                      View Order Status
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                © 2024 EddySylva Kitchen
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  // Send using configured service
  if (process.env.RESEND_API_KEY) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "EddySylva Kitchen <orders@eddysylvakitchen.com>",
        to: customerEmail,
        subject: `${statusInfo.title} - Order #${orderNumber}`,
        html: emailHtml,
      }),
    });
  } else if (process.env.SENDGRID_API_KEY) {
    await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: customerEmail, name: customerName }],
          },
        ],
        from: {
          email: "orders@eddysylvakitchen.com",
          name: "EddySylva Kitchen",
        },
        subject: `${statusInfo.title} - Order #${orderNumber}`,
        content: [
          {
            type: "text/html",
            value: emailHtml,
          },
        ],
      }),
    });
  }
}
