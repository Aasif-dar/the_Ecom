"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useSiteStore } from "@/store/site";

export function AnnouncementBar() {
  const messages = useSiteStore((s) => s.content.announcements);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (messages.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % messages.length), 4500);
    return () => clearInterval(t);
  }, [messages.length]);

  const current = messages[i % Math.max(messages.length, 1)] ?? "";
  return (
    <div className="bg-moss text-paper">
      <div className="container-x flex h-9 items-center justify-between gap-6">
        <div className="hidden w-48 text-[0.6875rem] tracking-[0.1em] text-paper/60 lg:block">Made in India · Small runs</div>
        <div className="relative h-full flex-1 overflow-hidden text-center" role="status" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={current}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 flex items-center justify-center truncate px-2 text-[0.6875rem] font-medium uppercase tracking-[0.16em]"
            >
              {current}
            </motion.p>
          </AnimatePresence>
        </div>
        <nav aria-label="Utility" className="hidden w-48 items-center justify-end gap-5 text-[0.6875rem] tracking-[0.1em] text-paper/80 lg:flex">
          <Link href="/track-order" className="transition-colors hover:text-paper">
            Track order
          </Link>
          <Link href="/contact" className="transition-colors hover:text-paper">
            Help
          </Link>
        </nav>
      </div>
    </div>
  );
}
