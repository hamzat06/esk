import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware";

// Map routes to required permissions
const ROUTE_PERMISSIONS: Record<string, string> = {
  "/admin/products": "products",
  "/admin/orders": "orders",
  "/admin/customers": "customers",
  "/admin/categories": "categories",
  "/admin/catering": "catering",
  "/admin/settings": "settings",
  "/admin/analytics": "analytics",
};

// Routes that only super admins can access
const SUPER_ADMIN_ONLY_ROUTES = ["/admin/admins"];

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request);

  // Validate user by contacting the Supabase Auth server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user profile with role AND permissions if authenticated
  let userRole: string | null = null;
  let userPermissions: string[] | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, permissions")
      .eq("id", user.id)
      .single();

    userRole = profile?.role || null;
    userPermissions = profile?.permissions || null;
  }

  // Helper function to check if user is super admin
  const isSuperAdmin = () => {
    return userRole === "admin" && userPermissions === null;
  };

  // Helper function to check if user has permission
  const hasPermission = (permission: string) => {
    if (isSuperAdmin()) return true; // Super admins have all permissions
    if (!userPermissions) return false; // No permissions array = no access
    return userPermissions.includes(permission);
  };

  // Admin-only routes
  const adminRoutes = ["/admin"];
  const isAdminRoute = adminRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );

  if (isAdminRoute) {
    if (!user) {
      // Not logged in - redirect to signin
      const redirectUrl = new URL("/signin", request.url);
      redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    if (userRole !== "admin") {
      // Logged in but not admin - redirect to home with error
      const redirectUrl = new URL("/", request.url);
      redirectUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(redirectUrl);
    }

    // Check if this is a super admin only route
    const isSuperAdminRoute = SUPER_ADMIN_ONLY_ROUTES.some((route) =>
      request.nextUrl.pathname.startsWith(route),
    );

    if (isSuperAdminRoute && !isSuperAdmin()) {
      // Not a super admin - redirect to main admin page
      const redirectUrl = new URL("/admin", request.url);
      redirectUrl.searchParams.set("error", "super_admin_required");
      return NextResponse.redirect(redirectUrl);
    }

    // Check permission-specific routes
    // Only check if NOT super admin (super admins bypass this)
    if (!isSuperAdmin()) {
      for (const [route, permission] of Object.entries(ROUTE_PERMISSIONS)) {
        if (request.nextUrl.pathname.startsWith(route)) {
          if (!hasPermission(permission)) {
            // No permission - redirect to admin dashboard
            const redirectUrl = new URL("/admin", request.url);
            redirectUrl.searchParams.set("error", "no_permission");
            redirectUrl.searchParams.set("required", permission);
            return NextResponse.redirect(redirectUrl);
          }
        }
      }
    }

    // Allow access to main /admin route for all admins
    // This is the dashboard where they see only what they have access to
  }

  // Protected routes (require any authenticated user)
  const protectedRoutes = ["/orders", "/profile"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );

  if (isProtectedRoute && !user) {
    const redirectUrl = new URL("/signin", request.url);
    redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Auth routes - redirect to home if already authenticated
  const authRoutes = ["/signin", "/signup"];
  const isAuthRoute = authRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );

  if (isAuthRoute && user) {
    // Redirect admins to admin dashboard, others to home
    const redirectUrl =
      userRole === "admin"
        ? new URL("/admin", request.url)
        : new URL("/", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
