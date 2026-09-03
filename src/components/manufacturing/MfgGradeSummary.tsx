import { ArrowDown, ArrowUp } from "lucide-react";
import { periodOverPeriodDelta } from "@/lib/trendDelta";
import { cn } from "@/lib/utils";
import type { GradeBreakdown } from "@/types/manufacturing";

export function MfgGradeSummary({ grade, seed }: { grade: GradeBreakdown; seed: string }) {
  const items = [
    {
      key: "good",
      label: "Good Cell Production",
      mn: grade.goodMn,
      mw: grade.goodMW,
      pct: grade.goodPct,
      accent: "border-l-[var(--color-positive-solid)]",
      text: "text-[var(--color-positive-text)]",
      emphasis: true,
    },
    {
      key: "medium",
      label: "Medium Cell Production",
      mn: grade.mediumMn,
      mw: grade.mediumMW,
      pct: grade.mediumPct,
      accent: "border-l-[var(--color-warning-solid)]",
      text: "text-[var(--color-warning-text)]",
      emphasis: false,
    },
    {
      key: "low",
      label: "Low Cell Production",
      mn: grade.lowMn,
      mw: grade.lowMW,
      pct: grade.lowPct,
      accent: "border-l-[var(--color-critical-solid)]",
      text: "text-[var(--color-critical-text)]",
      emphasis: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 divide-y divide-[var(--color-border)] overflow-hidden rounded-xl border border-[var(--color-border)] bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      {items.map((item) => {
        const delta = periodOverPeriodDelta(`${seed}-${item.key}`, 5);
        return (
          <div key={item.key} className={cn("border-l-[3px] px-4 py-3.5", item.accent)}>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="text-[11.5px] font-medium text-[var(--color-ink-500)]">{item.label}</span>
              <span
                className={cn(
                  "flex items-center gap-0.5 text-[11px] font-medium",
                  delta >= 0 ? "text-[var(--color-positive-text)]" : "text-[var(--color-critical-text)]",
                )}
              >
                {delta >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {Math.abs(delta).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={cn(
                  "font-bold tabular-nums tracking-tight text-[var(--color-ink-900)]",
                  item.emphasis ? "text-[22px]" : "text-[18px]",
                )}
              >
                {item.mw.toFixed(1)} MW
              </span>
              <span className="text-[12px] text-[var(--color-ink-400)]">{item.mn.toFixed(2)} Mn cells</span>
            </div>
            <div className={cn("mt-0.5 text-[12.5px] font-medium", item.text)}>{item.pct.toFixed(1)}% of output</div>
          </div>
        );
      })}
    </div>
  );
}
