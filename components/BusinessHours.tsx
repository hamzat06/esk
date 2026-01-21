"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface BusinessHours {
  children?: React.ReactNode;
}

const BusinessHours = (props: BusinessHours) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{props?.children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl sm:text-3xl text-center">
            Business Hours
          </DialogTitle>
        </DialogHeader>

        <div className="text-base sm:text-lg mt-5">
          <div className="flex items-center justify-between border-b py-3">
            <p className="font-medium">Monday</p>
            <p className="text-gray-500">11:00 AM - 09:00 PM</p>
          </div>
          <div className="flex items-center justify-between border-b py-3">
            <p className="font-medium">Tuesday</p>
            <p className="text-gray-500">11:00 AM - 09:00 PM</p>
          </div>
          <div className="flex items-center justify-between border-b py-3">
            <p className="font-medium">Wednesday</p>
            <p className="text-gray-500">11:00 AM - 09:00 PM</p>
          </div>
          <div className="flex items-center justify-between border-b py-3">
            <p className="font-medium">Thursday</p>
            <p className="text-gray-500">11:00 AM - 09:00 PM</p>
          </div>
          <div className="flex items-center justify-between border-b py-3">
            <p className="font-medium">Friday</p>
            <p className="text-gray-500">11:00 AM - 09:00 PM</p>
          </div>
          <div className="flex items-center justify-between pt-3">
            <p className="font-medium">Saturday</p>
            <p className="text-gray-500">11:00 AM - 09:00 PM</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BusinessHours;
