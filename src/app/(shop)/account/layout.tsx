import type { Metadata } from "next";
import { AccountShell } from "@/components/account/account-shell";

export const metadata: Metadata = {
  title: { default: "My account", template: "%s | My account | Aadyam" },
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }: LayoutProps<"/account">) {
  return <AccountShell>{children}</AccountShell>;
}
