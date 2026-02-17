"use client";

import React from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Home,
  ShoppingCart,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Shield,
  Settings,
  BarChart3,
  Package,
  Users,
  FolderKanban,
  PartyPopper,
  Crown,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { SheetClose } from "../ui/sheet";
import { supabase } from "@/lib/supabase/client";
import { useUserProfile } from "@/lib/UseProfileProvider";

// Admin navigation items with required permissions
const ADMIN_LINKS = [
  {
    name: "Admin Dashboard",
    href: "/admin",
    icon: Shield,
    permission: null, // All admins can access
  },
  {
    name: "Categories",
    href: "/admin/categories",
    icon: FolderKanban,
    permission: "categories",
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: Package,
    permission: "products",
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
    permission: "orders",
  },
  {
    name: "Catering",
    href: "/admin/catering",
    icon: PartyPopper,
    permission: "catering",
  },
  {
    name: "Customers",
    href: "/admin/customers",
    icon: Users,
    permission: "customers",
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    permission: "analytics",
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
    permission: "settings",
  },
];

// Super admin only link
const SUPER_ADMIN_LINK = {
  name: "Admins",
  href: "/admin/admins",
  icon: Crown,
  permission: "super_admin_only",
};

const Auth = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading } = useUserProfile();

  const isHome = pathname === "/";
  const isOrders = pathname === "/orders";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  // Check if user is super admin (permissions === null)
  const isSuperAdmin = profile?.permissions === null;

  // Check if user has a specific permission
  const hasPermission = (permission: string | null): boolean => {
    if (!permission) return true; // No permission required
    if (isSuperAdmin) return true; // Super admins have all permissions
    if (permission === "super_admin_only") return isSuperAdmin; // Only super admins
    return profile?.permissions?.includes(permission) || false;
  };

  // Filter admin links based on permissions
  const filteredAdminLinks = ADMIN_LINKS.filter((link) =>
    hasPermission(link.permission),
  );

  // Add super admin link if user is super admin
  const adminLinks = isSuperAdmin
    ? [...filteredAdminLinks, SUPER_ADMIN_LINK]
    : filteredAdminLinks;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="grow h-full flex flex-col justify-between border-t">
      <div className="py-5 flex flex-col gap-y-3 px-5">
        <SheetClose asChild>
          <Button
            asChild
            size="lg"
            className="rounded-full justify-start px-6 gap-3"
            variant={isHome ? "default" : "ghost"}
          >
            <Link href="/">
              <Home className="size-5" />
              Home
            </Link>
          </Button>
        </SheetClose>

        {user && (
          <SheetClose asChild>
            <Button
              asChild
              size="lg"
              className="rounded-full justify-start px-6 gap-3"
              variant={isOrders ? "default" : "ghost"}
            >
              <Link href="/orders">
                <ShoppingCart className="size-5" />
                My Orders
              </Link>
            </Button>
          </SheetClose>
        )}

        {/* Admin Links - Filtered by Permissions */}
        {profile?.role === "admin" && adminLinks.length > 0 && (
          <>
            <div className="px-4 py-2">
              <div className="h-px bg-gray-200" />
              <div className="flex items-center gap-2 mt-3 mb-1 px-2">
                {isSuperAdmin ? (
                  <>
                    <Crown className="size-4 text-amber-600" />
                    <span className="text-xs font-semibold text-amber-600">
                      Super Admin
                    </span>
                  </>
                ) : (
                  <>
                    <Shield className="size-4 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-600">
                      Admin Access
                    </span>
                  </>
                )}
              </div>
            </div>

            {adminLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <SheetClose asChild key={link.href}>
                  <Button
                    asChild
                    size="lg"
                    className="rounded-full justify-start px-6 gap-3"
                    variant={isActive ? "default" : "ghost"}
                  >
                    <Link href={link.href}>
                      <link.icon className="size-5" />
                      {link.name}
                    </Link>
                  </Button>
                </SheetClose>
              );
            })}
          </>
        )}

        {/* Show message if admin has no permissions */}
        {profile?.role === "admin" &&
          !isSuperAdmin &&
          (!profile?.permissions || profile.permissions.length === 0) && (
            <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl mt-2">
              <p className="text-xs text-amber-800">
                You don&apos;t have any admin permissions yet. Contact a super
                admin to grant you access.
              </p>
            </div>
          )}
      </div>

      <div className="py-5 flex flex-col gap-y-3 px-6 border-t">
        {user ? (
          <>
            {/* User Info */}
            <div className="px-4 py-3 bg-gray-50 rounded-xl mb-2">
              <div className="flex items-center gap-3">
                <div
                  className={`size-10 rounded-full flex items-center justify-center ${
                    profile?.role === "admin"
                      ? isSuperAdmin
                        ? "bg-amber-500 text-white"
                        : "bg-primary text-white"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {profile?.role === "admin" ? (
                    isSuperAdmin ? (
                      <Crown className="size-5" />
                    ) : (
                      <Shield className="size-5" />
                    )
                  ) : (
                    <User className="size-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm truncate">
                      {profile?.fullName ||
                        user.user_metadata?.full_name ||
                        "User"}
                    </p>
                    {profile?.role === "admin" && (
                      <Badge
                        variant={isSuperAdmin ? "default" : "secondary"}
                        className={`text-xs px-2 py-0 ${
                          isSuperAdmin ? "bg-amber-500 hover:bg-amber-600" : ""
                        }`}
                      >
                        {isSuperAdmin ? "Super Admin" : "Admin"}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Sign Out */}
            <Button
              size="lg"
              variant="outline"
              className="rounded-full gap-2"
              onClick={handleSignOut}
            >
              <LogOut className="size-5" />
              Sign out
            </Button>
          </>
        ) : (
          <>
            {/* Sign In */}
            <SheetClose asChild>
              <Button asChild size="lg" className="rounded-full gap-2">
                <Link href="/signin">
                  <LogIn className="size-5" />
                  Log in
                </Link>
              </Button>
            </SheetClose>

            {/* Sign Up */}
            <SheetClose asChild>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full gap-2"
              >
                <Link href="/signup">
                  <UserPlus className="size-5" />
                  Create Account
                </Link>
              </Button>
            </SheetClose>
          </>
        )}
      </div>
    </div>
  );
};

export default Auth;
