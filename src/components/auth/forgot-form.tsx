"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MailCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

const schema = z.object({ email: z.string().trim().min(1, "Enter your email address").email("That doesn't look like a valid email") });
type Values = z.infer<typeof schema>;

export function ForgotForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  return (
    <AuthShell
      eyebrow="Account"
      title="Reset your"
      accent="password."
      subtitle="Enter the email you registered with and we'll send you a link to choose a new password."
      footer={
        <Link href="/login" className="font-medium text-ink underline underline-offset-4">
          ← Back to sign in
        </Link>
      }
    >
      {sentTo ? (
        <div role="status" className="border border-line bg-paper-2 p-6 text-center">
          <MailCheck className="mx-auto mb-4 size-9" strokeWidth={1} />
          <p className="font-serif text-[1.6rem] leading-none">Check your inbox</p>
          <p className="mt-3 text-[0.9rem] leading-relaxed text-graphite">If an account exists for {sentTo}, a reset link is on its way. In this demo no email is actually sent.</p>
        </div>
      ) : (
        <form
          noValidate
          className="space-y-5"
          onSubmit={handleSubmit(async ({ email }) => {
            await new Promise((r) => setTimeout(r, 600));
            setSentTo(email);
          })}
        >
          <Field label="Email" error={errors.email} required>
            {(p) => <Input type="email" autoComplete="email" placeholder="you@example.com" {...p} {...register("email")} />}
          </Field>
          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
