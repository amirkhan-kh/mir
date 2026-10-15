import type { ReactNode } from "react";

export type Tone = "lime" | "ink" | "amber" | "leaf" | "flame" | "sky" | "muted";

const TONES: Record<Tone, string> = {
  lime: "bg-lime-200 text-ink-950",
  ink: "bg-ink-950 text-white",
  amber: "bg-amber-50 text-amber-600 ring-1 ring-amber-600/15",
  leaf: "bg-lime-100 text-leaf-700 ring-1 ring-leaf-600/15",
  flame: "bg-flame-50 text-flame-600 ring-1 ring-flame-500/15",
  sky: "bg-sky-50 text-sky-700 ring-1 ring-sky-600/15",
  muted: "bg-ink-100 text-ink-600",
};

export function Badge({ tone = "muted", children, className = "" }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONES[tone]} ${className}`}>
      {children}
    </span>
  );
}
