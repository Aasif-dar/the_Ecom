import type { Metadata } from "next";
import { OverviewView } from "@/components/account/overview-view";

export const metadata: Metadata = { title: "Overview" };

export default function Page() {
  return <OverviewView />;
}
