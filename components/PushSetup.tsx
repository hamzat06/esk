"use client";

import { useEffect } from "react";
import { usePushNotifications } from "@/lib/hooks/usePushNotifications";
import { useUserProfile } from "@/lib/UseProfileProvider";

export default function PushSetup() {
  const { user } = useUserProfile();
  const { isSupported, isSubscribed, subscribe } = usePushNotifications();

  // Register service worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  // Auto-subscribe authenticated users who haven't been asked yet
  useEffect(() => {
    if (!user || !isSupported || isSubscribed) return;
    if (Notification.permission === "default") {
      // Small delay so the page has settled before showing the browser prompt
      const t = setTimeout(() => subscribe(), 3000);
      return () => clearTimeout(t);
    }
  }, [user, isSupported, isSubscribed, subscribe]);

  return null;
}
