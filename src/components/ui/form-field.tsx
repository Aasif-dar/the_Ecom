"use client";

import { useId } from "react";
import type { FieldError } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

/** Label + control + error. Wires aria attributes so errors are announced. */
export function Field({
  label,
  error,
  hint,
  required,
  className,
  children,
}: {
  label: string;
  error?: FieldError | { message?: string };
  hint?: string;
  required?: boolean;
  className?: string;
  children: (props: { id: string; "aria-invalid": boolean; "aria-describedby": string | undefined }) => React.ReactNode;
}) {
  const id = useId();
  const msgId = `${id}-msg`;
  const message = error?.message;
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={id}>
        {label}
        {required && <span aria-hidden className="text-clay">*</span>}
      </Label>
      {children({ id, "aria-invalid": !!message, "aria-describedby": message || hint ? msgId : undefined })}
      {(message || hint) && (
        <p id={msgId} role={message ? "alert" : undefined} className={cn("text-[0.8125rem]", message ? "text-danger" : "text-stone")}>
          {message ?? hint}
        </p>
      )}
    </div>
  );
}
