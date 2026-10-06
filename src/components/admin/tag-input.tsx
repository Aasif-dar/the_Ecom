"use client";

import { useState } from "react";
import { X } from "lucide-react";

export function TagInput({ value, onChange, placeholder = "Add a tag and press Enter" }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [draft, setDraft] = useState("");
  const commit = () => {
    const parts = draft.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
    if (parts.length) onChange([...new Set([...value, ...parts])]);
    setDraft("");
  };
  return (
    <div className="flex min-h-11 flex-wrap items-center gap-1.5 border border-input bg-paper-2 p-1.5 focus-within:border-ink focus-within:ring-1 focus-within:ring-ink">
      {value.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 bg-bone py-1 pl-2.5 pr-1 text-[0.78rem]">
          {t}
          <button type="button" aria-label={`Remove tag ${t}`} onClick={() => onChange(value.filter((x) => x !== t))} className="grid size-5 place-items-center hover:bg-sand">
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
          } else if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={commit}
        placeholder={value.length ? "" : placeholder}
        aria-label="Tags"
        className="min-w-32 flex-1 bg-transparent px-2 py-1 text-[0.875rem] outline-none placeholder:text-stone/70"
      />
    </div>
  );
}
