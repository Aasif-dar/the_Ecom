import type { Metadata } from "next";
import { OrderDetailPage } from "@/components/account/order-detail-page";

export const metadata: Metadata = { title: "Order details" };

export default async function Page({ params }: PageProps<"/account/orders/[id]">) {
  const { id } = await params;
  return <OrderDetailPage id={id} />;
}
