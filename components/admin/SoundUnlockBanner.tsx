"use client";

import { useState, useEffect } from "react";
import { Volume2, X } from "lucide-react";
import { initSounds, playSound } from "@/lib/sounds";

export default function SoundUnlockBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem("sound_unlocked")) {
      setVisible(true);
    }
  }, []);

  function handleUnlock() {
    initSounds();
    playSound("/sounds/order-bell-sound.wav");
    sessionStorage.setItem("sound_unlocked", "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <button
      onClick={handleUnlock}
      className="fixed top-0 inset-x-0 z-50 flex items-center justify-center gap-2 bg-primary text-white text-sm font-medium py-2.5 px-4 hover:bg-primary/90 transition-colors w-full"
    >
      <Volume2 className="size-4 shrink-0" />
      <span>Tap to enable order notification sounds</span>
      <X className="size-4 shrink-0 ml-2 opacity-70" />
    </button>
  );
}
