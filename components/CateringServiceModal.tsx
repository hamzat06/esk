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

interface CateringModalProps {
  children?: React.ReactNode;
}

const CateringServiceModal = (props: CateringModalProps) => {
  const dialog = useToggle();

  React.useEffect(() => {
    setTimeout(() => {
      dialog.handleOpen();
    }, 2000);
  }, []);

  return (
    <Dialog open={dialog.isOpen} onOpenChange={dialog.handleClose}>
      <DialogTrigger asChild>{props?.children}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-3xl text-center">
            Let us cater your next event!
          </DialogTitle>
          <DialogDescription className="text-base sm:text-lg my-3">
            We would be honored to provide our services for your next event.
            Each event is bespoke to your tastes and needs, to provide the best
            experience possible for you and your guests.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="lg">
              Not now
            </Button>
          </DialogClose>
          <Button size="lg">Book us</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CateringServiceModal;
