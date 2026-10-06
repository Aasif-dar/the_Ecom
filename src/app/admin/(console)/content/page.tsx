import type { Metadata } from "next";
import { ContentView } from "@/components/admin/content-view";

export const metadata: Metadata = { title: "Content" };

export default function AdminContentPage() {
  return <ContentView />;
}
