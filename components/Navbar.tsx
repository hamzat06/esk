"use client";

import { ShoppingBasket, UserCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { XIcon } from "lucide-react";
import useToggle from "@/hooks/useToggle";
import Auth from "./auth/Auth";
import Cart from "./cart/Cart";
import { useCartStore } from "./cart/stores/cartStore";

type DialogType = "CART" | "AUTH";

const Navbar = () => {
  const dialog = useToggle();
  const [dialogType, setDialogType] = useState<DialogType>("CART");
  const items = useCartStore((s) => s.items);

  const isAuth = dialogType === "AUTH";
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  function openDialog(val: DialogType) {
    setDialogType(val);
    dialog.handleOpen();
  }

  function handleClose() {
    dialog.handleClose();
  }

  const setSide = isAuth ? "left" : "right";

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto flex items-center justify-between p-4 sm:p-5">
          <Link href="/" className="transition-transform hover:scale-105 active:scale-95">
            <Image
              width={100}
              height={100}
              alt="eddysylva logo"
              src="/assets/esk-logo.png"
              className="size-11 sm:size-16"
              priority
            />
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* User Account Button */}
            <button
              className="group relative rounded-full p-2.5 sm:p-3 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:scale-95 transition-all duration-200"
              onClick={() => openDialog("AUTH")}
              aria-label="Account"
            >
              <UserCircle className="size-5 sm:size-6 text-gray-700 group-hover:text-gray-900 transition-colors" />
            </button>

            {/* Shopping Cart Button */}
            <button
              className="group relative rounded-full p-2.5 sm:p-3 bg-primary hover:bg-primary/90 active:scale-95 text-white transition-all duration-200 shadow-md hover:shadow-lg"
              onClick={() => openDialog("CART")}
              aria-label="Shopping cart"
            >
              <ShoppingBasket className="size-5 sm:size-6" />
              
              {/* Cart Badge */}
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1 shadow-md border-2 border-white animate-in fade-in zoom-in duration-200">
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Sheet/Drawer */}
      <Sheet open={dialog.isOpen} onOpenChange={handleClose}>
        <SheetContent side={setSide} className="p-0 flex flex-col">
          {/* Header */}
          <SheetHeader className="flex-row items-center justify-between px-5 py-4 border-b bg-white sticky top-0 z-10">
            <SheetTitle>
              {isAuth ? (
                <Image
                  width={50}
                  height={50}
                  alt="eddysylva logo"
                  src="/assets/esk-logo.png"
                  className="size-12 sm:size-14"
                />
              ) : (
                "My Cart"
              )}
            </SheetTitle>

            <Button
              className="size-10 hover:bg-gray-100 rounded-full transition-colors shrink-0"
              onClick={handleClose}
              variant="ghost"
              size="icon"
            >
              <XIcon className="size-5" />
            </Button>
          </SheetHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {isAuth ? <Auth /> : <Cart />}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Navbar;