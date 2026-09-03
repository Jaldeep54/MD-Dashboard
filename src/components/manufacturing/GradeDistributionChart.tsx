"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { TooltipContentProps } from "recharts";
import { ChartTooltipShell } from "@/components/dashboard/ChartTooltip";
import { formatMn } from "@/lib/calculations";
import type { GradeBreakdown } from "@/types/manufacturing";

const COLORS: Record<string, string> = {
  Good: "var(--color-positive-solid)",
  Medium: "var(--color-warning-solid)",
  Low: "var(--color-critical-solid)",
};

interface Row {
  grade: string;
  mw: number;
  mn: number;
  pct: number;
}

function CustomTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0]?.payload as Row | undefined;
  if (!item) return null;
  return (
    <ChartTooltipShell title={item.grade}>
      <div className="text-[12px] text-[var(--color-ink-500)]">
        {item.mw.toFixed(1)} MW · {formatMn(item.mn)} cells · {item.pct.toFixed(1)}%
      </div>
    </ChartTooltipShell>
  );
}

export function GradeDistributionChart({ grade }: { grade: GradeBreakdown }) {
  const data: Row[] = [
    { grade: "Good", mw: grade.goodMW, mn: grade.goodMn, pct: grade.goodPct },
    { grade: "Medium", mw: grade.mediumMW, mn: grade.mediumMn, pct: grade.mediumPct },
    { grade: "Low", mw: grade.lowMW, mn: grade.lowMn, pct: grade.lowPct },
  ];

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative h-[190px] w-[190px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="mw"
              nameKey="grade"
              innerRadius={58}
              outerRadius={82}
              paddingAngle={2}
              strokeWidth={0}
              isAnimationActive={false}
            >
              {data.map((entry) => (
                <Cell key={entry.grade} fill={COLORS[entry.grade]} />
              ))}
            </Pie>
            <Tooltip content={CustomTooltip} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] font-medium text-[var(--color-ink-500)]">Good Grade</span>
          <span className="text-[20px] font-bold text-[var(--color-ink-900)]">{grade.goodPct.toFixed(1)}%</span>
        </div>
      </div>

      <div className="w-full flex-1">
        <table className="w-full border-collapse text-[12.5px]">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--color-ink-500)]">
              <th className="py-1.5 font-semibold">Grade</th>
              <th className="py-1.5 text-right font-semibold">MW</th>
              <th className="py-1.5 text-right font-semibold">Mn Cells</th>
              <th className="py-1.5 text-right font-semibold">%</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.grade} className="border-b border-[var(--color-border)] last:border-0">
                <td className="py-2">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: COLORS[row.grade] }} />
                    {row.grade}
                  </span>
                </td>
                <td className="py-2 text-right tabular-nums text-[var(--color-ink-700)]">{row.mw.toFixed(1)}</td>
                <td className="py-2 text-right tabular-nums text-[var(--color-ink-700)]">{row.mn.toFixed(2)}</td>
                <td className="py-2 text-right font-medium tabular-nums text-[var(--color-ink-900)]">
                  {row.pct.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
