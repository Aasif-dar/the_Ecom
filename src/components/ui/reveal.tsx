"use client";

import { motion, type HTMLMotionProps } from "motion/react";

/** Subtle fade-up when a block scrolls into view. Used sparingly on section heads and image blocks. */
export function Reveal({
  children,
  delay = 0,
  y = 22,
  className,
  ...rest
}: { delay?: number; y?: number } & Omit<HTMLMotionProps<"div">, "initial" | "animate" | "whileInView" | "transition">) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
