import { cn } from "@/lib/utils";
import type { ProductionMetrics } from "@/types/dashboard";

export function GradeSummary({ production }: { production: ProductionMetrics }) {
  const items = [
    {
      key: "good",
      label: "Good (Saleable)",
      cells: production.goodCellsMn,
      mw: production.goodMW,
      accent: "border-l-[var(--color-positive-solid)]",
      text: "text-[var(--color-positive-text)]",
      emphasis: true,
    },
    {
      key: "medium",
      label: "Medium",
      cells: production.mediumCellsMn,
      mw: production.mediumMW,
      accent: "border-l-[var(--color-warning-solid)]",
      text: "text-[var(--color-warning-text)]",
      emphasis: false,
    },
    {
      key: "low",
      label: "Low",
      cells: production.lowCellsMn,
      mw: production.lowMW,
      accent: "border-l-[var(--color-critical-solid)]",
      text: "text-[var(--color-critical-text)]",
      emphasis: false,
    },
  ];

  return (
    <div className="grid grid-cols-3 divide-x divide-[var(--color-border)] overflow-hidden rounded-xl border border-[var(--color-border)] bg-white">
      {items.map((item) => (
        <div key={item.key} className={cn("border-l-[3px] px-4 py-3.5", item.accent)}>
          <div className="mb-1.5 text-[11.5px] font-medium text-[var(--color-ink-500)]">{item.label}</div>
          <div
            className={cn(
              "font-bold tabular-nums tracking-tight text-[var(--color-ink-900)]",
              item.emphasis ? "text-[22px]" : "text-[18px]",
            )}
          >
            {item.cells.toFixed(2)} Mn
          </div>
          <div className={cn("mt-0.5 text-[12.5px] font-medium", item.text)}>{item.mw.toFixed(2)} MW</div>
        </div>
      ))}
    </div>
  );
}
