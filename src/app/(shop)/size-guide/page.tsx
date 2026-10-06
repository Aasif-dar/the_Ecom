import type { Metadata } from "next";
import { InfoPage } from "@/components/layout/info-page";
import { SizeGuideDialog } from "@/components/product/size-guide";

export const metadata: Metadata = {
  title: "Size guide",
  description: "Find your size with Aadyam's measurement charts for tops, bottoms and footwear.",
  alternates: { canonical: "/size-guide" },
};

export default function SizeGuidePage() {
  return (
    <InfoPage
      eyebrow="Customer service"
      title="Size"
      accent="guide"
      intro="Our fits are designed in India for Indian bodies. Measure yourself, compare with the charts, and when in doubt, size up for a relaxed fit."
      sections={[
        {
          heading: "How to measure",
          body: [
            "Measure over light clothing. Chest at the fullest point, waist at the narrowest, hip at the widest. Keep the tape snug, not tight.",
            "For footwear, stand on a sheet of paper, mark your heel and longest toe and measure the distance in centimetres.",
          ],
        },
        {
          heading: "Between sizes?",
          body: ["Most of our tops are cut relaxed, so choose your usual size. Tailored pieces (blazers, trousers, shirts) run closer to the body, so size up if you prefer room."],
        },
      ]}
      aside={
        <div className="space-y-3 border border-line bg-paper-2 p-6">
          <p className="font-serif text-[1.5rem] leading-none">Charts</p>
          <div className="flex flex-col items-start gap-3 pt-2 text-[0.9375rem]">
            <SizeGuideDialog kind="tops" trigger={<span className="underline underline-offset-4">Tops & shirts</span>} />
            <SizeGuideDialog kind="bottoms" trigger={<span className="underline underline-offset-4">Trousers & denim</span>} />
            <SizeGuideDialog kind="footwear" trigger={<span className="underline underline-offset-4">Footwear</span>} />
          </div>
        </div>
      }
    />
  );
}
