"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { Bell, Heart, LayoutDashboard, LogOut, MapPin, Package, Settings, Star, UserRound } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import { useCurrentUser, useMyNotifications } from "@/store/hooks";
import { useHydrated } from "@/store/persist";

const NAV = [
  { href: "/account", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/account/profile", label: "Profile", icon: UserRound },
  { href: "/account/orders", label: "My orders", icon: Package },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/reviews", label: "Reviews", icon: Star },
  { href: "/account/notifications", label: "Notifications", icon: Bell },
  { href: "/account/settings", label: "Account settings", icon: Settings },
];

export function AccountSkeleton() {
  return (
    <div className="container-x py-10" aria-busy aria-label="Loading your account">
      <Skeleton className="mb-8 h-3 w-48" />
      <div className="grid gap-10 lg:grid-cols-[16rem_1fr] lg:gap-16">
        <div className="hidden space-y-3 lg:block">
          <Skeleton className="mb-6 h-16 w-full" />
          {Array.from({ length: 7 }, (_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
        <div className="space-y-6">
          <Skeleton className="h-14 w-72" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
          <Skeleton className="h-52 w-full" />
          <Skeleton className="h-52 w-full" />
        </div>
      </div>
    </div>
  );
}

export function AccountShell({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const unread = useMyNotifications().filter((n) => !n.read).length;

  useEffect(() => {
    if (hydrated && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [hydrated, user, pathname, router]);

  if (!hydrated || !user) return <AccountSkeleton />;

  const current = NAV.find((n) => (n.exact ? pathname === n.href : pathname.startsWith(n.href)));

  return (
    <div className="container-x pb-4 pt-8 sm:pt-12">
      <Breadcrumb
        className="mb-8"
        items={[{ label: "Home", href: "/" }, { label: "Account", href: "/account" }, ...(current && current.href !== "/account" ? [{ label: current.label }] : [])]}
      />
      <div className="grid gap-8 lg:grid-cols-[16rem_1fr] lg:gap-16">
        <aside>
          <div className="mb-6 hidden items-center gap-4 border-b border-line pb-6 lg:flex">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-ink text-sm font-medium tracking-wider text-paper">{initials(user.name)}</span>
            <div className="min-w-0">
              <p className="truncate font-serif text-[1.35rem] leading-tight">{user.name}</p>
              <p className="truncate text-[0.8125rem] text-stone">{user.email}</p>
            </div>
          </div>
          <nav aria-label="Account" className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
            {NAV.map((n) => {
              const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex shrink-0 items-center gap-3 whitespace-nowrap px-3.5 py-2.5 text-[0.875rem] transition-colors lg:px-3",
                    active ? "bg-ink text-paper" : "text-graphite hover:bg-bone hover:text-ink",
                  )}
                >
                  <n.icon className="size-[1.05rem]" strokeWidth={1.4} />
                  {n.label}
                  {n.href === "/account/notifications" && unread > 0 && <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-clay px-1 text-[0.625rem] font-semibold text-paper">{unread}</span>}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={() => {
                logout();
                toast("You've been signed out");
                router.push("/");
              }}
              className="flex shrink-0 items-center gap-3 whitespace-nowrap px-3.5 py-2.5 text-[0.875rem] text-graphite transition-colors hover:bg-bone hover:text-danger lg:mt-4 lg:border-t lg:border-line lg:px-3 lg:pt-4"
            >
              <LogOut className="size-[1.05rem]" strokeWidth={1.4} /> Sign out
            </button>
          </nav>
        </aside>
        <div className="min-w-0 pb-6">{children}</div>
      </div>
    </div>
  );
}

export function AccountHeading({ eyebrow, title, accent, action }: { eyebrow?: string; title: string; accent?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6 sm:mb-10">
      <div>
        {eyebrow && <p className="eyebrow mb-3 text-clay">{eyebrow}</p>}
        <h1 className="display-md">
          {title} {accent && <em className="font-serif italic">{accent}</em>}
        </h1>
      </div>
      {action}
    </div>
  );
}
