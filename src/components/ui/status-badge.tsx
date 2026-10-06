import type { OrderStatus, PaymentStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_META, PAYMENT_STATUS_META } from "@/lib/order-meta";

const TONE_TO_VARIANT = {
  neutral: "neutral",
  info: "info",
  progress: "progress",
  success: "success",
  danger: "danger",
} as const;

export function OrderStatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  const meta = ORDER_STATUS_META[status];
  return (
    <Badge variant={TONE_TO_VARIANT[meta.tone]} className={className}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {meta.label}
    </Badge>
  );
}

export function PaymentStatusBadge({ status, className }: { status: PaymentStatus; className?: string }) {
  const meta = PAYMENT_STATUS_META[status];
  return (
    <Badge variant={meta.tone} className={className}>
      {meta.label}
    </Badge>
  );
}
