"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSiteStore } from "@/store/site";

const schema = z.object({ email: z.string().trim().min(1, "Enter your email address").email("That doesn't look like a valid email") });
type Values = z.infer<typeof schema>;

export function NewsletterForm({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  const subscribe = useSiteStore((s) => s.subscribe);
  const [done, setDone] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const dark = tone === "dark";

  if (done) {
    return (
      <p role="status" className={cn("flex items-center gap-2.5 py-3 text-[0.9375rem]", dark ? "text-paper" : "text-ink", className)}>
        <span className={cn("grid size-6 place-items-center rounded-full", dark ? "bg-paper text-ink" : "bg-ink text-paper")}>
          <Check className="size-3.5" />
        </span>
        Thank you. A welcome note is on its way to {done}.
      </p>
    );
  }

  return (
    <form
      noValidate
      className={className}
      onSubmit={handleSubmit(async ({ email }) => {
        await new Promise((r) => setTimeout(r, 450));
        subscribe(email);
        setDone(email);
        reset();
      })}
    >
      <div className={cn("flex items-center border-b transition-colors focus-within:border-b-2", dark ? "border-paper/50 focus-within:border-paper" : "border-ink/60 focus-within:border-ink")}>
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          autoComplete="email"
          placeholder="Your email address"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "newsletter-error" : undefined}
          className={cn("h-12 min-w-0 flex-1 bg-transparent text-[0.9375rem] outline-none placeholder:opacity-60", dark ? "text-paper placeholder:text-paper" : "text-ink placeholder:text-stone")}
          {...register("email")}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn("inline-flex h-12 items-center gap-2 pl-4 text-[0.72rem] font-medium uppercase tracking-[0.16em] transition-opacity hover:opacity-70 disabled:opacity-50", dark ? "text-paper" : "text-ink")}
        >
          {isSubmitting ? "Joining…" : "Subscribe"} <ArrowRight className="size-4" />
        </button>
      </div>
      {errors.email && (
        <p id="newsletter-error" role="alert" className={cn("mt-2 text-[0.8125rem]", dark ? "text-[#f0a89c]" : "text-danger")}>
          {errors.email.message}
        </p>
      )}
    </form>
  );
}
