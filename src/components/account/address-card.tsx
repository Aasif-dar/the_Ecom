"use client";

import { Briefcase, Home, MapPin, Pencil, Trash2 } from "lucide-react";
import type { Address } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ICON = { home: Home, work: Briefcase, other: MapPin };

export function AddressBlock({ address, className }: { address: Address; className?: string }) {
  return (
    <address className={cn("text-[0.9rem] not-italic leading-relaxed text-graphite", className)}>
      <span className="block font-medium text-ink">{address.fullName}</span>
      {address.line1}
      <br />
      {address.line2}
      <br />
      {address.city}, {address.state} {address.pincode}
      <br />
      <span className="text-stone">Mobile: {address.phone}</span>
    </address>
  );
}

export function AddressCard({
  address,
  onEdit,
  onDelete,
  onMakeDefault,
  selectable,
  selected,
  onSelect,
}: {
  address: Address;
  onEdit?: () => void;
  onDelete?: () => void;
  onMakeDefault?: () => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const Icon = ICON[address.type];
  const body = (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-[0.6875rem] font-medium uppercase tracking-[0.14em]">
          <Icon className="size-4" strokeWidth={1.4} /> {address.type}
        </span>
        {address.isDefault && <Badge variant="default">Default</Badge>}
      </div>
      <AddressBlock address={address} />
    </>
  );

  return (
    <div className={cn("flex flex-col border bg-paper-2 transition-colors", selected ? "border-ink ring-1 ring-ink" : "border-line", selectable && "hover:border-ink")}>
      {selectable ? (
        <button type="button" role="radio" aria-checked={selected} onClick={onSelect} className="flex-1 p-5 text-left sm:p-6">
          {body}
        </button>
      ) : (
        <div className="flex-1 p-5 sm:p-6">{body}</div>
      )}
      {(onEdit || onDelete || onMakeDefault) && (
        <div className="flex items-center gap-5 border-t border-line px-5 py-3.5 text-[0.75rem] uppercase tracking-[0.12em] sm:px-6">
          {onEdit && (
            <button type="button" onClick={onEdit} className="inline-flex items-center gap-1.5 text-graphite transition-colors hover:text-ink">
              <Pencil className="size-3.5" /> Edit
            </button>
          )}
          {onDelete && (
            <button type="button" onClick={onDelete} className="inline-flex items-center gap-1.5 text-graphite transition-colors hover:text-danger">
              <Trash2 className="size-3.5" /> Delete
            </button>
          )}
          {onMakeDefault && !address.isDefault && (
            <button type="button" onClick={onMakeDefault} className="ml-auto text-clay transition-colors hover:underline">
              Set as default
            </button>
          )}
        </div>
      )}
    </div>
  );
}
