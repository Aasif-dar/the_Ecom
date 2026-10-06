"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { DEMO_ADMIN } from "@/data/seed-config";
import { safeNext } from "@/lib/safe-redirect";
import { useAuthStore } from "@/store/auth";
import { useAdminUser } from "@/store/hooks";

const schema = z.object({
  email: z.string().trim().min(1, "Enter your admin email").email("That doesn't look like a valid email"),
  password: z.string().min(1, "Enter your password"),
});
type Values = z.infer<typeof schema>;

export function AdminLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"), "/admin");
  const adminLogin = useAuthStore((s) => s.adminLogin);
  const admin = useAdminUser();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

  useEffect(() => {
    if (admin) router.replace(next.startsWith("/admin") ? next : "/admin");
  }, [admin, next, router]);

  return (
    <div className="admin-surface grid min-h-dvh place-items-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-10 flex items-center justify-between">
          <Logo />
          <span className="border border-ink px-2 py-1 text-[0.625rem] font-medium uppercase tracking-[0.16em]">Admin</span>
        </div>
        <div className="border border-line bg-paper-2 p-7 sm:p-9">
          <h1 className="display-md">
            Back-office <em className="font-serif italic">sign in</em>
          </h1>
          <p className="mt-3 text-[0.9rem] leading-relaxed text-graphite">Manage products, orders, customers and the storefront.</p>

          <div className="mt-7 flex items-start gap-3 border border-line bg-bone p-4 text-[0.8125rem] leading-relaxed text-graphite">
            <ShieldCheck className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-medium text-ink">Demo credentials</p>
              <p>
                {DEMO_ADMIN.email} / {DEMO_ADMIN.password}
              </p>
              <button
                type="button"
                className="mt-1.5 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-clay underline underline-offset-4"
                onClick={() => {
                  setValue("email", DEMO_ADMIN.email, { shouldValidate: true });
                  setValue("password", DEMO_ADMIN.password, { shouldValidate: true });
                }}
              >
                Fill credentials
              </button>
            </div>
          </div>

          <form
            noValidate
            className="mt-7 space-y-5"
            onSubmit={handleSubmit(async (v) => {
              setError(null);
              await new Promise((r) => setTimeout(r, 450));
              const res = adminLogin(v.email, v.password);
              if (!res.ok) return setError(res.error);
              toast.success("Welcome to the console");
              router.replace(next.startsWith("/admin") ? next : "/admin");
            })}
          >
            {error && (
              <p role="alert" className="border border-danger/40 bg-danger/[0.07] px-4 py-3 text-[0.875rem] text-danger">
                {error}
              </p>
            )}
            <Field label="Email" error={errors.email} required>
              {(p) => <Input type="email" autoComplete="username" {...p} {...register("email")} />}
            </Field>
            <Field label="Password" error={errors.password} required>
              {(p) => <PasswordInput autoComplete="current-password" {...p} {...register("password")} />}
            </Field>
            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in…" : "Sign in"} {!isSubmitting && <ArrowRight className="size-4" />}
            </Button>
          </form>
        </div>
        <p className="mt-6 text-center text-[0.8125rem] text-stone">
          <Link href="/" className="underline underline-offset-4 hover:text-ink">
            Back to the storefront
          </Link>
        </p>
      </div>
    </div>
  );
}
