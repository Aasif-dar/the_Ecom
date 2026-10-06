"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AccountHeading } from "@/components/account/account-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/form-field";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/store/auth";
import { useCurrentUser } from "@/store/hooks";

const schema = z
  .object({
    current: z.string().min(1, "Enter your current password"),
    next: z.string().min(8, "Use at least 8 characters").regex(/[A-Za-z]/, "Include at least one letter").regex(/\d/, "Include at least one number"),
    confirm: z.string().min(1, "Confirm your new password"),
  })
  .refine((v) => v.next === v.confirm, { path: ["confirm"], message: "Passwords don't match" })
  .refine((v) => v.next !== v.current, { path: ["next"], message: "Choose a password you haven't used before" });
type Values = z.infer<typeof schema>;

const PREFS = [
  { key: "orderUpdates", label: "Order updates", hint: "Confirmation, shipping and delivery messages." },
  { key: "smsAlerts", label: "SMS alerts", hint: "Delivery-day text messages from the courier." },
  { key: "newsletter", label: "Newsletter", hint: "New edits and notes from the studio." },
  { key: "offers", label: "Offers & sale previews", hint: "Early access to sales and codes." },
] as const;

export function SettingsView() {
  const user = useCurrentUser();
  const changePassword = useAuthStore((s) => s.changePassword);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { current: "", next: "", confirm: "" } });

  if (!user) return null;

  return (
    <>
      <AccountHeading eyebrow="Account" title="Account" accent="settings" />

      <section aria-labelledby="st-pass" className="max-w-xl">
        <h2 id="st-pass" className="font-serif text-[1.8rem] leading-none">
          Change password
        </h2>
        <p className="mb-6 mt-2 text-[0.875rem] text-stone">Use a strong password you don't use elsewhere.</p>
        <form
          noValidate
          className="space-y-5"
          onSubmit={handleSubmit(async (v) => {
            await new Promise((r) => setTimeout(r, 400));
            const res = changePassword(user.id, v.current, v.next);
            if (!res.ok) return setError("current", { message: res.error });
            toast.success("Password updated");
            reset();
          })}
        >
          <Field label="Current password" error={errors.current} required>
            {(p) => <PasswordInput autoComplete="current-password" {...p} {...register("current")} />}
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="New password" error={errors.next} required>
              {(p) => <PasswordInput autoComplete="new-password" {...p} {...register("next")} />}
            </Field>
            <Field label="Confirm new password" error={errors.confirm} required>
              {(p) => <PasswordInput autoComplete="new-password" {...p} {...register("confirm")} />}
            </Field>
          </div>
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Updating…" : "Update password"}
          </Button>
        </form>
      </section>

      <section aria-labelledby="st-prefs" className="mt-16 max-w-xl border-t border-line pt-12">
        <h2 id="st-prefs" className="font-serif text-[1.8rem] leading-none">
          Communication preferences
        </h2>
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {PREFS.map((p) => (
            <li key={p.key} className="flex items-center justify-between gap-6 py-5">
              <div>
                <p id={`pref-${p.key}`} className="text-[0.9375rem] font-medium">
                  {p.label}
                </p>
                <p className="mt-0.5 text-[0.8125rem] text-stone">{p.hint}</p>
              </div>
              <Switch
                aria-labelledby={`pref-${p.key}`}
                checked={user.preferences[p.key]}
                onCheckedChange={(checked) => {
                  updateProfile(user.id, { preferences: { ...user.preferences, [p.key]: checked } });
                  toast.success(`${p.label} ${checked ? "on" : "off"}`);
                }}
              />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
