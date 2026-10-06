import type { Metadata } from "next";
import { OrdersAdminView } from "@/components/admin/orders-view";

export const metadata: Metadata = { title: "Orders" };

export default function AdminOrdersPage() {
  return <OrdersAdminView />;
}
