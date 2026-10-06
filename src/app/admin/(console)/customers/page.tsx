import type { Metadata } from "next";
import { CustomersView } from "@/components/admin/customers-view";

export const metadata: Metadata = { title: "Customers" };

export default function AdminCustomersPage() {
  return <CustomersView />;
}
