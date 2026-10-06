import type { Metadata } from "next";
import { SettingsView } from "@/components/account/settings-view";

export const metadata: Metadata = { title: "Account settings" };

export default function Page() {
  return <SettingsView />;
}
