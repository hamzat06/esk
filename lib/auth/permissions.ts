/**
 * Authorization and Permission Utilities
 * Provides centralized permission checking for admin routes and actions
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type Permission =
  | "products"
  | "orders"
  | "customers"
  | "categories"
  | "catering"
  | "settings"
  | "analytics"
  | "admins";

export interface UserProfile {
  id: string;
  role: "customer" | "admin";
  permissions: Permission[] | null;
  full_name: string;
  email: string;
}

/**
 * Get current user with profile including role and permissions
 */
export async function getCurrentUserWithProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, permissions, full_name, email")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return profile as UserProfile;
}

/**
 * Check if user is a super admin (admin with null permissions)
 */
export function isSuperAdmin(profile: UserProfile | null): boolean {
  if (!profile) return false;
  return profile.role === "admin" && profile.permissions === null;
}

/**
 * Check if user has a specific permission
 * Super admins automatically have all permissions
 */
export function hasPermission(
  profile: UserProfile | null,
  permission: Permission,
): boolean {
  if (!profile) return false;
  if (isSuperAdmin(profile)) return true;
  if (!profile.permissions) return false;
  return profile.permissions.includes(permission);
}

/**
 * Check if user has ANY of the provided permissions
 */
export function hasAnyPermission(
  profile: UserProfile | null,
  permissions: Permission[],
): boolean {
  if (!profile) return false;
  if (isSuperAdmin(profile)) return true;
  if (!profile.permissions) return false;
  return permissions.some((p) => profile.permissions?.includes(p));
}

/**
 * Check if user has ALL of the provided permissions
 */
export function hasAllPermissions(
  profile: UserProfile | null,
  permissions: Permission[],
): boolean {
  if (!profile) return false;
  if (isSuperAdmin(profile)) return true;
  if (!profile.permissions) return false;
  return permissions.every((p) => profile.permissions?.includes(p));
}

/**
 * Require authentication - redirect to signin if not authenticated
 */
export async function requireAuth(redirectPath?: string): Promise<UserProfile> {
  const profile = await getCurrentUserWithProfile();

  if (!profile) {
    const path = redirectPath || "/signin";
    redirect(path);
  }

  return profile;
}

/**
 * Require admin role - redirect if not admin
 */
export async function requireAdmin(): Promise<UserProfile> {
  const profile = await requireAuth();

  if (profile.role !== "admin") {
    redirect("/?error=unauthorized");
  }

  return profile;
}

/**
 * Require super admin - redirect if not super admin
 */
export async function requireSuperAdmin(): Promise<UserProfile> {
  const profile = await requireAdmin();

  if (!isSuperAdmin(profile)) {
    redirect("/admin?error=super_admin_required");
  }

  return profile;
}

/**
 * Require specific permission - redirect if permission not granted
 */
export async function requirePermission(
  permission: Permission,
): Promise<UserProfile> {
  const profile = await requireAdmin();

  if (!hasPermission(profile, permission)) {
    redirect(`/admin?error=no_permission&required=${permission}`);
  }

  return profile;
}

/**
 * Require any of the provided permissions
 */
export async function requireAnyPermission(
  permissions: Permission[],
): Promise<UserProfile> {
  const profile = await requireAdmin();

  if (!hasAnyPermission(profile, permissions)) {
    redirect(`/admin?error=no_permission&required=${permissions.join(",")}`);
  }

  return profile;
}

/**
 * Require all of the provided permissions
 */
export async function requireAllPermissions(
  permissions: Permission[],
): Promise<UserProfile> {
  const profile = await requireAdmin();

  if (!hasAllPermissions(profile, permissions)) {
    redirect(`/admin?error=no_permission&required=${permissions.join(",")}`);
  }

  return profile;
}

/**
 * Check permission without redirecting - returns boolean
 * Useful for conditional rendering or server actions
 */
export async function checkPermission(
  permission: Permission,
): Promise<boolean> {
  const profile = await getCurrentUserWithProfile();
  return hasPermission(profile, permission);
}

/**
 * Validate API request - for use in API routes
 * Returns profile or throws error with status code
 */
export async function validateApiAuth(): Promise<{
  profile: UserProfile;
  supabase: Awaited<ReturnType<typeof createClient>>;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, permissions, full_name, email")
    .eq("id", user.id)
    .single();

  if (!profile) {
    throw new Error("Profile not found");
  }

  return { profile: profile as UserProfile, supabase };
}

/**
 * Validate API request requires admin
 */
export async function validateApiAdmin(): Promise<{
  profile: UserProfile;
  supabase: Awaited<ReturnType<typeof createClient>>;
}> {
  const { profile, supabase } = await validateApiAuth();

  if (profile.role !== "admin") {
    throw new Error("Admin access required");
  }

  return { profile, supabase };
}

/**
 * Validate API request requires specific permission
 */
export async function validateApiPermission(permission: Permission): Promise<{
  profile: UserProfile;
  supabase: Awaited<ReturnType<typeof createClient>>;
}> {
  const { profile, supabase } = await validateApiAdmin();

  if (!hasPermission(profile, permission)) {
    throw new Error(`Permission required: ${permission}`);
  }

  return { profile, supabase };
}
