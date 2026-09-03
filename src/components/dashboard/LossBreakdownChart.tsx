"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { TooltipContentProps } from "recharts";
import { ChartTooltipShell } from "@/components/dashboard/ChartTooltip";
import { formatPct, formatQuantity } from "@/lib/calculations";
import type { LossBreakdownItem } from "@/types/dashboard";

const COLORS = [
  "var(--color-critical-solid)",
  "var(--color-warning-solid)",
  "var(--color-navy-600)",
  "var(--color-info-solid)",
  "var(--color-ink-300)",
];

function CustomTooltip({
  active,
  payload,
  unitLabel,
}: TooltipContentProps & { unitLabel: string }) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0]?.payload as LossBreakdownItem | undefined;
  if (!item) return null;
  return (
    <ChartTooltipShell title={item.category}>
      <div className="text-[12px] text-[var(--color-ink-500)]">
        {formatQuantity(item.quantity)} {unitLabel} · {formatPct(item.pctOfTotal, 0)} of total loss
      </div>
    </ChartTooltipShell>
  );
}

export function LossBreakdownChart({ data, unitLabel = "cells" }: { data: LossBreakdownItem[]; unitLabel?: string }) {
  const topCategory = [...data].sort((a, b) => b.quantity - a.quantity)[0];

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative h-[190px] w-[190px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="quantity"
              nameKey="category"
              innerRadius={58}
              outerRadius={82}
              paddingAngle={2}
              strokeWidth={0}
              isAnimationActive={false}
            >
              {data.map((entry, i) => (
                <Cell key={entry.category} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={(props) => <CustomTooltip {...props} unitLabel={unitLabel} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] font-medium text-[var(--color-ink-500)]">Top Cause</span>
          <span className="text-[13px] font-bold text-[var(--color-ink-900)]">{topCategory.category}</span>
          <span className="text-[11.5px] text-[var(--color-critical-text)]">
            {formatPct(topCategory.pctOfTotal, 0)}
          </span>
        </div>
      </div>

      <div className="w-full flex-1">
        <table className="w-full border-collapse text-[12.5px]">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--color-ink-500)]">
              <th className="py-1.5 font-semibold">Loss Type</th>
              <th className="py-1.5 text-right font-semibold">Quantity</th>
              <th className="py-1.5 text-right font-semibold">% of Total</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, i) => (
              <tr key={item.category} className="border-b border-[var(--color-border)] last:border-0">
                <td className="py-2">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    {item.category}
                  </span>
                </td>
                <td className="py-2 text-right tabular-nums text-[var(--color-ink-700)]">
                  {formatQuantity(item.quantity)}
                </td>
                <td className="py-2 text-right font-medium tabular-nums text-[var(--color-ink-900)]">
                  {formatPct(item.pctOfTotal, 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
