"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TooltipContentProps } from "recharts";
import { ChartTooltipRow, ChartTooltipShell } from "@/components/dashboard/ChartTooltip";
import { formatPct, formatQuantity } from "@/lib/calculations";
import { cn } from "@/lib/utils";
import type { DefectCategory } from "@/types/manufacturing";

const BAR_COLOR = "var(--color-navy-600)";
const TOP_COLOR = "var(--color-critical-solid)";

function CustomTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0]?.payload as DefectCategory | undefined;
  if (!item) return null;
  return (
    <ChartTooltipShell title={item.label}>
      <ChartTooltipRow label="Count" value={formatQuantity(item.count)} />
      <ChartTooltipRow label="Share of Defects" value={formatPct(item.pctOfDefects, 1)} />
    </ChartTooltipShell>
  );
}

export function DefectParetoChart({ defects }: { defects: DefectCategory[] }) {
  const sorted = [...defects].sort((a, b) => b.count - a.count);
  const height = sorted.length * 30 + 20;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sorted} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }} barCategoryGap={8}>
            <CartesianGrid horizontal={false} stroke="var(--color-border)" />
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="label"
              tickLine={false}
              axisLine={false}
              width={130}
              tick={{ fontSize: 11.5, fill: "var(--color-ink-700)" }}
            />
            <Tooltip content={CustomTooltip} cursor={{ fill: "var(--color-bg)" }} />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={16}>
              {sorted.map((entry, i) => (
                <Cell key={entry.key} fill={i === 0 ? TOP_COLOR : BAR_COLOR} fillOpacity={i === 0 ? 1 : 0.75 - i * 0.05} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <table className="w-full self-start border-collapse text-[12.5px]">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--color-ink-500)]">
            <th className="py-1.5 font-semibold">Defect Category</th>
            <th className="py-1.5 text-right font-semibold">Count</th>
            <th className="py-1.5 text-right font-semibold">% of Defects</th>
            <th className="py-1.5 text-right font-semibold">Trend</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((d) => (
            <tr key={d.key} className="border-b border-[var(--color-border)] last:border-0">
              <td className="py-2 text-[var(--color-ink-900)]">{d.label}</td>
              <td className="py-2 text-right tabular-nums text-[var(--color-ink-700)]">{formatQuantity(d.count)}</td>
              <td className="py-2 text-right font-medium tabular-nums text-[var(--color-ink-900)]">
                {d.pctOfDefects.toFixed(0)}%
              </td>
              <td className="py-2 text-right">
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 text-[11.5px] font-medium",
                    d.trendPct <= 0 ? "text-[var(--color-positive-text)]" : "text-[var(--color-critical-text)]",
                  )}
                >
                  {d.trendPct <= 0 ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />}
                  {Math.abs(d.trendPct).toFixed(1)}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
