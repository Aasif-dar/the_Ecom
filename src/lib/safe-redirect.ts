/** Only allow same-site relative redirects (blocks open-redirect via ?next=https://evil.com). */
export function safeNext(next: string | null | undefined, fallback = "/account"): string {
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return fallback;
  return next;
}
