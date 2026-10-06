"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut, MapPin, Package, Settings, Star, User as UserIcon, UserRound, Heart } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { initials } from "@/lib/format";
import { useAuthStore } from "@/store/auth";
import { useCurrentUser } from "@/store/hooks";

const itemCls = "px-3 py-2.5 text-[0.875rem] gap-3";

export function AccountMenu() {
  const user = useCurrentUser();
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  if (!user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger aria-label="Account" className="grid size-10 place-items-center outline-offset-2 transition-colors hover:bg-bone data-popup-open:bg-bone">
          <UserIcon className="size-[1.3rem]" strokeWidth={1.4} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={10} className="w-64 p-3">
          <p className="mb-1 px-1 font-serif text-[1.35rem] leading-tight">Welcome</p>
          <p className="mb-3 px-1 text-[0.8125rem] text-stone">Sign in to track orders and save your wishlist.</p>
          <div className="grid grid-cols-2 gap-2">
            <DropdownMenuItem render={<Link href="/login" />} className="justify-center bg-ink px-3 py-2.5 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-paper focus:bg-graphite focus:text-paper">
              Sign in
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/register" />} className="justify-center border border-ink px-3 py-2.5 text-[0.7rem] font-medium uppercase tracking-[0.14em]">
              Register
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="Account menu" className="grid size-10 place-items-center outline-offset-2">
        <span className="grid size-8 place-items-center rounded-full bg-ink text-[0.7rem] font-medium tracking-wider text-paper">{initials(user.name)}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={10} className="w-64">
        <DropdownMenuLabel className="px-3 pb-2 pt-3">
          <span className="block font-serif text-[1.3rem] leading-tight text-ink">{user.name}</span>
          <span className="block truncate text-[0.8125rem] font-normal text-stone">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/account" />} className={itemCls}>
          <UserRound /> Overview
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/account/orders" />} className={itemCls}>
          <Package /> My orders
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/wishlist" />} className={itemCls}>
          <Heart /> Wishlist
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/account/addresses" />} className={itemCls}>
          <MapPin /> Addresses
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/account/reviews" />} className={itemCls}>
          <Star /> Reviews
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/account/settings" />} className={itemCls}>
          <Settings /> Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className={itemCls}
          onClick={() => {
            logout();
            toast("You've been signed out");
            router.push("/");
          }}
        >
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
