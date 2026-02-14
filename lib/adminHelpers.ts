export function isAdminEmail(email: string): boolean {
  const adminEmails = [
    "admin@eddysylva.com",
    "owner@eddysylva.com",
    // Add more admin emails here
  ];

  return adminEmails.includes(email.toLowerCase());
}

// Admin permissions list
export const ADMIN_PERMISSIONS = {
  MANAGE_ORDERS: "manage_orders",
  MANAGE_PRODUCTS: "manage_products",
  MANAGE_USERS: "manage_users",
  MANAGE_CATEGORIES: "manage_categories",
  VIEW_ANALYTICS: "view_analytics",
} as const;

export type AdminPermission =
  (typeof ADMIN_PERMISSIONS)[keyof typeof ADMIN_PERMISSIONS];
