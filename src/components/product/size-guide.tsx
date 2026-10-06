"use client";

import { Ruler } from "lucide-react";
import type { SizeGuideKind } from "@/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const TOPS = {
  head: ["Size", "Chest (in)", "Waist (in)", "Shoulder (in)", "Length (in)"],
  rows: [
    ["XS", "32–34", "26–28", "14.5", "24"],
    ["S", "35–37", "29–31", "15.5", "25"],
    ["M", "38–40", "32–34", "16.5", "26"],
    ["L", "41–43", "35–37", "17.5", "27"],
    ["XL", "44–46", "38–40", "18.5", "28"],
    ["XXL", "47–49", "41–43", "19.5", "29"],
  ],
};
const BOTTOMS = {
  head: ["Waist size", "Waist (in)", "Hip (in)", "Inseam (in)"],
  rows: [
    ["26", "26", "35", "30"], ["28", "28", "37", "30"], ["30", "30", "39", "31"], ["32", "32", "41", "31"],
    ["34", "34", "43", "32"], ["36", "36", "45", "32"], ["38", "38", "47", "32"],
  ],
};
const FOOTWEAR = {
  head: ["EU", "UK / India", "US", "Foot length (cm)"],
  rows: [
    ["36", "3", "5", "22.8"], ["37", "4", "6", "23.5"], ["38", "5", "7", "24.1"], ["39", "6", "8", "24.8"],
    ["40", "7", "9", "25.4"], ["41", "8", "9.5", "26.0"], ["42", "8.5", "10", "26.7"], ["43", "9.5", "11", "27.3"], ["44", "10", "12", "28.0"],
  ],
};

export function SizeGuideDialog({ kind, trigger }: { kind: SizeGuideKind; trigger?: React.ReactNode }) {
  const table = kind === "tops" ? TOPS : kind === "bottoms" ? BOTTOMS : kind === "footwear" ? FOOTWEAR : null;
  return (
    <Dialog>
      <DialogTrigger
        render={
          trigger ? undefined : (
            <button type="button" className="inline-flex items-center gap-1.5 text-[0.75rem] font-medium uppercase tracking-[0.14em] text-ink underline underline-offset-4 decoration-ink/40 hover:decoration-ink" />
          )
        }
      >
        {trigger ?? (
          <>
            <Ruler className="size-3.5" /> Size guide
          </>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Size guide</DialogTitle>
          <DialogDescription>Body measurements in inches unless noted. If you're between sizes, size up for a relaxed fit.</DialogDescription>
        </DialogHeader>
        {table ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-ink">
                  {table.head.map((h) => (
                    <th key={h} scope="col" className="py-3 pr-4 text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-stone">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row) => (
                  <tr key={row[0]} className="border-b border-line">
                    {row.map((cell, i) => (
                      <td key={i} className={i === 0 ? "py-3 pr-4 font-medium" : "py-3 pr-4 tabular-nums text-graphite"}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-[0.9375rem] leading-relaxed text-graphite">
            This piece comes in a single size designed to fit most. Dimensions are listed under <strong>Product details</strong>. Write to us at care@aadyam.in if you'd like help.
          </p>
        )}
        <div className="bg-bone p-4 text-[0.8125rem] leading-relaxed text-graphite">
          <p className="mb-1 font-medium text-ink">How to measure</p>
          {kind === "footwear"
            ? "Stand on a sheet of paper, mark your heel and longest toe, and measure the distance. Measure in the evening, when feet are largest."
            : "Measure over light clothing. Chest at the fullest point, waist at the narrowest, hip at the widest. Keep the tape snug, not tight."}
        </div>
      </DialogContent>
    </Dialog>
  );
}
