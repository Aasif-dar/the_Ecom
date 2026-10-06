import { NewsletterForm } from "@/components/layout/newsletter-form";
import { Reveal } from "@/components/ui/reveal";

export function NewsletterSection() {
  return (
    <section aria-labelledby="nl-title" className="mt-20 bg-bone py-20 sm:mt-28 sm:py-28">
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-5 text-clay">The list</p>
          <h2 id="nl-title" className="display-lg">
            Be the first to <em className="font-serif italic">know.</em>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[1rem] leading-relaxed text-graphite">
            New edits, restocks and the occasional note from the studio. Join now and get 10% off your first order with code <strong className="font-medium text-ink">WELCOME10</strong>.
          </p>
          <NewsletterForm className="mx-auto mt-10 max-w-lg text-left" />
        </Reveal>
      </div>
    </section>
  );
}
