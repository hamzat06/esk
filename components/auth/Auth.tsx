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
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { SheetClose } from "../ui/sheet";
import { useUserProfile } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase/client";

const Auth = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading } = useUserProfile();

  const isHome = pathname === "/";
  const isOrders = pathname === "/orders";
  const isAdmin = pathname.startsWith("/admin");

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

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

        {/* Admin Links */}
        {profile?.role === "admin" && (
          <>
            <div className="px-4 py-2">
              <div className="h-px bg-gray-200" />
            </div>

            <SheetClose asChild>
              <Button
                asChild
                size="lg"
                className="rounded-full justify-start px-6 gap-3"
                variant={isAdmin ? "default" : "ghost"}
              >
                <Link href="/admin">
                  <Shield className="size-5" />
                  Admin Dashboard
                </Link>
              </Button>
            </SheetClose>

            <SheetClose asChild>
              <Button
                asChild
                size="lg"
                className="rounded-full justify-start px-6 gap-3"
                variant="ghost"
              >
                <Link href="/admin/orders">
                  <BarChart3 className="size-5" />
                  Manage Orders
                </Link>
              </Button>
            </SheetClose>

            <SheetClose asChild>
              <Button
                asChild
                size="lg"
                className="rounded-full justify-start px-6 gap-3"
                variant="ghost"
              >
                <Link href="/admin/products">
                  <Settings className="size-5" />
                  Manage Products
                </Link>
              </Button>
            </SheetClose>
          </>
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
                      ? "bg-primary text-white"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {profile?.role === "admin" ? (
                    <Shield className="size-5" />
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
                      <Badge variant="default" className="text-xs px-2 py-0">
                        Admin
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
