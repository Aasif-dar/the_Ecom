"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Ban, CheckCircle2, Mail, MapPin, Phone, Search, UserX } from "lucide-react";
import { toast } from "sonner";
import type { Order, User } from "@/types";
import { AdminCard, AdminPageHeader } from "@/components/admin/page-header";
import { AddressBlock } from "@/components/account/address-card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OrderStatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatINR, initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import { useOrderStore } from "@/store/orders";

const PAGE = 15;

interface Row {
  user: User;
  orders: number;
  spent: number;
  last?: string;
}

function useCustomerRows(): Row[] {
  const users = useAuthStore((s) => s.users);
  const orders = useOrderStore((s) => s.orders);
  return useMemo(() => {
    const agg = new Map<string, { orders: number; spent: number; last?: string }>();
    for (const o of orders) {
      const a = agg.get(o.userId) ?? { orders: 0, spent: 0 };
      a.orders += 1;
      if (o.status !== "cancelled") a.spent += o.total;
      if (!a.last || +new Date(o.createdAt) > +new Date(a.last)) a.last = o.createdAt;
      agg.set(o.userId, a);
    }
    return users.filter((u) => u.role === "customer").map((user) => ({ user, ...(agg.get(user.id) ?? { orders: 0, spent: 0 }) }));
  }, [users, orders]);
}

