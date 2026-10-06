import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InfoPage } from "@/components/layout/info-page";
import { INFO_DOCS } from "@/data/info-content";

// Static policy pages (shipping, returns, privacy, terms) share one template and are pre-rendered.
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(INFO_DOCS).map((doc) => ({ doc }));
}

export async function generateMetadata({ params }: PageProps<"/[doc]">): Promise<Metadata> {
  const { doc } = await params;
  const d = INFO_DOCS[doc];
  if (!d) return {};
  return { title: d.metaTitle, description: d.description, alternates: { canonical: `/${d.slug}` } };
}

export default async function InfoDocPage({ params }: PageProps<"/[doc]">) {
  const { doc } = await params;
  const d = INFO_DOCS[doc];
  if (!d) notFound();
  return <InfoPage eyebrow={d.eyebrow} title={d.title} accent={d.accent} intro={d.intro} sections={d.sections} updated={d.updated} />;
}
