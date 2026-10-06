"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Heart, Menu, Search, ShoppingBag } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { AccountMenu } from "@/components/layout/account-menu";
import { NotificationBell } from "@/components/layout/notification-bell";
import { MegaMenuPanel } from "@/components/layout/mega-menu";
import { NAV_LINKS } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui";
import { useCartCount, useWishlistCount } from "@/store/hooks";

function CountBadge({ count, pulse }: { count: number; pulse?: number }) {
  if (count <= 0) return null;
  return (
    <span
      key={`${count}-${pulse ?? 0}`}
      aria-hidden
      className="absolute right-0.5 top-0.5 grid h-[1.05rem] min-w-[1.05rem] animate-badge-bump place-items-center rounded-full bg-clay px-1 text-[0.625rem] font-semibold leading-none text-paper tabular-nums"
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

const iconBtn = "relative grid size-10 place-items-center outline-offset-2 transition-colors hover:bg-bone";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setMenuOpen = useUiStore((s) => s.setMenuOpen);
  const setSearchOpen = useUiStore((s) => s.setSearchOpen);
  const setCartOpen = useUiStore((s) => s.setCartOpen);
  const pulse = useUiStore((s) => s.cartPulse);
  const cartCount = useCartCount();
  const wishCount = useWishlistCount();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMega(false), [pathname]);

  // "/" or Cmd/Ctrl+K opens search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable;
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") setMega(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSearchOpen]);

  const openMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMega(true);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMega(false), 140);
  };

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/"));

  return (
    <header
      className={cn("sticky top-0 z-50 bg-paper transition-[box-shadow,border-color] duration-300", scrolled || mega ? "border-b border-line shadow-[0_8px_30px_-24px_rgba(20,17,15,0.35)]" : "border-b border-transparent")}
      onMouseLeave={scheduleClose}
    >
      <div className="container-x relative grid h-16 grid-cols-[1fr_auto_1fr] items-center lg:h-[4.5rem]">
        {/* left */}
        <div className="flex items-center">
          <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open menu" className={cn(iconBtn, "-ml-2.5 min-[1200px]:hidden")}>
            <Menu className="size-[1.35rem]" strokeWidth={1.4} />
          </button>
          <nav aria-label="Primary" className="hidden items-center gap-7 min-[1200px]:flex">
            {NAV_LINKS.map((l) =>
              l.mega ? (
                <div key={l.label} onMouseEnter={openMega} onFocus={openMega}>
                  <button
                    type="button"
                    aria-expanded={mega}
                    aria-haspopup="true"
                    onClick={() => setMega((v) => !v)}
                    className="group relative inline-flex items-center gap-1 py-2 text-[0.72rem] font-medium uppercase tracking-[0.16em] outline-offset-4"
                  >
                    {l.label}
                    <ChevronDown className={cn("size-3 transition-transform duration-300", mega && "rotate-180")} />
                    <span className={cn("absolute inset-x-0 -bottom-0.5 h-px origin-left bg-ink transition-transform duration-500", mega ? "scale-x-100" : "scale-x-0")} />
                  </button>
                </div>
              ) : (
                <Link
                  key={l.label}
                  href={l.href}
                  onMouseEnter={() => setMega(false)}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className="group relative py-2 text-[0.72rem] font-medium uppercase tracking-[0.16em] outline-offset-4"
                >
                  {l.label}
                  <span className={cn("absolute inset-x-0 -bottom-0.5 h-px origin-left bg-ink transition-transform duration-500 group-hover:scale-x-100", isActive(l.href) ? "scale-x-100" : "scale-x-0")} />
                </Link>
              ),
            )}
          </nav>
        </div>

        {/* center */}
        <Logo className="justify-self-center" />

        {/* right */}
        <div className="flex items-center justify-end gap-0.5">
          <button type="button" onClick={() => setSearchOpen(true)} aria-label="Search (press /)" className={iconBtn}>
            <Search className="size-[1.25rem]" strokeWidth={1.4} />
          </button>
          <div className="hidden min-[1200px]:block">
            <AccountMenu />
          </div>
          <div className="hidden min-[1200px]:block">
            <NotificationBell />
          </div>
          <Link href="/wishlist" aria-label={`Wishlist${wishCount ? `, ${wishCount} items` : ""}`} className={iconBtn}>
            <Heart className="size-[1.25rem]" strokeWidth={1.4} />
            <CountBadge count={wishCount} />
          </Link>
          <button type="button" onClick={() => setCartOpen(true)} aria-label={`Open bag${cartCount ? `, ${cartCount} items` : ""}`} className={cn(iconBtn, "-mr-2.5 min-[1200px]:mr-0")}>
            <ShoppingBag className="size-[1.25rem]" strokeWidth={1.4} />
            <CountBadge count={cartCount} pulse={pulse} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mega && (
          <motion.div
            key="mega"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-0 top-full hidden min-[1200px]:block"
            onMouseEnter={openMega}
          >
            <MegaMenuPanel onNavigate={() => setMega(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
