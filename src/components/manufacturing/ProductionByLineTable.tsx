"use client";

import { ChevronRight } from "lucide-react";
import { Card, SectionHeading } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import type { LineProductionRow } from "@/types/manufacturing";

export function ProductionByLineTable({
  rows,
  selectedLine,
  onSelectLine,
}: {
  rows: LineProductionRow[];
  selectedLine: string;
  onSelectLine: (lineId: string) => void;
}) {
  return (
    <Card padded={false} className="overflow-hidden">
      <div className="p-5 pb-0">
        <SectionHeading
          title="Production by Line"
          description="Line-level attainment, capacity utilization and grade mix — click a row for detail."
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-[13px]">
          <thead>
            <tr className="border-y border-[var(--color-border)] bg-[var(--color-bg)]/60 text-left text-[11.5px] font-semibold uppercase tracking-wide text-[var(--color-ink-500)]">
              <th className="px-5 py-2.5 font-semibold">Line</th>
              <th className="px-3 py-2.5 text-right font-semibold">Production</th>
              <th className="px-3 py-2.5 text-right font-semibold">Target</th>
              <th className="px-3 py-2.5 text-right font-semibold">Achievement</th>
              <th className="px-3 py-2.5 text-right font-semibold">Capacity Util.</th>
              <th className="px-3 py-2.5 text-right font-semibold">Good Grade %</th>
              <th className="px-3 py-2.5 pr-5 text-right font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isSelected = selectedLine === row.id;
              return (
                <tr
                  key={row.id}
                  onClick={() => onSelectLine(row.id)}
                  className={cn(
                    "group cursor-pointer border-b border-[var(--color-border)] transition-colors last:border-0 hover:bg-[var(--color-bg)]/70",
                    isSelected && "bg-[var(--color-info-bg)]/50",
                    row.status === "critical" && "bg-[var(--color-critical-bg)]/25",
                  )}
                >
                  <td className="px-5 py-3 font-medium text-[var(--color-ink-900)]">
                    <div className="flex items-center gap-2">
                      {row.name}
                      <ChevronRight className="h-3.5 w-3.5 text-[var(--color-ink-300)] opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-[var(--color-ink-900)]">
                    {row.productionMW.toFixed(2)} MW
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-[var(--color-ink-500)]">
                    {row.targetMW.toFixed(2)} MW
                  </td>
                  <td
                    className={cn(
                      "px-3 py-3 text-right font-medium tabular-nums",
                      row.achievementPct >= 100
                        ? "text-[var(--color-positive-text)]"
                        : row.achievementPct >= 97
                          ? "text-[var(--color-warning-text)]"
                          : "text-[var(--color-critical-text)]",
                    )}
                  >
                    {row.achievementPct.toFixed(1)}%
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-[var(--color-ink-700)]">
                    {row.capacityUtilizationPct.toFixed(0)}%
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-[var(--color-ink-700)]">
                    {row.goodGradePct.toFixed(1)}%
                  </td>
                  <td className="px-3 py-3 pr-5 text-right">
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
