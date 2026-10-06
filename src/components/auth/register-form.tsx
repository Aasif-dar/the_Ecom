"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { safeNext } from "@/lib/safe-redirect";
import { useAuthStore } from "@/store/auth";
import { useCurrentUser } from "@/store/hooks";

export const phoneSchema = z
  .string()
  .trim()
  .min(1, "Enter your mobile number")
  .transform((v) => v.replace(/[\s-]/g, "").replace(/^(\+91|91|0)/, ""))
  .refine((v) => /^[6-9]\d{9}$/.test(v), "Enter a valid 10-digit Indian mobile number");

const schema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name").max(60),
    email: z.string().trim().min(1, "Enter your email address").email("That doesn't look like a valid email"),
    phone: phoneSchema,
    password: z
      .string()
      .min(8, "Use at least 8 characters")
      .regex(/[A-Za-z]/, "Include at least one letter")
      .regex(/\d/, "Include at least one number"),
    confirm: z.string().min(1, "Confirm your password"),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords don't match" });
type Input_ = z.input<typeof schema>;
type Output_ = z.output<typeof schema>;

export function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const registerUser = useAuthStore((s) => s.register);
  const user = useCurrentUser();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Input_, unknown, Output_>({ resolver: zodResolver(schema), defaultValues: { name: "", email: "", phone: "", password: "", confirm: "" } });

  useEffect(() => {
    if (user) router.replace(next);
  }, [user, next, router]);

  const submit = async (v: Output_) => {
    setFormError(null);
    await new Promise((r) => setTimeout(r, 600));
    const res = registerUser({ name: v.name, email: v.email, phone: `+91 ${v.phone.slice(0, 5)} ${v.phone.slice(5)}`, password: v.password });
    if (!res.ok) return setFormError(res.error);
    toast.success(`Welcome to Aadyam, ${res.user.name.split(" ")[0]}`, { description: "Your account is ready." });
    router.replace(next);
  };

  return (
    <AuthShell
      eyebrow="Join us"
      title="Create your"
      accent="account."
      subtitle="Save your details for faster checkout, track every order and get early access to new edits."
      footer={
        <p>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-ink underline underline-offset-4">
            Sign in
          </Link>
        </p>
      }
    >
      <form noValidate onSubmit={handleSubmit(submit)} className="space-y-5">
        {formError && (
          <p role="alert" className="border border-danger/40 bg-danger/[0.07] px-4 py-3 text-[0.875rem] text-danger">
            {formError}
          </p>
        )}
        <Field label="Full name" error={errors.name} required>
          {(p) => <Input autoComplete="name" placeholder="As on your ID" {...p} {...register("name")} />}
        </Field>
        <Field label="Email" error={errors.email} required>
          {(p) => <Input type="email" autoComplete="email" placeholder="you@example.com" {...p} {...register("email")} />}
        </Field>
        <Field label="Mobile number" error={errors.phone} required hint="We'll only use this for delivery updates.">
          {(p) => (
            <div className="flex">
              <span className="grid h-11 shrink-0 place-items-center border border-r-0 border-input bg-bone px-3.5 text-[0.9rem] text-graphite">+91</span>
              <Input type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="98765 43210" {...p} {...register("phone")} />
            </div>
          )}
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Password" error={errors.password} required>
            {(p) => <PasswordInput autoComplete="new-password" placeholder="Min. 8 characters" {...p} {...register("password")} />}
          </Field>
          <Field label="Confirm password" error={errors.confirm} required>
            {(p) => <PasswordInput autoComplete="new-password" placeholder="Repeat password" {...p} {...register("confirm")} />}
          </Field>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create account"} {!isSubmitting && <ArrowRight className="size-4" />}
        </Button>
        <p className="text-center text-[0.78rem] leading-relaxed text-stone">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-4">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline underline-offset-4">
            Privacy policy
          </Link>
          .
        </p>
      </form>
    </AuthShell>
  );
}
