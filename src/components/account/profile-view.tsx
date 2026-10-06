"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AccountHeading } from "@/components/account/account-shell";
import { phoneSchema } from "@/components/auth/register-form";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import { useCurrentUser } from "@/store/hooks";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(60),
  email: z.string().trim().min(1, "Enter your email address").email("That doesn't look like a valid email"),
  phone: phoneSchema,
  gender: z.enum(["female", "male", "other"]).optional(),
  dateOfBirth: z.string().optional(),
});
type In = z.input<typeof schema>;
type Out = z.output<typeof schema>;

export function ProfileView() {
  const user = useCurrentUser();
  const update = useAuthStore((s) => s.updateProfile);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<In, unknown, Out>({ resolver: zodResolver(schema) });
  const gender = watch("gender");

  useEffect(() => {
    if (user) reset({ name: user.name, email: user.email, phone: user.phone, gender: user.gender, dateOfBirth: user.dateOfBirth ?? "" });
  }, [user, reset]);

  if (!user) return null;

  return (
    <>
      <AccountHeading eyebrow="Account" title="Your" accent="profile" />
      <form
        noValidate
        className="grid max-w-2xl gap-6 sm:grid-cols-2"
        onSubmit={handleSubmit(async (v) => {
          await new Promise((r) => setTimeout(r, 400));
          const res = update(user.id, { name: v.name, email: v.email, phone: `+91 ${v.phone.slice(0, 5)} ${v.phone.slice(5)}`, gender: v.gender, dateOfBirth: v.dateOfBirth || undefined });
          if (!res.ok) return setError("email", { message: res.error });
          toast.success("Profile updated");
        })}
      >
        <Field label="Full name" error={errors.name} required className="sm:col-span-2">
          {(p) => <Input autoComplete="name" {...p} {...register("name")} />}
        </Field>
        <Field label="Email" error={errors.email} required>
          {(p) => <Input type="email" autoComplete="email" {...p} {...register("email")} />}
        </Field>
        <Field label="Mobile number" error={errors.phone} required>
          {(p) => <Input type="tel" autoComplete="tel" {...p} {...register("phone")} />}
        </Field>
        <fieldset>
          <legend className="mb-2 text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-graphite">Gender</legend>
          <div role="radiogroup" className="grid grid-cols-3 gap-2">
            {(["female", "male", "other"] as const).map((g) => (
              <button
                key={g}
                type="button"
                role="radio"
                aria-checked={gender === g}
                onClick={() => setValue("gender", g, { shouldDirty: true })}
                className={cn("h-11 border text-[0.8125rem] font-medium capitalize transition-colors", gender === g ? "border-ink bg-ink text-paper" : "border-line bg-paper-2 hover:border-ink")}
              >
                {g}
              </button>
            ))}
          </div>
        </fieldset>
        <Field label="Date of birth" error={errors.dateOfBirth}>
          {(p) => <Input type="date" max={new Date().toISOString().slice(0, 10)} {...p} {...register("dateOfBirth")} />}
        </Field>
        <div className="sm:col-span-2">
          <Button type="submit" size="lg" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </>
  );
}
