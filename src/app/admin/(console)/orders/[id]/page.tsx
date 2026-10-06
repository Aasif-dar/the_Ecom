import type { Metadata } from "next";
import { AdminOrderDetail } from "@/components/admin/order-detail-admin";

export const metadata: Metadata = { title: "Order details" };

export default async function AdminOrderPage({ params }: PageProps<"/admin/orders/[id]">) {
  const { id } = await params;
  return <AdminOrderDetail id={id} />;
}
