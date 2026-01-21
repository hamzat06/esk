"use client";

import React from "react";
import { Button } from "./ui/button";
import { Home, ShoppingCart } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { SheetClose } from "./ui/sheet";

const Auth = () => {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isOrders = pathname === "/orders";

  return (
    <div className="grow h-full flex flex-col justify-between border-t">
      <div className="py-5 flex flex-col gap-y-3 px-5">
        <SheetClose asChild>
          <Button
            asChild
            size="lg"
            className="rounded-full justify-start px-6!"
            variant={isHome ? "default" : "ghost"}
          >
            <Link href="/">
              <Home className="size-5" />
              Home
            </Link>
          </Button>
        </SheetClose>

        <SheetClose asChild>
          <Button
            asChild
            size="lg"
            className="rounded-full justify-start px-6!"
            variant={isOrders ? "default" : "ghost"}
          >
            <Link href="/orders">
              <ShoppingCart className="size-5" />
              Orders
            </Link>
          </Button>
        </SheetClose>
      </div>
      <div className="py-5 flex flex-col gap-y-3 px-6 border-t">
        <SheetClose asChild>
          <Button asChild size="lg" className="rounded-full">
            <Link href="/login">Log in</Link>
          </Button>
        </SheetClose>

        <SheetClose asChild>
          <Button asChild size="lg" variant="outline" className="rounded-full">
            <Link href="/signup">Sign up</Link>
          </Button>
        </SheetClose>
      </div>
    </div>
  );
};

export default Auth;
