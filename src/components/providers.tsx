"use client";

import { useEffect } from "react";
import { MotionConfig } from "motion/react";
import { Toaster, toast } from "sonner";
import { hydrateAllStores, startCrossTabSync, useHydrationStore } from "@/store/persist";
import { useAuthStore } from "@/store/auth";
import { AUTO_CONFIRM_MS, PLACED_NOTE, useOrderStore } from "@/store/orders";
import { useRouter } from "next/navigation";

/** Rehydrates all persisted demo stores after mount and keeps tabs in sync. */
function StoreHydration() {
  useEffect(() => {
    let stop = () => {};
    hydrateAllStores().then(() => {
      useAuthStore.getState().enforceSessionPolicy();
      stop = startCrossTabSync();
    });
    return () => stop();
  }, []);
  return null;
}

/**
 * Pops a toast when something new lands in the signed-in customer's feed, for example
 * when the admin ships an order from another tab. This is the demo's "live" notification.
 */
function NotificationWatcher() {
  const router = useRouter();
  const hydrated = useHydrationStore((s) => s.hydrated);
  useEffect(() => {
    if (!hydrated) return;
    const seen = new Set(useOrderStore.getState().notifications.map((n) => n.id));
    return useOrderStore.subscribe((state) => {
      const { userId, adminId } = useAuthStore.getState();
      for (const n of state.notifications) {
        if (seen.has(n.id)) continue;
        seen.add(n.id);
        const mine = (userId && n.recipientId === userId) || (adminId && n.recipientId === "admin");
        if (!mine || n.read) continue;
        toast(n.title, {
          description: n.body,
          action: n.href ? { label: "View", onClick: () => router.push(n.href!) } : undefined,
          duration: 6000,
        });
      }
    });
  }, [hydrated, router]);
  return null;
}

/**
 * Demo behaviour: the "warehouse" confirms a freshly placed order a few seconds later, so
 * the notification feed and tracking timeline come alive. It reschedules after reloads.
 */
function AutoConfirmWatcher() {
  const hydrated = useHydrationStore((s) => s.hydrated);
  useEffect(() => {
    if (!hydrated) return;
    const scheduled = new Set<string>();
    const timers: ReturnType<typeof setTimeout>[] = [];
    const scan = () => {
      const { orders, updateStatus } = useOrderStore.getState();
      for (const o of orders) {
        if (o.status !== "processing" || scheduled.has(o.id) || o.timeline[0]?.note !== PLACED_NOTE) continue;
        const age = Date.now() - new Date(o.createdAt).getTime();
        if (age > 15 * 60 * 1000) continue; // stale: leave it for the admin
        scheduled.add(o.id);
        timers.push(
          setTimeout(() => {
            const current = useOrderStore.getState().orders.find((x) => x.id === o.id);
            if (current?.status === "processing") updateStatus(o.id, "confirmed");
          }, Math.max(0, AUTO_CONFIRM_MS - age)),
        );
      }
    };
    scan();
    const unsub = useOrderStore.subscribe(scan);
    return () => {
      unsub();
      timers.forEach(clearTimeout);
    };
  }, [hydrated]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <StoreHydration />
      <NotificationWatcher />
      <AutoConfirmWatcher />
      {children}
      <Toaster
        position="bottom-right"
        offset={20}
        gap={10}
        toastOptions={{
          unstyled: false,
          classNames: {
            toast: "!rounded-none !border !border-line !bg-ink !text-paper !shadow-[0_18px_50px_-12px_rgba(20,17,15,0.45)] !font-sans !px-5 !py-4",
            title: "!text-[0.8125rem] !font-medium !tracking-wide",
            description: "!text-[0.78rem] !text-paper/70",
            actionButton: "!rounded-none !bg-paper !text-ink !text-[0.68rem] !font-medium !uppercase !tracking-[0.14em]",
            success: "[&_[data-icon]]:!text-paper",
            error: "!bg-danger !text-paper",
          },
        }}
      />
    </MotionConfig>
  );
}
