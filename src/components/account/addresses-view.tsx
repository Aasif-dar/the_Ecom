"use client";

import { useState } from "react";
import { MapPin, Plus } from "lucide-react";
import { toast } from "sonner";
import type { Address } from "@/types";
import { AccountHeading } from "@/components/account/account-shell";
import { AddressCard } from "@/components/account/address-card";
import { AddressFormDialog } from "@/components/account/address-form";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { useAuthStore } from "@/store/auth";
import { useCurrentUser } from "@/store/hooks";

export function AddressesView() {
  const user = useCurrentUser();
  const remove = useAuthStore((s) => s.deleteAddress);
  const makeDefault = useAuthStore((s) => s.setDefaultAddress);
  const [editing, setEditing] = useState<Address | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Address | null>(null);
  if (!user) return null;

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  return (
    <>
      <AccountHeading
        eyebrow="Account"
        title="Saved"
        accent="addresses"
        action={
          <Button onClick={openNew}>
            <Plus className="size-4" /> Add address
          </Button>
        }
      />
      {user.addresses.length === 0 ? (
        <EmptyState
          compact
          icon={MapPin}
          title="No saved addresses"
          body="Add an address once and check out in a couple of taps."
          actions={
            <Button size="lg" onClick={openNew}>
              Add your first address
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-5 md:grid-cols-2">
          {user.addresses.map((a) => (
            <li key={a.id}>
              <AddressCard
                address={a}
                onEdit={() => {
                  setEditing(a);
                  setFormOpen(true);
                }}
                onDelete={() => setDeleting(a)}
                onMakeDefault={() => {
                  makeDefault(user.id, a.id);
                  toast.success("Default address updated");
                }}
              />
            </li>
          ))}
        </ul>
      )}

      <AddressFormDialog open={formOpen} onOpenChange={setFormOpen} initial={editing} />

      <Modal
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete this address?"
        description={deleting ? `${deleting.line1}, ${deleting.city}` : undefined}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Keep it
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleting) remove(user.id, deleting.id);
                toast("Address deleted");
                setDeleting(null);
              }}
            >
              Delete address
            </Button>
          </>
        }
      >
        <p className="text-[0.9rem] text-graphite">This won't affect orders you've already placed.</p>
      </Modal>
    </>
  );
}
