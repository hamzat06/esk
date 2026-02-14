import z from "zod";

export const signupSchema = z.object({
  email: z.email(),
  name: z.string(),
  phone: z.string(),
  password: z.string(),
});

export type SignupT = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  phone: z.string(),
  password: z.string(),
});

export type LoginT = z.infer<typeof loginSchema>;

export type UserRole = "customer" | "admin";

export type UserProfile = {
  id: string; // matches auth.users.id
  fullName: string;
  email: string;
  phone?: string | null;
  role: UserRole; // customer or admin

  // Default delivery address (optional, only for customers)
  defaultAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  } | null;

  // Admin-specific fields (optional)
  permissions?: string[] | null; // e.g., ["manage_orders", "manage_products"]

  // Timestamps
  createdAt: string;
  updatedAt: string;
};
