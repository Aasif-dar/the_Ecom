"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import type { Address, AddressType } from "@/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { INDIAN_STATES } from "@/data/geo";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import { useCurrentUser } from "@/store/hooks";

const PIN_HINTS: Record<string, [string, string]> = {
  "400": ["Mumbai", "Maharashtra"], "110": ["New Delhi", "Delhi"], "560": ["Bengaluru", "Karnataka"], "500": ["Hyderabad", "Telangana"],
  "600": ["Chennai", "Tamil Nadu"], "411": ["Pune", "Maharashtra"], "700": ["Kolkata", "West Bengal"], "380": ["Ahmedabad", "Gujarat"],
  "302": ["Jaipur", "Rajasthan"], "122": ["Gurugram", "Haryana"], "226": ["Lucknow", "Uttar Pradesh"], "682": ["Kochi", "Kerala"],
  "160": ["Chandigarh", "Chandigarh"], "452": ["Indore", "Madhya Pradesh"], "751": ["Bhubaneswar", "Odisha"], "440": ["Nagpur", "Maharashtra"],
};

export const addressSchema = z.object({
  fullName: z.string().trim().min(2, "Enter the recipient's full name").max(60),
  phone: z
    .string()
    .trim()
    .min(1, "Enter a mobile number")
    .refine((v) => /^[6-9]\d{9}$/.test(v.replace(/[\s-]/g, "").replace(/^(\+91|91|0)/, "")), "Enter a valid 10-digit mobile number"),
  line1: z.string().trim().min(5, "Enter the house / flat number and street").max(120),
  line2: z.string().trim().min(2, "Enter your apartment, area or locality").max(120),
  city: z.string().trim().min(2, "Enter your city").max(60),
  state: z.string().min(1, "Select your state"),
  pincode: z.string().trim().regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit PIN code"),
  type: z.enum(["home", "work", "other"]),
  isDefault: z.boolean(),
});
export type AddressValues = z.infer<typeof addressSchema>;

const TYPES: { value: AddressType; label: string }[] = [
  { value: "home", label: "Home" },
  { value: "work", label: "Work" },
  { value: "other", label: "Other" },
];

export function formatPhone(raw: string) {
  const d = raw.replace(/[\s-]/g, "").replace(/^(\+91|91|0)/, "");
  return d.length === 10 ? `+91 ${d.slice(0, 5)} ${d.slice(5)}` : raw;
}

export function AddressFormDialog({
  open,
  onOpenChange,
  initial,
  onSaved,
  defaultName,
  defaultPhone,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial?: Address | null;
  onSaved?: (a: Address) => void;
  defaultName?: string;
  defaultPhone?: string;
}) {
  const user = useCurrentUser();
  const add = useAuthStore((s) => s.addAddress);
  const update = useAuthStore((s) => s.updateAddress);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: { fullName: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "", type: "home", isDefault: false },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      initial
        ? { fullName: initial.fullName, phone: initial.phone, line1: initial.line1, line2: initial.line2, city: initial.city, state: initial.state, pincode: initial.pincode, type: initial.type, isDefault: initial.isDefault }
        : { fullName: defaultName ?? user?.name ?? "", phone: defaultPhone ?? user?.phone ?? "", line1: "", line2: "", city: "", state: "", pincode: "", type: "home", isDefault: !(user?.addresses.length) },
    );
  }, [open, initial, user, defaultName, defaultPhone, reset]);

  const pincode = watch("pincode");
  useEffect(() => {
    if (/^\d{6}$/.test(pincode)) {
      const hint = PIN_HINTS[pincode.slice(0, 3)];
      if (hint) {
        if (!getValues("city")) setValue("city", hint[0], { shouldValidate: true });
        if (!getValues("state")) setValue("state", hint[1], { shouldValidate: true });
      }
    }
  }, [pincode, getValues, setValue]);

  if (!user) return null;
  const type = watch("type");
  const isDefault = watch("isDefault");

  const onSubmit = async (v: AddressValues) => {
    await new Promise((r) => setTimeout(r, 350));
    const data = { ...v, phone: formatPhone(v.phone) };
    if (initial) {
      const updated: Address = { ...initial, ...data };
      update(user.id, updated);
      toast.success("Address updated");
      onSaved?.(updated);
    } else {
      const created = add(user.id, data);
      toast.success("Address saved");
      onSaved?.(created);
    }
    onOpenChange(false);
  };

  return (
    <Modal
      variant="drawer"
      open={open}
      onOpenChange={onOpenChange}
      title={initial ? "Edit address" : "Add a new address"}
      description="Where should we deliver your order?"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="address-form" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : initial ? "Save changes" : "Save address"}
          </Button>
        </>
      }
    >
      <form id="address-form" noValidate onSubmit={handleSubmit(onSubmit)} className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" error={errors.fullName} required className="sm:col-span-1">
          {(p) => <Input autoComplete="name" {...p} {...register("fullName")} />}
        </Field>
        <Field label="Mobile number" error={errors.phone} required>
          {(p) => <Input type="tel" inputMode="tel" autoComplete="tel" placeholder="98765 43210" {...p} {...register("phone")} />}
        </Field>
        <Field label="Address" error={errors.line1} required className="sm:col-span-2" hint="House / flat number, building and street">
          {(p) => <Input autoComplete="address-line1" {...p} {...register("line1")} />}
        </Field>
        <Field label="Apartment / area" error={errors.line2} required className="sm:col-span-2">
          {(p) => <Input autoComplete="address-line2" placeholder="Locality, landmark" {...p} {...register("line2")} />}
        </Field>
        <Field label="PIN code" error={errors.pincode} required>
          {(p) => <Input inputMode="numeric" maxLength={6} autoComplete="postal-code" placeholder="560034" {...p} {...register("pincode")} />}
        </Field>
        <Field label="City" error={errors.city} required>
          {(p) => <Input autoComplete="address-level2" {...p} {...register("city")} />}
        </Field>
        <Field label="State" error={errors.state} required className="sm:col-span-2">
          {(p) => (
            <Controller
              control={control}
              name="state"
              render={({ field }) => (
                <Select value={field.value} onValueChange={(v) => field.onChange(v)} items={INDIAN_STATES.map((s) => ({ value: s, label: s }))}>
                  <SelectTrigger id={p.id} aria-invalid={p["aria-invalid"]} className="w-full">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false} className="max-h-72">
                    {INDIAN_STATES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          )}
        </Field>

        <fieldset className="sm:col-span-2">
          <legend className="mb-2 text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-graphite">Address type</legend>
          <div role="radiogroup" className="grid grid-cols-3 gap-2">
            {TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                role="radio"
                aria-checked={type === t.value}
                onClick={() => setValue("type", t.value)}
                className={cn("h-11 border text-[0.8125rem] font-medium transition-colors", type === t.value ? "border-ink bg-ink text-paper" : "border-line bg-paper-2 hover:border-ink")}
              >
                {t.label}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="flex cursor-pointer items-center gap-3 text-[0.9rem] sm:col-span-2">
          <Checkbox checked={isDefault} onCheckedChange={(c) => setValue("isDefault", !!c)} />
          Make this my default address
        </label>
      </form>
    </Modal>
  );
}
