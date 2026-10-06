"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  BarChart3, Bell, Boxes, ExternalLink, FileText, LayoutDashboard, LogOut, Menu, RotateCcw, Settings, ShoppingBag, Tags, Truck, Users,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { initials, relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { clearAllPersistedData, useHydrated } from "@/store/persist";
import { useAuthStore } from "@/store/auth";
import { useOrderStore } from "@/store/orders";
import { useAdminUser } from "@/store/hooks";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Boxes },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/delivery", label: "Delivery", icon: Truck },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/content", label: "Content", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const pending = useOrderStore((s) => s.orders.filter((o) => ["processing", "confirmed", "packed"].includes(o.status)).length);
  const adminLogout = useAuthStore((s) => s.adminLogout);
  const router = useRouter();
  const [resetOpen, setResetOpen] = useState(false);

  return (
    <div className="flex h-full flex-col bg-ink text-paper">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-paper/10 px-6">
        <Logo tone="light" className="!text-[1.35rem]" />
        <span className="border border-paper/30 px-1.5 py-0.5 text-[0.6rem] font-medium uppercase tracking-[0.16em] text-paper/70">Admin</span>
      </div>
      <nav aria-label="Admin" className="thin-scroll flex-1 overflow-y-auto px-3 py-5">
        <ul className="space-y-0.5">
          {NAV.map((n) => {
            const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
            return (
              <li key={n.href}>
                <Link
                  href={n.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn("flex items-center gap-3 px-3 py-2.5 text-[0.875rem] transition-colors", active ? "bg-paper text-ink" : "text-paper/75 hover:bg-paper/10 hover:text-paper")}
                >
                  <n.icon className="size-[1.05rem]" strokeWidth={1.4} />
                  {n.label}
                  {n.href === "/admin/orders" && pending > 0 && (
                    <span className={cn("ml-auto grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[0.65rem] font-semibold tabular-nums", active ? "bg-clay text-paper" : "bg-clay text-paper")}>{pending}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="space-y-0.5 border-t border-paper/10 px-3 py-4 text-[0.8125rem]">
        <Link href="/" target="_blank" className="flex items-center gap-3 px-3 py-2.5 text-paper/75 transition-colors hover:bg-paper/10 hover:text-paper">
          <ExternalLink className="size-4" strokeWidth={1.4} /> View storefront
        </Link>
        <button type="button" onClick={() => setResetOpen(true)} className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-paper/75 transition-colors hover:bg-paper/10 hover:text-paper">
          <RotateCcw className="size-4" strokeWidth={1.4} /> Reset demo data
        </button>
        <button
          type="button"
          onClick={() => {
            adminLogout();
            toast("Signed out of admin");
            router.push("/admin/login");
          }}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-paper/75 transition-colors hover:bg-paper/10 hover:text-paper"
        >
          <LogOut className="size-4" strokeWidth={1.4} /> Sign out
        </button>
      </div>

      <Modal
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset demo data?"
        description="This restores every product, order, customer and setting to its original state and signs everyone out."
        footer={
          <>
            <Button variant="ghost" onClick={() => setResetOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                clearAllPersistedData();
                window.location.href = "/admin/login";
              }}
            >
              Reset everything
            </Button>
          </>
        }
      >
        <p className="text-[0.9rem] text-graphite">Useful before a client walkthrough: you'll start from a clean slate.</p>
      </Modal>
    </div>
  );
}

function AdminNotifications() {
  const all = useOrderStore((s) => s.notifications);
  const markRead = useOrderStore((s) => s.markRead);
  const markAll = useOrderStore((s) => s.markAllRead);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const list = useMemo(() => all.filter((n) => n.recipientId === "admin"), [all]);
  const unread = list.filter((n) => !n.read).length;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"} className="relative grid size-10 place-items-center transition-colors hover:bg-bone data-popup-open:bg-bone">
        <Bell className="size-[1.2rem]" strokeWidth={1.4} />
        {unread > 0 && <span className="absolute right-2 top-2 size-2 rounded-full bg-clay ring-2 ring-paper-2" aria-hidden />}
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-[min(92vw,24rem)] gap-0 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3.5">
          <h2 className="font-serif text-[1.25rem] leading-none">Alerts</h2>
          {unread > 0 && (
            <button type="button" onClick={() => markAll("admin")} className="text-[0.75rem] text-stone underline underline-offset-4 hover:text-ink">
              Mark all read
            </button>
          )}
        </div>
        <ul className="max-h-[22rem] divide-y divide-line overflow-y-auto">
          {list.length === 0 && <li className="px-4 py-8 text-center text-[0.85rem] text-stone">No alerts.</li>}
          {list.slice(0, 8).map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => {
                  markRead(n.id);
                  setOpen(false);
                  if (n.href) router.push(n.href);
                }}
                className={cn("flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-bone", !n.read && "bg-clay/[0.04]")}
              >
                <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-clay")} aria-hidden />
                <span className="min-w-0">
                  <span className="block text-[0.85rem] font-medium leading-snug">{n.title}</span>
                  <span className="line-clamp-2 block text-[0.8rem] text-stone">{n.body}</span>
                  <span className="mt-1 block text-[0.65rem] uppercase tracking-[0.1em] text-stone/80">{relativeTime(n.createdAt)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

function ShellSkeleton() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[17rem_1fr]" aria-busy aria-label="Loading dashboard">
      <div className="hidden bg-ink lg:block" />
      <div className="space-y-6 p-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-6">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-80 w-full" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const admin = useAdminUser();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (hydrated && !admin) router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
  }, [hydrated, admin, pathname, router]);

  useEffect(() => setMenuOpen(false), [pathname]);

  if (!hydrated || !admin) return <ShellSkeleton />;

  const current = NAV.find((n) => (n.exact ? pathname === n.href : pathname.startsWith(n.href)));

  return (
    <div className="admin-surface min-h-dvh bg-background lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="sticky top-0 hidden h-dvh lg:block" aria-label="Sidebar">
        <SidebarContent pathname={pathname} />
      </aside>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" showCloseButton={false} className="!w-72 !max-w-[85vw] p-0">
          <SheetTitle className="sr-only">Admin menu</SheetTitle>
          <SheetDescription className="sr-only">Admin navigation</SheetDescription>
          <SidebarContent pathname={pathname} onNavigate={() => setMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-line bg-paper-2/95 px-4 backdrop-blur-none sm:px-8">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open menu" className="grid size-10 place-items-center hover:bg-bone lg:hidden">
              <Menu className="size-5" />
            </button>
            <p className="text-[0.72rem] font-medium uppercase tracking-[0.16em] text-stone">
              Admin <span className="mx-1.5 text-sand">/</span> <span className="text-ink">{current?.label ?? "Console"}</span>
            </p>
          </div>
          <div className="flex items-center gap-1">
            <AdminNotifications />
            <div className="ml-2 hidden items-center gap-3 border-l border-line pl-4 sm:flex">
              <span className="grid size-9 place-items-center rounded-full bg-ink text-[0.7rem] font-medium tracking-wider text-paper">{initials(admin.name)}</span>
              <span className="leading-tight">
                <span className="block text-[0.8125rem] font-medium">{admin.name}</span>
                <span className="block text-[0.7rem] text-stone">Store manager</span>
              </span>
            </div>
          </div>
        </header>
        <main id="admin-main" className="mx-auto w-full max-w-[1500px] px-4 pb-16 pt-8 sm:px-8 sm:pt-10">
          {children}
        </main>
      </div>
    </div>
  );
}
