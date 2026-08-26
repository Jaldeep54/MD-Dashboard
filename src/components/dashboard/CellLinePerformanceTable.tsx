"use client";

import { ChevronRight } from "lucide-react";
import { Card, SectionHeading } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatMW, formatPct, formatRupeePerW } from "@/lib/calculations";
import { cn } from "@/lib/utils";
import type { CellLinePerformance, LineFilter } from "@/types/dashboard";

export function CellLinePerformanceTable({
  cellLines,
  selectedLine,
  onSelectLine,
}: {
  cellLines: CellLinePerformance[];
  selectedLine: LineFilter;
  onSelectLine: (lineId: string) => void;
}) {
  return (
    <Card padded={false} className="overflow-hidden">
      <div className="p-5 pb-0">
        <SectionHeading
          title="Cell Line Performance"
          description="Line-level attainment, capacity, yield and cost — click a row for detail."
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-[13px]">
          <thead>
            <tr className="border-y border-[var(--color-border)] bg-[var(--color-bg)]/60 text-left text-[11.5px] font-semibold uppercase tracking-wide text-[var(--color-ink-500)]">
              <th className="px-5 py-2.5 font-semibold">Cell Line</th>
              <th className="px-3 py-2.5 text-right font-semibold">Production</th>
              <th className="px-3 py-2.5 text-right font-semibold">Target</th>
              <th className="px-3 py-2.5 text-right font-semibold">Achievement</th>
              <th className="px-3 py-2.5 text-right font-semibold">Capacity Util.</th>
              <th className="px-3 py-2.5 text-right font-semibold">Process Yield</th>
              <th className="px-3 py-2.5 text-right font-semibold">Cost/W</th>
              <th className="px-3 py-2.5 pr-5 text-right font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {cellLines.map((line) => {
              const isSelected = selectedLine === line.id;
              return (
                <tr
                  key={line.id}
                  onClick={() => onSelectLine(line.id)}
                  className={cn(
                    "group cursor-pointer border-b border-[var(--color-border)] transition-colors last:border-0 hover:bg-[var(--color-bg)]/70",
                    isSelected && "bg-[var(--color-info-bg)]/50",
                    line.status === "critical" && "bg-[var(--color-critical-bg)]/25",
                  )}
                >
                  <td className="px-5 py-3 font-medium text-[var(--color-ink-900)]">
                    <div className="flex items-center gap-2">
                      {line.name}
                      <ChevronRight className="h-3.5 w-3.5 text-[var(--color-ink-300)] opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-[var(--color-ink-900)]">
                    {formatMW(line.production.actualMW, 2)}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-[var(--color-ink-500)]">
                    {formatMW(line.production.targetMW, 2)}
                  </td>
                  <td
                    className={cn(
                      "px-3 py-3 text-right font-medium tabular-nums",
                      line.production.achievementPct >= 100
                        ? "text-[var(--color-positive-text)]"
                        : line.production.achievementPct >= 97
                          ? "text-[var(--color-warning-text)]"
                          : "text-[var(--color-critical-text)]",
                    )}
                  >
                    {formatPct(line.production.achievementPct)}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-[var(--color-ink-700)]">
                    {formatPct(line.capacity.overallUtilizationPct, 0)}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-[var(--color-ink-700)]">
                    {formatPct(line.yieldMetrics.yieldPct)}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-[var(--color-ink-700)]">
                    {formatRupeePerW(line.cost.actualPerW)}
                  </td>
                  <td className="px-3 py-3 pr-5 text-right">
                    <StatusBadge status={line.status} />
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
