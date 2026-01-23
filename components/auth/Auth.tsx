"use client";

import React from "react";
import { Button } from "../ui/button";
import { Home, ShoppingCart, User, LogIn, UserPlus } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { SheetClose } from "../ui/sheet";

const Auth = () => {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isOrders = pathname === "/orders";

  return (
    <div className="h-full flex flex-col">
      {/* Welcome Section */}
      <div className="px-6 py-8 bg-linear-to-br from-primary/5 to-primary/10 border-b">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-md mb-4 mx-auto">
          <User className="size-8 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold text-center font-playfair">
          Welcome Back
        </h2>
        <p className="text-sm text-gray-600 text-center mt-2">
          Sign in to access your account and orders
        </p>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-5 py-6 space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">
          Navigation
        </p>
        
        <SheetClose asChild>
          <Button
            asChild
            size="lg"
            className="w-full rounded-xl justify-start gap-3 px-5 text-base transition-all duration-200"
            variant={isHome ? "default" : "ghost"}
          >
            <Link href="/" className={isHome ? "shadow-md" : "hover:bg-gray-100"}>
              <Home className="size-5" />
              <span>Home</span>
            </Link>
          </Button>
        </SheetClose>

        <SheetClose asChild>
          <Button
            asChild
            size="lg"
            className="w-full rounded-xl justify-start gap-3 px-5 text-base transition-all duration-200"
            variant={isOrders ? "default" : "ghost"}
          >
            <Link href="/orders" className={isOrders ? "shadow-md" : "hover:bg-gray-100"}>
              <ShoppingCart className="size-5" />
              <span>My Orders</span>
            </Link>
          </Button>
        </SheetClose>
      </div>

      {/* Auth Actions */}
      <div className="px-6 py-6 border-t bg-gray-50 space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Account
        </p>

        <SheetClose asChild>
          <Button 
            asChild 
            size="lg" 
            className="w-full rounded-xl gap-2 text-base font-semibold shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Link href="/signin">
              <LogIn className="size-5" />
              Log in
            </Link>
          </Button>
        </SheetClose>

        <SheetClose asChild>
          <Button 
            asChild 
            size="lg" 
            variant="outline" 
            className="w-full rounded-xl gap-2 text-base font-semibold border-2 hover:bg-gray-100 transition-all duration-200"
          >
            <Link href="/signup">
              <UserPlus className="size-5" />
              Create Account
            </Link>
          </Button>
        </SheetClose>

        <p className="text-xs text-gray-500 text-center mt-4">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="text-primary hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Auth;