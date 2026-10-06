"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowRight, Info } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { DEMO_CUSTOMER } from "@/data/seed-config";
import { safeNext } from "@/lib/safe-redirect";
import { useAuthStore } from "@/store/auth";
import { useCurrentUser } from "@/store/hooks";

const schema = z.object({
  email: z.string().trim().min(1, "Enter your email address").email("That doesn't look like a valid email"),
  password: z.string().min(1, "Enter your password"),
  remember: z.boolean(),
});
type Values = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const login = useAuthStore((s) => s.login);
  const user = useCurrentUser();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "", remember: true } });
  const remember = watch("remember");

  useEffect(() => {
    if (user) router.replace(next);
  }, [user, next, router]);

  const submit = async (v: Values) => {
    setFormError(null);
    await new Promise((r) => setTimeout(r, 500)); // feels like a network call
    const res = login(v.email, v.password, v.remember);
    if (!res.ok) {
      setFormError(res.error);
      return;
    }
    toast.success(`Welcome back, ${res.user.name.split(" ")[0]}`);
    router.replace(next);
  };

  return (
    <AuthShell
      eyebrow="Account"
      title="Welcome"
      accent="back."
      subtitle="Sign in to track orders, manage addresses and keep your wishlist across devices."
      footer={
        <p>
          New to Aadyam?{" "}
          <Link href={`/register${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-medium text-ink underline underline-offset-4">
            Create an account
          </Link>
        </p>
      }
    >
      <div className="mb-7 flex items-start gap-3 border border-line bg-bone p-4 text-[0.8125rem] leading-relaxed text-graphite">
        <Info className="mt-0.5 size-4 shrink-0" />
        <div>
          <p className="font-medium text-ink">Demo store</p>
          <p>
            Try <strong className="font-medium text-ink">{DEMO_CUSTOMER.email}</strong> / <strong className="font-medium text-ink">{DEMO_CUSTOMER.password}</strong>, which has orders at every stage.
          </p>
          <button
            type="button"
            className="mt-2 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-clay underline underline-offset-4"
            onClick={() => {
              setValue("email", DEMO_CUSTOMER.email, { shouldValidate: true });
              setValue("password", DEMO_CUSTOMER.password, { shouldValidate: true });
            }}
          >
            Fill demo credentials
          </button>
        </div>
      </div>

      <form noValidate onSubmit={handleSubmit(submit)} className="space-y-5">
        {formError && (
          <p role="alert" className="border border-danger/40 bg-danger/[0.07] px-4 py-3 text-[0.875rem] text-danger">
            {formError}
          </p>
        )}
        <Field label="Email" error={errors.email} required>
          {(p) => <Input type="email" autoComplete="email" placeholder="you@example.com" {...p} {...register("email")} />}
        </Field>
        <Field label="Password" error={errors.password} required>
          {(p) => <PasswordInput autoComplete="current-password" placeholder="Your password" {...p} {...register("password")} />}
        </Field>
        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2.5 text-[0.875rem]">
            <Checkbox checked={remember} onCheckedChange={(c) => setValue("remember", !!c)} />
            Remember me
          </label>
          <Link href="/forgot-password" className="text-[0.875rem] text-graphite underline underline-offset-4 hover:text-ink">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Sign in"} {!isSubmitting && <ArrowRight className="size-4" />}
        </Button>
      </form>
    </AuthShell>
  );
}
