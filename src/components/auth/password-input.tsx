"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

export const PasswordInput = forwardRef<HTMLInputElement, React.ComponentProps<"input">>(function PasswordInput(props, ref) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input ref={ref} type={show ? "text" : "password"} className="pr-12" {...props} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        aria-pressed={show}
        className="absolute right-1 top-1/2 grid size-10 -translate-y-1/2 place-items-center text-stone hover:text-ink"
      >
        {show ? <EyeOff className="size-[1.1rem]" strokeWidth={1.5} /> : <Eye className="size-[1.1rem]" strokeWidth={1.5} />}
      </button>
    </div>
  );
});
