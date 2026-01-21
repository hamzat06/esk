"use client";

import { ShoppingBasket, UserCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Sheet from "./Sheet";
import useToggle from "@/hooks/useToggle";
import Auth from "./Auth";
import Cart from "./Cart";

type DialogType = "CART" | "AUTH";

const Navbar = () => {
  const dialog = useToggle();
  const [dialogType, setDialogType] = useState<DialogType>("CART");

  const isAuth = dialogType === "AUTH";

  function renderDialog() {
    return isAuth ? <Auth /> : <Cart />;
  }

  function openDialog(val: DialogType) {
    setDialogType(val);
    dialog.handleOpen();
  }

  const setSide = isAuth ? "left" : "right";

  const setTitle = isAuth ? <AuthTitle /> : "My cart";

  function AuthTitle() {
    return (
      <Image
        width={50}
        height={50}
        alt="eddysylva logo"
        src="/assets/esk-logo.png"
        className="size-14"
      />
    );
  }

  return (
    <nav>
      <div className="container mx-auto flex items-center justify-between p-4 sm:p-5">
        <Link href="/">
          <Image
            width={100}
            height={100}
            alt="eddysylva logo"
            src="/assets/esk-logo.png"
            className="size-11 sm:size-16"
          />
        </Link>

        <div className="flex items-center gap-x-5">
          <div
            className="rounded-full p-2 border border-accent-foreground hover:cursor-pointer hover:bg-gray-200"
            onClick={() => openDialog("AUTH")}
          >
            <UserCircle className="size-6 sm:size-8" />
          </div>

          <div
            className="rounded-full p-2 border border-accent-foreground bg-primary text-white hover:cursor-pointer"
            onClick={() => openDialog("CART")}
          >
            <ShoppingBasket className="size-6 sm:size-8" />
          </div>
        </div>
      </div>

      <Sheet
        open={dialog.isOpen}
        onClose={dialog.handleClose}
        side={setSide}
        title={setTitle}
      >
        {renderDialog()}
      </Sheet>
    </nav>
  );
};

export default Navbar;
