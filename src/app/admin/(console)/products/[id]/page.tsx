import type { Metadata } from "next";
import { EditProductPage } from "@/components/admin/edit-product-page";

export const metadata: Metadata = { title: "Edit product" };

export default async function AdminEditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  return <EditProductPage id={id} />;
}
