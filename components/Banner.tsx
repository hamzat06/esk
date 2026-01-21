import { AlertTriangle } from "lucide-react";
import React from "react";

const Banner = () => {
  return (
    <div className="p-4 bg-[#F8C620] text-[#A62828] text-center font-semibold text-sm sm:text-base flex items-center justify-center gap-x-2">
      <AlertTriangle className="size-4 hidden sm:block" />
      <p>This outlet is closed. It will be opened at 11:00 AM</p>
    </div>
  );
};

export default Banner;
