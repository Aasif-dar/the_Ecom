"use client";

import { useState } from "react";
import { CheckCircle2, MapPin } from "lucide-react";
import { formatWeekday } from "@/lib/format";
import { useSiteStore } from "@/store/site";

const DAY = 24 * 60 * 60 * 1000;

export function DeliveryChecker() {
  const codEnabled = useSiteStore((s) => s.settings.store.codEnabled);
  const [pin, setPin] = useState("");
  const [result, setResult] = useState<{ ok: boolean; eta?: string; metro?: boolean } | null>(null);

  const check = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[1-9][0-9]{5}$/.test(pin)) return setResult({ ok: false });
    const metro = ["110", "400", "560", "500", "600", "411", "700", "122"].some((p) => pin.startsWith(p));
    const eta = formatWeekday(Date.now() + (metro ? 4 : 6) * DAY);
    setResult({ ok: true, eta, metro });
  };

  return (
    <div className="border border-line bg-paper-2 p-4">
      <p className="mb-3 flex items-center gap-2 text-[0.6875rem] font-medium uppercase tracking-[0.14em]">
        <MapPin className="size-3.5" /> Delivery & services
      </p>
      <form onSubmit={check} className="flex gap-2" noValidate>
        <label htmlFor="pin" className="sr-only">
          Delivery PIN code
        </label>
        <input
          id="pin"
          inputMode="numeric"
          maxLength={6}
          value={pin}
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, ""));
            setResult(null);
          }}
          placeholder="Enter PIN code"
          aria-invalid={result?.ok === false}
          className="h-11 min-w-0 flex-1 border border-line bg-paper px-3.5 text-[0.9rem] outline-none focus-visible:border-ink focus-visible:ring-1 focus-visible:ring-ink"
        />
        <button type="submit" className="h-11 border border-ink px-5 text-[0.7rem] font-medium uppercase tracking-[0.14em] transition-colors hover:bg-ink hover:text-paper">
          Check
        </button>
      </form>
      <div aria-live="polite">
        {result?.ok === false && <p className="mt-3 text-[0.8125rem] text-danger">Please enter a valid 6-digit PIN code.</p>}
        {result?.ok && (
          <ul className="mt-3 space-y-1.5 text-[0.8125rem] text-graphite">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-success" /> Delivery by <strong className="font-medium text-ink">{result.eta}</strong>
            </li>
            {codEnabled && (
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-success" /> Cash on delivery available
              </li>
            )}
            <li className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-success" /> Easy 7-day returns & exchanges
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}