export function CustomersView() {
  const rows = useCustomerRows();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = rows.filter((r) => (status === "all" || r.user.status === status) && (!term || r.user.name.toLowerCase().includes(term) || r.user.email.includes(term) || r.user.phone.replace(/\s/g, "").includes(term.replace(/\s/g, ""))));
    return list.sort((a, b) => (sort === "spent" ? b.spent - a.spent : sort === "orders" ? b.orders - a.orders : sort === "name" ? a.user.name.localeCompare(b.user.name) : +new Date(b.user.createdAt) - +new Date(a.user.createdAt)));
  }, [rows, q, status, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const current = Math.min(page, totalPages);
  const pageRows = filtered.slice((current - 1) * PAGE, current * PAGE);
  const repeat = rows.filter((r) => r.orders > 1).length;
  const avg = rows.length ? Math.round(rows.reduce((s, r) => s + r.spent, 0) / Math.max(1, rows.filter((r) => r.orders > 0).length)) : 0;

  const sel = (value: string, onChange: (v: string) => void, label: string, options: { value: string; label: string }[]) => (
    <Select value={value} onValueChange={(v) => { onChange(v as string); setPage(1); }} items={options}>
      <SelectTrigger size="sm" aria-label={label} className="h-10 min-w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <>
      <AdminPageHeader title="Customers" description={`${rows.length} registered · ${repeat} repeat buyers · average lifetime spend ${formatINR(avg)}`} />
      <AdminCard>
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4 sm:p-5">
          <div className="relative min-w-60 flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone" />
            <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search name, email or phone" aria-label="Search customers" className="h-10 pl-10" />
          </div>
          {sel(status, setStatus, "Status", [{ value: "all", label: "All statuses" }, { value: "active", label: "Active" }, { value: "blocked", label: "Blocked" }])}
          {sel(sort, setSort, "Sort", [{ value: "recent", label: "Newest first" }, { value: "spent", label: "Highest spend" }, { value: "orders", label: "Most orders" }, { value: "name", label: "Name A–Z" }])}
        </div>
        {filtered.length === 0 ? (
          <EmptyState compact icon={UserX} title="No customers found" body="Try a different search." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[52rem] text-left text-[0.8125rem]">
              <thead>
                <tr className="border-b border-line bg-bone/50 text-[0.65rem] uppercase tracking-[0.12em] text-stone">
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-3 py-3 font-medium">Phone</th>
                  <th className="px-3 py-3 text-right font-medium">Orders</th>
                  <th className="px-3 py-3 text-right font-medium">Total spent</th>
                  <th className="px-3 py-3 font-medium">Registered</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map(({ user, orders, spent }) => (
                  <tr key={user.id} className="border-b border-line/70 last:border-0 hover:bg-bone/40">
                    <td className="px-5 py-3">
                      <Link href={`/admin/customers/${user.id}`} className="group flex items-center gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-bone text-[0.7rem] font-medium tracking-wider">{initials(user.name)}</span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium group-hover:text-clay">{user.name}</span>
                          <span className="block truncate text-[0.75rem] text-stone">{user.email}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-3 tabular-nums text-graphite">{user.phone}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{orders}</td>
                    <td className="px-3 py-3 text-right font-medium tabular-nums">{formatINR(spent)}</td>
                    <td className="px-3 py-3 text-graphite">{formatDate(user.createdAt)}</td>
                    <td className="px-5 py-3">
                      <Badge variant={user.status === "active" ? "success" : "danger"}>{user.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3 text-[0.78rem] text-stone">
          <span>
            Showing {filtered.length === 0 ? 0 : (current - 1) * PAGE + 1}–{Math.min(current * PAGE, filtered.length)} of {filtered.length}
          </span>
          <Pagination page={current} totalPages={totalPages} onChange={setPage} />
        </div>
      </AdminCard>
    </>
  );
}

export function CustomerDetail({ id }: { id: string }) {
  const user = useAuthStore((s) => s.users.find((u) => u.id === id && u.role === "customer"));
  const setStatus = useAuthStore((s) => s.setUserStatus);
  const orders: Order[] = useOrderStore((s) => s.orders).filter((o) => o.userId === id);

  if (!user) {
    return (
      <EmptyState
        icon={UserX}
        title="Customer not found"
        actions={
          <Link href="/admin/customers" className={buttonVariants({ size: "lg" })}>
            All customers
          </Link>
        }
      />
    );
  }
  const valid = orders.filter((o) => o.status !== "cancelled");
  const spent = valid.reduce((s, o) => s + o.total, 0);

  return (
    <>
      <Link href="/admin/customers" className="mb-5 inline-flex items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-graphite hover:text-ink">
        <ArrowLeft className="size-4" /> All customers
      </Link>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-5 sm:mb-10">
        <div className="flex items-center gap-5">
          <span className="grid size-16 place-items-center rounded-full bg-ink text-lg font-medium tracking-wider text-paper">{initials(user.name)}</span>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-serif text-[2.2rem] leading-none sm:text-[2.6rem]">{user.name}</h1>
              <Badge variant={user.status === "active" ? "success" : "danger"}>{user.status}</Badge>
            </div>
            <p className="mt-2 text-[0.85rem] text-stone">Customer since {formatDate(user.createdAt)}</p>
          </div>
        </div>
        <Button
          variant={user.status === "active" ? "destructive" : "outline"}
          onClick={() => {
            const next = user.status === "active" ? "blocked" : "active";
            setStatus(user.id, next);
            toast.success(next === "blocked" ? `${user.name} can no longer sign in` : `${user.name} has been reactivated`);
          }}
        >
          {user.status === "active" ? (
            <>
              <Ban className="size-4" /> Block customer
            </>
          ) : (
            <>
              <CheckCircle2 className="size-4" /> Reactivate
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Orders", String(orders.length)],
          ["Total spent", formatINR(spent)],
          ["Average order", formatINR(valid.length ? Math.round(spent / valid.length) : 0)],
          ["Last order", orders[0] ? formatDate(orders[0].createdAt) : "None yet"],
        ].map(([l, v]) => (
          <div key={l} className="border border-line bg-paper-2 p-5">
            <p className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-stone">{l}</p>
            <p className="mt-3 font-serif text-[1.9rem] leading-none tabular-nums">{v}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_22rem]">
        <AdminCard>
          <h2 className="border-b border-line px-5 py-4 font-serif text-[1.45rem] leading-none sm:px-6">Order history</h2>
          {orders.length === 0 ? (
            <p className="px-6 py-10 text-center text-[0.9rem] text-stone">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[34rem] text-left text-[0.8125rem]">
                <thead>
                  <tr className="border-b border-line text-[0.65rem] uppercase tracking-[0.12em] text-stone">
                    <th className="px-6 py-3 font-medium">Order</th>
                    <th className="px-3 py-3 font-medium">Date</th>
                    <th className="px-3 py-3 text-right font-medium">Total</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-b border-line/70 last:border-0 hover:bg-bone/40">
                      <td className="px-6 py-3 font-mono text-[0.78rem]">
                        <Link href={`/admin/orders/${o.id}`} className="hover:underline">
                          {o.id}
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-graphite">{formatDate(o.createdAt)}</td>
                      <td className="px-3 py-3 text-right tabular-nums">{formatINR(o.total)}</td>
                      <td className="px-6 py-3">
                        <OrderStatusBadge status={o.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminCard>

        <div className="space-y-6">
          <AdminCard className="space-y-3 p-5 sm:p-6">
            <h2 className="text-[0.72rem] font-medium uppercase tracking-[0.16em]">Contact</h2>
            <p className="flex items-center gap-3 break-all text-[0.875rem]"><Mail className="size-4 shrink-0 text-stone" strokeWidth={1.4} /> {user.email}</p>
            <p className="flex items-center gap-3 text-[0.875rem]"><Phone className="size-4 shrink-0 text-stone" strokeWidth={1.4} /> {user.phone}</p>
          </AdminCard>
          <AdminCard className="p-5 sm:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[0.16em]">
              <MapPin className="size-4" strokeWidth={1.4} /> Addresses ({user.addresses.length})
            </h2>
            {user.addresses.length === 0 ? (
              <p className="text-[0.85rem] text-stone">No saved addresses.</p>
            ) : (
              <ul className="space-y-5">
                {user.addresses.map((a) => (
                  <li key={a.id} className={cn("border-l-2 pl-4", a.isDefault ? "border-ink" : "border-line")}>
                    <p className="mb-1 text-[0.65rem] uppercase tracking-[0.14em] text-stone">
                      {a.type}
                      {a.isDefault && " · default"}
                    </p>
                    <AddressBlock address={a} className="text-[0.85rem]" />
                  </li>
                ))}
              </ul>
            )}
          </AdminCard>
        </div>
      </div>
    </>
  );
}
