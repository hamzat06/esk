"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import useToggle from "@/hooks/useToggle";
import { Button } from "./ui/button";
import { PartyPopper, Sparkles } from "lucide-react";

interface CateringModalProps {
  children?: React.ReactNode;
}

const CateringServiceModal = (props: CateringModalProps) => {
  const dialog = useToggle();

  React.useEffect(() => {
    const timer = setTimeout(() => {
      dialog.handleOpen();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Dialog open={dialog.isOpen} onOpenChange={dialog.handleClose}>
      <DialogTrigger asChild>{props?.children}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          {/* Icon */}
          <div className="flex justify-center mb-2">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <PartyPopper className="size-8 text-primary" />
              </div>
              <Sparkles className="size-4 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>

          <DialogTitle className="text-2xl sm:text-3xl text-center font-playfair">
            Let us cater your next event!
          </DialogTitle>
          
          <DialogDescription className="text-base sm:text-lg text-gray-600 text-center leading-relaxed pt-2">
            We would be honored to provide our services for your next event.
            Each event is bespoke to your tastes and needs, to provide the best
            experience possible for you and your guests.
          </DialogDescription>
        </DialogHeader>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3 py-4">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold font-playfair text-primary mb-1">50+</p>
            <p className="text-sm text-gray-600">Events Catered</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold font-playfair text-primary mb-1">500+</p>
            <p className="text-sm text-gray-600">Happy Guests</p>
          </div>
        </div>

        <DialogFooter className="gap-3 sm:gap-3">
          <DialogClose asChild>
            <Button 
              variant="outline" 
              size="lg" 
              className="sm:flex-1 rounded-xl border-2"
            >
              Not now
            </Button>
          </DialogClose>
          <Button 
            size="lg" 
            className="sm:flex-1 rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            Book us
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CateringServiceModal;