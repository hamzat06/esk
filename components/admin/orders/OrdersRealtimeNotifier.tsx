"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { playSound } from "@/lib/sounds";
import { toast } from "react-hot-toast";

export default function OrdersRealtimeNotifier() {
  const router = useRouter();

  useEffect(() => {
    const channel = supabase
      .channel("admin-orders-notifier")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        () => {
          playSound("/sounds/order-bell-sound.wav");
          toast.success("New order received!");
          router.refresh();
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        () => {
          router.refresh();
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [router]);

  return null;
}
