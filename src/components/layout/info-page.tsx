import { Breadcrumb } from "@/components/ui/breadcrumb";

export interface InfoSection {
  heading: string;
  body: (string | string[])[];
}

/** Long-form content template: policies, about, shipping. Narrow measure, generous leading. */
export function InfoPage({
  eyebrow,
  title,
  accent,
  intro,
  sections,
  updated,
  aside,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  intro: string;
  sections: InfoSection[];
  updated?: string;
  aside?: React.ReactNode;
}) {
  return (
    <div className="container-x pb-4 pt-8 sm:pt-12">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: title }]} className="mb-8" />
      <div className="grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-24">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4 text-clay">{eyebrow}</p>
          <h1 className="display-lg">
            {title} {accent && <em className="font-serif italic">{accent}</em>}
          </h1>
          <p className="mt-6 text-[1.125rem] leading-relaxed text-graphite">{intro}</p>
          {updated && <p className="mt-4 text-[0.78rem] uppercase tracking-[0.12em] text-stone">Last updated {updated}</p>}
          <div className="mt-14 space-y-12 border-t border-ink pt-12">
            {sections.map((s) => (
              <section key={s.heading} aria-labelledby={`h-${s.heading.replace(/\W+/g, "-")}`}>
                <h2 id={`h-${s.heading.replace(/\W+/g, "-")}`} className="font-serif text-[2rem] leading-none">
                  {s.heading}
                </h2>
                <div className="mt-5 space-y-4 text-[1rem] leading-[1.75] text-graphite">
                  {s.body.map((b, i) =>
                    Array.isArray(b) ? (
                      <ul key={i} className="list-disc space-y-2 pl-5 marker:text-stone">
                        {b.map((li) => (
                          <li key={li}>{li}</li>
                        ))}
                      </ul>
                    ) : (
                      <p key={i}>{b}</p>
                    ),
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
        {aside && <aside className="lg:sticky lg:top-28 lg:self-start">{aside}</aside>}
      </div>
    </div>
  );
}
