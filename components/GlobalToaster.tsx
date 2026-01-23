"use client";

import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

export default function GlobalToaster() {
  const [position, setPosition] = useState<"top-center" | "bottom-center">(
    "top-center",
  );

  useEffect(() => {
    const updatePosition = () => {
      setPosition(window.innerWidth < 640 ? "bottom-center" : "top-center");
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);

    return () => window.removeEventListener("resize", updatePosition);
  }, []);

  return (
    <Toaster
      position={position}
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: "0.5rem",
          padding: "1rem",
          fontSize: "1rem",
        },
      }}
    />
  );
}
