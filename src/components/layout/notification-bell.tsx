"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useOrderStore } from "@/store/orders";
import { useCurrentUser, useMyNotifications } from "@/store/hooks";
import { useState } from "react";

export function NotificationBell({ className }: { className?: string }) {
  const user = useCurrentUser();
  const notifications = useMyNotifications();
  const markRead = useOrderStore((s) => s.markRead);
  const markAllRead = useOrderStore((s) => s.markAllRead);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  if (!user) return null;
  const unread = notifications.filter((n) => !n.read).length;
  const latest = notifications.slice(0, 5);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        className={cn("relative grid size-10 place-items-center outline-offset-2 transition-colors hover:bg-bone data-popup-open:bg-bone", className)}
      >
        <Bell className="size-[1.25rem]" strokeWidth={1.4} />
        {unread > 0 && <span className="absolute right-2 top-2 size-2 rounded-full bg-clay ring-2 ring-paper" aria-hidden />}
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={10} className="w-[min(92vw,24rem)] gap-0 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3.5">
          <h2 className="font-serif text-[1.3rem] leading-none">Notifications</h2>
          {unread > 0 && (
            <button type="button" onClick={() => markAllRead(user.id)} className="text-[0.75rem] text-stone underline underline-offset-4 hover:text-ink">
              Mark all read
            </button>
          )}
        </div>
        {latest.length === 0 ? (
          <p className="px-4 py-10 text-center text-[0.875rem] text-stone">You're all caught up. Order updates will appear here.</p>
        ) : (
          <ul className="max-h-[22rem] divide-y divide-line overflow-y-auto">
            {latest.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => {
                    markRead(n.id);
                    setOpen(false);
                    if (n.href) router.push(n.href);
                  }}
                  className={cn("flex w-full gap-3 px-4 py-3.5 text-left transition-colors hover:bg-bone", !n.read && "bg-clay/[0.04]")}
                >
                  <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-clay")} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.875rem] font-medium leading-snug text-ink">{n.title}</span>
                    <span className="mt-0.5 line-clamp-2 block text-[0.8125rem] leading-snug text-stone">{n.body}</span>
                    <span className="mt-1.5 block text-[0.6875rem] uppercase tracking-[0.1em] text-stone/80">{relativeTime(n.createdAt)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <Link href="/account/notifications" onClick={() => setOpen(false)} className="block border-t px-4 py-3.5 text-center text-[0.72rem] font-medium uppercase tracking-[0.16em] hover:bg-bone">
          View all notifications
        </Link>
      </PopoverContent>
    </Popover>
  );
}
