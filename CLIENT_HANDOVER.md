# EddySylva Kitchen — Platform Handover Document

**Prepared by:** Hamzat Ajanaku  
**Date:** May 2026  
**Platform:** EddySylva Kitchen Online Ordering & Management System

---

## Overview

EddySylva Kitchen is a full-featured restaurant web platform built for online ordering, catering bookings, and back-office management. Customers can browse the menu, add items to their cart, and pay securely — without needing to create an account. The admin panel gives you and your team complete control over orders, products, customers, and shop settings.

---

## What Was Built

### Customer-Facing Website

The public website is what your customers see and interact with.

**Homepage**
- Full menu browsing with category filters and search
- Product cards showing name, price, and availability
- Restaurant info: address, hours, delivery fee, ratings
- Promotional banners (fully manageable from the admin panel)
- Catering enquiry form (auto-prompts after a few seconds)

**Shopping Cart**
- Persistent cart — items are saved even if the browser is closed
- Supports product options/variants (e.g. sizes, extras)
- Live price breakdown: subtotal, delivery fee, 8% tax, total

**Checkout**
- Guests can order without creating an account
- Signed-in customers have their name and address pre-filled
- Secure payment via Stripe (card only)
- Order confirmation email sent automatically after payment

**Order History**
- Signed-in customers can view all their past orders and current status
- Each order shows items, breakdown, delivery address, and status

**Authentication**
- Sign up / Sign in with email and password
- Forgot password and reset password flows

---

### Admin Panel (`/admin`)

The admin panel is only accessible to accounts with the admin role.

#### Dashboard
A quick overview of your business:
- Total orders and revenue
- Today's orders
- Orders currently being prepared or ready
- Total customer count

#### Orders
- View all incoming orders in real time
- Update order status step by step:
  `Pending → Confirmed → Preparing → Ready → Delivered`
- Customer contact info visible on each order
- Filter and search orders

#### Products
- Add, edit, or remove menu items
- Upload product photos
- Set price, category, and stock status (in stock / out of stock)
- Configure product options (e.g. portion sizes, add-ons)

#### Categories
- Create and manage menu categories (e.g. Rice Dishes, Soups, Drinks)
- Products are assigned to categories for organised browsing

#### Customers
- View all registered customers
- Promote a customer to admin (with selective permissions)
- Edit customer details

#### Catering Bookings
- View all catering enquiry submissions
- See event details: type, date, guest count, venue, budget range
- Add internal notes and provide a quote amount
- Update booking status

#### Admins
- *(Super Admin only)* Manage all admin accounts
- Set specific permissions for each admin
- Demote admins back to customer if needed

#### Settings
- **Shop Info** — Name, address, phone, email, delivery fee, minimum order, description
- **Banners** — Upload and manage homepage promotional banners
- **Opening Hours** — Set hours per day of the week, mark days as closed
- **Holidays** — Define closure dates for public holidays or special events

#### Analytics
- Page view trends
- Customer growth over time
- Order volume and revenue charts
- Product performance

---

## Admin Roles & Permissions

There are two types of admin:

| Type | What they can access |
|---|---|
| **Super Admin** | Everything — full access, no restrictions |
| **Regular Admin** | Only the sections you explicitly grant them |

**Available permissions you can assign:**
- `products` — Product management
- `orders` — Order management
- `customers` — Customer management
- `categories` — Category management
- `catering` — Catering bookings
- `settings` — Shop settings
- `analytics` — Analytics dashboard

To make someone a Super Admin, run the following SQL in your Supabase SQL Editor (replace the email):

```sql
UPDATE public.profiles
SET role = 'admin', permissions = NULL
WHERE email = 'person@example.com';
```

---

## How Orders Work

### Guest Order (no account required)
1. Customer browses the menu and adds items to cart
2. Goes to checkout, fills in name, email, delivery address
3. Pays via Stripe
4. Order is created in the system
5. Confirmation email is sent to the customer
6. Order appears in your admin Orders panel

### Signed-In Order
Same as above, except name and saved address are pre-filled, and the customer can view their full order history at `/orders`.

### Order Status Emails
Customers receive an automatic email when their order is confirmed. You can manage the status of each order from the admin panel.

---

## Integrations & Services

| Service | Purpose |
|---|---|
| **Stripe** | Payment processing (card payments) |
| **Supabase** | Database, authentication, and file storage |
| **Cloudinary** | Product image hosting and optimisation |
| **Resend** | Order confirmation and notification emails |

---

## Technology Stack

The platform is built on modern, production-grade technology:

- **Next.js** — Web framework (server-side rendering for speed and SEO)
- **React** — User interface
- **TypeScript** — Type-safe codebase
- **Supabase (PostgreSQL)** — Database and authentication
- **Tailwind CSS** — Styling
- **Stripe** — Payments
- **Cloudinary** — Image management
- **Resend** — Email delivery

---

## What You Need to Keep Running

To keep the platform live and operational, the following accounts/services must remain active:

1. **Supabase** — Database and auth. Keep the project active; do not delete it.
2. **Stripe** — Payment processing. Keep the account in good standing.
3. **Cloudinary** — Image hosting. Product photos are served from here.
4. **Resend** — Email delivery. Used for order confirmation emails.
5. **Hosting** — The app is deployed and served from your hosting provider (e.g. Vercel).

---

## Things Only the Developer Can Help With

The following require developer access and cannot be done from the admin panel:

- Changing the overall design or layout
- Adding new pages or features
- Integrating new payment methods
- Database schema changes
- Updating environment variables / API keys
- Deploying code updates

---

## Contact

For technical support or future feature requests, contact:

**Hamzat Ajanaku**  
Developer

---

*This document covers the platform as delivered in May 2026.*
