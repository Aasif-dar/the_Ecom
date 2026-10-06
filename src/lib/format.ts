const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export function formatINR(value: number): string {
  return `₹${inr.format(Math.round(value))}`;
}

/** 1250000 -> ₹12.5L, 18400000 -> ₹1.84Cr. For dashboard tiles. */
export function formatINRCompact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1e7) return `₹${trim(value / 1e7)}Cr`;
  if (abs >= 1e5) return `₹${trim(value / 1e5)}L`;
  if (abs >= 1e3) return `₹${trim(value / 1e3)}K`;
  return `₹${Math.round(value)}`;
}
const trim = (n: number) => (Math.round(n * 100) / 100).toString().replace(/\.0+$/, "");

export function formatNumber(value: number): string {
  return inr.format(value);
}

const dateFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
const dateShortFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
const timeFmt = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" });
const weekdayFmt = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Kolkata" });

export const formatDate = (d: string | number | Date) => dateFmt.format(new Date(d));
export const formatDateShort = (d: string | number | Date) => dateShortFmt.format(new Date(d));
export const formatTime = (d: string | number | Date) => timeFmt.format(new Date(d));
export const formatDateTime = (d: string | number | Date) => `${formatDate(d)}, ${formatTime(d)}`;
export const formatWeekday = (d: string | number | Date) => weekdayFmt.format(new Date(d));

export function relativeTime(d: string | number | Date, now: number = Date.now()): string {
  const diff = now - new Date(d).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr${h > 1 ? "s" : ""} ago`;
  const days = Math.round(h / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return formatDate(d);
}

export function discountPercent(price: number, mrp: number): number {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function pluralize(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}

export function maskCard(last4: string) {
  return `•••• ${last4}`;
}
