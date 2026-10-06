import type { Metadata } from "next";
import { ContactView } from "@/components/layout/contact-view";

export const metadata: Metadata = { title: "Contact us", description: "Get in touch with the Aadyam team about orders, fit or fabric.", alternates: { canonical: "/contact" } };

export default function ContactPage() {
  return <ContactView />;
}
